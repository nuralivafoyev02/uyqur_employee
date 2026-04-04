"use server";

import { revalidatePath } from "next/cache";

import { hasRole, requireViewer } from "@/lib/auth";
import { parseAppLanguage } from "@/lib/preferences";
import { buildTelegramCompletedPlansMessage } from "@/lib/telegram-report";
import { getRequestOrigin } from "@/lib/site-url";
import { hasSupabaseServiceRoleEnv, isSupabaseConfigured } from "@/lib/supabase/config";
import { createActionClient, createAdminClient } from "@/lib/supabase/server";
import {
  getTelegramConfig,
  sendTelegramJsonLog,
  sendTelegramTextMessage,
} from "@/lib/telegram-service";
import { getTodayIsoDate, isValidIsoDate } from "@/lib/utils";
import { type ActionState, validatePlanForm } from "@/lib/validations";
import type { PlanStatus } from "@/types/database";

type PlanField =
  | "title"
  | "description"
  | "assigneeId"
  | "dueDate"
  | "priority"
  | "status";

function buildPlanAssignmentMessage({
  title,
  dueDate,
  plansUrl,
}: {
  title: string;
  dueDate: string;
  plansUrl: string;
}) {
  return [
    "Sizga vazifa biriktirildi.🤓",
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

export async function savePlanAction(
  _prevState: ActionState<PlanField> | undefined,
  formData: FormData,
): Promise<ActionState<PlanField>> {
  const viewer = await requireViewer();

  if (!hasRole(viewer.role, ["admin", "manager"])) {
    return {
      success: false,
      message: "Bu amal faqat admin yoki manager uchun ochiq.",
    };
  }

  const validation = validatePlanForm(formData);

  if (!validation.data) {
    return {
      success: false,
      message: "Vazifa maydonlarini tekshirib chiqing.",
      fieldErrors: validation.fieldErrors,
    };
  }

  const supabase = await createActionClient();

  if (!supabase) {
    return {
      success: false,
      message: "Supabase ulanishi sozlanmagan.",
    };
  }

  const planIdEntry = formData.get("planId");
  const planId = typeof planIdEntry === "string" ? planIdEntry : "";
  const existingPlan = planId
    ? await supabase
      .from("plans")
      .select("id, assignee_id, title")
      .eq("id", planId)
      .maybeSingle()
      .then((result) => result.data)
    : null;
  const payload = {
    assignee_id: validation.data.assigneeId,
    title: validation.data.title,
    description: validation.data.description || null,
    due_date: validation.data.dueDate || null,
    priority: validation.data.priority,
    status: validation.data.status,
  };

  const operation = planId
    ? supabase.from("plans").update(payload).eq("id", planId)
    : supabase.from("plans").insert({
      ...payload,
      created_by: viewer.id,
    });

  const { error } = await operation;

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  const shouldNotifyAssignee =
    !planId || Boolean(existingPlan && existingPlan.assignee_id !== validation.data.assigneeId);

  if (shouldNotifyAssignee) {
    const [assigneeProfile, telegramConfig] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, telegram_chat_id, telegram_username")
        .eq("id", validation.data.assigneeId)
        .maybeSingle()
        .then((result) => result.data),
      getTelegramConfig(supabase),
    ]);

    const assigneeChatId = assigneeProfile?.telegram_chat_id?.trim();
    const assigneeUsername = normalizeTelegramUsername(assigneeProfile?.telegram_username);

    if (telegramConfig && assigneeProfile && assigneeChatId) {
      const plansUrl = `${await getRequestOrigin()}/plans`;
      const assignmentMessage = buildPlanAssignmentMessage({
        title: validation.data.title,
        dueDate: validation.data.dueDate,
        plansUrl,
      });

      try {
        await sendTelegramTextMessage(telegramConfig, assignmentMessage, {
          chatId: assigneeChatId,
        });

        await sendTelegramJsonLog(telegramConfig, {
          event: "telegram.plan_assignment.sent",
          status: "success",
          actor: {
            id: viewer.id,
            name: viewer.full_name,
          },
          data: {
            planId: planId || "new",
            assigneeId: validation.data.assigneeId,
            assigneeName: assigneeProfile.full_name,
            assigneeChatId,
            assigneeUsername: assigneeUsername || null,
            title: validation.data.title,
            dueDate: validation.data.dueDate || null,
            targetChatId: assigneeChatId,
          },
        }).catch(() => undefined);
      } catch (notificationError) {
        await sendTelegramJsonLog(telegramConfig, {
          event: "telegram.plan_assignment.failed",
          status: "error",
          actor: {
            id: viewer.id,
            name: viewer.full_name,
          },
          data: {
            planId: planId || "new",
            assigneeId: validation.data.assigneeId,
            assigneeName: assigneeProfile.full_name,
            assigneeChatId,
            assigneeUsername: assigneeUsername || null,
            title: validation.data.title,
            dueDate: validation.data.dueDate || null,
            error:
              notificationError instanceof Error && notificationError.message
                ? notificationError.message
                : "Telegramga private vazifa xabari yuborilmadi.",
          },
        }).catch(() => undefined);
      }
    } else if (telegramConfig) {
      await sendTelegramJsonLog(telegramConfig, {
        event: "telegram.plan_assignment.skipped",
        status: "info",
        actor: {
          id: viewer.id,
          name: viewer.full_name,
        },
        data: {
          planId: planId || "new",
          assigneeId: validation.data.assigneeId,
          assigneeUsername: assigneeUsername || null,
          title: validation.data.title,
          reason: !assigneeProfile
            ? "assignee_not_found"
            : !assigneeChatId
              ? assigneeUsername
                ? "assignee_username_requires_chat_id"
                : "assignee_missing_telegram_chat_id"
              : "telegram_not_connected",
        },
      }).catch(() => undefined);
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/plans");
  revalidatePath("/employees");
  revalidatePath(`/employees/${validation.data.assigneeId}`);
  revalidatePath("/api/employees");
  revalidatePath("/api/reports");

  return {
    success: true,
    message: "Vazifa saqlandi.",
    redirectTo: "/plans",
  };
}

export async function updatePlanStatusAction(formData: FormData) {
  const viewer = await requireViewer();
  const supabase = await createActionClient();

  if (!supabase) {
    return {
      success: false,
      message: "Supabase ulanishi sozlanmagan.",
    } satisfies ActionState;
  }

  const planIdEntry = formData.get("planId");
  const statusEntry = formData.get("status");
  const planId = typeof planIdEntry === "string" ? planIdEntry : "";
  const rawStatus = typeof statusEntry === "string" ? statusEntry : "";

  if (!planId) {
    return {
      success: false,
      message: "Vazifa topilmadi.",
    } satisfies ActionState;
  }

  if (
    rawStatus !== "todo" &&
    rawStatus !== "in_progress" &&
    rawStatus !== "done" &&
    rawStatus !== "blocked"
  ) {
    return {
      success: false,
      message: "Status noto'g'ri tanlangan.",
    } satisfies ActionState;
  }

  const { data: plan } = await supabase
    .from("plans")
    .select("assignee_id")
    .eq("id", planId)
    .maybeSingle();

  if (!plan) {
    return {
      success: false,
      message: "Vazifa topilmadi.",
    } satisfies ActionState;
  }

  if (!hasRole(viewer.role, ["admin", "manager"]) && plan.assignee_id !== viewer.id) {
    return {
      success: false,
      message: "Bu vazifa statusini yangilashga ruxsat yo'q.",
    } satisfies ActionState;
  }

  let error: { message: string } | null = null;

  if (hasRole(viewer.role, ["admin", "manager"])) {
    const response = await supabase
      .from("plans")
      .update({
        status: rawStatus as PlanStatus,
      })
      .eq("id", planId);

    error = response.error;
  } else {
    const response = await supabase.rpc("update_plan_status", {
      plan_id: planId,
      next_status: rawStatus as PlanStatus,
    });

    error = response.error;
  }

  if (error) {
    return {
      success: false,
      message: error.message,
    } satisfies ActionState;
  }

  revalidatePath("/dashboard");
  revalidatePath("/plans");
  revalidatePath("/employees");
  revalidatePath(`/employees/${plan.assignee_id}`);
  revalidatePath("/api/employees");

  return {
    success: true,
    message: "Vazifa statusi yangilandi.",
  } satisfies ActionState;
}

export async function sendCompletedPlansToTelegramAction(
  formData: FormData,
): Promise<ActionState<string>> {
  const viewer = await requireViewer();
  const supabase = await createActionClient();
  const languageEntry = formData.get("language");
  const language = parseAppLanguage(typeof languageEntry === "string" ? languageEntry : undefined);
  const employeeIdEntry = formData.get("employeeId");
  const employeeId =
    typeof employeeIdEntry === "string" && employeeIdEntry.trim() ? employeeIdEntry.trim() : viewer.id;
  const reportDateEntry = formData.get("reportDate");
  const reportDate =
    typeof reportDateEntry === "string" && isValidIsoDate(reportDateEntry)
      ? reportDateEntry
      : getTodayIsoDate();

  if (!supabase || !isSupabaseConfigured()) {
    return {
      success: false,
      message: "Supabase ulanishi sozlanmagan.",
    };
  }

  if (employeeId !== viewer.id && !hasRole(viewer.role, ["admin", "manager"])) {
    return {
      success: false,
      message: "Bu xodimning yakunlangan vazifalarini Telegramga yuborish huquqi yo'q.",
    };
  }

  const canReadTelegramSecrets =
    hasRole(viewer.role, ["admin", "manager"]) || hasSupabaseServiceRoleEnv();

  if (!canReadTelegramSecrets) {
    return {
      success: false,
      message:
        "Xodim yakunlangan vazifalarini Telegramga yuborish uchun serverda SUPABASE_SERVICE_ROLE_KEY sozlanishi kerak.",
    };
  }

  const telegramConfigClient =
    hasRole(viewer.role, ["admin", "manager"]) ? supabase : createAdminClient() ?? supabase;
  const telegramConfig = await getTelegramConfig(telegramConfigClient);

  if (!telegramConfig) {
    return {
      success: false,
      message: "Telegram chat ID yoki bot token topilmadi.",
    };
  }

  const employee =
    employeeId === viewer.id
      ? {
        full_name: viewer.full_name,
        title: viewer.title,
      }
      : await supabase
        .from("profiles")
        .select("full_name, title")
        .eq("id", employeeId)
        .maybeSingle()
        .then((result) => result.data);

  if (!employee) {
    return {
      success: false,
      message: "Xodim topilmadi.",
    };
  }

  const nextDate = new Date(`${reportDate}T00:00:00`);
  nextDate.setDate(nextDate.getDate() + 1);
  const endDate = nextDate.toISOString().slice(0, 10);

  const { data: completedPlans } = await supabase
    .from("plans")
    .select("id, title, due_date, priority, updated_at")
    .eq("assignee_id", employeeId)
    .eq("status", "done")
    .gte("updated_at", `${reportDate}T00:00:00`)
    .lt("updated_at", `${endDate}T00:00:00`)
    .order("updated_at", { ascending: false });

  if (!completedPlans || completedPlans.length === 0) {
    return {
      success: false,
      message: "Bugun yakunlangan vazifa topilmadi.",
    };
  }

  const payload = buildTelegramCompletedPlansMessage({
    language,
    employeeName: employee.full_name,
    employeeTitle: employee.title,
    reportDate,
    completedPlans: completedPlans.map((plan) => ({
      id: plan.id,
      title: plan.title,
      dueDate: plan.due_date,
      priority: plan.priority,
      updatedAt: plan.updated_at,
    })),
  });

  try {
    await sendTelegramTextMessage(telegramConfig, payload);

    await sendTelegramJsonLog(telegramConfig, {
      event: "telegram.completed_plans.sent",
      status: "success",
      actor: {
        id: viewer.id,
        name: viewer.full_name,
      },
      data: {
        employeeId,
        reportDate,
        targetChatId: telegramConfig.chatId,
        completedPlans,
      },
    }).catch(() => undefined);

    revalidatePath("/dashboard");
    revalidatePath("/plans");
    revalidatePath("/employees");
    revalidatePath(`/employees/${employeeId}`);
    revalidatePath("/api/employees");
    revalidatePath("/api/reports");

    return {
      success: true,
      message: "Yakunlangan vazifalar Telegramga yuborildi.",
    };
  } catch (error) {
    await sendTelegramJsonLog(telegramConfig, {
      event: "telegram.completed_plans.failed",
      status: "error",
      actor: {
        id: viewer.id,
        name: viewer.full_name,
      },
      data: {
        employeeId,
        reportDate,
        targetChatId: telegramConfig.chatId,
        completedPlans,
        error:
          error instanceof Error && error.message
            ? error.message
            : "Telegramga yuborishda xatolik yuz berdi.",
      },
    }).catch(() => undefined);

    return {
      success: false,
      message:
        error instanceof Error && error.message
          ? error.message
          : "Telegramga yuborishda xatolik yuz berdi.",
    };
  }
}
