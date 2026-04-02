"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useTransition,
  type CSSProperties,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";

import { useAppCopy, usePreferences } from "@/components/providers/preferences-provider";
import {
  BreadcrumbChevronIcon,
  DashboardIcon,
  EmployeesIcon,
  PlansIcon,
  ReportsIcon,
  SuggestionsIcon,
  SignOutIcon,
  SidebarCollapseIcon,
  SidebarExpandIcon,
  StatusIcon,
  SettingsIcon,
  UserIcon,
} from "@/components/layout/dashboard-icons";
import { DashboardNav, type DashboardNavItem } from "@/components/layout/dashboard-nav";
import { signOutAction } from "@/lib/actions/auth";
import { updateProfileStatusAction } from "@/lib/actions/profile";
import { type AppCopy, translateProfileMessage } from "@/lib/copy";
import { getDashboardCopy } from "@/lib/dashboard-copy";
import { getEmployeesCopy } from "@/lib/employees-copy";
import type { AppLanguage } from "@/lib/preferences";
import { getPlansCopy } from "@/lib/plans-copy";
import { getReportsCopy } from "@/lib/reports-copy";
import { getSuggestionsCopy } from "@/lib/suggestions-copy";
import { ProfileStatusBadge } from "@/components/ui/badges";
import { ActionStateToast } from "@/components/ui/toast-effect";
import { useAnimatedPresence } from "@/components/ui/use-animated-presence";
import { cx, getInitials, getRoleLabel } from "@/lib/utils";
import type { ActionState } from "@/lib/validations";
import type { ComponentType } from "react";

type ViewerSummary = {
  fullName: string;
  email: string;
  role: "admin" | "manager" | "employee";
  title: string | null;
  department: string | null;
  profileStatus: string | null;
};

type SignOutButtonProps = {
  label: string;
  icon?: React.ReactNode;
  confirmTitle: string;
  confirmDescription: string;
  confirmActionLabel: string;
  cancelLabel: string;
  className: string;
  onTrigger?: () => void;
};

type HeaderMeta = {
  title: string;
  segments: string[];
  icon: ComponentType<{ className?: string }>;
};

function buildPrimaryItems(
  role: ViewerSummary["role"] | null,
  navCopy: AppCopy["shell"]["nav"],
): DashboardNavItem[] {
  const baseItems: DashboardNavItem[] = [
    { href: "/dashboard", label: navCopy.dashboard, icon: DashboardIcon },
    { href: "/reports", label: navCopy.reports, icon: ReportsIcon },
    { href: "/plans", label: navCopy.plans, icon: PlansIcon },
    { href: "/suggestions", label: navCopy.suggestions, icon: SuggestionsIcon },
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

function buildHeaderMeta({
  pathname,
  language,
  viewer,
  copy,
}: {
  pathname: string;
  language: AppLanguage;
  viewer: ViewerSummary | null;
  copy: AppCopy;
}): HeaderMeta {
  const dashboardCopy = getDashboardCopy(language);
  const reportsCopy = getReportsCopy(language);
  const plansCopy = getPlansCopy(language);
  const employeesCopy = getEmployeesCopy(language);
  const suggestionsCopy = getSuggestionsCopy(language);
  const normalizedPath = pathname === "/" ? "/dashboard" : pathname;

  if (normalizedPath.startsWith("/employees/")) {
    return {
      title: employeesCopy.profile.headerEyebrow,
      segments: [copy.shell.nav.employees],
      icon: EmployeesIcon,
    };
  }

  if (normalizedPath.startsWith("/employees")) {
    return {
      title: employeesCopy.list.header.title,
      segments: [copy.shell.nav.employees],
      icon: EmployeesIcon,
    };
  }

  if (normalizedPath.startsWith("/reports")) {
    return {
      title: reportsCopy.header.title,
      segments: [copy.shell.nav.reports],
      icon: ReportsIcon,
    };
  }

  if (normalizedPath.startsWith("/plans")) {
    return {
      title: plansCopy.header.title,
      segments: [copy.shell.nav.plans],
      icon: PlansIcon,
    };
  }

  if (normalizedPath.startsWith("/suggestions")) {
    return {
      title: suggestionsCopy.header.title,
      segments: [copy.shell.nav.suggestions],
      icon: SuggestionsIcon,
    };
  }

  if (normalizedPath.startsWith("/settings")) {
    return {
      title: copy.settings.title,
      segments: [copy.shell.nav.settings],
      icon: SettingsIcon,
    };
  }

  const firstName = viewer?.fullName.trim().split(/\s+/)[0];

  return {
    title:
      viewer?.role === "employee" && firstName
        ? dashboardCopy.header.employeeTitle(firstName)
        : dashboardCopy.header.leadTitle,
    segments: [copy.shell.nav.dashboard],
    icon: DashboardIcon,
  };
}

function SignOutButton({
  label,
  icon,
  confirmTitle,
  confirmDescription,
  confirmActionLabel,
  cancelLabel,
  className,
  onTrigger,
}: SignOutButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const { isMounted, dataState } = useAnimatedPresence(isOpen);

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
        <button
          type="button"
          className={className}
          onClick={() => {
            onTrigger?.();
            setIsOpen(true);
          }}
        >
          {icon}
          <span>{label}</span>
        </button>
      </form>

      {isMounted
        ? createPortal(
          <div
            data-state={dataState}
            className="app-overlay fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-[2px]"
            onClick={() => setIsOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
              data-state={dataState}
              className="app-dialog-panel app-panel w-full max-w-md p-6"
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
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isStatusEditorOpen, setIsStatusEditorOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [statusState, setStatusState] = useState<ActionState<"profileStatus"> | undefined>();
  const [statusDraft, setStatusDraft] = useState("");
  const [statusOverride, setStatusOverride] = useState<string | null>(null);
  const [isSavingStatus, startSavingStatus] = useTransition();
  const initials = viewer?.fullName ? getInitials(viewer.fullName) : null;
  const profileMeta = [viewer?.department, viewer?.title].filter(Boolean).join(" · ");
  const profileSubtitle =
    profileMeta || (viewer ? getRoleLabel(viewer.role, language) : copy.shell.loadingProfile);
  const currentStatus = statusOverride ?? viewer?.profileStatus ?? "";
  const translatedStatusMessage = statusState?.message
    ? translateProfileMessage(statusState.message, language)
    : undefined;

  function closePopover() {
    setIsStatusEditorOpen(false);
    setIsOpen(false);
  }

  function toggleStatusEditor() {
    setStatusState(undefined);
    setStatusDraft(currentStatus);
    setIsStatusEditorOpen((current) => !current);
  }

  function handleStatusCancel() {
    setStatusDraft(currentStatus);
    setStatusState(undefined);
    setIsStatusEditorOpen(false);
  }

  function handleStatusSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const nextStatus = typeof formData.get("profileStatus") === "string"
      ? formData.get("profileStatus")!.toString().trim()
      : "";

    startSavingStatus(async () => {
      const result = await updateProfileStatusAction(undefined, formData);
      setStatusState(result);

      if (!result.success) {
        return;
      }

      setStatusOverride(nextStatus);
      setStatusDraft(nextStatus);
      setIsStatusEditorOpen(false);
      router.refresh();
    });
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePopover();
      }
    };

    const handlePointerDown = (event: MouseEvent | PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        closePopover();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  return (
    <div ref={wrapperRef} className="relative">
      <ActionStateToast state={statusState} message={translatedStatusMessage} />
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={copy.shell.openProfile}
        className="app-icon-button h-11 w-11"
        onClick={() => {
          if (isOpen) {
            closePopover();
            return;
          }

          setIsOpen(true);
        }}
      >
        <UserIcon className="h-5 w-5" />
      </button>

      <div
        role="dialog"
        aria-modal="false"
        aria-hidden={!isOpen}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        data-state={isOpen ? "open" : "closed"}
        className="app-popover-panel absolute right-0 top-full z-50 mt-3 w-[min(21rem,calc(100vw-1.5rem))]"
      >
        <div className="app-panel relative overflow-hidden p-3.5 sm:p-4">
            <div className="absolute right-5 top-0 h-3 w-3 -translate-y-1/2 rotate-45 border-l border-t border-app-border bg-app-surface" />

            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-app-accent text-sm font-semibold text-white">
                  {initials ? initials : <UserIcon className="h-5 w-5" />}
                </div>
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-app-surface bg-emerald-500" />
              </div>
              <div className="min-w-0">
                <div>
                  <p
                    id={titleId}
                    className="truncate text-[18px] font-semibold leading-tight tracking-tight text-app-text"
                  >
                    {viewer?.fullName ?? copy.shell.loadingName}
                  </p>
                  <p
                    id={descriptionId}
                    className="mt-1 truncate text-sm leading-5 text-app-text-muted"
                  >
                    {profileSubtitle}
                  </p>
                </div>
                <div className="mt-2">
                  <ProfileStatusBadge
                    status={currentStatus || copy.shell.noStatus}
                    className="max-w-48 truncate"
                  />
                </div>
              </div>
            </div>

            <div className="my-3 border-t border-app-border" />

            <div className="space-y-1">
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-[15px] font-medium text-app-text transition hover:bg-app-surface-muted"
                onClick={toggleStatusEditor}
              >
                <StatusIcon className="h-[18px] w-[18px] text-app-text-subtle" />
                <span>{copy.shell.addStatus}</span>
              </button>
              <Link
                href="/settings?section=profile"
                className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-[15px] font-medium text-app-text transition hover:bg-app-surface-muted"
                onClick={closePopover}
              >
                <SettingsIcon className="h-[18px] w-[18px] text-app-text-subtle" />
                <span>{copy.shell.profileSettings}</span>
              </Link>
            </div>

            {isStatusEditorOpen ? (
              <div className="mt-3 rounded-2xl border border-app-border bg-app-bg-elevated p-3">
                <form className="space-y-3" onSubmit={handleStatusSubmit}>
                  <div className="space-y-2">
                    <label
                      className="block text-sm font-medium text-app-text"
                      htmlFor="profileStatus"
                    >
                      {copy.shell.statusLabel}
                    </label>
                    <input
                      id="profileStatus"
                      name="profileStatus"
                      className="app-field h-11 text-sm"
                      value={statusDraft}
                      placeholder={copy.shell.statusPlaceholder}
                      maxLength={60}
                      onChange={(event) => setStatusDraft(event.target.value)}
                    />
                    {statusState?.fieldErrors?.profileStatus ? (
                      <p className="text-sm text-rose-700">
                        {translateProfileMessage(statusState.fieldErrors.profileStatus[0], language)}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      className="app-button-secondary px-3 py-2 text-sm"
                      onClick={handleStatusCancel}
                    >
                      {copy.common.cancel}
                    </button>
                    <button
                      type="submit"
                      className="app-button px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isSavingStatus}
                    >
                      {isSavingStatus ? copy.shell.statusPending : copy.shell.statusSubmit}
                    </button>
                  </div>
                </form>
              </div>
            ) : null}

            <div className="my-3 border-t border-app-border" />

            <SignOutButton
              label={copy.shell.signOut}
              icon={<SignOutIcon className="h-[18px] w-[18px]" />}
              confirmTitle={copy.shell.signOutConfirmTitle}
              confirmDescription={copy.shell.signOutConfirmDescription}
              confirmActionLabel={copy.shell.signOutConfirmAction}
              cancelLabel={copy.common.cancel}
              onTrigger={() => setIsOpen(false)}
              className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-[15px] font-medium text-rose-600 transition hover:bg-rose-50"
            />
          </div>
      </div>
    </div>
  );
}

export function DashboardShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { language } = usePreferences();
  const pathname = usePathname();
  const copy = useAppCopy();
  const [viewer, setViewer] = useState<ViewerSummary | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const primaryItems = buildPrimaryItems(viewer?.role ?? null, copy.shell.nav);
  const settingsItem = buildSettingsItem(copy.shell.nav);
  const mobileItems = [...primaryItems, settingsItem];
  const headerMeta = useMemo(
    () => buildHeaderMeta({ pathname, language, viewer, copy }),
    [pathname, language, viewer, copy],
  );
  const HeaderIcon = headerMeta.icon;
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
              <div className="min-w-0">
                <Link
                  href="/dashboard"
                  className="text-sm font-semibold tracking-[0.18em] text-app-text lg:hidden"
                >
                  Uyqur Support
                </Link>
                <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2 text-sm text-app-text-muted">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-app-bg-elevated text-app-text-subtle">
                    <HeaderIcon className="h-4 w-4" />
                  </span>
                  <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                    {headerMeta.segments.map((segment, index) => (
                      <div
                        key={`${segment}-${index}`}
                        className="flex min-w-0 items-center gap-1.5"
                      >
                        <BreadcrumbChevronIcon className="h-3.5 w-3.5 shrink-0 text-app-text-subtle" />
                        <span
                          className="truncate font-medium text-app-text-muted"
                        >
                          {segment}
                        </span>
                      </div>
                    ))}
                    <div className="flex min-w-0 items-center gap-1.5">
                      <BreadcrumbChevronIcon className="h-3.5 w-3.5 shrink-0 text-app-text-subtle" />
                      <span className="min-w-0 max-w-full truncate rounded-2xl bg-app-bg-elevated px-3 py-1.5 text-sm font-semibold tracking-tight text-app-text">
                        {headerMeta.title}
                      </span>
                    </div>
                  </div>
                </div>
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
