"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useAppCopy, usePreferences } from "@/components/providers/preferences-provider";
import { DashboardNav, type DashboardNavItem } from "@/components/layout/dashboard-nav";
import { RoleBadge } from "@/components/ui/badges";
import { signOutAction } from "@/lib/actions/auth";
import type { AppCopy } from "@/lib/copy";

type ViewerSummary = {
  fullName: string;
  email: string;
  role: "admin" | "manager" | "employee";
};

function buildItems(
  role: ViewerSummary["role"] | null,
  navCopy: AppCopy["shell"]["nav"],
): DashboardNavItem[] {
  const baseItems: DashboardNavItem[] = [
    { href: "/dashboard", label: navCopy.dashboard },
    { href: "/reports", label: navCopy.reports },
    { href: "/plans", label: navCopy.plans },
    { href: "/settings", label: navCopy.settings },
  ];

  if (role === "admin" || role === "manager") {
    return [
      baseItems[0],
      baseItems[1],
      baseItems[2],
      { href: "/employees", label: navCopy.employees },
      baseItems[3],
    ];
  }

  return baseItems;
}

export function DashboardShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { language } = usePreferences();
  const copy = useAppCopy();
  const [viewer, setViewer] = useState<ViewerSummary | null>(null);
  const items = buildItems(viewer?.role ?? null, copy.shell.nav);

  useEffect(() => {
    let active = true;

    async function loadViewer() {
      try {
        const response = await fetch("/api/me", {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as ViewerSummary;

        if (active) {
          setViewer(payload);
        }
      } catch {
        // Keep the shell responsive even if the profile request fails.
      }
    }

    void loadViewer();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden border-r border-app-border bg-app-surface px-4 py-6 backdrop-blur lg:flex lg:flex-col">
          <Link
            href="/dashboard"
            className="px-3 text-sm font-semibold tracking-[0.18em] text-app-text"
          >
            UYQUR
          </Link>
          <div className="mt-8">
            <DashboardNav items={items} />
          </div>

          <div className="mt-auto space-y-4 rounded-2xl border border-app-border bg-app-bg-elevated p-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-app-text">
                {viewer?.fullName ?? copy.shell.loadingName}
              </p>
              <p className="text-sm text-app-text-muted">
                {viewer?.email ?? copy.shell.loadingProfile}
              </p>
              {viewer ? <RoleBadge role={viewer.role} language={language} /> : null}
            </div>
            <form action={signOutAction}>
              <button type="submit" className="app-button-secondary w-full justify-center">
                {copy.shell.signOut}
              </button>
            </form>
          </div>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="border-b border-app-border bg-app-surface backdrop-blur">
            <div className="app-shell flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <Link
                  href="/dashboard"
                  className="text-sm font-semibold tracking-[0.18em] text-app-text lg:hidden"
                >
                  UYQUR
                </Link>
                <p className="mt-1 text-sm text-app-text-muted">
                  {copy.shell.subtitle}
                </p>
              </div>

              <details className="rounded-2xl border border-app-border bg-app-bg-elevated px-4 py-3 lg:hidden">
                <summary className="cursor-pointer text-sm font-medium text-app-text">
                  {copy.shell.menuAndProfile}
                </summary>
                <div className="mt-4 space-y-4">
                  <DashboardNav items={items} compact />
                  <div className="rounded-2xl border border-app-border bg-app-surface p-4">
                    <p className="text-sm font-semibold text-app-text">
                      {viewer?.fullName ?? copy.shell.loadingName}
                    </p>
                    <p className="text-sm text-app-text-muted">
                      {viewer?.email ?? copy.shell.loadingProfile}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      {viewer ? <RoleBadge role={viewer.role} language={language} /> : <span />}
                      <form action={signOutAction}>
                        <button type="submit" className="app-button-secondary px-3 py-2">
                          {copy.shell.signOut}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          </header>

          <main className="app-shell flex-1 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
