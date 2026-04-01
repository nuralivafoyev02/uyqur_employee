import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
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
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="app-kicker">Kirish</p>
        <h1 className="app-title">Ish jarayoniga qayting</h1>
        <p className="app-subtitle">
          Hisobotlar, vazifalar va employee overview shu yerdan boshqariladi.
        </p>
      </div>

      {!configured ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          `.env.local` ichiga haqiqiy Supabase qiymatlari kiritilmaguncha auth ishlamaydi.
        </div>
      ) : null}

      <AuthForm
        mode="login"
        action={signInAction}
        notice={
          params.registered === "1"
            ? "Hisob yaratildi. Endi email va parol bilan tizimga kiring."
            : undefined
        }
        disabled={!configured}
      />

      <p className="text-sm text-app-text-muted">
        {"Hisob yo'qmi? "}
        <Link href="/register" className="font-medium text-app-accent">
          {"Ro'yxatdan o'tish"}
        </Link>
      </p>
    </div>
  );
}
