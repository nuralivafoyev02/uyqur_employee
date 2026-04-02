"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { CloseIcon, SearchIcon } from "@/components/layout/dashboard-icons";
import { useAppCopy, usePreferences } from "@/components/providers/preferences-provider";
import type { GlobalSearchResult } from "@/lib/queries/global-search";
import type { PlanStatus, ReportStatus, SuggestionStatus } from "@/types/database";
import {
  cx,
  formatDate,
  formatDateTime,
  getPlanStatusLabel,
  getPriorityLabel,
  getReportStatusLabel,
  getRoleLabel,
  getSuggestionStatusLabel,
  truncate,
} from "@/lib/utils";

const SEARCH_KIND_ORDER: Array<GlobalSearchResult["kind"]> = [
  "report",
  "plan",
  "suggestion",
  "employee",
];

type SearchResponse = {
  results: GlobalSearchResult[];
};

export function GlobalSearch() {
  const copy = useAppCopy();
  const { language } = usePreferences();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim());
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable;

      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey && !isTypingTarget) {
        event.preventDefault();
        inputRef.current?.focus();
      }

      if (event.key === "Escape") {
        setIsFocused(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (deferredQuery.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadResults() {
      try {
        setIsLoading(true);

        const response = await fetch(`/api/search?q=${encodeURIComponent(deferredQuery)}`, {
          cache: "no-store",
          credentials: "same-origin",
          signal: controller.signal,
        });

        if (!response.ok) {
          setResults([]);
          return;
        }

        const payload = (await response.json()) as SearchResponse;
        setResults(payload.results ?? []);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadResults();

    return () => {
      controller.abort();
    };
  }, [deferredQuery]);

  const groupedResults = useMemo(
    () =>
      SEARCH_KIND_ORDER.map((kind) => ({
        kind,
        items: results.filter((item) => item.kind === kind),
      })).filter((section) => section.items.length > 0),
    [results],
  );
  const isPanelOpen = isFocused;

  function getSectionLabel(kind: GlobalSearchResult["kind"]) {
    switch (kind) {
      case "report":
        return copy.shell.search.reports;
      case "plan":
        return copy.shell.search.plans;
      case "suggestion":
        return copy.shell.search.suggestions;
      case "employee":
        return copy.shell.search.employees;
      default:
        return kind;
    }
  }

  function renderMeta(result: GlobalSearchResult) {
    const metaItems: string[] = [];

    if (result.kind === "report") {
      if (result.employeeName) {
        metaItems.push(result.employeeName);
      }

      if (result.reportDate) {
        metaItems.push(
          `${copy.shell.search.metaDate}: ${formatDate(result.reportDate, undefined, language)}`,
        );
      }

      if (result.status) {
        metaItems.push(getReportStatusLabel(result.status as ReportStatus, language));
      }
    }

    if (result.kind === "plan") {
      if (result.employeeName) {
        metaItems.push(result.employeeName);
      }

      if (result.dueDate) {
        metaItems.push(
          `${copy.shell.search.metaDeadline}: ${formatDate(result.dueDate, undefined, language)}`,
        );
      }

      if (result.priority) {
        metaItems.push(getPriorityLabel(result.priority, language));
      }

      if (result.status) {
        metaItems.push(getPlanStatusLabel(result.status as PlanStatus, language));
      }
    }

    if (result.kind === "suggestion") {
      if (result.employeeName) {
        metaItems.push(result.employeeName);
      }

      if (result.status) {
        metaItems.push(getSuggestionStatusLabel(result.status as SuggestionStatus, language));
      }
    }

    if (result.kind === "employee") {
      if (result.employeeTitle) {
        metaItems.push(result.employeeTitle);
      }

      if (result.employeeDepartment) {
        metaItems.push(result.employeeDepartment);
      }

      if (result.role) {
        metaItems.push(getRoleLabel(result.role, language));
      }
    }

    metaItems.push(`${copy.shell.search.metaUpdated}: ${formatDateTime(result.updatedAt, language)}`);

    return metaItems.join(" · ");
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-[460px]">
      <div className="flex h-11 items-center gap-2 rounded-full border border-app-border bg-app-bg-elevated px-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition focus-within:border-app-border-strong focus-within:bg-app-surface">
        <SearchIcon className="h-4 w-4 text-app-text-subtle" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsFocused(true)}
          className="h-full min-w-0 flex-1 bg-transparent text-[13px] text-app-text outline-none placeholder:text-app-text-subtle"
          placeholder={copy.shell.search.placeholder}
          aria-label={copy.shell.search.placeholder}
        />
        {query ? (
          <button
            type="button"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-app-text-subtle transition hover:bg-app-surface-muted hover:text-app-text"
            aria-label={copy.shell.search.clear}
            onClick={() => {
              setQuery("");
              setResults([]);
              inputRef.current?.focus();
            }}
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {isPanelOpen ? (
        <div
          data-state={isPanelOpen ? "open" : "closed"}
          className="app-popover-panel absolute inset-x-0 top-[calc(100%+10px)] z-40 rounded-[24px] border border-app-border bg-app-surface p-3 shadow-[0_18px_48px_rgba(16,24,40,0.14)]"
        >
          <div className="max-h-[min(70vh,560px)] overflow-y-auto pr-1">
            {deferredQuery.length < 2 ? (
              <div className="px-2 py-6 text-center text-[13px] text-app-text-muted">
                {copy.shell.search.minQuery}
              </div>
            ) : isLoading ? (
              <div className="px-2 py-6 text-center text-[13px] text-app-text-muted">
                {copy.shell.search.loading}
              </div>
            ) : groupedResults.length === 0 ? (
              <div className="px-2 py-6 text-center text-[13px] text-app-text-muted">
                {copy.shell.search.empty}
              </div>
            ) : (
              <div className="space-y-4">
                {groupedResults.map((section) => (
                  <section key={section.kind} className="space-y-2">
                    <div className="px-2">
                      <p className="app-kicker">{getSectionLabel(section.kind)}</p>
                    </div>

                    <div className="space-y-1.5">
                      {section.items.map((result) => (
                        <Link
                          key={`${result.kind}-${result.id}`}
                          href={result.href}
                          className={cx(
                            "block rounded-[18px] border border-transparent bg-app-bg-elevated px-3 py-3 transition hover:border-app-border hover:bg-app-surface-muted",
                          )}
                          onClick={() => setIsFocused(false)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-[13px] font-semibold text-app-text">
                                {result.title}
                              </p>
                              <p className="mt-1 text-[11px] leading-4 text-app-text-muted">
                                {renderMeta(result)}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-full border border-app-border bg-app-surface px-2 py-1 text-[10px] font-semibold text-app-text-subtle">
                              {copy.shell.search.open}
                            </span>
                          </div>

                          {result.description ? (
                            <p className="mt-2 text-[12px] leading-[1.15rem] text-app-text-muted">
                              {truncate(result.description, 140)}
                            </p>
                          ) : null}
                        </Link>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
