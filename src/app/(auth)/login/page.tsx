import { redirect } from "next/navigation";

import { AuthPageContent } from "@/components/auth/auth-page-content";
import { getCurrentViewer } from "@/lib/auth";
import { signInAction } from "@/lib/actions/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type LoginPageProps = {
  searchParams: Promise<{
    registered?: string;
    confirmation?: string;
    authError?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const viewer = await getCurrentViewer();

  if (viewer) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const configured = isSupabaseConfigured();
  const notice =
    params.authError === "confirmation_failed"
      ? "Email tasdiqlash havolasi yaroqsiz yoki eskirgan."
      : params.authError === "supabase_not_ready"
        ? "Supabase ulanishi sozlanmagan. `.env.local` ni tekshirib ko'ring."
        : params.registered === "1"
          ? params.confirmation === "1"
            ? "Hisob yaratildi. Emailingizga yuborilgan tasdiqlash havolasini bosing, keyin tizimga kiring."
            : "Hisob yaratildi. Endi email va parol bilan tizimga kiring."
          : undefined;
  const noticeTone =
    params.authError === "confirmation_failed" || params.authError === "supabase_not_ready"
      ? "error"
      : "success";

  return (
    <AuthPageContent
      mode="login"
      action={signInAction}
      notice={notice}
      noticeTone={noticeTone}
      disabled={!configured}
    />
  );
}
