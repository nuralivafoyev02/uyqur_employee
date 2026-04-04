"use client";

import { useTransition } from "react";

import { usePreferences } from "@/components/providers/preferences-provider";
import { useToast } from "@/components/providers/toast-provider";
import type { ActiveIntegrationSummary } from "@/lib/integration-providers";
import { getPlansCopy, translatePlanMessage } from "@/lib/plans-copy";
import {
  buildTelegramCompletedPlansMessage,
  type TelegramCompletedPlanItem,
} from "@/lib/telegram-report";
import { formatDate } from "@/lib/utils";
import type { ActionState } from "@/lib/validations";

type SendCompletedPlansToTelegramAction = (
  formData: FormData,
) => Promise<ActionState<string>>;

type PlanTelegramPanelProps = {
  action: SendCompletedPlansToTelegramAction;
  canSend: boolean;
  completedPlans: TelegramCompletedPlanItem[];
  date: string;
  employeeId: string;
  employeeName: string;
  employeeTitle?: string | null;
  telegramConnection: ActiveIntegrationSummary | null;
};

export function PlanTelegramPanel({
  action,
  canSend,
  completedPlans,
  date,
  employeeId,
  employeeName,
  employeeTitle,
  telegramConnection,
}: PlanTelegramPanelProps) {
  const [isPending, startTransition] = useTransition();
  const { language } = usePreferences();
  const { pushToast } = useToast();
  const copy = getPlansCopy(language);
  const previewMessage = buildTelegramCompletedPlansMessage({
    language,
    employeeName,
    employeeTitle,
    reportDate: date,
    completedPlans,
  });

  function handleSend() {
    const formData = new FormData();
    formData.set("employeeId", employeeId);
    formData.set("reportDate", date);
    formData.set("language", language);

    startTransition(async () => {
      const result = await action(formData);

      if (result.message) {
        pushToast({
          message: translatePlanMessage(result.message, language) ?? result.message,
          tone: result.success ? "success" : "error",
        });
      }
    });
  }

  return (
    <section className="app-panel p-4 md:p-5">
      <div className="flex flex-col gap-3 border-b border-app-border pb-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1.5">
          <p className="app-kicker">{copy.telegram.title}</p>
          <h2 className="text-lg font-semibold tracking-tight text-app-text">
            {copy.telegram.completedPlansTitle}
          </h2>
          <p className="max-w-2xl text-[13px] leading-5 text-app-text-muted">
            {copy.telegram.description}
          </p>
        </div>

        <div className="rounded-full border border-app-border bg-app-bg-elevated px-3 py-1.5 text-[12px] font-medium text-app-text-muted">
          {copy.telegram.dateLabel}: {formatDate(date, undefined, language)}
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-app-border bg-app-surface p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
              {copy.telegram.employeeLabel}
            </p>
            <p className="mt-2 text-sm font-semibold text-app-text">
              {employeeTitle ? `${employeeName} / ${employeeTitle}` : employeeName}
            </p>

            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
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

          <button
            type="button"
            className="app-button w-full justify-center"
            disabled={
              isPending ||
              !telegramConnection ||
              !canSend ||
              !employeeId ||
              completedPlans.length === 0
            }
            onClick={handleSend}
          >
            {isPending ? copy.telegram.sending : copy.telegram.send}
          </button>
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
