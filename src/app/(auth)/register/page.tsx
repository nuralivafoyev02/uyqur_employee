import { redirect } from "next/navigation";

import { AuthPageContent } from "@/components/auth/auth-page-content";
import { getCurrentViewer } from "@/lib/auth";
import { signUpAction } from "@/lib/actions/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function RegisterPage() {
  const viewer = await getCurrentViewer();

  if (viewer) {
    redirect("/dashboard");
  }

  const configured = isSupabaseConfigured();

  return (
    <AuthPageContent
      mode="register"
      action={signUpAction}
      disabled={!configured}
    />
  );
}
