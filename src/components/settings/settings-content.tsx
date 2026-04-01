"use client";

import { useAppCopy, usePreferences } from "@/components/providers/preferences-provider";
import { PreferencesPanel } from "@/components/settings/preferences-panel";
import { ProfileForm } from "@/components/settings/profile-form";
import { RoleBadge } from "@/components/ui/badges";
import { PageHeader } from "@/components/ui/page-header";
import type { ActionState } from "@/lib/validations";
import { formatDateTime } from "@/lib/utils";
import type { Viewer } from "@/types/database";

type ProfileField = "fullName" | "title" | "department";

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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={copy.settings.eyebrow}
        title={copy.settings.title}
        description={copy.settings.description}
        actions={<RoleBadge role={viewer.role} language={language} />}
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_minmax(0,1.05fr)]">
        <div className="space-y-6">
          <section className="app-panel p-6">
            <p className="app-kicker">{copy.settings.accountEyebrow}</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-app-text">
              {copy.settings.accountTitle}
            </h2>

            <div className="mt-6 grid gap-4 text-sm">
              <div className="rounded-2xl border border-app-border bg-app-bg-elevated px-4 py-4">
                <p className="text-app-text-subtle">{copy.settings.emailLabel}</p>
                <p className="mt-1 font-medium text-app-text">{viewer.email}</p>
              </div>
              <div className="rounded-2xl border border-app-border bg-app-bg-elevated px-4 py-4">
                <p className="text-app-text-subtle">{copy.settings.updatedAtLabel}</p>
                <p className="mt-1 font-medium text-app-text">
                  {formatDateTime(viewer.updated_at, language)}
                </p>
              </div>
            </div>
          </section>

          <PreferencesPanel />
        </div>

        <section className="app-panel p-6">
          <p className="app-kicker">{copy.settings.profileEyebrow}</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-app-text">
            {copy.settings.profileTitle}
          </h2>

          <div className="mt-6">
            <ProfileForm action={action} profile={viewer} />
          </div>
        </section>
      </div>
    </div>
  );
}
