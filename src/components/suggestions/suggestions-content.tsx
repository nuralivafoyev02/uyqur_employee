"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { ChevronDownIcon } from "@/components/layout/dashboard-icons";
import { usePreferences } from "@/components/providers/preferences-provider";
import {
  SuggestionDetailModal,
  type SuggestionDetailItem,
} from "@/components/suggestions/suggestion-detail-modal";
import { SuggestionForm } from "@/components/suggestions/suggestion-form";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterModal } from "@/components/ui/filter-modal";
import { Pagination } from "@/components/ui/pagination";
import { PageHeader } from "@/components/ui/page-header";
import { SuggestionStatusBadge } from "@/components/ui/badges";
import { getSuggestionsCopy } from "@/lib/suggestions-copy";
import { cx, formatDateTime, getSuggestionStatusLabel, truncate } from "@/lib/utils";
import type { SuggestionsPageData } from "@/lib/queries/suggestions";
import type { ActionState } from "@/lib/validations";
import type { SuggestionStatus } from "@/types/database";

type SuggestionField = "title" | "description";

type SaveSuggestionAction = (
  state: ActionState<SuggestionField> | undefined,
  formData: FormData,
) => Promise<ActionState<SuggestionField>>;

type UpdateSuggestionStatusAction = (formData: FormData) => Promise<void>;

type SuggestionsContentProps = {
  data: SuggestionsPageData;
  saveAction: SaveSuggestionAction;
  updateStatusAction: UpdateSuggestionStatusAction;
};

const STATUSES: SuggestionStatus[] = ["new", "accepted", "prepared", "canceled"];
const ACTIVE_STATUSES: SuggestionStatus[] = ["new", "accepted"];

export function SuggestionsContent({
  data,
  saveAction,
  updateStatusAction,
}: SuggestionsContentProps) {
  const { language } = usePreferences();
  const copy = getSuggestionsCopy(language);
  const [isArchiveOpen, setIsArchiveOpen] = useState(
    data.filters.status === "prepared" || data.filters.status === "canceled",
  );
  const [isCompactView, setIsCompactView] = useState(true);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<SuggestionDetailItem | null>(null);
  const detailCloseTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (detailCloseTimeoutRef.current !== null) {
        window.clearTimeout(detailCloseTimeoutRef.current);
      }
    };
  }, []);

  const activeFilterCount =
    Number(Boolean(data.filters.q)) +
    Number(Boolean(data.filters.status)) +
    Number(Boolean(data.isLeadView && data.filters.employeeId));
  const isArchiveVisible =
    isArchiveOpen || data.filters.status === "prepared" || data.filters.status === "canceled";
  const activeSuggestions = useMemo(
    () => data.suggestions.filter((suggestion) => ACTIVE_STATUSES.includes(suggestion.status)),
    [data.suggestions],
  );
  const archivedSuggestions = useMemo(
    () => data.suggestions.filter((suggestion) => !ACTIVE_STATUSES.includes(suggestion.status)),
    [data.suggestions],
  );
  const paginationQuery = useMemo(
    () => ({
      ...(data.filters.q ? { q: data.filters.q } : {}),
      ...(data.filters.status ? { status: data.filters.status } : {}),
      ...(data.filters.employeeId ? { employeeId: data.filters.employeeId } : {}),
    }),
    [data.filters.employeeId, data.filters.q, data.filters.status],
  );

  function openSuggestionDetail(suggestion: SuggestionsPageData["suggestions"][number]) {
    if (detailCloseTimeoutRef.current !== null) {
      window.clearTimeout(detailCloseTimeoutRef.current);
      detailCloseTimeoutRef.current = null;
    }

    setSelectedSuggestion({
      id: suggestion.id,
      title: suggestion.title,
      description: suggestion.description,
      status: suggestion.status,
      createdAt: suggestion.createdAt,
      updatedAt: suggestion.updatedAt,
      employeeName: suggestion.employee?.full_name,
      employeeTitle: suggestion.employee?.title,
      employeeDepartment: suggestion.employee?.department,
    });
    setIsDetailOpen(true);
  }

  function closeSuggestionDetail() {
    setIsDetailOpen(false);

    if (detailCloseTimeoutRef.current !== null) {
      window.clearTimeout(detailCloseTimeoutRef.current);
    }

    detailCloseTimeoutRef.current = window.setTimeout(() => {
      setSelectedSuggestion(null);
      detailCloseTimeoutRef.current = null;
    }, 240);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={copy.header.eyebrow}
        title={copy.header.title}
        description={copy.header.description}
        actions={
          <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
            <FilterModal
              triggerLabel={copy.filters.open}
              title={copy.filters.title}
              closeLabel={copy.filters.close}
              activeCount={activeFilterCount}
            >
              <form className="grid gap-4">
                <div className="space-y-1.5">
                  <label
                    className="block text-xs font-semibold uppercase tracking-[0.12em] text-app-text-subtle"
                    htmlFor="suggestionFilterSearch"
                  >
                    {copy.filters.search}
                  </label>
                  <input
                    id="suggestionFilterSearch"
                    name="q"
                    className="app-field"
                    defaultValue={data.filters.q}
                    placeholder={copy.create.titlePlaceholder}
                  />
                </div>

                {data.isLeadView ? (
                  <div className="space-y-1.5">
                    <label
                      className="block text-xs font-semibold uppercase tracking-[0.12em] text-app-text-subtle"
                      htmlFor="suggestionFilterEmployee"
                    >
                      {copy.filters.employee}
                    </label>
                    <select
                      id="suggestionFilterEmployee"
                      name="employeeId"
                      className="app-field"
                      defaultValue={data.filters.employeeId}
                    >
                      <option value="">{copy.filters.all}</option>
                      {data.employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}

                <div className="space-y-1.5">
                  <label
                    className="block text-xs font-semibold uppercase tracking-[0.12em] text-app-text-subtle"
                    htmlFor="suggestionFilterStatus"
                  >
                    {copy.filters.status}
                  </label>
                  <select
                    id="suggestionFilterStatus"
                    name="status"
                    className="app-field"
                    defaultValue={data.filters.status}
                  >
                    <option value="">{copy.filters.all}</option>
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {getSuggestionStatusLabel(status, language)}
                      </option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="app-button w-full">
                  {copy.filters.submit}
                </button>
              </form>
            </FilterModal>

            <button
              type="button"
              className="app-button-secondary px-3 py-1.5 text-xs"
              onClick={() => setIsCompactView((current) => !current)}
            >
              {isCompactView ? copy.header.expanded : copy.header.compact}
            </button>
          </div>
        }
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <div className="app-panel p-4">
          <p className="text-[12px] font-medium text-app-text-muted">{copy.stats.total}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-app-text">
            {data.stats.total}
          </p>
        </div>
        <div className="app-panel p-4">
          <p className="text-[12px] font-medium text-app-text-muted">{copy.stats.fresh}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-app-text">
            {data.stats.fresh}
          </p>
        </div>
        <div className="app-panel p-4">
          <p className="text-[12px] font-medium text-app-text-muted">{copy.stats.accepted}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-app-text">
            {data.stats.accepted}
          </p>
        </div>
        <div className="app-panel p-4">
          <p className="text-[12px] font-medium text-app-text-muted">{copy.stats.prepared}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-app-text">
            {data.stats.prepared}
          </p>
        </div>
        <div className="app-panel p-4">
          <p className="text-[12px] font-medium text-app-text-muted">{copy.stats.canceled}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-app-text">
            {data.stats.canceled}
          </p>
        </div>
      </div>

      <section className="app-panel p-4 md:p-5">
        <div className="flex flex-col gap-4 border-b border-app-border pb-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1.5">
            <p className="app-kicker">{copy.create.eyebrow}</p>
            <h2 className="text-lg font-semibold tracking-tight text-app-text">
              {copy.create.title}
            </h2>
            <p className="max-w-2xl text-[13px] leading-5 text-app-text-muted">
              {copy.create.description}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <SuggestionForm action={saveAction} />
        </div>
      </section>

      <section className="app-panel p-4 md:p-5">
        <div className="flex flex-col gap-3 border-b border-app-border pb-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1.5">
            <p className="app-kicker">{copy.list.eyebrow}</p>
            <h2 className="text-lg font-semibold tracking-tight text-app-text">
              {copy.list.title}
            </h2>
            <p className="max-w-2xl text-[13px] leading-5 text-app-text-muted">
              {copy.list.description}
            </p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-[13px] text-app-text-muted">
              {copy.pagination.summary(data.filters.page, data.pageCount)}
            </p>
            <p className="text-[12px] text-app-text-subtle">
              {isCompactView ? copy.list.compactHint : copy.list.fullHint}
            </p>
          </div>
        </div>

        {data.suggestions.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              title={copy.list.noSuggestionsTitle}
              description={copy.list.noSuggestionsDescription}
            />
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-app-text">{copy.list.active}</h3>
                <span className="text-[12px] text-app-text-subtle">
                  {activeSuggestions.length}
                </span>
              </div>

              {activeSuggestions.length > 0 ? (
                <div className="space-y-3">
                  {activeSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      onClick={() => openSuggestionDetail(suggestion)}
                      className={cx(
                        "w-full rounded-2xl border border-app-border bg-app-bg-elevated text-left transition hover:border-app-border-strong",
                        isCompactView ? "px-3 py-3" : "px-4 py-4",
                      )}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p
                            className={cx(
                              "font-semibold text-app-text",
                              isCompactView ? "text-[14px]" : "text-[15px]",
                            )}
                          >
                            {suggestion.title}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-app-text-muted">
                            <span>{suggestion.employee?.full_name ?? "-"}</span>
                            {suggestion.employee?.title ? <span>{suggestion.employee.title}</span> : null}
                            <span>{formatDateTime(suggestion.updatedAt, language)}</span>
                          </div>
                        </div>

                        <SuggestionStatusBadge status={suggestion.status} language={language} />
                      </div>

                      <p
                        className={cx(
                          "mt-3 leading-6 text-app-text-muted",
                          isCompactView ? "app-line-clamp-2 text-[12px]" : "text-[13px]",
                        )}
                      >
                        {truncate(
                          suggestion.description?.trim() || copy.list.noDescription,
                          isCompactView ? 120 : 240,
                        )}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-app-border bg-app-bg-elevated px-4 py-4 text-[13px] text-app-text-muted">
                  {copy.list.emptyActive}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-2xl border border-app-border bg-app-surface px-4 py-3 text-left"
                onClick={() => setIsArchiveOpen((current) => !current)}
              >
                <div>
                  <p className="text-sm font-semibold text-app-text">{copy.list.archive}</p>
                  <p className="mt-1 text-[12px] text-app-text-muted">
                    {archivedSuggestions.length}
                  </p>
                </div>
                <ChevronDownIcon
                  className={cx("h-4 w-4 transition", isArchiveVisible && "rotate-180")}
                />
              </button>

              {isArchiveVisible ? (
                archivedSuggestions.length > 0 ? (
                  <div className="space-y-3">
                    {archivedSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        type="button"
                        onClick={() => openSuggestionDetail(suggestion)}
                        className={cx(
                          "w-full rounded-2xl border border-app-border bg-app-bg-elevated text-left transition hover:border-app-border-strong",
                          isCompactView ? "px-3 py-3" : "px-4 py-4",
                        )}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p
                              className={cx(
                                "font-semibold text-app-text",
                                isCompactView ? "text-[14px]" : "text-[15px]",
                              )}
                            >
                              {suggestion.title}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-app-text-muted">
                              <span>{suggestion.employee?.full_name ?? "-"}</span>
                              <span>{formatDateTime(suggestion.updatedAt, language)}</span>
                            </div>
                          </div>

                          <SuggestionStatusBadge status={suggestion.status} language={language} />
                        </div>

                        <p
                          className={cx(
                            "mt-3 leading-6 text-app-text-muted",
                            isCompactView ? "app-line-clamp-2 text-[12px]" : "text-[13px]",
                          )}
                        >
                          {truncate(
                            suggestion.description?.trim() || copy.list.noDescription,
                            isCompactView ? 100 : 220,
                          )}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-app-border bg-app-bg-elevated px-4 py-4 text-[13px] text-app-text-muted">
                    {copy.list.emptyArchive}
                  </div>
                )
              ) : null}
            </div>

            <Pagination
              pathname="/suggestions"
              page={data.filters.page}
              pageCount={data.pageCount}
              query={paginationQuery}
              summaryLabel={copy.pagination.summary(data.filters.page, data.pageCount)}
            />
          </div>
        )}
      </section>

      <SuggestionDetailModal
        isOpen={isDetailOpen}
        suggestion={selectedSuggestion}
        canManageStatus={data.isLeadView}
        onClose={closeSuggestionDetail}
        updateStatusAction={updateStatusAction}
      />
    </div>
  );
}
