"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { IntegrationProviderBadge } from "@/components/integrations/provider-icon";
import {
  ArrowRightIcon,
  InfoIcon,
} from "@/components/layout/dashboard-icons";
import { QuickPlanModal } from "@/components/plans/quick-plan-modal";
import { usePreferences } from "@/components/providers/preferences-provider";
import { Badge } from "@/components/ui/badge";
import { getIntegrationsCopy } from "@/lib/integrations-copy";
import {
  getIntegrationProvider,
  getIntegrationPublicSummary,
  INTEGRATION_PROVIDERS,
  type ActiveIntegrationSummary,
} from "@/lib/integration-providers";
import { cx, formatDateTime } from "@/lib/utils";
import type { Viewer } from "@/types/database";
import type { ActionState } from "@/lib/validations";

import { IntegrationConnectModal } from "@/components/settings/integration-connect-modal";
import { IntegrationDisconnectButton } from "@/components/settings/integration-disconnect-button";

type SaveIntegrationAction = (
  state: ActionState<string> | undefined,
  formData: FormData,
) => Promise<ActionState<string>>;

type DisconnectIntegrationAction = (
  formData: FormData,
) => Promise<ActionState<string>>;

type IntegrationsPanelProps = {
  action: SaveIntegrationAction;
  disconnectAction: DisconnectIntegrationAction;
  viewer: Viewer;
  connections: ActiveIntegrationSummary[];
};

export function IntegrationsPanel({
  action,
  disconnectAction,
  viewer,
  connections,
}: IntegrationsPanelProps) {
  const { language } = usePreferences();
  const copy = getIntegrationsCopy(language);
  const [selectedProviderSlug, setSelectedProviderSlug] = useState<string | null>(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const canManage = viewer.role === "admin" || viewer.role === "manager";
  const connectionMap = useMemo(
    () => new Map(connections.map((connection) => [connection.provider, connection])),
    [connections],
  );
  const selectedProvider = getIntegrationProvider(selectedProviderSlug);
  const selectedConnection = selectedProvider
    ? connectionMap.get(selectedProvider.slug) ?? null
    : null;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-app-border bg-app-surface p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="app-kicker">{copy.panelEyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-app-text">
              {copy.panelTitle}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-app-text-muted">
              {copy.panelDescription}
            </p>
          </div>

          <button
            type="button"
            className="app-icon-button h-9 w-9 shrink-0"
            aria-label={copy.privacyTriggerLabel}
            title={copy.privacyTriggerLabel}
            onClick={() => setIsPrivacyOpen(true)}
          >
            <InfoIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge tone={canManage ? "info" : "neutral"}>
            {canManage ? copy.manageHint : copy.readOnlyHint}
          </Badge>
          <Badge tone="neutral">{copy.connectedTitle}: {connections.length}</Badge>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1.5">
            <p className="app-kicker">{copy.panelEyebrow}</p>
            <h3 className="text-xl font-semibold tracking-tight text-app-text">{copy.availableTitle}</h3>
          </div>
          <Badge tone="neutral">{INTEGRATION_PROVIDERS.length}</Badge>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {INTEGRATION_PROVIDERS.map((provider) => {
            const connection = connectionMap.get(provider.slug);
            const summary = connection
              ? getIntegrationPublicSummary(provider.slug, connection.publicConfig, language)
              : [];

            return (
              <article
                key={provider.slug}
                className="rounded-3xl border border-app-border bg-app-surface p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <IntegrationProviderBadge
                        provider={provider.slug}
                        className="h-11 w-11 shrink-0"
                        iconClassName="h-5 w-5"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-lg font-semibold tracking-tight text-app-text">
                          {provider.displayName}
                        </p>
                        <p className="mt-1 text-[13px] leading-5 text-app-text-muted">
                          {provider.summary[language]}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Badge tone={connection ? "success" : "neutral"}>
                    {connection ? copy.connectedStatus : copy.connect}
                  </Badge>
                </div>

                {summary.length > 0 ? (
                  <div className="mt-4 rounded-2xl border border-app-border bg-app-bg-elevated p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                      {copy.publicConfigLabel}
                    </p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {summary.map((item) => (
                        <div key={`${provider.slug}-${item.key}`}>
                          <p className="text-[11px] text-app-text-subtle">{item.label}</p>
                          <p className="mt-1 truncate text-[13px] font-medium text-app-text">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {connection ? (
                    <Link
                      href={`/integrations/${provider.slug}`}
                      className="app-button-secondary gap-2 px-3 py-2 text-xs"
                    >
                      <span>{copy.open}</span>
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  ) : null}

                  <button
                    type="button"
                    className={cx(
                      "app-button gap-2 px-3 py-2 text-xs",
                      !canManage && "cursor-not-allowed opacity-60",
                    )}
                    disabled={!canManage}
                    onClick={() => setSelectedProviderSlug(provider.slug)}
                  >
                    {connection ? copy.update : copy.connect}
                  </button>
                </div>

                {connection ? (
                  <p className="mt-3 text-[12px] leading-5 text-app-text-muted">
                    {copy.updatedAtLabel}: {formatDateTime(connection.updatedAt, language)}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1.5">
            <p className="app-kicker">{copy.panelEyebrow}</p>
            <h3 className="text-xl font-semibold tracking-tight text-app-text">{copy.connectedTitle}</h3>
          </div>
          <Badge tone="neutral">{connections.length}</Badge>
        </div>

        {connections.length === 0 ? (
          <article className="rounded-3xl border border-dashed border-app-border bg-app-surface p-6">
            <p className="text-base font-semibold text-app-text">{copy.connectedEmptyTitle}</p>
            <p className="mt-2 text-sm leading-6 text-app-text-muted">
              {copy.connectedEmptyDescription}
            </p>
          </article>
        ) : (
          <div className="grid gap-4">
            {connections.map((connection) => {
              const summary = getIntegrationPublicSummary(
                connection.provider,
                connection.publicConfig,
                language,
              );

              return (
                <article
                  key={connection.id}
                  className="rounded-3xl border border-app-border bg-app-surface p-5"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <IntegrationProviderBadge
                          provider={connection.provider}
                          className="h-11 w-11 shrink-0"
                          iconClassName="h-5 w-5"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-lg font-semibold tracking-tight text-app-text">
                            {connection.displayName}
                          </p>
                          <p className="mt-1 text-[12px] leading-5 text-app-text-muted">
                            {copy.updatedAtLabel}: {formatDateTime(connection.updatedAt, language)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="success">{copy.connectedStatus}</Badge>
                      <Link
                        href={`/integrations/${connection.provider}`}
                        className="app-button-secondary gap-2 px-3 py-2 text-xs"
                      >
                        <span>{copy.open}</span>
                        <ArrowRightIcon className="h-4 w-4" />
                      </Link>
                      {canManage ? (
                        <IntegrationDisconnectButton
                          action={disconnectAction}
                          provider={connection.provider}
                          className="app-button-secondary px-3 py-2 text-xs text-rose-600"
                        />
                      ) : null}
                    </div>
                  </div>

                  {summary.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {summary.map((item) => (
                        <span
                          key={`${connection.id}-${item.key}`}
                          className="rounded-full border border-app-border bg-app-bg-elevated px-3 py-1.5 text-[12px] font-medium text-app-text"
                        >
                          {item.label}: {item.value}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <QuickPlanModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        title={copy.privacyTitle}
        description={copy.privacyDescription}
        closeLabel={copy.close}
      >
        <div className="space-y-3">
          <div className="rounded-2xl border border-app-border bg-app-bg-elevated p-4">
            <div className="space-y-2">
              {copy.privacyPoints.map((point, index) => (
                <p key={`privacy-point-${index}`} className="text-sm leading-6 text-app-text-muted">
                  {String(index + 1).padStart(2, "0")}. {point}
                </p>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="app-button-secondary px-4"
              onClick={() => setIsPrivacyOpen(false)}
            >
              {copy.close}
            </button>
          </div>
        </div>
      </QuickPlanModal>

      {selectedProvider ? (
        <IntegrationConnectModal
          key={selectedProvider.slug}
          action={action}
          provider={selectedProvider}
          connection={selectedConnection}
          isOpen={Boolean(selectedProvider)}
          onClose={() => setSelectedProviderSlug(null)}
        />
      ) : null}
    </div>
  );
}
