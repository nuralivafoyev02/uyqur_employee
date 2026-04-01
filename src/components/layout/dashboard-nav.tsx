"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { cx } from "@/lib/utils";

export type DashboardNavItem = {
  href: string;
  label: string;
};

type DashboardNavProps = {
  items: DashboardNavItem[];
  compact?: boolean;
};

export function DashboardNav({ items, compact = false }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    items.forEach((item) => {
      router.prefetch(item.href);
    });
  }, [items, router]);

  return (
    <nav className={cx("flex flex-col gap-1.5", compact && "gap-2")}>
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch
            onMouseEnter={() => {
              router.prefetch(item.href);
            }}
            onFocus={() => {
              router.prefetch(item.href);
            }}
            className={cx(
              "rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active
                ? "bg-app-accent text-white"
                : "text-app-text-muted hover:bg-app-surface-muted hover:text-app-text",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
