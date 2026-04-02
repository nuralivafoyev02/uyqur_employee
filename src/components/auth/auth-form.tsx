"use client";

import { useActionState, useState } from "react";

import { SubmitButton } from "@/components/ui/submit-button";
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
  disabled?: boolean;
};

export function AuthForm({ mode, action, notice, disabled = false }: AuthFormProps) {
  const [state, formAction] = useActionState(action, undefined);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isRegister = mode === "register";

  return (
    <form action={formAction} className="space-y-5">
      {notice ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </div>
      ) : null}

      {state?.message ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {state.message}
        </div>
      ) : null}

      {isRegister ? (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-app-text" htmlFor="fullName">
            F.I.Sh.
          </label>
          <input
            id="fullName"
            name="fullName"
            className="app-field"
            placeholder="Masalan, Sardor Qodirov"
            disabled={disabled}
          />
          {state?.fieldErrors?.fullName ? (
            <p className="text-sm text-rose-700">{state.fieldErrors.fullName[0]}</p>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-app-text" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="app-field"
          placeholder="name@company.com"
          disabled={disabled}
        />
        {state?.fieldErrors?.email ? (
          <p className="text-sm text-rose-700">{state.fieldErrors.email[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-app-text" htmlFor="password">
          Parol
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={isPasswordVisible ? "text" : "password"}
            autoComplete={isRegister ? "new-password" : "current-password"}
            className="app-field pr-20"
            placeholder="Kamida 8 ta belgi"
            disabled={disabled}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-3 my-auto inline-flex h-7 items-center text-[12px] font-semibold text-app-text-muted transition hover:text-app-text disabled:pointer-events-none disabled:opacity-60"
            onClick={() => setIsPasswordVisible((current) => !current)}
            aria-label={isPasswordVisible ? "Parolni yashirish" : "Parolni ko'rsatish"}
            aria-pressed={isPasswordVisible}
            disabled={disabled}
          >
            {isPasswordVisible ? "Yashir" : "Ko'rsat"}
          </button>
        </div>
        {state?.fieldErrors?.password ? (
          <p className="text-sm text-rose-700">{state.fieldErrors.password[0]}</p>
        ) : null}
      </div>

      <SubmitButton
        label={isRegister ? "Hisob yaratish" : "Kirish"}
        pendingLabel={isRegister ? "Yaratilmoqda..." : "Kirilmoqda..."}
        className="w-full"
      />
    </form>
  );
}
