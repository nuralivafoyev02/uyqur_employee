"use client";

import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";
import { usePreferences } from "@/components/providers/preferences-provider";
import { getAuthCopy } from "@/lib/auth-copy";
import type { ActionState } from "@/lib/validations";

type AuthField = "fullName" | "email" | "password";
type AuthFormAction = (
  state: ActionState<AuthField> | undefined,
  formData: FormData,
) => Promise<ActionState<AuthField>>;

type AuthPageContentProps = {
  mode: "login" | "register";
  action: AuthFormAction;
  notice?: string;
  disabled?: boolean;
};

export function AuthPageContent({
  mode,
  action,
  notice,
  disabled = false,
}: AuthPageContentProps) {
  const { language } = usePreferences();
  const copy = getAuthCopy(language);
  const isRegister = mode === "register";

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="app-kicker">
          {isRegister ? copy.register.eyebrow : copy.login.eyebrow}
        </p>
        <h1 className="app-title">
          {isRegister ? copy.register.title : copy.login.title}
        </h1>
        <p className="app-subtitle">
          {isRegister ? copy.register.description : copy.login.description}
        </p>
      </div>

      {!disabled ? null : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {copy.warnings.supabaseNotReady}
        </div>
      )}

      <AuthForm mode={mode} action={action} notice={notice} disabled={disabled} />

      <p className="text-sm text-app-text-muted">
        {isRegister ? copy.register.hasAccount : copy.login.noAccount}{" "}
        <Link href={isRegister ? "/login" : "/register"} className="font-medium text-app-accent">
          {isRegister ? copy.register.loginLink : copy.login.registerLink}
        </Link>
      </p>
    </div>
  );
}
