"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ComponentType } from "react";

import { cx } from "@/lib/utils";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: ComponentType<{
    className?: string;
  }>;
};

type DashboardNavProps = {
  items: DashboardNavItem[];
  compact?: boolean;
  collapsed?: boolean;
};

export function DashboardNav({
  items,
  compact = false,
  collapsed = false,
}: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    items.forEach((item) => {
      router.prefetch(item.href);
    });
  }, [items, router]);

  return (
    <nav
      className={cx(
        "flex w-full flex-col gap-1.5",
        compact && "gap-2",
        collapsed && "items-center gap-2.5",
      )}
    >
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            aria-label={collapsed ? item.label : undefined}
            prefetch
            onMouseEnter={() => {
              router.prefetch(item.href);
            }}
            onFocus={() => {
              router.prefetch(item.href);
            }}
            className={cx(
              "group relative flex items-center text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-border-strong focus-visible:ring-offset-2 focus-visible:ring-offset-app-surface",
              collapsed
                ? "h-14 w-14 justify-center rounded-[1.25rem] text-app-text-muted transition-colors duration-200 hover:text-app-text"
                : "gap-3 rounded-2xl px-3 py-2.5 transition-colors duration-200",
              !collapsed &&
                (active
                  ? "bg-app-accent text-white"
                  : "text-app-text-muted hover:bg-app-surface-muted hover:text-app-text"),
            )}
          >
            <span
              className={cx(
                "flex shrink-0 items-center justify-center transition-colors duration-200",
                collapsed
                  ? active
                    ? "h-12 w-12 rounded-[1.1rem] bg-app-accent text-white"
                    : "h-12 w-12 rounded-[1.1rem] bg-transparent text-app-text-subtle group-hover:bg-app-surface-muted group-hover:text-app-text"
                  : active
                    ? "h-8 w-8 rounded-lg bg-white/12 text-white"
                    : "h-8 w-8 rounded-lg bg-app-bg-elevated text-app-text-subtle group-hover:bg-app-surface group-hover:text-app-text",
                compact && !collapsed && "h-7 w-7 rounded-md",
              )}
            >
              <Icon
                className={cx(
                  collapsed ? "h-[20px] w-[20px]" : "h-[17px] w-[17px]",
                  compact && !collapsed && "h-[15px] w-[15px]",
                )}
              />
            </span>
            {collapsed ? (
              <span className="pointer-events-none absolute left-full top-1/2 z-30 ml-3 hidden -translate-y-1/2 group-hover:block group-focus-visible:block">
                <span className="absolute left-0 top-1/2 h-3.5 w-3.5 -translate-x-[35%] -translate-y-1/2 rotate-45 rounded-[3px] bg-slate-950/92 shadow-[0_10px_26px_rgba(15,23,42,0.28)]" />
                <span
                  role="tooltip"
                  className="relative block whitespace-nowrap rounded-xl bg-slate-950/92 px-3 py-2 text-sm font-medium tracking-tight text-white shadow-[0_14px_32px_rgba(15,23,42,0.34)]"
                >
                  {item.label}
                </span>
              </span>
            ) : (
              <span className="truncate">{item.label}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
