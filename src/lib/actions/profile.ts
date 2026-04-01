"use server";

import { revalidatePath } from "next/cache";

import { requireViewer } from "@/lib/auth";
import { createActionClient } from "@/lib/supabase/server";
import {
  type ActionState,
  validateProfileForm,
  validateProfileStatusForm,
} from "@/lib/validations";

type ProfileField = "fullName" | "title" | "department" | "profileStatus";
type ProfileStatusField = "profileStatus";

function revalidateProfileViews(viewerId: string) {
  revalidatePath("/dashboard");
  revalidatePath("/settings");
  revalidatePath("/employees");
  revalidatePath("/reports");
  revalidatePath(`/employees/${viewerId}`);
}

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
      profile_status: validation.data.profileStatus || null,
    })
    .eq("id", viewer.id);

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidateProfileViews(viewer.id);

  return {
    success: true,
    message: "Profil yangilandi.",
  };
}

export async function updateProfileStatusAction(
  _prevState: ActionState<ProfileStatusField> | undefined,
  formData: FormData,
): Promise<ActionState<ProfileStatusField>> {
  const validation = validateProfileStatusForm(formData);

  if (!validation.data) {
    return {
      success: false,
      message: "Status maydonini tekshiring.",
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
      profile_status: validation.data.profileStatus || null,
    })
    .eq("id", viewer.id);

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidateProfileViews(viewer.id);

  return {
    success: true,
    message: "Status yangilandi.",
  };
}
