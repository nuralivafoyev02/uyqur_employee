"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";

import { useAppCopy, usePreferences } from "@/components/providers/preferences-provider";
import {
  CloseIcon,
  DashboardIcon,
  EmployeesIcon,
  PlansIcon,
  ReportsIcon,
  SidebarCollapseIcon,
  SidebarExpandIcon,
  SettingsIcon,
  UserIcon,
} from "@/components/layout/dashboard-icons";
import { DashboardNav, type DashboardNavItem } from "@/components/layout/dashboard-nav";
import { RoleBadge } from "@/components/ui/badges";
import { signOutAction } from "@/lib/actions/auth";
import type { AppCopy } from "@/lib/copy";
import type { AppLanguage } from "@/lib/preferences";
import { cx, getInitials } from "@/lib/utils";

type ViewerSummary = {
  fullName: string;
  email: string;
  role: "admin" | "manager" | "employee";
};

type SignOutButtonProps = {
  label: string;
  confirmTitle: string;
  confirmDescription: string;
  confirmActionLabel: string;
  cancelLabel: string;
  className: string;
};

function buildPrimaryItems(
  role: ViewerSummary["role"] | null,
  navCopy: AppCopy["shell"]["nav"],
): DashboardNavItem[] {
  const baseItems: DashboardNavItem[] = [
    { href: "/dashboard", label: navCopy.dashboard, icon: DashboardIcon },
    { href: "/reports", label: navCopy.reports, icon: ReportsIcon },
    { href: "/plans", label: navCopy.plans, icon: PlansIcon },
  ];

  if (role === "admin" || role === "manager") {
    return [...baseItems, { href: "/employees", label: navCopy.employees, icon: EmployeesIcon }];
  }

  return baseItems;
}

function buildSettingsItem(navCopy: AppCopy["shell"]["nav"]): DashboardNavItem {
  return {
    href: "/settings",
    label: navCopy.settings,
    icon: SettingsIcon,
  };
}

function SignOutButton({
  label,
  confirmTitle,
  confirmDescription,
  confirmActionLabel,
  cancelLabel,
  className,
}: SignOutButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function handleConfirm() {
    setIsOpen(false);
    formRef.current?.requestSubmit();
  }

  return (
    <>
      <form ref={formRef} action={signOutAction}>
        <button type="button" className={className} onClick={() => setIsOpen(true)}>
          {label}
        </button>
      </form>

      {isOpen
        ? createPortal(
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-[2px]"
            onClick={() => setIsOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
              className="app-panel w-full max-w-md p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="space-y-2">
                <p id={titleId} className="text-lg font-semibold tracking-tight text-app-text">
                  {confirmTitle}
                </p>
                <p id={descriptionId} className="text-sm leading-6 text-app-text-muted">
                  {confirmDescription}
                </p>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  className="app-button-secondary justify-center"
                  onClick={() => setIsOpen(false)}
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  className="app-button justify-center exit-btn"
                  onClick={handleConfirm}
                >
                  {confirmActionLabel}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
        : null}
    </>
  );
}

function ProfileButton({
  viewer,
  copy,
  language,
}: {
  viewer: ViewerSummary | null;
  copy: AppCopy;
  language: AppLanguage;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();
  const descriptionId = useId();
  const initials = viewer?.fullName ? getInitials(viewer.fullName) : null;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-label={copy.shell.openProfile}
        className="app-icon-button h-11 w-11"
        onClick={() => setIsOpen(true)}
      >
        <UserIcon className="h-5 w-5" />
      </button>

      {isOpen
        ? createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-[2px] sm:items-center"
            onClick={() => setIsOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
              className="app-panel w-full max-w-md p-5 sm:p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-app-accent-muted text-sm font-semibold text-app-accent">
                    {initials ? initials : <UserIcon className="h-5 w-5" />}
                  </div>
                  <div>
                    <p id={titleId} className="text-lg font-semibold tracking-tight text-app-text">
                      {copy.shell.profileTitle}
                    </p>
                    <p id={descriptionId} className="text-sm text-app-text-muted">
                      {copy.shell.profileDescription}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label={copy.shell.closeProfile}
                  className="app-icon-button h-10 w-10"
                  onClick={() => setIsOpen(false)}
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 rounded-2xl border border-app-border bg-app-bg-elevated p-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-app-text">
                    {viewer?.fullName ?? copy.shell.loadingName}
                  </p>
                  <p className="text-sm text-app-text-muted">
                    {viewer?.email ?? copy.shell.loadingProfile}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {viewer ? <RoleBadge role={viewer.role} language={language} /> : null}
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/settings"
                  className="app-button-secondary flex-1 justify-center"
                  onClick={() => setIsOpen(false)}
                >
                  {copy.shell.nav.settings}
                </Link>
                <SignOutButton
                  label={copy.shell.signOut}
                  confirmTitle={copy.shell.signOutConfirmTitle}
                  confirmDescription={copy.shell.signOutConfirmDescription}
                  confirmActionLabel={copy.shell.signOutConfirmAction}
                  cancelLabel={copy.common.cancel}
                  className="exit-btn app-button flex-1 justify-center"
                />
              </div>
            </div>
          </div>,
          document.body,
        )
        : null}
    </>
  );
}

export function DashboardShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { language } = usePreferences();
  const copy = useAppCopy();
  const [viewer, setViewer] = useState<ViewerSummary | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const primaryItems = buildPrimaryItems(viewer?.role ?? null, copy.shell.nav);
  const settingsItem = buildSettingsItem(copy.shell.nav);
  const mobileItems = [...primaryItems, settingsItem];
  const desktopLayoutStyle = {
    "--sidebar-width": isSidebarExpanded ? "260px" : "104px",
  } as CSSProperties;

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
    <div className="h-screen overflow-hidden">
      <div
        className="mx-auto grid h-screen w-full transition-[grid-template-columns] duration-300 ease-out lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)]"
        style={desktopLayoutStyle}
      >
        <aside
          className="hidden h-screen border-r border-app-border bg-app-surface px-4 py-6 backdrop-blur lg:flex lg:flex-col"
        >
          <Link
            href="/dashboard"
            aria-label="Uyqur Support"
            className={cx(
              "flex min-h-11 items-center text-sm font-bold text-app-text",
              isSidebarExpanded ? "justify-start gap-3 px-2" : "justify-center px-0",
            )}
          >
            <Image
              src="/uyqur-logo.jpg"
              alt="Logo"
              width={35}
              height={35}
              className="rounded-[2px]"
            />
            {isSidebarExpanded ? <span>Uyqur Support</span> : null}
          </Link>

          <div className="mt-8 flex-1">
            <DashboardNav items={primaryItems} collapsed={!isSidebarExpanded} />
          </div>

          <div className="mt-auto space-y-3 pt-6">
            <button
              type="button"
              aria-label={
                isSidebarExpanded ? copy.shell.collapseSidebar : copy.shell.expandSidebar
              }
              title={isSidebarExpanded ? copy.shell.collapseSidebar : copy.shell.expandSidebar}
              className={cx(
                "hidden h-12 w-full items-center rounded-2xl text-sm font-semibold text-app-text-muted transition-colors duration-200 hover:bg-app-surface-muted hover:text-app-text lg:inline-flex",
                isSidebarExpanded
                  ? "justify-start gap-2 px-3"
                  : "justify-center px-0",
              )}
              onClick={() => setIsSidebarExpanded((current) => !current)}
            >
              {isSidebarExpanded ? (
                <>
                  <SidebarCollapseIcon className="h-4 w-4" />
                  <span>{copy.shell.collapseSidebarShort}</span>
                </>
              ) : (
                <SidebarExpandIcon className="h-4 w-4" />
              )}
            </button>

            <div className="border-t border-app-border pt-4">
              <DashboardNav items={[settingsItem]} collapsed={!isSidebarExpanded} />
            </div>
          </div>
        </aside>

        <div className="flex h-screen min-h-0 flex-col overflow-hidden w-full">
          <header className="border-b border-app-border bg-app-surface backdrop-blur">
            <div className="app-shell flex flex-col gap-4 py-1 md:flex-row md:items-center md:justify-between">
              <div>
                <Link
                  href="/dashboard"
                  className="text-sm font-semibold tracking-[0.18em] text-app-text lg:hidden"
                >
                  Uyqur Support
                </Link>
                <p className="mt-1 text-sm text-app-text-muted">{copy.shell.subtitle}</p>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto">
                <details className="rounded-2xl border border-app-border bg-app-bg-elevated px-4 py-3 lg:hidden">
                  <summary className="cursor-pointer text-sm font-medium text-app-text">
                    {copy.shell.menuAndProfile}
                  </summary>
                  <div className="mt-4 space-y-4">
                    <DashboardNav items={mobileItems} compact />
                  </div>
                </details>

                <ProfileButton viewer={viewer} copy={copy} language={language} />
              </div>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="app-shell min-h-full py-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
