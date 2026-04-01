import Link from "next/link";

import { cx } from "@/lib/utils";

type PaginationProps = {
  pathname: string;
  page: number;
  pageCount: number;
  query: Record<string, string>;
};

function buildHref(pathname: string, page: number, query: Record<string, string>) {
  const params = new URLSearchParams(query);

  if (page > 1) {
    params.set("page", String(page));
  } else {
    params.delete("page");
  }

  const serialized = params.toString();
  return serialized ? `${pathname}?${serialized}` : pathname;
}

export function Pagination({
  pathname,
  page,
  pageCount,
  query,
}: PaginationProps) {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between border-t border-app-border pt-4">
      <p className="text-sm text-app-text-muted">
        Sahifa {page} / {pageCount}
      </p>
      <div className="flex items-center gap-2">
        <Link
          href={buildHref(pathname, Math.max(1, page - 1), query)}
          className={cx(
            "app-button-secondary px-3 py-2",
            page <= 1 && "pointer-events-none opacity-50",
          )}
        >
          Oldingi
        </Link>
        <Link
          href={buildHref(pathname, Math.min(pageCount, page + 1), query)}
          className={cx(
            "app-button-secondary px-3 py-2",
            page >= pageCount && "pointer-events-none opacity-50",
          )}
        >
          Keyingi
        </Link>
      </div>
    </div>
  );
}
