"use client";

import { useActionState } from "react";

import { useAppCopy, usePreferences } from "@/components/providers/preferences-provider";
import { SubmitButton } from "@/components/ui/submit-button";
import { translateProfileMessage } from "@/lib/copy";
import type { ActionState } from "@/lib/validations";
import type { Profile } from "@/types/database";

type ProfileField = "fullName" | "title" | "department";

type ProfileFormAction = (
  state: ActionState<ProfileField> | undefined,
  formData: FormData,
) => Promise<ActionState<ProfileField>>;

type ProfileFormProps = {
  action: ProfileFormAction;
  profile: Pick<Profile, "full_name" | "title" | "department">;
};

export function ProfileForm({ action, profile }: ProfileFormProps) {
  const [state, formAction] = useActionState(action, undefined);
  const { language } = usePreferences();
  const copy = useAppCopy();

  return (
    <form action={formAction} className="space-y-5">
      {state?.message ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            state.success
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {translateProfileMessage(state.message, language)}
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-app-text" htmlFor="fullName">
          {copy.settings.profileForm.fullName}
        </label>
        <input
          id="fullName"
          name="fullName"
          className="app-field"
          defaultValue={profile.full_name}
        />
        {state?.fieldErrors?.fullName ? (
          <p className="text-sm text-rose-700">
            {translateProfileMessage(state.fieldErrors.fullName[0], language)}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-app-text" htmlFor="title">
            {copy.settings.profileForm.title}
          </label>
          <input
            id="title"
            name="title"
            className="app-field"
            defaultValue={profile.title ?? ""}
            placeholder={copy.settings.profileForm.titlePlaceholder}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-app-text" htmlFor="department">
            {copy.settings.profileForm.department}
          </label>
          <input
            id="department"
            name="department"
            className="app-field"
            defaultValue={profile.department ?? ""}
            placeholder={copy.settings.profileForm.departmentPlaceholder}
          />
        </div>
      </div>

      <SubmitButton
        label={copy.settings.profileForm.submit}
        pendingLabel={copy.settings.profileForm.pending}
      />
    </form>
  );
}
