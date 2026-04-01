import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentViewer } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <section className="app-panel w-full max-w-2xl p-8 md:p-10">
          <div className="space-y-4">
            <p className="app-kicker">Uyqur Employee Tracking</p>
            <h1 className="app-title">Supabase ulanishi kutilmoqda</h1>
            <p className="app-subtitle max-w-xl">
              Tizim product-ready oqimlar bilan tayyorlandi, lekin ishga tushishi uchun
              {`.env.local` +
                " ichida haqiqiy Supabase URL va publishable key bo'lishi kerak."}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login" className="app-button">
              Login sahifasi
            </Link>
            <Link href="/register" className="app-button-secondary">
              {"Ro'yxatdan o'tish"}
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const viewer = await getCurrentViewer();

  redirect(viewer ? "/dashboard" : "/login");
}
