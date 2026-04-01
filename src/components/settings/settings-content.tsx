"use client";

import { useMemo, useState } from "react";

import {
  AccountIcon,
  InterfaceIcon,
  UserIcon,
} from "@/components/layout/dashboard-icons";
import { useAppCopy, usePreferences } from "@/components/providers/preferences-provider";
import { PreferencesPanel } from "@/components/settings/preferences-panel";
import { ProfileForm } from "@/components/settings/profile-form";
import { RoleBadge } from "@/components/ui/badges";
import type { ActionState } from "@/lib/validations";
import { cx, formatDateTime } from "@/lib/utils";
import type { Viewer } from "@/types/database";

type ProfileField = "fullName" | "title" | "department";
type SettingsSectionId = "account" | "preferences" | "profile";

type ProfileFormAction = (
  state: ActionState<ProfileField> | undefined,
  formData: FormData,
) => Promise<ActionState<ProfileField>>;

type SettingsContentProps = {
  action: ProfileFormAction;
  viewer: Viewer;
};

export function SettingsContent({ action, viewer }: SettingsContentProps) {
  const { language } = usePreferences();
  const copy = useAppCopy();
  const [activeSection, setActiveSection] = useState<SettingsSectionId>("account");

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
        : copy.settings.profileEyebrow;
  const currentTitle =
    activeSection === "account"
      ? copy.settings.accountTitle
      : activeSection === "preferences"
        ? copy.settings.preferencesTitle
        : copy.settings.profileTitle;
  const currentDescription =
    activeSection === "account"
      ? copy.settings.accountDescription
      : activeSection === "preferences"
        ? copy.settings.preferencesDescription
        : copy.settings.sections.profile.description;

  return (
    <div className="-mx-4 -mt-6 min-h-screen md:-mx-6">
      <div className="min-h-screen overflow-hidden border-y border-app-border bg-app-surface lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:border">
        <aside className="border-b border-app-border bg-app-surface px-4 py-5 lg:min-h-full lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
          <div className="px-2 pb-4">
            <p className="text-sm font-semibold tracking-tight text-app-text-subtle">
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
                    "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors duration-200",
                    isActive
                      ? "bg-app-accent-muted text-app-text"
                      : "text-app-text-muted hover:bg-app-surface-muted hover:text-app-text",
                  )}
                  onClick={() => setActiveSection(section.id)}
                >
                  <span
                    className={cx(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-200",
                      isActive
                        ? "bg-app-accent text-white"
                        : "bg-app-bg-elevated text-app-text-subtle",
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0 text-base font-semibold">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0 bg-app-surface">
          <div className="border-b border-app-border bg-app-bg-elevated/40 px-5 py-5 md:px-6 md:py-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-app-accent-muted text-app-accent">
                  <CurrentSectionIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="app-kicker">{currentEyebrow}</p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-app-text">
                    {currentTitle}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-app-text-muted">
                    {currentDescription}
                  </p>
                </div>
              </div>

              <RoleBadge role={viewer.role} language={language} />
            </div>
          </div>

          <div className="px-5 py-6 md:px-6 md:py-7">
            {activeSection === "account" ? (
              <div className="divide-y divide-app-border">
                <div className="grid gap-2 py-4 md:grid-cols-[180px_minmax(0,1fr)] md:items-center">
                  <p className="text-sm font-medium text-app-text">{copy.settings.emailLabel}</p>
                  <p className="text-sm text-app-text-muted">{viewer.email}</p>
                </div>
                <div className="grid gap-2 py-4 md:grid-cols-[180px_minmax(0,1fr)] md:items-center">
                  <p className="text-sm font-medium text-app-text">{copy.settings.roleLabel}</p>
                  <div>
                    <RoleBadge role={viewer.role} language={language} />
                  </div>
                </div>
                <div className="grid gap-2 py-4 md:grid-cols-[180px_minmax(0,1fr)] md:items-center">
                  <p className="text-sm font-medium text-app-text">
                    {copy.settings.updatedAtLabel}
                  </p>
                  <p className="text-sm text-app-text-muted">
                    {formatDateTime(viewer.updated_at, language)}
                  </p>
                </div>
              </div>
            ) : null}

            {activeSection === "preferences" ? <PreferencesPanel /> : null}

            {activeSection === "profile" ? (
              <ProfileForm action={action} profile={viewer} />
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
