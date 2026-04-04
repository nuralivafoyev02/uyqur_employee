"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { usePreferences } from "@/components/providers/preferences-provider";
import { ReportTelegramPanel } from "@/components/reports/report-telegram-panel";
import { SubmitButton } from "@/components/ui/submit-button";
import { ActionStateToast } from "@/components/ui/toast-effect";
import type { ActiveIntegrationSummary } from "@/lib/integration-providers";
import { getReportsCopy, translateReportMessage } from "@/lib/reports-copy";
import type { TelegramCompletedPlanItem } from "@/lib/telegram-report";
import { cx, formatDate, getReportStatusLabel } from "@/lib/utils";
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

type SendReportToTelegramAction = (
  state: ActionState<string> | undefined,
  formData: FormData,
) => Promise<ActionState<string>>;

type ReportFormProps = {
  action: ReportFormAction;
  canSendTelegram: boolean;
  sendTelegramAction: SendReportToTelegramAction;
  employeeId: string;
  employeeName: string;
  employeeTitle?: string | null;
  initialValue?: Pick<
    DailyReport,
    | "id"
    | "report_date"
    | "completed_work"
    | "current_work"
    | "next_plan"
    | "blockers"
    | "status"
    | "telegram_status"
    | "telegram_last_error"
    | "telegram_sent_at"
  > | null;
  selectedDate: string;
  telegramConnection: ActiveIntegrationSummary | null;
  completedPlans: TelegramCompletedPlanItem[];
};

type ReportDraft = {
  completedWork: string;
  currentWork: string;
  nextPlan: string;
  blockers: string;
  status: ReportStatus;
};

const reportStatuses: ReportStatus[] = ["done", "in_progress", "blocked"];

function getInitialReportDraft(
  initialValue?: Pick<
    DailyReport,
    "completed_work" | "current_work" | "next_plan" | "blockers" | "status"
  > | null,
): ReportDraft {
  return {
    completedWork: initialValue?.completed_work ?? "",
    currentWork: initialValue?.current_work ?? "",
    nextPlan: initialValue?.next_plan ?? "",
    blockers: initialValue?.blockers ?? "",
    status: initialValue?.status ?? "in_progress",
  };
}

export function ReportForm({
  action,
  canSendTelegram,
  sendTelegramAction,
  employeeId,
  employeeName,
  employeeTitle,
  initialValue,
  selectedDate,
  telegramConnection,
  completedPlans,
}: ReportFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const handledRedirectRef = useRef<string | null>(null);
  const [state, formAction] = useActionState(action, undefined);
  const router = useRouter();
  const { language } = usePreferences();
  const copy = getReportsCopy(language);
  const [draft, setDraft] = useState<ReportDraft>(() => getInitialReportDraft(initialValue));

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

  const sections = [
    {
      key: "completedWork",
      label: copy.form.completedWork,
      hint: copy.form.completedWorkHint,
      placeholder: copy.form.completedWorkPlaceholder,
    },
    {
      key: "currentWork",
      label: copy.form.currentWork,
      hint: copy.form.currentWorkHint,
      placeholder: copy.form.currentWorkPlaceholder,
    },
    {
      key: "nextPlan",
      label: copy.form.nextPlan,
      hint: copy.form.nextPlanHint,
      placeholder: copy.form.nextPlanPlaceholder,
    },
  ] as const;

  const completedCount = sections.filter(
    (section) => draft[section.key].trim().length >= 8,
  ).length;

  return (
    <div className="space-y-4">
      <ActionStateToast
        state={state}
        message={state?.message ? translateReportMessage(state.message, language) : undefined}
      />

      <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-app-border bg-app-bg-elevated p-4">
            <p className="app-kicker">{copy.form.progressTitle}</p>
            <h3 className="mt-2 text-base font-semibold tracking-tight text-app-text">
              {formatDate(selectedDate, undefined, language)}
            </h3>
            <p className="mt-1 text-[13px] leading-5 text-app-text-muted">
              {copy.form.progressDescription}
            </p>

            <div className="mt-4 flex items-end gap-3">
              <p className="text-3xl font-semibold tracking-tight text-app-text">
                {completedCount}/3
              </p>
              <p
                className={cx(
                  "pb-1 text-[12px] font-medium",
                  completedCount === 3 ? "text-emerald-700" : "text-app-text-muted",
                )}
              >
                {completedCount === 3
                  ? copy.form.progressReady
                  : copy.form.progressPending}
              </p>
            </div>

            <div className="mt-4 space-y-2">
              {sections.map((section, index) => {
                const isReady = draft[section.key].trim().length >= 8;

                return (
                  <div
                    key={section.key}
                    className={cx(
                      "flex items-center justify-between rounded-2xl border px-3 py-2.5",
                      isReady
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-app-border bg-app-surface",
                    )}
                  >
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <p className="mt-1 text-[13px] font-medium text-app-text">
                        {section.label}
                      </p>
                    </div>
                    <span
                      className={cx(
                        "rounded-full border px-2 py-1 text-[11px] font-semibold",
                        isReady
                          ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                          : "border-app-border bg-app-bg-elevated text-app-text-muted",
                      )}
                    >
                      {isReady ? copy.form.progressReady : copy.form.progressPending}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-app-border bg-app-bg-elevated p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
              {copy.form.status}
            </p>
            <p className="mt-1 text-[13px] leading-5 text-app-text-muted">
              {copy.form.statusHint}
            </p>

            <div className="mt-3 app-segmented">
              {reportStatuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  className="app-segmented-button"
                  data-active={draft.status === status}
                  aria-pressed={draft.status === status}
                  onClick={() => setDraft((current) => ({ ...current, status }))}
                >
                  {getReportStatusLabel(status, language)}
                </button>
              ))}
            </div>
            {state?.fieldErrors?.status ? (
              <p className="mt-2 text-[12px] text-rose-700">
                {translateReportMessage(state.fieldErrors.status[0], language)}
              </p>
            ) : null}
          </div>
        </aside>

        <div className="space-y-3">
          <form ref={formRef} action={formAction} className="space-y-3">
            {initialValue?.id ? <input type="hidden" name="reportId" value={initialValue.id} /> : null}
            <input type="hidden" name="employeeId" value={employeeId} />
            <input type="hidden" name="reportDate" value={initialValue?.report_date ?? selectedDate} />
            <input type="hidden" name="status" value={draft.status} />

            {sections.map((section, index) => (
              <div
                key={section.key}
                className="rounded-2xl border border-app-border bg-app-surface p-4"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <label
                      className="block text-sm font-semibold tracking-tight text-app-text"
                      htmlFor={section.key}
                    >
                      {section.label}
                    </label>
                    <p className="max-w-2xl text-[13px] leading-5 text-app-text-muted">
                      {section.hint}
                    </p>
                  </div>
                </div>

                <textarea
                  id={section.key}
                  name={section.key}
                  className="app-field app-textarea mt-3 min-h-32"
                  value={draft[section.key]}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      [section.key]: event.target.value,
                    }))
                  }
                  placeholder={section.placeholder}
                />

                {state?.fieldErrors?.[section.key] ? (
                  <p className="mt-2 text-[12px] text-rose-700">
                    {translateReportMessage(state.fieldErrors[section.key]?.[0], language)}
                  </p>
                ) : null}
              </div>
            ))}

            <div className="rounded-2xl border border-app-border bg-app-bg-elevated p-4">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                  {copy.form.optional}
                </p>
                <label
                  className="block text-sm font-semibold tracking-tight text-app-text"
                  htmlFor="blockers"
                >
                  {copy.form.blockers}
                </label>
                <p className="max-w-2xl text-[13px] leading-5 text-app-text-muted">
                  {copy.form.blockersHint}
                </p>
              </div>

              <textarea
                id="blockers"
                name="blockers"
                className="app-field app-textarea mt-3 min-h-24"
                value={draft.blockers}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, blockers: event.target.value }))
                }
                placeholder={copy.form.blockersPlaceholder}
              />
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-app-border bg-app-surface p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[13px] leading-5 text-app-text-muted">
                {copy.form.progressDescription}
              </p>
              <SubmitButton
                label={copy.form.submit}
                pendingLabel={copy.form.pending}
                className="w-full px-4 sm:w-auto"
              />
            </div>
          </form>

          {initialValue?.id ? (
            <ReportTelegramPanel
              action={sendTelegramAction}
              canSend={canSendTelegram}
              report={initialValue}
              employeeName={employeeName}
              employeeTitle={employeeTitle}
              completedPlans={completedPlans}
              telegramConnection={telegramConnection}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-app-border bg-app-bg-elevated px-4 py-4 text-[13px] text-app-text-muted">
              {copy.telegram.saveFirstHint}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
