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
  const validation = validateReportForm(formData);

  if (!validation.data) {
    return {
      success: false,
      message: "Hisobotdagi maydonlarni tekshirib chiqing.",
      fieldErrors: validation.fieldErrors,
    };
  }

  const viewer = await requireViewer();
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
    employee_id: viewer.id,
    report_date: validation.data.reportDate,
    completed_work: validation.data.completedWork,
    current_work: validation.data.currentWork,
    next_plan: validation.data.nextPlan,
    blockers: validation.data.blockers || null,
    status: validation.data.status,
  };

  const operation = reportId
    ? supabase
        .from("daily_reports")
        .update(payload)
        .eq("id", reportId)
        .eq("employee_id", viewer.id)
    : supabase
        .from("daily_reports")
        .upsert(payload, {
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

  return {
    success: true,
    message: "Hisobot saqlandi.",
  };
}
