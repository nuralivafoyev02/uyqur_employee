"use client";

import { useActionState, useState } from "react";

import { usePreferences } from "@/components/providers/preferences-provider";
import type { ToastTone } from "@/components/providers/toast-provider";
import { SubmitButton } from "@/components/ui/submit-button";
import { ActionStateToast, ToastEffect } from "@/components/ui/toast-effect";
import { getAuthCopy, translateAuthMessage } from "@/lib/auth-copy";
import type { ActionState } from "@/lib/validations";

type AuthField = "fullName" | "email" | "password";
type AuthFormAction = (
  state: ActionState<AuthField> | undefined,
  formData: FormData,
) => Promise<ActionState<AuthField>>;

type AuthFormProps = {
  mode: "login" | "register";
  action: AuthFormAction;
  notice?: string;
  noticeTone?: ToastTone;
  disabled?: boolean;
};

export function AuthForm({
  mode,
  action,
  notice,
  noticeTone = "success",
  disabled = false,
}: AuthFormProps) {
  const [state, formAction] = useActionState(action, undefined);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isRegister = mode === "register";
  const { language } = usePreferences();
  const copy = getAuthCopy(language);

  return (
    <form action={formAction} className="space-y-5">
      <ToastEffect
        message={translateAuthMessage(notice, language)}
        tone={noticeTone}
        eventKey={notice}
      />
      <ActionStateToast
        state={state}
        message={translateAuthMessage(state?.message, language)}
      />

      {isRegister ? (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-app-text" htmlFor="fullName">
            {copy.form.fullName}
          </label>
          <input
            id="fullName"
            name="fullName"
            className="app-field"
            placeholder={copy.form.fullNamePlaceholder}
            disabled={disabled}
          />
          {state?.fieldErrors?.fullName ? (
            <p className="text-sm text-rose-700">
              {translateAuthMessage(state.fieldErrors.fullName[0], language)}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-app-text" htmlFor="email">
          {copy.form.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="app-field"
          placeholder={copy.form.emailPlaceholder}
          disabled={disabled}
        />
        {state?.fieldErrors?.email ? (
          <p className="text-sm text-rose-700">
            {translateAuthMessage(state.fieldErrors.email[0], language)}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-app-text" htmlFor="password">
          {copy.form.password}
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={isPasswordVisible ? "text" : "password"}
            autoComplete={isRegister ? "new-password" : "current-password"}
            className="app-field pr-20"
            placeholder={copy.form.passwordPlaceholder}
            disabled={disabled}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-3 my-auto inline-flex h-7 items-center text-[12px] font-semibold text-app-text-muted transition hover:text-app-text disabled:pointer-events-none disabled:opacity-60"
            onClick={() => setIsPasswordVisible((current) => !current)}
            aria-label={isPasswordVisible ? copy.form.hidePassword : copy.form.showPassword}
            aria-pressed={isPasswordVisible}
            disabled={disabled}
          >
            {isPasswordVisible ? copy.form.hidePassword : copy.form.showPassword}
          </button>
        </div>
        {state?.fieldErrors?.password ? (
          <p className="text-sm text-rose-700">
            {translateAuthMessage(state.fieldErrors.password[0], language)}
          </p>
        ) : null}
      </div>

      <SubmitButton
        label={isRegister ? copy.form.createAccount : copy.form.signIn}
        pendingLabel={isRegister ? copy.form.creating : copy.form.signingIn}
        className="w-full"
      />
    </form>
  );
}
