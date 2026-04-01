import { cache } from "react";
import { redirect } from "next/navigation";

import { createServerComponentClient } from "@/lib/supabase/server";
import type { Profile, UserRole, Viewer } from "@/types/database";

const PROFILE_COLUMNS =
  "id, full_name, title, department, profile_status, role, created_at, updated_at";

function canAutoCreateProfile(email: string | undefined, userId: string) {
  return userId.length > 0 && Boolean(email);
}

async function ensureProfile(userId: string, email: string | undefined) {
  const supabase = await createServerComponentClient();

  if (!supabase) {
    return null;
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", userId)
    .maybeSingle();

  if (existingProfile) {
    return existingProfile as Profile;
  }

  if (!canAutoCreateProfile(email, userId)) {
    return null;
  }

  const fallbackName = email?.split("@")[0]?.replace(/[._-]/g, " ") ?? "Yangi xodim";

  const { data: insertedProfile } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      full_name: fallbackName
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0]?.toUpperCase() + part.slice(1))
        .join(" "),
    })
    .select(PROFILE_COLUMNS)
    .single();

  if (!insertedProfile) {
    return null;
  }

  return insertedProfile as Profile;
}

export const getCurrentViewer = cache(async (): Promise<Viewer | null> => {
  const supabase = await createServerComponentClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profile = await ensureProfile(user.id, user.email);

  if (!profile) {
    return null;
  }

  return {
    ...profile,
    email: user.email ?? "",
  };
});

export async function requireViewer() {
  const viewer = await getCurrentViewer();

  if (!viewer) {
    redirect("/login");
  }

  return viewer;
}

export function hasRole(
  role: UserRole,
  allowed: readonly UserRole[] | UserRole,
): boolean {
  const allowedRoles = Array.isArray(allowed) ? allowed : [allowed];
  return allowedRoles.includes(role);
}

export async function requireRole(allowed: readonly UserRole[] | UserRole) {
  const viewer = await requireViewer();

  if (!hasRole(viewer.role, allowed)) {
    redirect("/dashboard?denied=1");
  }

  return viewer;
}
