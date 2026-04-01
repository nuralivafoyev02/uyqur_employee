"use client";

import { usePreferences } from "@/components/providers/preferences-provider";
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

type ReportsContentProps = {
  data: ReportsPageData;
  action: SaveReportAction;
};

const STATUSES: ReportStatus[] = ["done", "in_progress", "blocked"];

export function ReportsContent({ data, action }: ReportsContentProps) {
  const { language } = usePreferences();
  const copy = getReportsCopy(language);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={copy.header.eyebrow}
        title={copy.header.title}
        description={copy.header.description}
      />

      <div className="grid gap-6 xl:grid-cols-[0.92fr_minmax(0,1.08fr)]">
        <section className="app-panel p-6">
          <div className="space-y-2">
            <p className="app-kicker">{copy.editor.eyebrow}</p>
            <h2 className="text-xl font-semibold tracking-tight text-app-text">
              {formatDate(data.editorDate, undefined, language)}
            </h2>
            <p className="text-sm text-app-text-muted">
              {data.reportForEditor
                ? copy.editor.existingDescription
                : copy.editor.newDescription}
            </p>
          </div>

          <div className="mt-6">
            <ReportForm
              action={action}
              initialValue={data.reportForEditor}
              selectedDate={data.editorDate}
            />
          </div>
        </section>

        <section className="space-y-6">
          {data.isLeadView ? (
            <div className="app-panel p-6">
              <form className="grid gap-4 md:grid-cols-4">
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

                <div className="flex items-end">
                  <button type="submit" className="app-button w-full">
                    {copy.filters.submit}
                  </button>
                </div>
              </form>
            </div>
          ) : null}

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
                      <ReportStatusBadge status={report.status} language={language} />
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
