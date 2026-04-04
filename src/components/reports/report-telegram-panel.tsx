"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { usePreferences } from "@/components/providers/preferences-provider";
import { SubmitButton } from "@/components/ui/submit-button";
import { ActionStateToast } from "@/components/ui/toast-effect";
import type { ActiveIntegrationSummary } from "@/lib/integration-providers";
import { getReportsCopy, translateReportMessage } from "@/lib/reports-copy";
import type { TelegramCompletedPlanItem } from "@/lib/telegram-report";
import { buildTelegramReportMessage } from "@/lib/telegram-report";
import { formatDateTime } from "@/lib/utils";
import type { ActionState } from "@/lib/validations";
import type { DailyReport } from "@/types/database";

type SendReportToTelegramAction = (
  state: ActionState<string> | undefined,
  formData: FormData,
) => Promise<ActionState<string>>;

type ReportTelegramPanelProps = {
  action: SendReportToTelegramAction;
  canSend: boolean;
  report: Pick<
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
  >;
  employeeName: string;
  employeeTitle?: string | null;
  completedPlans: TelegramCompletedPlanItem[];
  telegramConnection: ActiveIntegrationSummary | null;
};

export function ReportTelegramPanel({
  action,
  canSend,
  report,
  employeeName,
  employeeTitle,
  completedPlans,
  telegramConnection,
}: ReportTelegramPanelProps) {
  const [state, formAction] = useActionState(action, undefined);
  const router = useRouter();
  const { language } = usePreferences();
  const copy = getReportsCopy(language);
  const previewMessage = buildTelegramReportMessage({
    language,
    employeeName,
    employeeTitle,
    reportDate: report.report_date,
    status: report.status,
    completedWork: report.completed_work,
    currentWork: report.current_work,
    nextPlan: report.next_plan,
    blockers: report.blockers,
    completedPlans,
  });

  useEffect(() => {
    if (!state?.success) {
      return;
    }

    router.refresh();
  }, [router, state?.success]);

  const statusLabel =
    report.telegram_status === "sent"
      ? copy.telegram.statusSent
      : report.telegram_status === "failed"
        ? copy.telegram.statusFailed
        : copy.telegram.statusNotSent;

  return (
    <section className="rounded-2xl border border-app-border bg-app-bg-elevated p-4">
      <ActionStateToast
        state={state}
        message={state?.message ? translateReportMessage(state.message, language) : undefined}
      />

      <div className="flex flex-col gap-3 border-b border-app-border pb-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1.5">
          <p className="app-kicker">{copy.telegram.title}</p>
          <h3 className="text-base font-semibold tracking-tight text-app-text">{statusLabel}</h3>
          <p className="max-w-2xl text-[13px] leading-5 text-app-text-muted">
            {copy.telegram.description}
          </p>
        </div>

        {report.telegram_sent_at ? (
          <div className="rounded-2xl border border-app-border bg-app-surface px-3 py-2 text-[12px] text-app-text-muted">
            {copy.telegram.sentAt}: {formatDateTime(report.telegram_sent_at, language)}
          </div>
        ) : null}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-app-border bg-app-surface p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
              {copy.telegram.completedPlans}
            </p>
            {completedPlans.length > 0 ? (
              <ul className="mt-3 space-y-2 text-[13px] leading-5 text-app-text-muted">
                {completedPlans.map((plan) => (
                  <li key={plan.id}>{plan.title}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-[13px] leading-5 text-app-text-muted">
                {copy.telegram.completedPlansEmpty}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-app-border bg-app-surface p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
              {copy.telegram.botLabel}
            </p>
            <p className="mt-2 text-sm font-semibold text-app-text">
              {telegramConnection?.publicConfig.botUsername || copy.telegram.notConnected}
            </p>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
              {copy.telegram.chatLabel}
            </p>
            <p className="mt-2 break-all text-[13px] text-app-text-muted">
              {telegramConnection?.publicConfig.chatId || copy.telegram.notConnectedHint}
            </p>
          </div>

          {!canSend && telegramConnection ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[13px] leading-5 text-amber-900">
              {copy.telegram.restrictedHint}
            </div>
          ) : null}

          {report.telegram_last_error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-[13px] text-rose-800">
              <span className="font-semibold">{copy.telegram.lastError}: </span>
              {report.telegram_last_error}
            </div>
          ) : null}

          <form action={formAction} className="space-y-3">
            <input type="hidden" name="reportId" value={report.id} />
            <input type="hidden" name="language" value={language} />
            <SubmitButton
              label={
                report.telegram_status === "sent" || report.telegram_status === "failed"
                  ? copy.telegram.resend
                  : copy.telegram.send
              }
              pendingLabel={copy.telegram.sending}
              className="w-full justify-center"
              disabled={!telegramConnection || !canSend}
            />
          </form>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
            {copy.telegram.preview}
          </p>
          <pre className="mt-3 whitespace-pre-wrap break-words text-[13px] leading-6 text-app-text">
            {previewMessage}
          </pre>
        </div>
      </div>
    </section>
  );
}
