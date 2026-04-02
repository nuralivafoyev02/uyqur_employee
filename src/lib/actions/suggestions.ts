"use server";

import { revalidatePath } from "next/cache";

import { hasRole, requireViewer } from "@/lib/auth";
import { createActionClient } from "@/lib/supabase/server";
import { type ActionState, validateSuggestionForm } from "@/lib/validations";
import type { SuggestionStatus } from "@/types/database";

type SuggestionField = "title" | "description";

export async function saveSuggestionAction(
  _prevState: ActionState<SuggestionField> | undefined,
  formData: FormData,
): Promise<ActionState<SuggestionField>> {
  const viewer = await requireViewer();
  const validation = validateSuggestionForm(formData);

  if (!validation.data) {
    return {
      success: false,
      message: "Taklif maydonlarini tekshirib chiqing.",
      fieldErrors: validation.fieldErrors,
    };
  }

  const supabase = await createActionClient();

  if (!supabase) {
    return {
      success: false,
      message: "Supabase ulanishi sozlanmagan.",
    };
  }

  const { error } = await supabase.from("suggestions").insert({
    employee_id: viewer.id,
    title: validation.data.title,
    description: validation.data.description || null,
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/suggestions");

  return {
    success: true,
    message: "Taklif saqlandi.",
    redirectTo: "/suggestions",
  };
}

export async function updateSuggestionStatusAction(formData: FormData) {
  const viewer = await requireViewer();

  if (!hasRole(viewer.role, ["admin", "manager"])) {
    return;
  }

  const supabase = await createActionClient();

  if (!supabase) {
    return;
  }

  const suggestionIdEntry = formData.get("suggestionId");
  const statusEntry = formData.get("status");
  const suggestionId = typeof suggestionIdEntry === "string" ? suggestionIdEntry : "";
  const rawStatus = typeof statusEntry === "string" ? statusEntry : "";

  if (!suggestionId) {
    return;
  }

  if (
    rawStatus !== "new" &&
    rawStatus !== "accepted" &&
    rawStatus !== "prepared" &&
    rawStatus !== "canceled"
  ) {
    return;
  }

  await supabase
    .from("suggestions")
    .update({
      status: rawStatus as SuggestionStatus,
    })
    .eq("id", suggestionId);

  revalidatePath("/dashboard");
  revalidatePath("/suggestions");
}
