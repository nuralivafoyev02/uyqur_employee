import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { hasRole } from "@/lib/auth";
import type {
  AssistantMessageRecord,
  AssistantMessageKind,
  AssistantThreadDetail,
  AssistantThreadSummary,
} from "@/lib/assistant-types";
import { getRequestOrigin } from "@/lib/site-url";
import { hasSupabaseServiceRoleEnv } from "@/lib/supabase/config";
import { createAdminClient } from "@/lib/supabase/server";
import {
  getTelegramConfig,
  sendTelegramJsonLog,
  sendTelegramTextMessage,
} from "@/lib/telegram-service";
import {
  formatDate,
  getPlanStatusLabel,
  getPriorityLabel,
  getTodayIsoDate,
} from "@/lib/utils";
import type { AiMessage, AiThread, Database, Json, PlanPriority, Viewer } from "@/types/database";

type DatabaseClient = SupabaseClient<Database>;

type AssistantMemory = {
  lastIntent?: string;
  lastEmployeeId?: string | null;
  lastEmployeeName?: string | null;
  lastRangeLabel?: string | null;
  lastRangeDays?: number | null;
  lastDate?: string | null;
};

type AssistantReply = {
  content: string;
  intent: string;
  kind?: AssistantMessageKind;
  memory?: AssistantMemory;
};

type EmployeeLookup = {
  id: string;
  full_name: string;
  title: string | null;
  role: Viewer["role"];
  telegram_chat_id?: string | null;
  telegram_username?: string | null;
};

type OpenPlanRow = {
  id: string;
  title: string;
  due_date: string | null;
  status: Database["public"]["Tables"]["plans"]["Row"]["status"];
  priority: Database["public"]["Tables"]["plans"]["Row"]["priority"];
  updated_at: string;
};

type DailyReportRow = {
  id: string;
  report_date: string;
  completed_work: string;
  current_work: string;
  next_plan: string;
  blockers: string | null;
  status: Database["public"]["Tables"]["daily_reports"]["Row"]["status"];
  updated_at: string;
};

type AssistantRange = {
  startDate: string;
  endDate: string;
  label: string;
  days: number;
};

const DEFAULT_THREAD_TITLE = "Yangi chat";
const MAX_THREAD_TITLE_LENGTH = 60;
const MAX_THREAD_PREVIEW_LENGTH = 120;
const MAX_HISTORY_MESSAGES = 18;
const MAX_VISIBLE_ITEMS = 8;
const ASSISTANT_ERROR_MESSAGE =
  "Uzr, hozir ichki AI yordamchisida muammo chiqdi. Bir ozdan keyin yana urinib ko'ring.";

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function shiftIsoDate(value: string, days: number) {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function normalizeAssistantText(value: string) {
  return value
    .toLocaleLowerCase()
    .replace(/[ʻ’`]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(value: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(value));
}

function normalizeRecord(value: Json | null | undefined) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, Json>;
}

function parseAssistantMemory(value: Json | null | undefined): AssistantMemory {
  const record = normalizeRecord(value);
  return {
    lastIntent: typeof record.lastIntent === "string" ? record.lastIntent : undefined,
    lastEmployeeId: typeof record.lastEmployeeId === "string" ? record.lastEmployeeId : null,
    lastEmployeeName: typeof record.lastEmployeeName === "string" ? record.lastEmployeeName : null,
    lastRangeLabel: typeof record.lastRangeLabel === "string" ? record.lastRangeLabel : null,
    lastRangeDays: typeof record.lastRangeDays === "number" ? record.lastRangeDays : null,
    lastDate: typeof record.lastDate === "string" ? record.lastDate : null,
  };
}

function serializeAssistantMemory(memory: AssistantMemory): Json {
  return {
    lastIntent: memory.lastIntent ?? null,
    lastEmployeeId: memory.lastEmployeeId ?? null,
    lastEmployeeName: memory.lastEmployeeName ?? null,
    lastRangeLabel: memory.lastRangeLabel ?? null,
    lastRangeDays: memory.lastRangeDays ?? null,
    lastDate: memory.lastDate ?? null,
  };
}

function parseAssistantMessageKind(metadata: Json | null | undefined): AssistantMessageKind {
  const record = normalizeRecord(metadata);
  const kind = record.kind;

  return kind === "error" || kind === "info" ? kind : "reply";
}

function toThreadSummary(thread: Pick<
  AiThread,
  "id" | "title" | "last_message_preview" | "last_message_at" | "created_at" | "updated_at"
>): AssistantThreadSummary {
  return {
    id: thread.id,
    title: thread.title,
    lastMessagePreview: thread.last_message_preview,
    lastMessageAt: thread.last_message_at,
    createdAt: thread.created_at,
    updatedAt: thread.updated_at,
  };
}

function toMessageRecord(message: Pick<
  AiMessage,
  "id" | "sender" | "content" | "created_at" | "metadata"
>): AssistantMessageRecord {
  return {
    id: message.id,
    sender: message.sender as AssistantMessageRecord["sender"],
    content: message.content,
    createdAt: message.created_at,
    kind: parseAssistantMessageKind(message.metadata),
  };
}

function isGreetingMessage(message: string) {
  const normalized = normalizeAssistantText(message);
  return includesAny(normalized, [
    /\b(salom|assalomu alaykum|assalom|vaalaykum assalom|hello|hi|hey)\b/i,
    /\b(qalaysiz|qalesan|yaxshimisiz)\b/i,
  ]);
}

function isHelpMessage(message: string) {
  const normalized = normalizeAssistantText(message);
  return includesAny(normalized, [
    /(nima qila olasan|nimalarni qila olasan|yordam|help|komanda|buyruq|imkoniyat)/i,
    /(qanday ishlaysan|nima bilasan|nimaga qodirsan)/i,
  ]);
}

function isTodayTasksMessage(message: string, memory: AssistantMemory) {
  const normalized = normalizeAssistantText(message);

  if (
    includesAny(normalized, [
      /(bugun|today).*(vazifa|task|ish)/i,
      /(vazifalarim|vazifam|menga nima vazifa|menga qanday vazifa|bugungi ishlarim|mening ishlarim)/i,
      /(qanday vazifalar bor|nima ishlar bor|qaysi ishlar bor)/i,
    ])
  ) {
    return true;
  }

  return (
    memory.lastIntent === "today_tasks" &&
    includesAny(normalized, [/\b(shu|shular|yana|davom et|bugunchi)\b/i, /\b(unda|menda)\b/i])
  );
}

function isCompletedTasksMessage(message: string, memory: AssistantMemory) {
  const normalized = normalizeAssistantText(message);

  if (
    includesAny(normalized, [
      /(yakunlangan|bajarilgan|bitgan|tugagan|done).*(vazifa|task|ish)/i,
      /(qaysi vazifalar.*(yakunlangan|bajarilgan|bitgan|tugagan))/i,
      /(bugun|kecha|hafta|oy).*(nima.*bajardim|nima.*yakunladim)/i,
    ])
  ) {
    return true;
  }

  return (
    memory.lastIntent === "completed_tasks" &&
    includesAny(normalized, [/\b(yana|shu|shu xodim|bugunchi|kechachi|haftachi)\b/i])
  );
}

function isOverdueTasksMessage(message: string, memory: AssistantMemory) {
  const normalized = normalizeAssistantText(message);

  if (
    includesAny(normalized, [
      /(kechikkan|muddati o'tgan|muddati otgan|overdue).*(vazifa|task|ish)/i,
      /(deadline.*o'tgan|deadline.*otgan).*(vazifa|task)/i,
    ])
  ) {
    return true;
  }

  return (
    memory.lastIntent === "overdue_tasks" &&
    includesAny(normalized, [/\b(yana|shu|davom et)\b/i])
  );
}

function isActivityMessage(message: string, memory: AssistantMemory) {
  const normalized = normalizeAssistantText(message);

  if (/(eng faol|faol xodim|faolligi|reyting|top xodim)/i.test(normalized)) {
    return true;
  }

  if (
    /(faol|aktiv)/i.test(normalized) &&
    /(kim|kimlar|xodim|xodimlar|bugun|hafta|oy|top|eng|so'nggi|songgi)/i.test(normalized)
  ) {
    return true;
  }

  if (
    memory.lastIntent === "activity_leaderboard" &&
    /(bugun|hafta|oy|30 kun|7 kun|14 kun|yana|davom et|ko'rsat|kim|kimlar|faol|aktiv)/i.test(normalized)
  ) {
    return true;
  }

  return false;
}

function isAssignTaskMessage(message: string) {
  const normalized = normalizeAssistantText(message);
  return includesAny(normalized, [
    /(biriktir|vazifa ber|vazifa yarat|task yarat|ishini ber|ishini biriktir)/i,
    /(vazifa qo'y|task qo'y|ishga qo'y)/i,
  ]);
}

function isReportMessage(message: string) {
  const normalized = normalizeAssistantText(message);
  return /(hisobot|report)/i.test(normalized);
}

function isMissingReportsMessage(message: string, memory: AssistantMemory) {
  const normalized = normalizeAssistantText(message);

  if (
    includesAny(normalized, [
      /(kim|kimlar).*(hisobot).*(topshirmadi|yo'q|yubormadi|bermadi)/i,
      /(hisobotsiz|hisoboti yo'q|hisoboti yoq|hisobot bermagan)/i,
      /(hisobot.*(yetishmayapti|yetishmaydi))/i,
    ])
  ) {
    return true;
  }

  return (
    memory.lastIntent === "missing_reports" &&
    includesAny(normalized, [/\b(yana|bugunchi|kechachi|shu kun)\b/i])
  );
}

function isBlockerMessage(message: string) {
  const normalized = normalizeAssistantText(message);
  return /(blocker|to'siq|tosiq|muammo)/i.test(normalized);
}

function isEmployeeSummaryMessage(message: string, memory: AssistantMemory) {
  const normalized = normalizeAssistantText(message);

  if (
    includesAny(normalized, [
      /(holatini ayt|holati qanday|nima qilyapti|nimalar qilyapti|statusi qanday)/i,
      /(shu xodim|o'sha xodim|osha xodim).*(holati|statusi|vazifalari|hisoboti)/i,
      /(xodim.*(holati|statusi|faolligi))/i,
    ])
  ) {
    return true;
  }

  return (
    Boolean(memory.lastEmployeeId) &&
    includesAny(normalized, [/\b(unda|unga|uning|shu xodim|o'sha xodim|xodimchi)\b/i])
  );
}

function detectAssistantIntent(message: string, memory: AssistantMemory) {
  const scores = new Map<string, number>();
  const addScore = (intent: string, score: number) => {
    scores.set(intent, (scores.get(intent) ?? 0) + score);
  };
  const normalized = normalizeAssistantText(message);

  if (isAssignTaskMessage(normalized)) {
    addScore("assign_task", 12);
  }

  if (isActivityMessage(normalized, memory)) {
    addScore("activity_leaderboard", 11);
  }

  if (isMissingReportsMessage(normalized, memory)) {
    addScore("missing_reports", 10);
  }

  if (isCompletedTasksMessage(normalized, memory)) {
    addScore("completed_tasks", 10);
  }

  if (isOverdueTasksMessage(normalized, memory)) {
    addScore("overdue_tasks", 10);
  }

  if (isTodayTasksMessage(normalized, memory)) {
    addScore("today_tasks", 9);
  }

  if (isBlockerMessage(normalized)) {
    addScore("blockers", 8);
  }

  if (isReportMessage(normalized)) {
    addScore("today_report", 7);
  }

  if (isEmployeeSummaryMessage(normalized, memory)) {
    addScore("employee_summary", 6);
  }

  if (isGreetingMessage(normalized)) {
    addScore("greeting", 5);
  }

  if (isHelpMessage(normalized)) {
    addScore("help", 5);
  }

  const [bestIntent] = [...scores.entries()].sort((left, right) => right[1] - left[1])[0] ?? [];
  return bestIntent ?? "fallback";
}

function sanitizeThreadTitle(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return DEFAULT_THREAD_TITLE;
  }

  return truncateText(normalized, MAX_THREAD_TITLE_LENGTH);
}

function buildHelpMessage(viewer: Viewer) {
  const base = [
    `Salom, ${viewer.full_name.split(/\s+/)[0] ?? "hamkasb"}! Men Uyqur AI man.`,
    "",
    "Men hozir sizga quyidagi ishlarni tez va tushunarli qilib bajarib bera olaman:",
    "1. Bugungi ochiq vazifalar, yakunlangan vazifalar va kechikkan vazifalarni ko'rsatish.",
    "2. Bugungi hisobot, blocker yoki hisobot topshirilmagan xodimlarni aytish.",
    "3. Oldingi chat kontekstini eslab, shu mavzuda davom ettirish.",
    "4. Muayyan xodimning hozirgi ish holatini qisqacha yig'ib berish.",
  ];

  if (hasRole(viewer.role, ["admin", "manager"])) {
    base.push("5. Eng faol xodimlar reytingini chiqarish.");
    base.push("6. Chat ichidan xodimga yangi vazifa biriktirish.");
  }

  base.push("");
  base.push('Masalan: "Bugun manga nima vazifalar bor?"');
  base.push('Yoki: "Bugun yakunlagan vazifalarimni ko\'rsat"');
  base.push('Yoki: "Bugun kim hisobot topshirmadi?"');

  if (hasRole(viewer.role, ["admin", "manager"])) {
    base.push('Yoki: "Dilbekning bugungi holatini ayt"');
    base.push('Yoki: "Ali ga \\"Yetkazib berish hisobotini tayyorlash\\" vazifasini ertaga biriktir"');
  }

  return base.join("\n");
}

function formatTaskLine(task: OpenPlanRow, today: string) {
  const dueLabel = task.due_date
    ? task.due_date < today
      ? `kechikkan (${formatDate(task.due_date)})`
      : task.due_date === today
        ? "deadline bugun"
        : `deadline: ${formatDate(task.due_date)}`
    : "deadline yo'q";

  return `- ${task.title} (${getPriorityLabel(task.priority)}, ${getPlanStatusLabel(task.status)}, ${dueLabel})`;
}

function formatCompletedTaskLine(task: OpenPlanRow) {
  const completedDate = task.updated_at.slice(0, 10);
  const dueLabel = task.due_date ? `deadline: ${formatDate(task.due_date)}` : "deadline yo'q";
  return `- ${task.title} (${getPriorityLabel(task.priority)}, yakunlangan: ${formatDate(completedDate)}, ${dueLabel})`;
}

function normalizeNameToken(value: string) {
  return value.toLocaleLowerCase().replace(/\s+/g, " ").trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getViewerEmployeeLookup(viewer: Viewer): EmployeeLookup {
  return {
    id: viewer.id,
    full_name: viewer.full_name,
    title: viewer.title,
    role: viewer.role,
    telegram_chat_id: viewer.telegram_chat_id,
    telegram_username: viewer.telegram_username,
  };
}

async function findEmployeeByMessage(
  supabase: DatabaseClient,
  viewer: Viewer,
  message: string,
): Promise<EmployeeLookup | null> {
  if (!hasRole(viewer.role, ["admin", "manager"])) {
    return {
      id: viewer.id,
      full_name: viewer.full_name,
      title: viewer.title,
      role: viewer.role,
      telegram_chat_id: viewer.telegram_chat_id,
      telegram_username: viewer.telegram_username,
    };
  }

  const normalizedMessage = normalizeNameToken(message);
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, title, role, telegram_chat_id, telegram_username")
    .order("full_name");

  const employees = (data ?? []) as EmployeeLookup[];
  let bestMatch: { employee: EmployeeLookup; score: number } | null = null;

  for (const employee of employees) {
    const fullName = normalizeNameToken(employee.full_name);
    const tokens = fullName.split(" ").filter((token) => token.length >= 3);
    let score = 0;

    if (normalizedMessage.includes(fullName)) {
      score += 10;
    }

    for (const token of tokens) {
      if (normalizedMessage.includes(token)) {
        score += 2;
      }
    }

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { employee, score };
    }
  }

  if (!bestMatch || bestMatch.score < 2) {
    return null;
  }

  return bestMatch.employee;
}

async function getEmployeeById(supabase: DatabaseClient, employeeId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, title, role, telegram_chat_id, telegram_username")
    .eq("id", employeeId)
    .maybeSingle();

  return (data as EmployeeLookup | null) ?? null;
}

function messageTargetsSelf(message: string) {
  const normalized = normalizeAssistantText(message);
  return /\b(men|menga|mening|menda|o'zim|ozim|o'zimga|ozimga|manga)\b/i.test(normalized);
}

function messageTargetsPreviousEmployee(message: string) {
  const normalized = normalizeAssistantText(message);
  return includesAny(normalized, [
    /\b(shu xodim|o'sha xodim|osha xodim|shu odam|o'sha odam|osha odam)\b/i,
    /\b(unga|unda|uning|uniki|shu\schi|o'sha\schi)\b/i,
  ]);
}

async function resolveEmployeeFromMessage(
  supabase: DatabaseClient,
  viewer: Viewer,
  message: string,
  memory: AssistantMemory,
  options?: {
    allowMemory?: boolean;
    defaultToViewer?: boolean;
  },
) {
  const fallbackEmployee = getViewerEmployeeLookup(viewer);
  const explicitEmployee = await findEmployeeByMessage(supabase, viewer, message);

  if (explicitEmployee) {
    return explicitEmployee;
  }

  if (
    options?.allowMemory !== false &&
    hasRole(viewer.role, ["admin", "manager"]) &&
    memory.lastEmployeeId &&
    messageTargetsPreviousEmployee(message)
  ) {
    const memoryEmployee = await getEmployeeById(supabase, memory.lastEmployeeId);

    if (memoryEmployee) {
      return memoryEmployee;
    }
  }

  if (!hasRole(viewer.role, ["admin", "manager"])) {
    return fallbackEmployee;
  }

  if (messageTargetsSelf(message)) {
    return fallbackEmployee;
  }

  return options?.defaultToViewer === false ? null : fallbackEmployee;
}

function parseSingleDate(
  message: string,
  today: string,
  memory?: AssistantMemory,
) {
  const normalized = normalizeAssistantText(message);
  const isoMatch = normalized.match(/\b(20\d{2}-\d{2}-\d{2})\b/);

  if (isoMatch) {
    return isoMatch[1];
  }

  if (normalized.includes("kecha")) {
    return shiftIsoDate(today, -1);
  }

  if (normalized.includes("ertaga")) {
    return shiftIsoDate(today, 1);
  }

  if (normalized.includes("indin")) {
    return shiftIsoDate(today, 2);
  }

  if (normalized.includes("bugun")) {
    return today;
  }

  return memory?.lastDate ?? today;
}

function parseRangeFromMessage(
  message: string,
  today: string,
  memory?: AssistantMemory,
  defaultDays = 1,
): AssistantRange {
  const normalized = normalizeAssistantText(message);
  const explicitDays = normalized.match(/\b(\d{1,2})\s*kun\b/i);
  const memoryDays = memory?.lastRangeDays ?? null;

  if (normalized.includes("bugun")) {
    return {
      startDate: today,
      endDate: today,
      label: "Bugun",
      days: 1,
    };
  }

  if (normalized.includes("kecha")) {
    const date = shiftIsoDate(today, -1);
    return {
      startDate: date,
      endDate: date,
      label: "Kecha",
      days: 1,
    };
  }

  if (normalized.includes("hafta")) {
    return {
      startDate: shiftIsoDate(today, -6),
      endDate: today,
      label: "So'nggi 7 kun",
      days: 7,
    };
  }

  if (normalized.includes("oy")) {
    return {
      startDate: shiftIsoDate(today, -29),
      endDate: today,
      label: "So'nggi 30 kun",
      days: 30,
    };
  }

  if (explicitDays) {
    const days = Math.min(Math.max(Number(explicitDays[1]), 1), 30);
    return {
      startDate: days === 1 ? today : shiftIsoDate(today, -(days - 1)),
      endDate: today,
      label: days === 1 ? "Bugun" : `So'nggi ${days} kun`,
      days,
    };
  }

  if (
    memoryDays &&
    includesAny(normalized, [/\b(yana|davom et|shu xodim|bugunchi|kechachi|haftachi|oychi)\b/i])
  ) {
    return {
      startDate: memoryDays === 1 ? today : shiftIsoDate(today, -(memoryDays - 1)),
      endDate: today,
      label: memory?.lastRangeLabel ?? (memoryDays === 1 ? "Bugun" : `So'nggi ${memoryDays} kun`),
      days: memoryDays,
    };
  }

  return {
    startDate: defaultDays === 1 ? today : shiftIsoDate(today, -(defaultDays - 1)),
    endDate: today,
    label: defaultDays === 1 ? "Bugun" : `So'nggi ${defaultDays} kun`,
    days: defaultDays,
  };
}

async function getOpenTasksForEmployee(
  supabase: DatabaseClient,
  employeeId: string,
) {
  const { data } = await supabase
    .from("plans")
    .select("id, title, due_date, status, priority, updated_at")
    .eq("assignee_id", employeeId)
    .neq("status", "done")
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("updated_at", { ascending: false })
    .limit(16);

  return (data ?? []) as OpenPlanRow[];
}

async function getCompletedTasksForEmployee(
  supabase: DatabaseClient,
  employeeId: string,
  range: AssistantRange,
) {
  const { data } = await supabase
    .from("plans")
    .select("id, title, due_date, status, priority, updated_at")
    .eq("assignee_id", employeeId)
    .eq("status", "done")
    .gte("updated_at", `${range.startDate}T00:00:00`)
    .lte("updated_at", `${range.endDate}T23:59:59.999`)
    .order("updated_at", { ascending: false })
    .limit(16);

  return (data ?? []) as OpenPlanRow[];
}

async function getOverdueTasksForEmployee(
  supabase: DatabaseClient,
  employeeId: string,
  today: string,
) {
  const { data } = await supabase
    .from("plans")
    .select("id, title, due_date, status, priority, updated_at")
    .eq("assignee_id", employeeId)
    .neq("status", "done")
    .not("due_date", "is", null)
    .lt("due_date", today)
    .order("due_date", { ascending: true })
    .limit(16);

  return (data ?? []) as OpenPlanRow[];
}

async function getTodayReportForEmployee(
  supabase: DatabaseClient,
  employeeId: string,
  today: string,
) {
  const { data } = await supabase
    .from("daily_reports")
    .select("id, report_date, completed_work, current_work, next_plan, blockers, status, updated_at")
    .eq("employee_id", employeeId)
    .eq("report_date", today)
    .maybeSingle();

  return data as DailyReportRow | null;
}

function parseRelativeDate(message: string, today: string) {
  const normalized = normalizeAssistantText(message);
  const isoMatch = normalized.match(/\b(20\d{2}-\d{2}-\d{2})\b/);

  if (isoMatch) {
    return isoMatch[1];
  }

  if (normalized.includes("bugun")) {
    return today;
  }

  if (normalized.includes("ertaga")) {
    return shiftIsoDate(today, 1);
  }

  if (normalized.includes("indin")) {
    return shiftIsoDate(today, 2);
  }

  return "";
}

function parsePriority(message: string): PlanPriority {
  const normalized = normalizeAssistantText(message);

  if (/(yuqori|high|urgent|shoshilinch)/i.test(normalized)) {
    return "high";
  }

  if (/(past|low)/i.test(normalized)) {
    return "low";
  }

  return "medium";
}

function parseAssignmentTitle(message: string, employeeName: string) {
  const quotedMatch = message.match(/["“](.+?)["”]/);

  if (quotedMatch?.[1]) {
    return sanitizeThreadTitle(quotedMatch[1]);
  }

  const colonParts = message.split(":");
  if (
    colonParts.length > 1 &&
    /(biriktir|vazifa|task|assign)/i.test(colonParts[0] ?? "")
  ) {
    const afterColon = colonParts.slice(1).join(":").trim();

    if (afterColon) {
      return sanitizeThreadTitle(afterColon);
    }
  }

  const employeeTokens = employeeName
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3);
  const employeePatterns = employeeTokens.map((token) =>
    new RegExp(`\\b${escapeRegExp(token)}(ga|ka|qa|ni|ning|da|dan)?\\b`, "ig"),
  );

  const normalized = message
    .replace(new RegExp(escapeRegExp(employeeName), "ig"), " ")
    .replace(/\b(yangi vazifa|yangi task)\b/gi, " ")
    .replace(/\b(ga|ka|qa|ni|ning|uchun|shu|ish(ni)?|vazifa(sini)?|task)\b/gi, " ")
    .replace(/\b(biriktir(ing|ib)?|ber(ing)?|yarat(ing)?|qilib qo'y|assign)\b/gi, " ")
    .replace(/\b(bugun|ertaga|indin|yuqori|past|o'rtacha|high|low|medium|urgent|shoshilinch)\b/gi, " ")
    .replace(/\b(20\d{2}-\d{2}-\d{2})\b/g, " ")
    .replace(/^[\s:,-]+/g, " ")
    .replace(/[\s:,-]+$/g, " ");

  const cleaned = employeePatterns.reduce(
    (result, pattern) => result.replace(pattern, " "),
    normalized,
  )
    .replace(/\s+/g, " ")
    .trim();

  return sanitizeThreadTitle(cleaned);
}

async function getTelegramConfigForLogging(supabase: DatabaseClient) {
  const adminClient = hasSupabaseServiceRoleEnv() ? createAdminClient() : null;

  if (adminClient) {
    return getTelegramConfig(adminClient);
  }

  return getTelegramConfig(supabase);
}

async function tryLogAssistantEvent(
  supabase: DatabaseClient,
  viewer: Viewer,
  entry: Parameters<typeof sendTelegramJsonLog>[1],
) {
  try {
    const telegramConfig = await getTelegramConfigForLogging(supabase);

    if (!telegramConfig?.logChannelId) {
      return;
    }

    await sendTelegramJsonLog(telegramConfig, {
      actor: {
        id: viewer.id,
        name: viewer.full_name,
      },
      ...entry,
    });
  } catch {
    // Logging must never block the assistant flow.
  }
}

export async function logAssistantFailure(
  supabase: DatabaseClient,
  viewer: Viewer,
  event: string,
  data: Record<string, unknown>,
) {
  await tryLogAssistantEvent(supabase, viewer, {
    event,
    status: "error",
    data,
  });
}

function buildAssignmentTelegramMessage({
  title,
  dueDate,
  plansUrl,
}: {
  title: string;
  dueDate: string;
  plansUrl: string;
}) {
  return [
    "Sizga vazifa biriktirildi.",
    "",
    `Vazifa: ${title}`,
    dueDate ? `Deadline: ${dueDate}` : null,
    "",
    "Vazifani ko'rish uchun quyidagi linkga kiring:",
    plansUrl,
  ]
    .filter(Boolean)
    .join("\n");
}

function normalizeTelegramUsername(value: string | null | undefined) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return "";
  }

  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

async function notifyAssignedEmployee(
  supabase: DatabaseClient,
  viewer: Viewer,
  assignee: EmployeeLookup,
  planId: string,
  title: string,
  dueDate: string,
) {
  const telegramConfig = await getTelegramConfig(supabase);
  const assigneeChatId = assignee.telegram_chat_id?.trim();
  const assigneeUsername = normalizeTelegramUsername(assignee.telegram_username);

  if (!telegramConfig || !assigneeChatId) {
    if (telegramConfig) {
      await sendTelegramJsonLog(telegramConfig, {
        event: "ai.plan_assignment.skipped",
        status: "info",
        actor: {
          id: viewer.id,
          name: viewer.full_name,
        },
        data: {
          planId,
          assigneeId: assignee.id,
          assigneeName: assignee.full_name,
          assigneeUsername: assigneeUsername || null,
          reason: assigneeUsername
            ? "assignee_username_requires_chat_id"
            : "assignee_missing_telegram_chat_id",
        },
      }).catch(() => undefined);
    }

    return;
  }

  const plansUrl = `${await getRequestOrigin()}/plans`;
  const message = buildAssignmentTelegramMessage({
    title,
    dueDate,
    plansUrl,
  });

  try {
    await sendTelegramTextMessage(telegramConfig, message, {
      chatId: assigneeChatId,
    });

    await sendTelegramJsonLog(telegramConfig, {
      event: "ai.plan_assignment.sent",
      status: "success",
      actor: {
        id: viewer.id,
        name: viewer.full_name,
      },
      data: {
        planId,
        assigneeId: assignee.id,
        assigneeName: assignee.full_name,
        assigneeChatId,
        assigneeUsername: assigneeUsername || null,
        title,
        dueDate: dueDate || null,
      },
    }).catch(() => undefined);
  } catch (error) {
    await sendTelegramJsonLog(telegramConfig, {
      event: "ai.plan_assignment.failed",
      status: "error",
      actor: {
        id: viewer.id,
        name: viewer.full_name,
      },
      data: {
        planId,
        assigneeId: assignee.id,
        assigneeName: assignee.full_name,
        assigneeChatId,
        assigneeUsername: assigneeUsername || null,
        title,
        dueDate: dueDate || null,
        error: error instanceof Error ? error.message : "Telegram xabari yuborilmadi.",
      },
    }).catch(() => undefined);
  }
}

async function buildTodayTasksReply(
  supabase: DatabaseClient,
  viewer: Viewer,
  message: string,
  memory: AssistantMemory,
): Promise<AssistantReply> {
  const today = getTodayIsoDate();
  const targetEmployee =
    (await resolveEmployeeFromMessage(supabase, viewer, message, memory)) ??
    getViewerEmployeeLookup(viewer);

  const tasks = await getOpenTasksForEmployee(supabase, targetEmployee.id);
  const overdue = tasks.filter((task) => Boolean(task.due_date && task.due_date < today));
  const dueToday = tasks.filter((task) => task.due_date === today);
  const other = tasks.filter((task) => !overdue.includes(task) && !dueToday.includes(task));
  const intro =
    targetEmployee.id === viewer.id
      ? "Bugun sizning faol vazifalaringiz:"
      : `${targetEmployee.full_name} uchun bugungi faol vazifalar:`;

  if (tasks.length === 0) {
    return {
      intent: "today_tasks",
      memory: {
        lastIntent: "today_tasks",
        lastEmployeeId: targetEmployee.id,
        lastEmployeeName: targetEmployee.full_name,
        lastDate: today,
      },
      content: `${intro}\n\nHozircha ochiq vazifa topilmadi. Agar kerak bo'lsa yangi vazifa ham biriktirib beraman.`,
    };
  }

  const lines = [intro, ""];

  if (dueToday.length > 0) {
    lines.push("Deadline bugun:");
    dueToday.slice(0, MAX_VISIBLE_ITEMS).forEach((task) => lines.push(formatTaskLine(task, today)));
    lines.push("");
  }

  if (overdue.length > 0) {
    lines.push("Kechikkan vazifalar:");
    overdue.slice(0, MAX_VISIBLE_ITEMS).forEach((task) => lines.push(formatTaskLine(task, today)));
    lines.push("");
  }

  if (other.length > 0) {
    lines.push("Qolgan faol vazifalar:");
    other.slice(0, MAX_VISIBLE_ITEMS).forEach((task) => lines.push(formatTaskLine(task, today)));
  }

  if (tasks.length > MAX_VISIBLE_ITEMS) {
    lines.push("");
    lines.push(`Jami ${tasks.length} ta ochiq vazifa bor. Yuqorida eng muhimlari ko'rsatildi.`);
  }

  return {
    intent: "today_tasks",
    memory: {
      lastIntent: "today_tasks",
      lastEmployeeId: targetEmployee.id,
      lastEmployeeName: targetEmployee.full_name,
      lastDate: today,
    },
    content: lines.filter(Boolean).join("\n"),
  };
}

async function buildCompletedTasksReply(
  supabase: DatabaseClient,
  viewer: Viewer,
  message: string,
  memory: AssistantMemory,
): Promise<AssistantReply> {
  const today = getTodayIsoDate();
  const range = parseRangeFromMessage(message, today, memory, 1);
  const employee =
    (await resolveEmployeeFromMessage(supabase, viewer, message, memory)) ??
    getViewerEmployeeLookup(viewer);
  const tasks = await getCompletedTasksForEmployee(supabase, employee.id, range);
  const intro =
    employee.id === viewer.id
      ? `${range.label} yakunlagan vazifalaringiz:`
      : `${employee.full_name} ${range.label.toLocaleLowerCase()} yakunlagan vazifalar:`;

  if (tasks.length === 0) {
    return {
      intent: "completed_tasks",
      memory: {
        lastIntent: "completed_tasks",
        lastEmployeeId: employee.id,
        lastEmployeeName: employee.full_name,
        lastRangeLabel: range.label,
        lastRangeDays: range.days,
        lastDate: range.endDate,
      },
      content:
        employee.id === viewer.id
          ? `${range.label} hali yakunlangan vazifa topilmadi.`
          : `${employee.full_name} uchun ${range.label.toLocaleLowerCase()} yakunlangan vazifa topilmadi.`,
    };
  }

  const lines = [
    intro,
    "",
    ...tasks.slice(0, MAX_VISIBLE_ITEMS).map((task) => formatCompletedTaskLine(task)),
  ];

  if (tasks.length > MAX_VISIBLE_ITEMS) {
    lines.push("");
    lines.push(`Jami ${tasks.length} ta yakunlangan vazifa bor. Yuqorida asosiylari ko'rsatildi.`);
  }

  return {
    intent: "completed_tasks",
    memory: {
      lastIntent: "completed_tasks",
      lastEmployeeId: employee.id,
      lastEmployeeName: employee.full_name,
      lastRangeLabel: range.label,
      lastRangeDays: range.days,
      lastDate: range.endDate,
    },
    content: lines.join("\n"),
  };
}

async function buildOverdueTasksReply(
  supabase: DatabaseClient,
  viewer: Viewer,
  message: string,
  memory: AssistantMemory,
): Promise<AssistantReply> {
  const today = getTodayIsoDate();
  const employee =
    (await resolveEmployeeFromMessage(supabase, viewer, message, memory)) ??
    getViewerEmployeeLookup(viewer);
  const tasks = await getOverdueTasksForEmployee(supabase, employee.id, today);
  const intro =
    employee.id === viewer.id
      ? "Sizdagi kechikkan vazifalar:"
      : `${employee.full_name} dagi kechikkan vazifalar:`;

  if (tasks.length === 0) {
    return {
      intent: "overdue_tasks",
      memory: {
        lastIntent: "overdue_tasks",
        lastEmployeeId: employee.id,
        lastEmployeeName: employee.full_name,
        lastDate: today,
      },
      content:
        employee.id === viewer.id
          ? "Hozir sizda kechikkan vazifa yo'q."
          : `${employee.full_name} da hozir kechikkan vazifa ko'rinmadi.`,
    };
  }

  return {
    intent: "overdue_tasks",
    memory: {
      lastIntent: "overdue_tasks",
      lastEmployeeId: employee.id,
      lastEmployeeName: employee.full_name,
      lastDate: today,
    },
    content: [
      intro,
      "",
      ...tasks.slice(0, MAX_VISIBLE_ITEMS).map((task) => formatTaskLine(task, today)),
      tasks.length > MAX_VISIBLE_ITEMS ? "" : null,
      tasks.length > MAX_VISIBLE_ITEMS
        ? `Jami ${tasks.length} ta kechikkan vazifa bor.`
        : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

async function buildTodayReportReply(
  supabase: DatabaseClient,
  viewer: Viewer,
  message: string,
  memory: AssistantMemory,
): Promise<AssistantReply> {
  const today = getTodayIsoDate();
  const targetDate = parseSingleDate(message, today, memory);
  const employee =
    (await resolveEmployeeFromMessage(supabase, viewer, message, memory)) ??
    getViewerEmployeeLookup(viewer);

  const report = await getTodayReportForEmployee(supabase, employee.id, targetDate);
  const dateLabel = targetDate === today ? "Bugungi" : `${formatDate(targetDate)} kungi`;

  if (!report) {
    return {
      intent: "today_report",
      memory: {
        lastIntent: "today_report",
        lastEmployeeId: employee.id,
        lastEmployeeName: employee.full_name,
        lastDate: targetDate,
      },
      content:
        employee.id === viewer.id
          ? `${dateLabel} hisobotingiz hali topshirilmagan.`
          : `${employee.full_name} ${dateLabel.toLocaleLowerCase()} hisobotni hali topshirmagan.`,
    };
  }

  return {
    intent: "today_report",
    memory: {
      lastIntent: "today_report",
      lastEmployeeId: employee.id,
      lastEmployeeName: employee.full_name,
      lastDate: targetDate,
    },
    content: [
      employee.id === viewer.id
        ? `${dateLabel} hisobot holati:`
        : `${employee.full_name} ning ${dateLabel.toLocaleLowerCase()} hisobot holati:`,
      "",
      `Holat: ${report.status === "blocked" ? "To'siq bor" : report.status === "done" ? "Bajarildi" : "Jarayonda"}`,
      `Bajarilgan ishlar: ${truncateText(report.completed_work, 220)}`,
      `Joriy ishlar: ${truncateText(report.current_work, 180)}`,
      `Keyingi reja: ${truncateText(report.next_plan, 180)}`,
      report.blockers ? `Blocker: ${truncateText(report.blockers, 180)}` : "Blocker: yo'q",
    ].join("\n"),
  };
}

async function buildMissingReportsReply(
  supabase: DatabaseClient,
  viewer: Viewer,
  message: string,
  memory: AssistantMemory,
): Promise<AssistantReply> {
  if (!hasRole(viewer.role, ["admin", "manager"])) {
    return {
      intent: "missing_reports",
      kind: "info",
      content: "Kim hisobot topshirmaganini ko'rish faqat rahbarlar uchun ochiq.",
      memory: {
        lastIntent: "missing_reports",
      },
    };
  }

  const today = getTodayIsoDate();
  const targetDate = parseSingleDate(message, today, memory);
  const [profilesRes, reportsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, title, role")
      .eq("role", "employee")
      .order("full_name"),
    supabase
      .from("daily_reports")
      .select("employee_id")
      .eq("report_date", targetDate),
  ]);

  const employees = (profilesRes.data ?? []) as EmployeeLookup[];
  const reportEmployeeIds = new Set(
    (reportsRes.data ?? []).map((row) => (row as { employee_id: string }).employee_id),
  );
  const missingEmployees = employees.filter((employee) => !reportEmployeeIds.has(employee.id));
  const dateLabel = targetDate === today ? "Bugun" : formatDate(targetDate);

  if (missingEmployees.length === 0) {
    return {
      intent: "missing_reports",
      memory: {
        lastIntent: "missing_reports",
        lastDate: targetDate,
      },
      content: `${dateLabel} barcha xodimlar hisobot topshirgan.`,
    };
  }

  return {
    intent: "missing_reports",
    memory: {
      lastIntent: "missing_reports",
      lastDate: targetDate,
    },
    content: [
      `${dateLabel} hisobot topshirmagan xodimlar:`,
      "",
      ...missingEmployees.slice(0, MAX_VISIBLE_ITEMS).map((employee, index) => {
        const titleSuffix = employee.title ? `, ${employee.title}` : "";
        return `${index + 1}. ${employee.full_name}${titleSuffix}`;
      }),
      missingEmployees.length > MAX_VISIBLE_ITEMS ? "" : null,
      missingEmployees.length > MAX_VISIBLE_ITEMS
        ? `Jami ${missingEmployees.length} xodim hisobot topshirmagan.`
        : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

async function buildEmployeeSummaryReply(
  supabase: DatabaseClient,
  viewer: Viewer,
  message: string,
  memory: AssistantMemory,
): Promise<AssistantReply> {
  const today = getTodayIsoDate();
  const employee = await resolveEmployeeFromMessage(supabase, viewer, message, memory, {
    defaultToViewer: true,
  });

  if (!employee) {
    return {
      intent: "employee_summary",
      kind: "info",
      content: "Qaysi xodim haqida ma'lumot kerakligini aniqroq yozing.",
      memory: {
        lastIntent: "employee_summary",
      },
    };
  }

  const todayRange = parseRangeFromMessage("bugun", today, memory, 1);
  const [openTasks, completedTasks, report] = await Promise.all([
    getOpenTasksForEmployee(supabase, employee.id),
    getCompletedTasksForEmployee(supabase, employee.id, todayRange),
    getTodayReportForEmployee(supabase, employee.id, today),
  ]);
  const overdueCount = openTasks.filter((task) => Boolean(task.due_date && task.due_date < today)).length;
  const firstName = employee.full_name.split(/\s+/)[0] ?? employee.full_name;

  return {
    intent: "employee_summary",
    memory: {
      lastIntent: "employee_summary",
      lastEmployeeId: employee.id,
      lastEmployeeName: employee.full_name,
      lastDate: today,
    },
    content: [
      employee.id === viewer.id ? "Sizning bugungi qisqa holatingiz:" : `${firstName} bo'yicha bugungi qisqa holat:`,
      "",
      `Ochiq vazifalar: ${openTasks.length} ta`,
      `Bugun yakunlangan vazifalar: ${completedTasks.length} ta`,
      `Kechikkan vazifalar: ${overdueCount} ta`,
      `Hisobot: ${report ? (report.status === "blocked" ? "blocker bilan topshirilgan" : report.status === "done" ? "topshirilgan, holat bajarildi" : "topshirilgan, jarayonda") : "hali topshirilmagan"}`,
      report?.blockers?.trim() ? `Blocker: ${truncateText(report.blockers, 160)}` : "Blocker: yo'q",
      openTasks[0] ? `Eng yaqin vazifa: ${openTasks[0].title}` : "Eng yaqin vazifa: yo'q",
    ].join("\n"),
  };
}

async function buildBlockerReply(
  supabase: DatabaseClient,
  viewer: Viewer,
  message: string,
  memory: AssistantMemory,
): Promise<AssistantReply> {
  const today = getTodayIsoDate();
  const targetDate = parseSingleDate(message, today, memory);
  const requestedEmployee = await resolveEmployeeFromMessage(supabase, viewer, message, memory, {
    defaultToViewer: !hasRole(viewer.role, ["admin", "manager"]),
  });

  if (!hasRole(viewer.role, ["admin", "manager"]) || requestedEmployee) {
    const employee = requestedEmployee ?? getViewerEmployeeLookup(viewer);
    const report = await getTodayReportForEmployee(supabase, employee.id, targetDate);
    const blockers = report?.blockers?.trim();
    const label = targetDate === today ? "Bugungi" : `${formatDate(targetDate)} kungi`;

    return {
      intent: "blockers",
      memory: {
        lastIntent: "blockers",
        lastEmployeeId: employee.id,
        lastEmployeeName: employee.full_name,
        lastDate: targetDate,
      },
      content: blockers
        ? employee.id === viewer.id
          ? `${label} blocker:\n\n${blockers}`
          : `${employee.full_name} uchun ${label.toLocaleLowerCase()} blocker:\n\n${blockers}`
        : employee.id === viewer.id
          ? `${label} hisobotingizda blocker ko'rsatilmagan.`
          : `${employee.full_name} uchun ${label.toLocaleLowerCase()} blocker ko'rsatilmagan.`,
    };
  }

  const { data } = await supabase
    .from("daily_reports")
    .select("id, employee_id, blockers")
    .eq("report_date", targetDate)
    .eq("status", "blocked")
    .order("updated_at", { ascending: false })
    .limit(8);

  const blockedRows = (data ?? []) as Array<{
    id: string;
    employee_id: string;
    blockers: string | null;
  }>;

  const employeeIds = Array.from(new Set(blockedRows.map((row) => row.employee_id)));
  const { data: employeeRows } = employeeIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", employeeIds)
    : { data: [] as Array<{ id: string; full_name: string }> };
  const employeeNames = new Map(
    ((employeeRows ?? []) as Array<{ id: string; full_name: string }>).map((employee) => [
      employee.id,
      employee.full_name,
    ]),
  );

  if (blockedRows.length === 0) {
    return {
      intent: "blockers",
      memory: {
        lastIntent: "blockers",
        lastDate: targetDate,
      },
      content:
        targetDate === today
          ? "Bugun blocker bilan topshirilgan hisobot topilmadi."
          : `${formatDate(targetDate)} kuni blocker bilan topshirilgan hisobot topilmadi.`,
    };
  }

  return {
    intent: "blockers",
    memory: {
      lastIntent: "blockers",
      lastDate: targetDate,
    },
    content: [
      targetDate === today ? "Bugungi blockerlar:" : `${formatDate(targetDate)} kungi blockerlar:`,
      "",
      ...blockedRows.map((row) => {
        const employeeName = employeeNames.get(row.employee_id) ?? "Noma'lum xodim";
        return `- ${employeeName}: ${truncateText(row.blockers ?? "Sabab ko'rsatilmagan.", 180)}`;
      }),
    ].join("\n"),
  };
}

async function buildActivityReply(
  supabase: DatabaseClient,
  viewer: Viewer,
  message: string,
  memory: AssistantMemory,
): Promise<AssistantReply> {
  if (!hasRole(viewer.role, ["admin", "manager"])) {
    return {
      intent: "activity_leaderboard",
      kind: "info",
      content: "Faollik reytingi faqat rahbarlar uchun ochiq.",
      memory: {
        lastIntent: "activity_leaderboard",
      },
    };
  }

  const normalized = normalizeAssistantText(message);
  const today = getTodayIsoDate();
  const range = parseRangeFromMessage(normalized, today, memory, 30);
  const rangeDays = range.days;
  const rangeLabel = range.label;
  const startDate = range.startDate;

  const [profilesRes, reportsRes, plansRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, title, role")
      .order("full_name"),
    supabase
      .from("daily_reports")
      .select("employee_id")
      .gte("report_date", startDate)
      .lte("report_date", range.endDate),
    supabase
      .from("plans")
      .select("assignee_id")
      .eq("status", "done")
      .gte("updated_at", `${startDate}T00:00:00`)
      .lte("updated_at", `${range.endDate}T23:59:59.999`),
  ]);

  const employees = ((profilesRes.data ?? []) as EmployeeLookup[]).filter(
    (employee) => employee.role === "employee",
  );
  const reportCounts = new Map<string, number>();
  const doneTaskCounts = new Map<string, number>();

  for (const row of reportsRes.data ?? []) {
    const employeeId = (row as { employee_id: string }).employee_id;
    reportCounts.set(employeeId, (reportCounts.get(employeeId) ?? 0) + 1);
  }

  for (const row of plansRes.data ?? []) {
    const employeeId = (row as { assignee_id: string }).assignee_id;
    doneTaskCounts.set(employeeId, (doneTaskCounts.get(employeeId) ?? 0) + 1);
  }

  const leaderboard = employees
    .map((employee) => {
      const reports = reportCounts.get(employee.id) ?? 0;
      const donePlans = doneTaskCounts.get(employee.id) ?? 0;
      return {
        employee,
        reports,
        donePlans,
        totalActions: reports + donePlans,
      };
    })
    .filter((entry) => entry.totalActions > 0)
    .sort((left, right) => right.totalActions - left.totalActions || right.donePlans - left.donePlans)
    .slice(0, 5);

  if (leaderboard.length === 0) {
    return {
      intent: "activity_leaderboard",
      memory: {
        lastIntent: "activity_leaderboard",
        lastRangeLabel: rangeLabel,
        lastRangeDays: rangeDays,
        lastDate: today,
      },
      content:
        rangeDays === 1
          ? "Bugun bo'yicha hali yetarli faollik ko'rinmadi. Hozircha yakunlangan vazifa yoki topshirilgan hisobot topilmadi.\n\nXohlasangiz, so'nggi 7 kun bo'yicha ham reytingni chiqarib beraman."
          : `${rangeLabel} bo'yicha faollik uchun yetarli amal topilmadi. Agar xohlasangiz boshqa davr bo'yicha ham ko'rsataman.`,
    };
  }

  return {
    intent: "activity_leaderboard",
    memory: {
      lastIntent: "activity_leaderboard",
      lastRangeLabel: rangeLabel,
      lastRangeDays: rangeDays,
      lastEmployeeId: leaderboard[0].employee.id,
      lastEmployeeName: leaderboard[0].employee.full_name,
      lastDate: today,
    },
    content: [
      `${rangeLabel} bo'yicha faollik reytingi:`,
      "",
      ...leaderboard.map((entry, index) => {
        const titleSuffix = entry.employee.title ? `, ${entry.employee.title}` : "";
        return `${index + 1}. ${entry.employee.full_name}${titleSuffix} — ${entry.totalActions} amal (${entry.donePlans} ta yakunlangan vazifa, ${entry.reports} ta hisobot)`;
      }),
      "",
      `Eng faol xodim: ${leaderboard[0].employee.full_name}`,
    ].join("\n"),
  };
}

async function buildAssignTaskReply(
  supabase: DatabaseClient,
  viewer: Viewer,
  message: string,
  memory: AssistantMemory,
): Promise<AssistantReply> {
  if (!hasRole(viewer.role, ["admin", "manager"])) {
    return {
      intent: "assign_task",
      kind: "info",
      content: "Vazifa biriktirish faqat admin yoki manager uchun ochiq.",
      memory: {
        lastIntent: "assign_task",
      },
    };
  }

  const today = getTodayIsoDate();
  const employee = await resolveEmployeeFromMessage(supabase, viewer, message, memory, {
    defaultToViewer: false,
  });

  if (!employee) {
    return {
      intent: "assign_task",
      kind: "info",
      content:
        'Kimga vazifa biriktirishni aniqlay olmadim. Masalan: Ali ga "Savdo hisobotini tayyorlash" vazifasini ertaga biriktir.',
      memory: {
        lastIntent: "assign_task",
      },
    };
  }

  const dueDate = parseRelativeDate(message, today);
  const priority = parsePriority(message);
  const title = parseAssignmentTitle(message, employee.full_name);

  if (!title || title === DEFAULT_THREAD_TITLE || title.length < 3) {
    return {
      intent: "assign_task",
      kind: "info",
      content:
        'Vazifa nomini aniqroq yozing. Masalan: Ali ga "Mijozlar ro\'yxatini yangilash" vazifasini bugun biriktir.',
      memory: {
        lastIntent: "assign_task",
        lastEmployeeId: employee.id,
        lastEmployeeName: employee.full_name,
        lastDate: dueDate || today,
      },
    };
  }

  const { data: insertedPlan, error } = await supabase
    .from("plans")
    .insert({
      assignee_id: employee.id,
      created_by: viewer.id,
      title,
      description: null,
      due_date: dueDate || null,
      priority,
      status: "todo",
    })
    .select("id")
    .single();

  if (error || !insertedPlan) {
    throw new Error(error?.message ?? "Vazifani yaratib bo'lmadi.");
  }

  await notifyAssignedEmployee(supabase, viewer, employee, insertedPlan.id, title, dueDate);

  return {
    intent: "assign_task",
    memory: {
      lastIntent: "assign_task",
      lastEmployeeId: employee.id,
      lastEmployeeName: employee.full_name,
      lastDate: dueDate || today,
    },
    content: [
      "Vazifa muvaffaqiyatli biriktirildi.",
      "",
      `Xodim: ${employee.full_name}`,
      `Vazifa: ${title}`,
      `Prioritet: ${getPriorityLabel(priority)}`,
      dueDate ? `Deadline: ${formatDate(dueDate)}` : "Deadline: belgilanmagan",
    ].join("\n"),
  };
}

function buildGreetingReply(viewer: Viewer) {
  const firstName = viewer.full_name.split(/\s+/)[0] ?? "hamkasb";
  const lines = [
    `Salom, ${firstName}! Men tayyorman.`,
    "",
    "Sizga vazifalar, hisobotlar, blockerlar va ichki ish oqimlari bo'yicha tez yordam bera olaman.",
  ];

  if (hasRole(viewer.role, ["admin", "manager"])) {
    lines.push("Xohlasangiz xodimlar faolligi yoki ma'lum xodimning bugungi holatini ham chiqarib beraman.");
  }

  lines.push("");
  lines.push('Masalan: "Bugun manga nima vazifalar bor?"');

  return lines.join("\n");
}

function buildFallbackReply(viewer: Viewer, message: string) {
  const normalized = normalizeAssistantText(message);
  const suggestions: string[] = [];

  if (/(vazifa|task|ish)/i.test(normalized)) {
    suggestions.push('"Bugun manga nima vazifalar bor?"');
    suggestions.push('"Bugun yakunlagan vazifalarimni ko\'rsat"');
    suggestions.push('"Mendagi kechikkan vazifalarni ko\'rsat"');
  }

  if (/(hisobot|report)/i.test(normalized)) {
    suggestions.push('"Bugungi hisobotim holatini ayt"');
    suggestions.push('"Bugun kim hisobot topshirmadi?"');
  }

  if (/(xodim|faol|aktiv|reyting)/i.test(normalized)) {
    suggestions.push('"Eng faol xodimlar reytingini ko\'rsat"');
    suggestions.push('"Dilbekning bugungi holatini ayt"');
  }

  if (hasRole(viewer.role, ["admin", "manager"])) {
    suggestions.push('"Ali ga \\"Inventar ro\'yxatini yangilash\\" vazifasini ertaga biriktir"');
  }

  if (suggestions.length === 0) {
    suggestions.push('"Bugun manga nima vazifalar bor?"');
    suggestions.push('"Bugungi hisobotim holatini ayt"');
    suggestions.push('"Bugungi blockerlar kimda?"');
    if (hasRole(viewer.role, ["admin", "manager"])) {
      suggestions.push('"Eng faol xodimlar reytingini ko\'rsat"');
    }
  }

  return [
    "Savolni qisman tushundim, lekin aniq amal bajarish uchun uni biroz ravshanroq yozsangiz yaxshi bo'ladi.",
    "",
    "Masalan, quyidagilardan birini yozishingiz mumkin:",
    ...Array.from(new Set(suggestions)).slice(0, 5).map((item) => `- ${item}`),
  ].join("\n");
}

async function generateAssistantReply(
  supabase: DatabaseClient,
  viewer: Viewer,
  message: string,
  memory: AssistantMemory,
): Promise<AssistantReply> {
  const intent = detectAssistantIntent(message, memory);

  switch (intent) {
    case "assign_task":
      return buildAssignTaskReply(supabase, viewer, message, memory);
    case "activity_leaderboard":
      return buildActivityReply(supabase, viewer, message, memory);
    case "today_tasks":
      return buildTodayTasksReply(supabase, viewer, message, memory);
    case "completed_tasks":
      return buildCompletedTasksReply(supabase, viewer, message, memory);
    case "overdue_tasks":
      return buildOverdueTasksReply(supabase, viewer, message, memory);
    case "missing_reports":
      return buildMissingReportsReply(supabase, viewer, message, memory);
    case "blockers":
      return buildBlockerReply(supabase, viewer, message, memory);
    case "today_report":
      return buildTodayReportReply(supabase, viewer, message, memory);
    case "employee_summary":
      return buildEmployeeSummaryReply(supabase, viewer, message, memory);
    case "greeting":
      return {
        intent: "greeting",
        memory: {
          lastIntent: "greeting",
        },
        content: buildGreetingReply(viewer),
      };
    case "help":
      return {
        intent: "help",
        memory: {
          lastIntent: "help",
        },
        content: buildHelpMessage(viewer),
      };
    default:
      return {
        intent: "fallback",
        kind: "info",
        memory: {
          lastIntent: "fallback",
        },
        content: buildFallbackReply(viewer, message),
      };
  }
}

export async function listAssistantThreads(
  supabase: DatabaseClient,
  viewerId: string,
): Promise<AssistantThreadSummary[]> {
  const { data } = await supabase
    .from("ai_threads")
    .select("id, title, last_message_preview, last_message_at, created_at, updated_at")
    .eq("user_id", viewerId)
    .order("last_message_at", { ascending: false })
    .limit(20);

  return ((data ?? []) as Array<
    Pick<AiThread, "id" | "title" | "last_message_preview" | "last_message_at" | "created_at" | "updated_at">
  >).map(toThreadSummary);
}

export async function createAssistantThread(
  supabase: DatabaseClient,
  viewerId: string,
): Promise<AssistantThreadSummary> {
  const { data, error } = await supabase
    .from("ai_threads")
    .insert({
      user_id: viewerId,
      title: DEFAULT_THREAD_TITLE,
      last_message_preview: null,
      memory: {},
    })
    .select("id, title, last_message_preview, last_message_at, created_at, updated_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "AI chat yaratib bo'lmadi.");
  }

  return toThreadSummary(data as Pick<
    AiThread,
    "id" | "title" | "last_message_preview" | "last_message_at" | "created_at" | "updated_at"
  >);
}

export async function getAssistantThreadDetail(
  supabase: DatabaseClient,
  viewerId: string,
  threadId: string,
): Promise<AssistantThreadDetail | null> {
  const { data: thread } = await supabase
    .from("ai_threads")
    .select("id, title, last_message_preview, last_message_at, created_at, updated_at")
    .eq("id", threadId)
    .eq("user_id", viewerId)
    .maybeSingle();

  if (!thread) {
    return null;
  }

  const { data: messages } = await supabase
    .from("ai_messages")
    .select("id, sender, content, metadata, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true })
    .limit(80);

  return {
    thread: toThreadSummary(thread as Pick<
      AiThread,
      "id" | "title" | "last_message_preview" | "last_message_at" | "created_at" | "updated_at"
    >),
    messages: ((messages ?? []) as Array<
      Pick<AiMessage, "id" | "sender" | "content" | "metadata" | "created_at">
    >).map(toMessageRecord),
  };
}

export async function deleteAssistantThread(
  supabase: DatabaseClient,
  viewerId: string,
  threadId: string,
) {
  const { data, error } = await supabase
    .from("ai_threads")
    .delete()
    .eq("id", threadId)
    .eq("user_id", viewerId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? true : false;
}

export async function sendAssistantMessage(
  supabase: DatabaseClient,
  viewer: Viewer,
  threadId: string,
  rawContent: string,
) {
  const content = rawContent.trim();

  if (!content) {
    throw new Error("Xabar bo'sh bo'lmasligi kerak.");
  }

  const { data: thread } = await supabase
    .from("ai_threads")
    .select("id, user_id, title, memory, created_at, updated_at, last_message_at, last_message_preview")
    .eq("id", threadId)
    .eq("user_id", viewer.id)
    .maybeSingle();

  if (!thread) {
    throw new Error("AI chat topilmadi.");
  }

  const { data: insertedUserMessage, error: userMessageError } = await supabase
    .from("ai_messages")
    .insert({
      thread_id: threadId,
      sender: "user",
      content,
      metadata: {
        kind: "reply",
      },
    })
    .select("id, sender, content, metadata, created_at")
    .single();

  if (userMessageError || !insertedUserMessage) {
    throw new Error(userMessageError?.message ?? "Foydalanuvchi xabarini saqlab bo'lmadi.");
  }

  const { data: historyRows } = await supabase
    .from("ai_messages")
    .select("id, sender, content, metadata, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: false })
    .limit(MAX_HISTORY_MESSAGES);

  const history = ((historyRows ?? []) as Array<
    Pick<AiMessage, "id" | "sender" | "content" | "metadata" | "created_at">
  >).reverse();
  const currentMemory = parseAssistantMemory(thread.memory);

  let assistantReply: AssistantReply;

  try {
    assistantReply = await generateAssistantReply(supabase, viewer, content, currentMemory);
  } catch (error) {
    await tryLogAssistantEvent(supabase, viewer, {
      event: "ai.chat.failed",
      status: "error",
      data: {
        threadId,
        message: content,
        history: history.map((item) => ({
          sender: item.sender,
          content: truncateText(item.content, 160),
        })),
        error: error instanceof Error ? error.message : "AI assistant xatosi",
      },
    });

    assistantReply = {
      intent: "error",
      kind: "error",
      content: ASSISTANT_ERROR_MESSAGE,
      memory: {
        ...currentMemory,
        lastIntent: "error",
      },
    };
  }

  const { data: insertedAssistantMessage, error: assistantMessageError } = await supabase
    .from("ai_messages")
    .insert({
      thread_id: threadId,
      sender: "assistant",
      content: assistantReply.content,
      metadata: {
        kind: assistantReply.kind ?? "reply",
        intent: assistantReply.intent,
      },
    })
    .select("id, sender, content, metadata, created_at")
    .single();

  if (assistantMessageError || !insertedAssistantMessage) {
    throw new Error(
      assistantMessageError?.message ?? "AI javobini saqlab bo'lmadi.",
    );
  }

  const nextMemory = {
    ...currentMemory,
    ...(assistantReply.memory ?? {}),
  };
  const nextTitle =
    thread.title === DEFAULT_THREAD_TITLE ? sanitizeThreadTitle(content) : thread.title;
  const preview = truncateText(assistantReply.content, MAX_THREAD_PREVIEW_LENGTH);

  const { data: updatedThread, error: threadUpdateError } = await supabase
    .from("ai_threads")
    .update({
      title: nextTitle,
      last_message_preview: preview,
      last_message_at: insertedAssistantMessage.created_at,
      memory: serializeAssistantMemory(nextMemory),
    })
    .eq("id", threadId)
    .eq("user_id", viewer.id)
    .select("id, title, last_message_preview, last_message_at, created_at, updated_at")
    .single();

  if (threadUpdateError || !updatedThread) {
    throw new Error(threadUpdateError?.message ?? "AI chat holatini yangilab bo'lmadi.");
  }

  return {
    thread: toThreadSummary(updatedThread as Pick<
      AiThread,
      "id" | "title" | "last_message_preview" | "last_message_at" | "created_at" | "updated_at"
    >),
    userMessage: toMessageRecord(insertedUserMessage as Pick<
      AiMessage,
      "id" | "sender" | "content" | "metadata" | "created_at"
    >),
    assistantMessage: toMessageRecord(insertedAssistantMessage as Pick<
      AiMessage,
      "id" | "sender" | "content" | "metadata" | "created_at"
    >),
  };
}
