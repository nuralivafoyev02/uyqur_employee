"use client";

import { useActionState } from "react";

import { ReportStatusBadge } from "@/components/ui/badges";
import { SubmitButton } from "@/components/ui/submit-button";
import { getReportStatusLabel } from "@/lib/utils";
import type { ActionState } from "@/lib/validations";
import type { DailyReport, ReportStatus } from "@/types/database";

type ReportField =
  | "reportDate"
  | "completedWork"
  | "currentWork"
  | "nextPlan"
  | "blockers"
  | "status";

type ReportFormAction = (
  state: ActionState<ReportField> | undefined,
  formData: FormData,
) => Promise<ActionState<ReportField>>;

type ReportFormProps = {
  action: ReportFormAction;
  initialValue?: Pick<
    DailyReport,
    | "id"
    | "report_date"
    | "completed_work"
    | "current_work"
    | "next_plan"
    | "blockers"
    | "status"
  > | null;
  selectedDate: string;
};

const reportStatuses: ReportStatus[] = ["done", "in_progress", "blocked"];

export function ReportForm({
  action,
  initialValue,
  selectedDate,
}: ReportFormProps) {
  const [state, formAction] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-5">
      {initialValue?.id ? <input type="hidden" name="reportId" value={initialValue.id} /> : null}
      <input
        type="hidden"
        name="reportDate"
        value={initialValue?.report_date ?? selectedDate}
      />

      {state?.message ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            state.success
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-app-text" htmlFor="completedWork">
          Bugun nimalarni yakunladingiz?
        </label>
        <textarea
          id="completedWork"
          name="completedWork"
          className="app-field app-textarea"
          defaultValue={initialValue?.completed_work ?? ""}
          placeholder="Qisqa, aniq va natijaga yo'naltirilgan yozing."
        />
        {state?.fieldErrors?.completedWork ? (
          <p className="text-sm text-rose-700">{state.fieldErrors.completedWork[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-app-text" htmlFor="currentWork">
          Hozir nima ustida ishlayapsiz?
        </label>
        <textarea
          id="currentWork"
          name="currentWork"
          className="app-field app-textarea"
          defaultValue={initialValue?.current_work ?? ""}
          placeholder="Joriy fokusni kiriting."
        />
        {state?.fieldErrors?.currentWork ? (
          <p className="text-sm text-rose-700">{state.fieldErrors.currentWork[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-app-text" htmlFor="nextPlan">
          Keyingi reja
        </label>
        <textarea
          id="nextPlan"
          name="nextPlan"
          className="app-field app-textarea"
          defaultValue={initialValue?.next_plan ?? ""}
          placeholder="Keyingi qadamlarni kiriting."
        />
        {state?.fieldErrors?.nextPlan ? (
          <p className="text-sm text-rose-700">{state.fieldErrors.nextPlan[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-app-text" htmlFor="blockers">
          {"To'siq yoki muammo"}
        </label>
        <textarea
          id="blockers"
          name="blockers"
          className="app-field app-textarea min-h-24"
          defaultValue={initialValue?.blockers ?? ""}
          placeholder="Agar muammo bo'lsa, shu yerga yozing."
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-app-text" htmlFor="status">
          Umumiy holat
        </label>
        <select
          id="status"
          name="status"
          className="app-field"
          defaultValue={initialValue?.status ?? "in_progress"}
        >
          {reportStatuses.map((status) => (
            <option key={status} value={status}>
              {getReportStatusLabel(status)}
            </option>
          ))}
        </select>
        <div className="flex flex-wrap gap-2">
          {reportStatuses.map((status) => (
            <ReportStatusBadge key={status} status={status} />
          ))}
        </div>
        {state?.fieldErrors?.status ? (
          <p className="text-sm text-rose-700">{state.fieldErrors.status[0]}</p>
        ) : null}
      </div>

      <SubmitButton label="Hisobotni saqlash" pendingLabel="Saqlanmoqda..." />
    </form>
  );
}
