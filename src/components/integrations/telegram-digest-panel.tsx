"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { usePreferences } from "@/components/providers/preferences-provider";
import { useToast } from "@/components/providers/toast-provider";
import { getTelegramDigestCopy } from "@/lib/telegram-digest-copy";
import {
  buildTelegramCompletedPlansDigestMessage,
  buildTelegramReportsDigestMessage,
  type TelegramDigestOverview,
} from "@/lib/telegram-digest";
import { formatDate } from "@/lib/utils";
import type { ActionState } from "@/lib/validations";

type SendTelegramDigestAction = (
  formData: FormData,
) => Promise<ActionState<string>>;

type TelegramDigestPanelProps = {
  action: SendTelegramDigestAction;
  overview: TelegramDigestOverview | null;
  canManage: boolean;
};

export function TelegramDigestPanel({
  action,
  overview,
  canManage,
}: TelegramDigestPanelProps) {
  const [pendingKind, setPendingKind] = useState<"reports" | "completed_plans" | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { language } = usePreferences();
  const { pushToast } = useToast();
  const copy = getTelegramDigestCopy(language);

  if (!canManage) {
    return (
      <section className="app-panel p-5">
        <p className="app-kicker">{copy.eyebrow}</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-app-text">{copy.title}</h2>
        <p className="mt-2 text-sm leading-6 text-app-text-muted">{copy.managerOnlyHint}</p>
      </section>
    );
  }

  if (!overview) {
    return null;
  }

  const reportsPreview = buildTelegramReportsDigestMessage(language, overview);
  const completedPlansPreview = buildTelegramCompletedPlansDigestMessage(language, overview);

  function handleSend(kind: "reports" | "completed_plans") {
    const formData = new FormData();
    formData.set("provider", "telegram");
    formData.set("language", language);
    formData.set("kind", kind);
    setPendingKind(kind);

    startTransition(async () => {
      const result = await action(formData);

      if (result.message) {
        pushToast({
          message: result.message,
          tone: result.success ? "success" : "error",
        });
      }

      if (result.success) {
        router.refresh();
      }

      setPendingKind(null);
    });
  }

  return (
    <section className="app-panel p-5">
      <div className="flex flex-col gap-3 border-b border-app-border pb-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1.5">
          <p className="app-kicker">{copy.eyebrow}</p>
          <h2 className="text-xl font-semibold tracking-tight text-app-text">{copy.title}</h2>
          <p className="max-w-3xl text-sm leading-6 text-app-text-muted">{copy.description}</p>
        </div>

        <div className="rounded-full border border-app-border bg-app-bg-elevated px-3 py-1.5 text-[12px] font-medium text-app-text-muted">
          {copy.todayLabel}: {formatDate(overview.date, undefined, language)}
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border border-app-border bg-app-bg-elevated p-4">
          <div className="flex flex-col gap-3 border-b border-app-border pb-4">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-app-text">{copy.reportsTitle}</h3>
              <p className="text-[13px] leading-5 text-app-text-muted">
                {copy.reportsDescription}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-app-border bg-app-surface px-3 py-1 text-[12px] text-app-text-muted">
                {copy.reportsCount(overview.reports.length)}
              </span>
              <button
                type="button"
                className="app-button-primary px-3 py-2 text-xs"
                disabled={isPending || overview.reports.length === 0}
                onClick={() => handleSend("reports")}
              >
                {pendingKind === "reports" ? copy.sendingReports : copy.sendReports}
              </button>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
              {copy.previewLabel}
            </p>
            <pre className="mt-3 whitespace-pre-wrap break-words text-[13px] leading-6 text-app-text">
              {reportsPreview}
            </pre>
          </div>
        </article>

        <article className="rounded-2xl border border-app-border bg-app-bg-elevated p-4">
          <div className="flex flex-col gap-3 border-b border-app-border pb-4">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-app-text">
                {copy.completedPlansTitle}
              </h3>
              <p className="text-[13px] leading-5 text-app-text-muted">
                {copy.completedPlansDescription}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-app-border bg-app-surface px-3 py-1 text-[12px] text-app-text-muted">
                {copy.completedPlansCount(overview.completedPlans.length)}
              </span>
              <button
                type="button"
                className="app-button-primary px-3 py-2 text-xs"
                disabled={isPending || overview.completedPlans.length === 0}
                onClick={() => handleSend("completed_plans")}
              >
                {pendingKind === "completed_plans"
                  ? copy.sendingCompletedPlans
                  : copy.sendCompletedPlans}
              </button>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
              {copy.previewLabel}
            </p>
            <pre className="mt-3 whitespace-pre-wrap break-words text-[13px] leading-6 text-app-text">
              {completedPlansPreview}
            </pre>
          </div>
        </article>
      </div>
    </section>
  );
}
