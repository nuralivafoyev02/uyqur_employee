"use client";

import type { PropsWithChildren } from "react";

import { cx } from "@/lib/utils";

type IconProps = {
  className?: string;
};

function IconBase({
  className,
  children,
}: PropsWithChildren<IconProps>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cx("h-5 w-5 shrink-0", className)}
    >
      {children}
    </svg>
  );
}

export function DashboardIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="2" />
      <rect x="13" y="3.5" width="7.5" height="5.5" rx="2" />
      <rect x="13" y="11" width="7.5" height="9.5" rx="2" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="2" />
    </IconBase>
  );
}

export function ReportsIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M8 3.75h6.5L19.5 8.75V18a2.25 2.25 0 0 1-2.25 2.25H8A2.25 2.25 0 0 1 5.75 18V6A2.25 2.25 0 0 1 8 3.75Z" />
      <path d="M14.5 3.75v4.5h4.5" />
      <path d="M9 11h6" />
      <path d="M9 14.5h6" />
      <path d="M9 18h4" />
    </IconBase>
  );
}

export function PlansIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <rect x="4.75" y="3.75" width="14.5" height="16.5" rx="2.5" />
      <path d="M8 3.75v3.5" />
      <path d="M16 3.75v3.5" />
      <path d="M4.75 8.5h14.5" />
      <path d="m8.1 13.15 1.25 1.25 2.25-2.6" />
      <path d="M13.2 13.5h3.2" />
      <path d="m8.1 17.1 1.25 1.25 2.25-2.6" />
      <path d="M13.2 17.45h3.2" />
    </IconBase>
  );
}

export function EmployeesIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M9 11a3.25 3.25 0 1 0 0-6.5A3.25 3.25 0 0 0 9 11Z" />
      <path d="M16.5 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path d="M3.75 18.75a5.25 5.25 0 0 1 10.5 0" />
      <path d="M14 18.75a4.25 4.25 0 0 1 6.25-3.75" />
    </IconBase>
  );
}

export function SuggestionsIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M12 3.75a4.75 4.75 0 0 1 2.85 8.55c-.8.6-1.35 1.1-1.6 1.95h-2.5c-.25-.85-.8-1.35-1.6-1.95A4.75 4.75 0 0 1 12 3.75Z" />
      <path d="M10 18.25h4" />
      <path d="M10.75 20.25h2.5" />
    </IconBase>
  );
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M5 6.5h9" />
      <path d="M17 6.5h2" />
      <path d="M10.5 6.5a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Z" />
      <path d="M5 12h2" />
      <path d="M10 12h9" />
      <path d="M8.5 12a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Z" />
      <path d="M5 17.5h9" />
      <path d="M17 17.5h2" />
      <path d="M15.5 17.5a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Z" />
    </IconBase>
  );
}

export function UserIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M12 12a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" />
      <path d="M5 19a7 7 0 0 1 14 0" />
    </IconBase>
  );
}

export function AccountIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <rect x="3.75" y="5.25" width="16.5" height="13.5" rx="2.5" />
      <path d="m5.75 8 6.25 4.75L18.25 8" />
    </IconBase>
  );
}

export function InterfaceIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <rect x="3.75" y="4.5" width="16.5" height="11.5" rx="2.25" />
      <path d="M9 19.5h6" />
      <path d="M12 16v3.5" />
      <path d="M7.75 8.75h8.5" />
      <path d="M7.75 11.75h4.5" />
    </IconBase>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </IconBase>
  );
}

export function SidebarCollapseIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="m14.5 6.75-5.25 5.25 5.25 5.25" />
    </IconBase>
  );
}

export function SidebarExpandIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="m9.5 6.75 5.25 5.25-5.25 5.25" />
    </IconBase>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="m6.75 9.5 5.25 5.25 5.25-5.25" />
    </IconBase>
  );
}

export function BreadcrumbChevronIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="m10 7.5 4 4.5-4 4.5" />
    </IconBase>
  );
}

export function SignOutIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M9 7H6.75A1.75 1.75 0 0 0 5 8.75v6.5A1.75 1.75 0 0 0 6.75 17H9" />
      <path d="M13 8.5 17 12l-4 3.5" />
      <path d="M10 12h7" />
    </IconBase>
  );
}

export function StatusIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 3.75v2.5" />
      <path d="M12 17.75v2.5" />
      <path d="M20.25 12h-2.5" />
      <path d="M6.25 12h-2.5" />
    </IconBase>
  );
}

export function FilterIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M4.75 6.25h14.5" />
      <path d="M7.75 11.75h8.5" />
      <path d="M10.5 17.25h3" />
    </IconBase>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <circle cx="11" cy="11" r="5.75" />
      <path d="m19 19-3.5-3.5" />
    </IconBase>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </IconBase>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M5 12h14" />
      <path d="m13.5 6.5 5.5 5.5-5.5 5.5" />
    </IconBase>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <rect x="4.5" y="5.5" width="15" height="14" rx="2.5" />
      <path d="M8 3.75v3.5" />
      <path d="M16 3.75v3.5" />
      <path d="M4.5 9.25h15" />
    </IconBase>
  );
}

export function AlertTriangleIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M10.95 4.45a1.2 1.2 0 0 1 2.1 0l7.1 12.4a1.2 1.2 0 0 1-1.05 1.8H4.9a1.2 1.2 0 0 1-1.05-1.8Z" />
      <path d="M12 9v4.5" />
      <path d="M12 17h.01" />
    </IconBase>
  );
}
