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
        "flex flex-col gap-1.5",
        compact && "gap-2",
        collapsed && "items-center",
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
            title={collapsed ? item.label : undefined}
            className={cx(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              collapsed && "w-12 justify-center px-0",
              active
                ? "bg-app-accent text-white"
                : "text-app-text-muted hover:bg-app-surface-muted hover:text-app-text",
            )}
          >
            <span
              className={cx(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition",
                active
                  ? "bg-white/12 text-white"
                  : "bg-app-bg-elevated text-app-text-subtle group-hover:bg-app-surface group-hover:text-app-text",
                compact && "h-7 w-7 rounded-md",
              )}
            >
              <Icon className={cx("h-[17px] w-[17px]", compact && "h-[15px] w-[15px]")} />
            </span>
            {collapsed ? null : <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
