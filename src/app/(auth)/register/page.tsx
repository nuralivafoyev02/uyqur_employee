import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
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
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="app-kicker">{"Ro'yxatdan o'tish"}</p>
        <h1 className="app-title">Yangi xodim hisobi yarating</h1>
        <p className="app-subtitle">
          Yangi foydalanuvchilar standart holatda `employee` roli bilan yaratiladi.
        </p>
      </div>

      {!configured ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          `.env.local` ichiga haqiqiy Supabase qiymatlari kiritilmaguncha auth ishlamaydi.
        </div>
      ) : null}

      <AuthForm mode="register" action={signUpAction} disabled={!configured} />

      <p className="text-sm text-app-text-muted">
        Hisob mavjudmi?{" "}
        <Link href="/login" className="font-medium text-app-accent">
          Login qilish
        </Link>
      </p>
    </div>
  );
}
