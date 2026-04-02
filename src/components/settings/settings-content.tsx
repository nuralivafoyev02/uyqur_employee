"use client";

import { useEffect, useMemo, useState } from "react";

import {
  AccountIcon,
  IntegrationIcon,
  InterfaceIcon,
  UserIcon,
} from "@/components/layout/dashboard-icons";
import { useAppCopy, usePreferences } from "@/components/providers/preferences-provider";
import { IntegrationsPanel } from "@/components/settings/integrations-panel";
import { PreferencesPanel } from "@/components/settings/preferences-panel";
import { ProfileForm } from "@/components/settings/profile-form";
import { RoleBadge } from "@/components/ui/badges";
import type { ActionState } from "@/lib/validations";
import { cx, formatDateTime } from "@/lib/utils";
import type { Viewer } from "@/types/database";
import type { ActiveIntegrationSummary } from "@/lib/integration-providers";

type ProfileField = "fullName" | "title" | "department" | "profileStatus";
type SettingsSectionId = "account" | "preferences" | "profile" | "integrations";

type ProfileFormAction = (
  state: ActionState<ProfileField> | undefined,
  formData: FormData,
) => Promise<ActionState<ProfileField>>;

type SaveIntegrationAction = (
  state: ActionState<string> | undefined,
  formData: FormData,
) => Promise<ActionState<string>>;

type DisconnectIntegrationAction = (
  formData: FormData,
) => Promise<ActionState<string>>;

type SettingsContentProps = {
  action: ProfileFormAction;
  integrationAction: SaveIntegrationAction;
  disconnectIntegrationAction: DisconnectIntegrationAction;
  viewer: Viewer;
  integrations: ActiveIntegrationSummary[];
  initialSection?: SettingsSectionId;
};

export function SettingsContent({
  action,
  integrationAction,
  disconnectIntegrationAction,
  viewer,
  integrations,
  initialSection = "account",
}: SettingsContentProps) {
  const { language } = usePreferences();
  const copy = useAppCopy();
  const [activeSection, setActiveSection] = useState<SettingsSectionId>(initialSection);

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  const sections = useMemo(
    () => [
      {
        id: "account" as const,
        label: copy.settings.sections.account.label,
        description: copy.settings.sections.account.description,
        icon: AccountIcon,
      },
      {
        id: "preferences" as const,
        label: copy.settings.sections.preferences.label,
        description: copy.settings.sections.preferences.description,
        icon: InterfaceIcon,
      },
      {
        id: "profile" as const,
        label: copy.settings.sections.profile.label,
        description: copy.settings.sections.profile.description,
        icon: UserIcon,
      },
      {
        id: "integrations" as const,
        label: copy.settings.sections.integrations.label,
        description: copy.settings.sections.integrations.description,
        icon: IntegrationIcon,
      },
    ],
    [copy],
  );

  const currentSection = sections.find((section) => section.id === activeSection) ?? sections[0];
  const CurrentSectionIcon = currentSection.icon;
  const currentEyebrow =
    activeSection === "account"
      ? copy.settings.accountEyebrow
      : activeSection === "preferences"
        ? copy.settings.preferencesEyebrow
        : activeSection === "profile"
          ? copy.settings.profileEyebrow
          : copy.settings.integrationsEyebrow;
  const currentTitle =
    activeSection === "account"
      ? copy.settings.accountTitle
      : activeSection === "preferences"
        ? copy.settings.preferencesTitle
        : activeSection === "profile"
          ? copy.settings.profileTitle
          : copy.settings.integrationsTitle;
  const currentDescription =
    activeSection === "account"
      ? copy.settings.accountDescription
      : activeSection === "preferences"
        ? copy.settings.preferencesDescription
        : activeSection === "profile"
          ? copy.settings.sections.profile.description
          : copy.settings.integrationsDescription;

  return (
    <div className="-mx-4 -mt-6 min-h-screen md:-mx-6">
      <div className="min-h-screen overflow-hidden border-y border-app-border bg-app-surface lg:grid lg:grid-cols-[232px_minmax(0,1fr)] lg:border">
        <aside className="border-b border-app-border bg-app-surface px-3.5 py-4 lg:min-h-full lg:border-b-0 lg:border-r lg:px-4 lg:py-5">
          <div className="px-2 pb-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-app-text-subtle">
              {copy.settings.eyebrow}
            </p>
          </div>

          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = section.id === activeSection;

              return (
                <button
                  key={section.id}
                  type="button"
                  className={cx(
                    "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition-colors duration-200",
                    isActive
                      ? "bg-app-accent-muted text-app-text"
                      : "text-app-text-muted hover:bg-app-surface-muted hover:text-app-text",
                  )}
                  onClick={() => setActiveSection(section.id)}
                >
                  <span
                    className={cx(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
                      isActive
                        ? "bg-app-accent text-white"
                        : "bg-app-bg-elevated text-app-text-subtle",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 text-sm font-semibold">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0 bg-app-surface">
          <div className="border-b border-app-border bg-app-bg-elevated/40 px-4 py-4 md:px-5 md:py-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-app-accent-muted text-app-accent">
                  <CurrentSectionIcon className="h-[18px] w-[18px]" />
                </div>
                <div className="min-w-0">
                  <p className="app-kicker">{currentEyebrow}</p>
                  <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-app-text md:text-[28px]">
                    {currentTitle}
                  </h1>
                  <p className="mt-1.5 max-w-2xl text-[13px] leading-5 text-app-text-muted">
                    {currentDescription}
                  </p>
                </div>
              </div>

              <RoleBadge role={viewer.role} language={language} />
            </div>
          </div>

          <div className="px-4 py-5 md:px-5 md:py-5">
            {activeSection === "account" ? (
              <div className="divide-y divide-app-border">
                <div className="grid gap-1.5 py-3 md:grid-cols-[160px_minmax(0,1fr)] md:items-center">
                  <p className="text-[13px] font-medium text-app-text">{copy.settings.emailLabel}</p>
                  <p className="text-[13px] text-app-text-muted">{viewer.email}</p>
                </div>
                <div className="grid gap-1.5 py-3 md:grid-cols-[160px_minmax(0,1fr)] md:items-center">
                  <p className="text-[13px] font-medium text-app-text">{copy.settings.roleLabel}</p>
                  <div>
                    <RoleBadge role={viewer.role} language={language} />
                  </div>
                </div>
                <div className="grid gap-1.5 py-3 md:grid-cols-[160px_minmax(0,1fr)] md:items-center">
                  <p className="text-[13px] font-medium text-app-text">
                    {copy.settings.updatedAtLabel}
                  </p>
                  <p className="text-[13px] text-app-text-muted">
                    {formatDateTime(viewer.updated_at, language)}
                  </p>
                </div>
              </div>
            ) : null}

            {activeSection === "preferences" ? <PreferencesPanel /> : null}

            {activeSection === "profile" ? (
              <ProfileForm action={action} profile={viewer} />
            ) : null}

            {activeSection === "integrations" ? (
              <IntegrationsPanel
                action={integrationAction}
                disconnectAction={disconnectIntegrationAction}
                viewer={viewer}
                connections={integrations}
              />
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
