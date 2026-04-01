"use server";

import { revalidatePath } from "next/cache";

import { requireViewer } from "@/lib/auth";
import { createActionClient } from "@/lib/supabase/server";
import { type ActionState, validateReportForm } from "@/lib/validations";

type ReportField =
  | "reportDate"
  | "completedWork"
  | "currentWork"
  | "nextPlan"
  | "blockers"
  | "status";

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
