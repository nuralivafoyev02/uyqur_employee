"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { usePreferences } from "@/components/providers/preferences-provider";
import { ReportStatusBadge } from "@/components/ui/badges";
import { SubmitButton } from "@/components/ui/submit-button";
import { getReportsCopy, translateReportMessage } from "@/lib/reports-copy";
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
  employeeId: string;
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
  employeeId,
  initialValue,
  selectedDate,
}: ReportFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const handledRedirectRef = useRef<string | null>(null);
  const [state, formAction] = useActionState(action, undefined);
  const router = useRouter();
  const { language } = usePreferences();
  const copy = getReportsCopy(language);

  useEffect(() => {
    if (!state?.success || !state.redirectTo) {
      return;
    }

    const redirectKey = `${state.redirectTo}:${state.message ?? ""}`;

    if (handledRedirectRef.current === redirectKey) {
      return;
    }

    handledRedirectRef.current = redirectKey;
    formRef.current?.reset();

    startTransition(() => {
      router.replace(state.redirectTo!);
      router.refresh();
    });
  }, [router, state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      {initialValue?.id ? <input type="hidden" name="reportId" value={initialValue.id} /> : null}
      <input type="hidden" name="employeeId" value={employeeId} />
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
          {translateReportMessage(state.message, language)}
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-app-text" htmlFor="completedWork">
          {copy.form.completedWork}
        </label>
        <textarea
          id="completedWork"
          name="completedWork"
          className="app-field app-textarea"
          defaultValue={initialValue?.completed_work ?? ""}
          placeholder={copy.form.completedWorkPlaceholder}
        />
        {state?.fieldErrors?.completedWork ? (
          <p className="text-sm text-rose-700">
            {translateReportMessage(state.fieldErrors.completedWork[0], language)}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-app-text" htmlFor="currentWork">
          {copy.form.currentWork}
        </label>
        <textarea
          id="currentWork"
          name="currentWork"
          className="app-field app-textarea"
          defaultValue={initialValue?.current_work ?? ""}
          placeholder={copy.form.currentWorkPlaceholder}
        />
        {state?.fieldErrors?.currentWork ? (
          <p className="text-sm text-rose-700">
            {translateReportMessage(state.fieldErrors.currentWork[0], language)}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-app-text" htmlFor="nextPlan">
          {copy.form.nextPlan}
        </label>
        <textarea
          id="nextPlan"
          name="nextPlan"
          className="app-field app-textarea"
          defaultValue={initialValue?.next_plan ?? ""}
          placeholder={copy.form.nextPlanPlaceholder}
        />
        {state?.fieldErrors?.nextPlan ? (
          <p className="text-sm text-rose-700">
            {translateReportMessage(state.fieldErrors.nextPlan[0], language)}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-app-text" htmlFor="blockers">
          {copy.form.blockers}
        </label>
        <textarea
          id="blockers"
          name="blockers"
          className="app-field app-textarea min-h-24"
          defaultValue={initialValue?.blockers ?? ""}
          placeholder={copy.form.blockersPlaceholder}
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-app-text" htmlFor="status">
          {copy.form.status}
        </label>
        <select
          id="status"
          name="status"
          className="app-field"
          defaultValue={initialValue?.status ?? "in_progress"}
        >
          {reportStatuses.map((status) => (
            <option key={status} value={status}>
              {getReportStatusLabel(status, language)}
            </option>
          ))}
        </select>
        <div className="flex flex-wrap gap-2">
          {reportStatuses.map((status) => (
            <ReportStatusBadge key={status} status={status} language={language} />
          ))}
        </div>
        {state?.fieldErrors?.status ? (
          <p className="text-sm text-rose-700">
            {translateReportMessage(state.fieldErrors.status[0], language)}
          </p>
        ) : null}
      </div>

      <SubmitButton label={copy.form.submit} pendingLabel={copy.form.pending} />
    </form>
  );
}
