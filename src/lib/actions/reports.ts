"use server";

import { revalidatePath } from "next/cache";

import { hasRole, requireViewer } from "@/lib/auth";
import { parseAppLanguage } from "@/lib/preferences";
import { hasSupabaseServiceRoleEnv } from "@/lib/supabase/config";
import { buildTelegramReportMessage } from "@/lib/telegram-report";
import { createActionClient, createAdminClient } from "@/lib/supabase/server";
import {
  getTelegramConfig,
  sendTelegramJsonLog,
  sendTelegramTextMessage,
} from "@/lib/telegram-service";
import { type ActionState, validateReportForm } from "@/lib/validations";

type ReportField =
  | "reportDate"
  | "completedWork"
  | "currentWork"
  | "nextPlan"
  | "blockers"
  | "status";

type TelegramReportRow = {
  id: string;
  employee_id: string;
  report_date: string;
  completed_work: string;
  current_work: string;
  next_plan: string;
  blockers: string | null;
  status: "done" | "in_progress" | "blocked";
  profiles: {
    full_name: string;
    title: string | null;
  } | null;
};

function getNextIsoDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

export async function saveReportAction(
  _prevState: ActionState<ReportField> | undefined,
  formData: FormData,
): Promise<ActionState<ReportField>> {
  const viewer = await requireViewer();
  const targetEmployeeIdEntry = formData.get("employeeId");
  const targetEmployeeId =
    typeof targetEmployeeIdEntry === "string" && targetEmployeeIdEntry.trim()
      ? targetEmployeeIdEntry.trim()
      : viewer.id;
  const canManageAllReports = viewer.role === "admin";

  if (targetEmployeeId !== viewer.id && !canManageAllReports) {
    return {
      success: false,
      message: "Bu hisobotni tahrirlash huquqi yo'q.",
    };
  }

  const validation = validateReportForm(formData);

  if (!validation.data) {
    return {
      success: false,
      message: "Hisobotdagi maydonlarni tekshirib chiqing.",
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

  const reportIdEntry = formData.get("reportId");
  const reportId = typeof reportIdEntry === "string" ? reportIdEntry : "";
  const payload = {
    employee_id: targetEmployeeId,
    report_date: validation.data.reportDate,
    completed_work: validation.data.completedWork,
    current_work: validation.data.currentWork,
    next_plan: validation.data.nextPlan,
    blockers: validation.data.blockers || null,
    status: validation.data.status,
    telegram_status: "not_sent" as const,
    telegram_payload: null,
    telegram_message_id: null,
    telegram_last_error: null,
    telegram_sent_at: null,
  };

  if (reportId) {
    const { data: existingReport } = await supabase
      .from("daily_reports")
      .select("id, employee_id")
      .eq("id", reportId)
      .maybeSingle();

    if (!existingReport) {
      return {
        success: false,
        message: "Hisobot topilmadi.",
      };
    }

    if (existingReport.employee_id !== viewer.id && !canManageAllReports) {
      return {
        success: false,
        message: "Bu hisobotni tahrirlash huquqi yo'q.",
      };
    }
  }

  const operation = reportId
    ? supabase.from("daily_reports").update(payload).eq("id", reportId)
    : supabase.from("daily_reports").upsert(payload, {
        onConflict: "employee_id,report_date",
      });

  const { error } = await operation;

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/reports");
  revalidatePath("/employees");
  revalidatePath(`/employees/${targetEmployeeId}`);
  revalidatePath("/api/reports");
  revalidatePath("/api/employees");

  return {
    success: true,
    message: "Hisobot saqlandi.",
    redirectTo:
      canManageAllReports && targetEmployeeId !== viewer.id
        ? `/reports?editorDate=${validation.data.reportDate}&editorEmployeeId=${targetEmployeeId}`
        : `/reports?editorDate=${validation.data.reportDate}`,
  };
}

export async function sendReportToTelegramAction(
  _prevState: ActionState<string> | undefined,
  formData: FormData,
): Promise<ActionState<string>> {
  const viewer = await requireViewer();
  const supabase = await createActionClient();
  const languageEntry = formData.get("language");
  const language = parseAppLanguage(typeof languageEntry === "string" ? languageEntry : undefined);
  const reportIdEntry = formData.get("reportId");
  const reportId = typeof reportIdEntry === "string" ? reportIdEntry : "";

  if (!reportId) {
    return {
      success: false,
      message: "Hisobot topilmadi.",
    };
  }

  if (!supabase) {
    return {
      success: false,
      message: "Supabase ulanishi sozlanmagan.",
    };
  }

  const { data: reportData } = await supabase
    .from("daily_reports")
    .select(
      "id, employee_id, report_date, completed_work, current_work, next_plan, blockers, status, profiles!daily_reports_employee_id_fkey(full_name, title)",
    )
    .eq("id", reportId)
    .maybeSingle();
  const report = reportData as unknown as TelegramReportRow | null;

  if (!report) {
    return {
      success: false,
      message: "Hisobot topilmadi.",
    };
  }

  if (report.employee_id !== viewer.id && !hasRole(viewer.role, ["admin", "manager"])) {
    return {
      success: false,
      message: "Bu hisobotni Telegramga yuborish huquqi yo'q.",
    };
  }

  const canReadTelegramSecrets =
    hasRole(viewer.role, ["admin", "manager"]) || hasSupabaseServiceRoleEnv();

  if (!canReadTelegramSecrets) {
    return {
      success: false,
      message:
        "Xodim hisobotini Telegramga yuborish uchun serverda SUPABASE_SERVICE_ROLE_KEY sozlanishi kerak.",
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

  const nextDate = getNextIsoDate(report.report_date);
  const { data: completedPlans } = await supabase
    .from("plans")
    .select("id, title, due_date, priority, updated_at")
    .eq("assignee_id", report.employee_id)
    .eq("status", "done")
    .gte("updated_at", `${report.report_date}T00:00:00`)
    .lt("updated_at", `${nextDate}T00:00:00`)
    .order("updated_at", { ascending: false });

  const payload = buildTelegramReportMessage({
    language,
    employeeName: report.profiles?.full_name ?? viewer.full_name,
    employeeTitle: report.profiles?.title,
    reportDate: report.report_date,
    status: report.status,
    completedWork: report.completed_work,
    currentWork: report.current_work,
    nextPlan: report.next_plan,
    blockers: report.blockers,
    completedPlans: (completedPlans ?? []).map((plan) => ({
      id: plan.id,
      title: plan.title,
      dueDate: plan.due_date,
      priority: plan.priority,
      updatedAt: plan.updated_at,
    })),
  });

  try {
    const result = await sendTelegramTextMessage(telegramConfig, payload);

    await sendTelegramJsonLog(telegramConfig, {
      event: "telegram.report.sent",
      status: "success",
      actor: {
        id: viewer.id,
        name: viewer.full_name,
      },
      data: {
        reportId: report.id,
        employeeId: report.employee_id,
        reportDate: report.report_date,
        targetChatId: telegramConfig.chatId,
        messageId: result.messageId,
        report: {
          completedWork: report.completed_work,
          currentWork: report.current_work,
          nextPlan: report.next_plan,
          blockers: report.blockers,
          status: report.status,
        },
      },
    }).catch(() => undefined);

    await supabase
      .from("daily_reports")
      .update({
        telegram_status: "sent",
        telegram_payload: payload,
        telegram_message_id: result.messageId,
        telegram_last_error: null,
        telegram_sent_at: new Date().toISOString(),
      })
      .eq("id", report.id);

    revalidatePath("/reports");
    revalidatePath("/dashboard");
    revalidatePath("/employees");
    revalidatePath(`/employees/${report.employee_id}`);
    revalidatePath("/api/reports");

    return {
      success: true,
      message: "Hisobot Telegramga yuborildi.",
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error && error.message
        ? error.message
        : "Telegramga yuborishda xatolik yuz berdi.";

    await sendTelegramJsonLog(telegramConfig, {
      event: "telegram.report.failed",
      status: "error",
      actor: {
        id: viewer.id,
        name: viewer.full_name,
      },
      data: {
        reportId: report.id,
        employeeId: report.employee_id,
        reportDate: report.report_date,
        targetChatId: telegramConfig.chatId,
        error: errorMessage,
        report: {
          completedWork: report.completed_work,
          currentWork: report.current_work,
          nextPlan: report.next_plan,
          blockers: report.blockers,
          status: report.status,
        },
      },
    }).catch(() => undefined);

    await supabase
      .from("daily_reports")
      .update({
        telegram_status: "failed",
        telegram_payload: payload,
        telegram_message_id: null,
        telegram_last_error: errorMessage,
        telegram_sent_at: null,
      })
      .eq("id", report.id);

    return {
      success: false,
      message: errorMessage,
    };
  }
}

export async function deleteReportAction(formData: FormData) {
  const viewer = await requireViewer();
  const supabase = await createActionClient();

  if (!supabase) {
    return;
  }

  const reportIdEntry = formData.get("reportId");
  const reportId = typeof reportIdEntry === "string" ? reportIdEntry : "";

  if (!reportId) {
    return;
  }

  const { data: report } = await supabase
    .from("daily_reports")
    .select("id, employee_id")
    .eq("id", reportId)
    .maybeSingle();

  if (!report) {
    return;
  }

  if (report.employee_id !== viewer.id && viewer.role !== "admin") {
    return;
  }

  await supabase.from("daily_reports").delete().eq("id", reportId);

  revalidatePath("/dashboard");
  revalidatePath("/reports");
  revalidatePath("/employees");
  revalidatePath(`/employees/${report.employee_id}`);
  revalidatePath("/api/reports");
  revalidatePath("/api/employees");
}
