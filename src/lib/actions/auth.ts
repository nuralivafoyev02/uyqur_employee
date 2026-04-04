"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createActionClient } from "@/lib/supabase/server";
import { getRequestOrigin } from "@/lib/site-url";
import {
  type ActionState,
  type FieldErrors,
  validateAuthForm,
} from "@/lib/validations";
import type { UserRole } from "@/types/database";

type AuthField = "fullName" | "email" | "password";

function authError(message: string, fieldErrors?: FieldErrors<AuthField>): ActionState<AuthField> {
  return {
    success: false,
    message,
    fieldErrors,
  };
}

function isEmailConfirmationError(error: { code?: string; message: string }) {
  return error.code === "email_not_confirmed" || /email not confirmed/i.test(error.message);
}

function isAlreadyRegisteredError(error: { code?: string; message: string }) {
  return (
    error.code === "user_already_exists" ||
    error.code === "email_exists" ||
    /already registered/i.test(error.message)
  );
}

function isConfirmationEmailSendError(error: { code?: string; message: string }) {
  return (
    error.code === "unexpected_failure" &&
    /confirmation email/i.test(error.message)
  );
}

function isExistingUserSignUpResponse(identities: { id: string }[] | undefined) {
  return Array.isArray(identities) && identities.length === 0;
}

export async function signInAction(
  _prevState: ActionState<AuthField> | undefined,
  formData: FormData,
): Promise<ActionState<AuthField>> {
  const validation = validateAuthForm(formData, "login");

  if (!validation.data) {
    return authError("Maydonlarni tekshirib qayta urinib ko'ring.", validation.fieldErrors);
  }

  const supabase = await createActionClient();

  if (!supabase) {
    return authError(
      "Supabase ulanishi sozlanmagan. `.env.local` ni tekshirib ko'ring.",
    );
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: validation.data.email,
    password: validation.data.password,
  });

  if (error) {
    if (isEmailConfirmationError(error)) {
      return authError(
        "Email manzilingiz tasdiqlanmagan. Avval emailingizdagi tasdiqlash havolasini bosing.",
      );
    }

    return authError("Login muvaffaqiyatsiz bo'ldi. Email yoki parol noto'g'ri.");
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUpAction(
  _prevState: ActionState<AuthField> | undefined,
  formData: FormData,
): Promise<ActionState<AuthField>> {
  const validation = validateAuthForm(formData, "register");

  if (!validation.data) {
    return authError("Maydonlarni to'g'rilab qayta yuboring.", validation.fieldErrors);
  }

  const supabase = await createActionClient();

  if (!supabase) {
    return authError(
      "Supabase ulanishi sozlanmagan. `.env.local` ni tekshirib ko'ring.",
    );
  }

  const appOrigin = await getRequestOrigin();

  const { data, error } = await supabase.auth.signUp({
    email: validation.data.email,
    password: validation.data.password,
    options: {
      emailRedirectTo: `${appOrigin}/auth/confirm?next=/dashboard`,
      data: {
        full_name: validation.data.fullName,
        role: "employee" satisfies UserRole,
      },
    },
  });

  if (error) {
    if (isConfirmationEmailSendError(error)) {
      return authError(
        "Tasdiqlash emailini yuborib bo'lmadi. Supabase Auth email sozlamalarini tekshiring.",
      );
    }

    if (isAlreadyRegisteredError(error)) {
      return authError(
        "Bu email allaqachon ro'yxatdan o'tgan. Login qiling yoki emailingizni tasdiqlang.",
      );
    }

    return authError(error.message);
  }

  // Supabase can return a masked user instead of an explicit error when the email
  // already exists and email confirmation is enabled in the project.
  if (isExistingUserSignUpResponse(data.user?.identities)) {
    return authError(
      "Bu email allaqachon ro'yxatdan o'tgan. Login qiling yoki emailingizni tasdiqlang.",
    );
  }

  if (!data.user && !data.session) {
    return authError("Hisob yaratishda xatolik yuz berdi. Keyinroq qayta urinib ko'ring.");
  }

  revalidatePath("/", "layout");

  if (data.session) {
    redirect("/dashboard");
  }

  redirect("/login?registered=1&confirmation=1");
}

export async function signOutAction() {
  const supabase = await createActionClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");
  redirect("/login");
}
