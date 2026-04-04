"use client";

import Link from "next/link";

import { ClickUpTestButton } from "@/components/integrations/clickup-test-button";
import { IntegrationProviderBadge } from "@/components/integrations/provider-icon";
import { TelegramDigestPanel } from "@/components/integrations/telegram-digest-panel";
import { TelegramTestButton } from "@/components/integrations/telegram-test-button";
import { PlanTelegramPanel } from "@/components/plans/plan-telegram-panel";
import { ArrowRightIcon } from "@/components/layout/dashboard-icons";
import { usePreferences } from "@/components/providers/preferences-provider";
import { IntegrationDisconnectButton } from "@/components/settings/integration-disconnect-button";
import { Badge } from "@/components/ui/badge";
import { getIntegrationsCopy } from "@/lib/integrations-copy";
import {
  getIntegrationProvider,
  getIntegrationPublicSummary,
  type ActiveIntegrationSummary,
} from "@/lib/integration-providers";
import type { TelegramDigestOverview } from "@/lib/telegram-digest";
import type { TodayCompletedPlansPreviewData } from "@/lib/queries/plans";
import { formatDateTime } from "@/lib/utils";
import type { ActionState } from "@/lib/validations";

type IntegrationPageContentProps = {
  canManageConnection: boolean;
  canSendPersonalCompletedPlans: boolean;
  connection: ActiveIntegrationSummary;
  disconnectAction: (formData: FormData) => Promise<ActionState<string>>;
  personalCompletedPlans: TodayCompletedPlansPreviewData | null;
  sendCompletedPlansToTelegramAction?: (formData: FormData) => Promise<ActionState<string>>;
  testClickUpConnectionAction?: (formData: FormData) => Promise<ActionState<string>>;
  sendTelegramDigestAction?: (formData: FormData) => Promise<ActionState<string>>;
  sendTelegramTestAction?: (formData: FormData) => Promise<ActionState<string>>;
  telegramDigestOverview: TelegramDigestOverview | null;
};

export function IntegrationPageContent({
  canManageConnection,
  canSendPersonalCompletedPlans,
  connection,
  disconnectAction,
  personalCompletedPlans,
  sendCompletedPlansToTelegramAction,
  testClickUpConnectionAction,
  sendTelegramDigestAction,
  sendTelegramTestAction,
  telegramDigestOverview,
}: IntegrationPageContentProps) {
  const { language } = usePreferences();
  const copy = getIntegrationsCopy(language);
  const provider = getIntegrationProvider(connection.provider);
  const summary = getIntegrationPublicSummary(
    connection.provider,
    connection.publicConfig,
    language,
  );

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-app-border bg-app-surface px-5 py-5 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <IntegrationProviderBadge
              provider={connection.provider}
              className="h-12 w-12 shrink-0"
              iconClassName="h-5 w-5"
            />
            <div className="min-w-0">
              <p className="app-kicker">{copy.panelEyebrow}</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-app-text">
                {provider?.displayName ?? connection.displayName}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-app-text-muted">
                {provider?.summary[language] ?? provider?.description[language] ?? copy.pageOverviewDescription}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center md:justify-end">
            <Badge tone="success">{copy.connectedStatus}</Badge>
            {connection.provider === "telegram" && sendTelegramTestAction && canManageConnection ? (
              <TelegramTestButton action={sendTelegramTestAction} />
            ) : null}
            {connection.provider === "clickup" && testClickUpConnectionAction && canManageConnection ? (
              <ClickUpTestButton action={testClickUpConnectionAction} />
            ) : null}
            <IntegrationDisconnectButton
              action={disconnectAction}
              provider={connection.provider}
              className="app-button-secondary w-full px-3 py-2 text-xs text-rose-600 sm:w-auto"
            />
            <Link
              href="/settings?section=integrations"
              className="app-button-secondary w-full gap-2 px-3 py-2 text-xs sm:w-auto"
            >
              <span>{copy.pageBackToSettings}</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] xl:items-end">
          <div className="flex flex-wrap gap-2 xl:self-end">
            <div className="rounded-full border border-app-border bg-app-bg-elevated px-3 py-1.5 text-[12px] font-medium text-app-text-muted">
              {copy.connectedAtLabel}: {formatDateTime(connection.createdAt, language)}
            </div>
            <div className="rounded-full border border-app-border bg-app-bg-elevated px-3 py-1.5 text-[12px] font-medium text-app-text-muted">
              {copy.updatedAtLabel}: {formatDateTime(connection.updatedAt, language)}
            </div>
          </div>

          <div className="rounded-3xl border border-app-border bg-app-bg-elevated p-4">
            <p className="app-kicker">{copy.publicConfigLabel}</p>

            {summary.length > 0 ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {summary.map((item) => (
                  <div
                    key={`${connection.id}-${item.key}`}
                    className="rounded-2xl border border-app-border bg-app-surface p-4"
                  >
                    <p className="text-[11px] text-app-text-subtle">{item.label}</p>
                    <p className="mt-2 break-all text-sm font-semibold text-app-text">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-app-text-muted">
                {copy.publicConfigEmpty}
              </p>
            )}
          </div>
        </div>
      </section>

      {connection.provider === "telegram" &&
      personalCompletedPlans &&
      sendCompletedPlansToTelegramAction ? (
        <PlanTelegramPanel
          action={sendCompletedPlansToTelegramAction}
          canSend={canSendPersonalCompletedPlans}
          completedPlans={personalCompletedPlans.completedPlans}
          date={personalCompletedPlans.date}
          employeeId={personalCompletedPlans.employee?.id ?? ""}
          employeeName={personalCompletedPlans.employee?.full_name ?? "Unknown"}
          employeeTitle={personalCompletedPlans.employee?.title}
          telegramConnection={connection}
        />
      ) : null}

      {connection.provider === "telegram" && canManageConnection && sendTelegramDigestAction ? (
        <TelegramDigestPanel
          action={sendTelegramDigestAction}
          canManage={canManageConnection}
          overview={telegramDigestOverview}
        />
      ) : null}
    </div>
  );
}
