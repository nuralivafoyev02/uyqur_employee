"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";

import { usePreferences } from "@/components/providers/preferences-provider";
import { ChevronDownIcon } from "@/components/layout/dashboard-icons";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { ReportStatusBadge } from "@/components/ui/badges";
import { ReportForm } from "@/components/reports/report-form";
import { getReportsCopy } from "@/lib/reports-copy";
import { formatDate, formatDateTime, getReportStatusLabel, truncate } from "@/lib/utils";
import type { ActionState } from "@/lib/validations";
import type { ReportsPageData } from "@/lib/queries/reports";
import type { ReportStatus } from "@/types/database";

type ReportField =
  | "reportDate"
  | "completedWork"
  | "currentWork"
  | "nextPlan"
  | "blockers"
  | "status";

type SaveReportAction = (
  state: ActionState<ReportField> | undefined,
  formData: FormData,
) => Promise<ActionState<ReportField>>;

type DeleteReportAction = (formData: FormData) => Promise<void>;

type ReportsContentProps = {
  data: ReportsPageData;
  action: SaveReportAction;
  deleteAction: DeleteReportAction;
};

const STATUSES: ReportStatus[] = ["done", "in_progress", "blocked"];

export function ReportsContent({ data, action, deleteAction }: ReportsContentProps) {
  const editorPanelId = useId();
  const [isEditorOpen, setIsEditorOpen] = useState(Boolean(data.editorRequested));
  const { language } = usePreferences();
  const copy = getReportsCopy(language);
  const editorQueryBase = useMemo(
    () => ({
      ...(data.filters.date ? { date: data.filters.date } : {}),
      ...(data.filters.status ? { status: data.filters.status } : {}),
      ...(data.filters.employeeId ? { employeeId: data.filters.employeeId } : {}),
      ...(data.filters.page > 1 ? { page: String(data.filters.page) } : {}),
    }),
    [data.filters.date, data.filters.employeeId, data.filters.page, data.filters.status],
  );

  function buildEditorHref(reportDate: string, employeeId: string) {
    const params = new URLSearchParams(editorQueryBase);
    params.set("editorDate", reportDate);

    if (data.canManageAllReports) {
      params.set("editorEmployeeId", employeeId);
    } else {
      params.delete("editorEmployeeId");
    }

    const serialized = params.toString();
    return serialized ? `/reports?${serialized}` : "/reports";
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={copy.header.eyebrow}
        title={copy.header.title}
        description={copy.header.description}
        actions={(
          <button
            type="button"
            className={isEditorOpen ? "app-button-secondary" : "app-button"}
            onClick={() => setIsEditorOpen((current) => !current)}
          >
            {isEditorOpen ? copy.editor.closeComposer : copy.editor.openComposer}
          </button>
        )}
      />

      {isEditorOpen ? (
        <section className="app-panel p-6">
          <div className="flex flex-col gap-4 border-b border-app-border pb-5 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <p className="app-kicker">{copy.editor.eyebrow}</p>
              <h2 className="text-xl font-semibold tracking-tight text-app-text">
                {formatDate(data.editorDate, undefined, language)}
              </h2>
              <p className="text-sm text-app-text-muted">
                {data.reportForEditor ? copy.editor.existingDescription : copy.editor.newDescription}
              </p>
            </div>

            <button
              type="button"
              aria-expanded={isEditorOpen}
              aria-controls={editorPanelId}
              className="app-button-secondary shrink-0 gap-2 self-start px-3 py-2"
              onClick={() => setIsEditorOpen(false)}
            >
              <span>{copy.editor.collapse}</span>
              <ChevronDownIcon className="h-4 w-4 rotate-180" />
            </button>
          </div>

          <form
            action="/reports"
            className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
          >
            <input type="hidden" name="date" value={data.filters.date} />
            <input type="hidden" name="status" value={data.filters.status} />
            <input type="hidden" name="employeeId" value={data.filters.employeeId} />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-app-text" htmlFor="editorDate">
                {copy.editor.date}
              </label>
              <input
                id="editorDate"
                name="editorDate"
                type="date"
                className="app-field"
                defaultValue={data.editorDate}
              />
            </div>

            {data.canManageAllReports ? (
              <div className="space-y-2">
                <label
                  className="block text-sm font-medium text-app-text"
                  htmlFor="editorEmployeeId"
                >
                  {copy.editor.employee}
                </label>
                <select
                  id="editorEmployeeId"
                  name="editorEmployeeId"
                  className="app-field"
                  defaultValue={data.editorEmployeeId}
                >
                  <option value="">{copy.editor.employeePlaceholder}</option>
                  {data.employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.full_name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="hidden md:block" />
            )}

            <div className="flex items-end">
              <button type="submit" className="app-button w-full md:w-auto">
                {copy.editor.openSelected}
              </button>
            </div>
          </form>

          <div
            id={editorPanelId}
            className="mt-6"
          >
            <ReportForm
              action={action}
              employeeId={data.editorEmployeeId}
              initialValue={data.reportForEditor}
              selectedDate={data.editorDate}
            />
          </div>
        </section>
      ) : null}

      <div className={data.isLeadView ? "grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]" : "space-y-6"}>
        {data.isLeadView ? (
          <div className="app-panel h-fit p-6">
            <form className="grid gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-app-text" htmlFor="date">
                  {copy.filters.date}
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  className="app-field"
                  defaultValue={data.filters.date}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-app-text" htmlFor="employeeId">
                  {copy.filters.employee}
                </label>
                <select
                  id="employeeId"
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

              <div className="space-y-2">
                <label className="block text-sm font-medium text-app-text" htmlFor="status">
                  {copy.filters.status}
                </label>
                <select
                  id="status"
                  name="status"
                  className="app-field"
                  defaultValue={data.filters.status}
                >
                  <option value="">{copy.filters.all}</option>
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {getReportStatusLabel(status, language)}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="app-button mt-2 w-full">
                {copy.filters.submit}
              </button>
            </form>
          </div>
        ) : null}

        <section className="space-y-6">
          <div className="app-panel p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="app-kicker">
                  {data.isLeadView ? copy.history.leadEyebrow : copy.history.employeeEyebrow}
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-app-text">
                  {data.isLeadView ? copy.history.leadTitle : copy.history.employeeTitle}
                </h2>
              </div>
              <p className="text-sm text-app-text-muted">
                {copy.history.entries(data.totalCount)}
              </p>
            </div>

            <div className="mt-6 space-y-4">
              {data.history.length > 0 ? (
                data.history.map((report) => (
                  <article
                    key={report.id}
                    className="rounded-2xl border border-app-border bg-app-bg-elevated p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-app-text">
                          {data.isLeadView
                            ? report.employee?.full_name ?? copy.history.unknownEmployee
                            : formatDate(report.reportDate, undefined, language)}
                        </p>
                        <p className="text-sm text-app-text-muted">
                          {data.isLeadView
                            ? `${formatDate(report.reportDate, undefined, language)} · ${
                                report.employee?.title ?? copy.history.noTitle
                              }`
                            : formatDateTime(report.updatedAt, language)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {(data.viewer.id === report.employeeId || data.viewer.role === "admin") ? (
                          <>
                            <Link
                              href={buildEditorHref(report.reportDate, report.employeeId)}
                              className="app-button-secondary px-3 py-2 text-xs"
                              onClick={() => setIsEditorOpen(true)}
                            >
                              {copy.history.edit}
                            </Link>
                            <form action={deleteAction}>
                              <input type="hidden" name="reportId" value={report.id} />
                              <button type="submit" className="app-button-secondary px-3 py-2 text-xs text-rose-700">
                                {copy.history.delete}
                              </button>
                            </form>
                          </>
                        ) : null}
                        <ReportStatusBadge status={report.status} language={language} />
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                          {copy.history.completedWork}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-app-text-muted">
                          {truncate(report.completedWork, 150)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                          {copy.history.currentWork}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-app-text-muted">
                          {truncate(report.currentWork, 150)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                          {copy.history.nextPlan}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-app-text-muted">
                          {truncate(report.nextPlan, 150)}
                        </p>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-app-border bg-app-bg-elevated px-5 py-10 text-center text-sm text-app-text-muted">
                  {copy.history.empty}
                </div>
              )}
            </div>

            <div className="mt-6">
              <Pagination
                pathname="/reports"
                page={data.filters.page}
                pageCount={data.pageCount}
                summaryLabel={copy.pagination.summary(data.filters.page, data.pageCount)}
                previousLabel={copy.pagination.previous}
                nextLabel={copy.pagination.next}
                query={{
                  ...(data.filters.date ? { date: data.filters.date } : {}),
                  ...(data.filters.status ? { status: data.filters.status } : {}),
                  ...(data.filters.employeeId ? { employeeId: data.filters.employeeId } : {}),
                }}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
