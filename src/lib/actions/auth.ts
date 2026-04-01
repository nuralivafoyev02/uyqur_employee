"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createActionClient } from "@/lib/supabase/server";
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

  const { data, error } = await supabase.auth.signUp({
    email: validation.data.email,
    password: validation.data.password,
    options: {
      data: {
        full_name: validation.data.fullName,
        role: "employee" satisfies UserRole,
      },
    },
  });

  if (error) {
    return authError(error.message);
  }

  revalidatePath("/", "layout");

  if (data.session) {
    redirect("/dashboard");
  }

  redirect("/login?registered=1");
}

export async function signOutAction() {
  const supabase = await createActionClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");
  redirect("/login");
}
