"use server";

import { revalidatePath } from "next/cache";

import { hasRole, requireViewer } from "@/lib/auth";
import { createActionClient } from "@/lib/supabase/server";
import { type ActionState, validatePlanForm } from "@/lib/validations";
import type { PlanStatus } from "@/types/database";

type PlanField =
  | "title"
  | "description"
  | "assigneeId"
  | "dueDate"
  | "priority"
  | "status";

export async function savePlanAction(
  _prevState: ActionState<PlanField> | undefined,
  formData: FormData,
): Promise<ActionState<PlanField>> {
  const viewer = await requireViewer();

  if (!hasRole(viewer.role, ["admin", "manager"])) {
    return {
      success: false,
      message: "Bu amal faqat admin yoki manager uchun ochiq.",
    };
  }

  const validation = validatePlanForm(formData);

  if (!validation.data) {
    return {
      success: false,
      message: "Vazifa maydonlarini tekshirib chiqing.",
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

  const planIdEntry = formData.get("planId");
  const planId = typeof planIdEntry === "string" ? planIdEntry : "";
  const payload = {
    assignee_id: validation.data.assigneeId,
    title: validation.data.title,
    description: validation.data.description || null,
    due_date: validation.data.dueDate || null,
    priority: validation.data.priority,
    status: validation.data.status,
  };

  const operation = planId
    ? supabase.from("plans").update(payload).eq("id", planId)
    : supabase.from("plans").insert({
        ...payload,
        created_by: viewer.id,
      });

  const { error } = await operation;

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/plans");
  revalidatePath("/employees");

  return {
    success: true,
    message: "Vazifa saqlandi.",
  };
}

export async function updatePlanStatusAction(formData: FormData) {
  const viewer = await requireViewer();
  const supabase = await createActionClient();

  if (!supabase) {
    return;
  }

  const planIdEntry = formData.get("planId");
  const statusEntry = formData.get("status");
  const planId = typeof planIdEntry === "string" ? planIdEntry : "";
  const rawStatus = typeof statusEntry === "string" ? statusEntry : "";

  if (!planId) {
    return;
  }

  if (
    rawStatus !== "todo" &&
    rawStatus !== "in_progress" &&
    rawStatus !== "done" &&
    rawStatus !== "blocked"
  ) {
    return;
  }

  const { data: plan } = await supabase
    .from("plans")
    .select("assignee_id")
    .eq("id", planId)
    .maybeSingle();

  if (!plan) {
    return;
  }

  if (!hasRole(viewer.role, ["admin", "manager"]) && plan.assignee_id !== viewer.id) {
    return;
  }

  if (hasRole(viewer.role, ["admin", "manager"])) {
    await supabase
      .from("plans")
      .update({
        status: rawStatus as PlanStatus,
      })
      .eq("id", planId);
  } else {
    await supabase.rpc("update_plan_status", {
      plan_id: planId,
      next_status: rawStatus as PlanStatus,
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/plans");
  revalidatePath("/employees");
}
