import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-app-bg">
      <div className="app-shell flex min-h-screen items-center justify-center py-10">
        <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.05fr_minmax(0,0.95fr)]">
          <section className="app-panel hidden p-10 lg:flex lg:flex-col lg:justify-between">
            <div className="space-y-4">
              <p className="app-kicker">Uyqur Employee Tracking</p>
              <h1 className="text-4xl font-semibold tracking-tight text-app-text">
                Hisobot, reja va xodim nazorati bir joyda.
              </h1>
              <p className="max-w-xl text-base leading-7 text-app-text-muted">
                Ichki jamoa uchun tez, aniq va ortiqcha bezaksiz workflow. Har bir
                hisobot server tomondan himoyalangan, role-based access bilan boshqariladi.
              </p>
            </div>

            <div className="app-panel-soft space-y-3 p-5">
              <p className="text-sm font-medium text-app-text">Asosiy imkoniyatlar</p>
              <ul className="space-y-2 text-sm leading-6 text-app-text-muted">
                <li>Bugungi hisobotni 2-3 bosishda topshirish</li>
                <li>Admin va manager uchun filtrlash va monitoring</li>
                <li>Plans/tasks oqimini deadline va prioritet bilan boshqarish</li>
              </ul>
            </div>
          </section>

          <section className="app-panel p-6 sm:p-8">
            <div className="mb-8 flex items-center justify-between">
              <Link href="/" className="text-sm font-semibold tracking-[0.18em] text-app-text">
                UYQUR
              </Link>
              <span className="text-sm text-app-text-subtle">Internal System</span>
            </div>
            {children}
          </section>
        </div>
      </div>
    </div>
  );
}
