"use server";

import { revalidatePath } from "next/cache";

import { requireViewer } from "@/lib/auth";
import { createActionClient } from "@/lib/supabase/server";
import { type ActionState, validateProfileForm } from "@/lib/validations";

type ProfileField = "fullName" | "title" | "department";

export async function updateProfileAction(
  _prevState: ActionState<ProfileField> | undefined,
  formData: FormData,
): Promise<ActionState<ProfileField>> {
  const validation = validateProfileForm(formData);

  if (!validation.data) {
    return {
      success: false,
      message: "Profil maydonlarini tekshiring.",
      fieldErrors: validation.fieldErrors,
    };
  }

  const viewer = await requireViewer();
  const supabase = await createActionClient();

  if (!supabase) {
    return {
      success: false,
      message: "Supabase ulanishi sozlanmagan.",
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: validation.data.fullName,
      title: validation.data.title || null,
      department: validation.data.department || null,
    })
    .eq("id", viewer.id);

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  revalidatePath("/employees");

  return {
    success: true,
    message: "Profil yangilandi.",
  };
}
