import { redirect } from "next/navigation";

import { AuthPageContent } from "@/components/auth/auth-page-content";
import { getCurrentViewer } from "@/lib/auth";
import { signInAction } from "@/lib/actions/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type LoginPageProps = {
  searchParams: Promise<{
    registered?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const viewer = await getCurrentViewer();

  if (viewer) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const configured = isSupabaseConfigured();

  return (
    <AuthPageContent
      mode="login"
      action={signInAction}
      notice={
        params.registered === "1"
          ? "Hisob yaratildi. Endi email va parol bilan tizimga kiring."
          : undefined
      }
      disabled={!configured}
    />
  );
}
