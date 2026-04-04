"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { usePreferences } from "@/components/providers/preferences-provider";
import { ChevronDownIcon } from "@/components/layout/dashboard-icons";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { ProfileStatusBadge, ReportStatusBadge } from "@/components/ui/badges";
import { FilterModal } from "@/components/ui/filter-modal";
import { ReportDetailModal } from "@/components/reports/report-detail-modal";
import { ReportForm } from "@/components/reports/report-form";
import type { ActiveIntegrationSummary } from "@/lib/integration-providers";
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

type SendReportToTelegramAction = (
  state: ActionState<string> | undefined,
  formData: FormData,
) => Promise<ActionState<string>>;

type DeleteReportAction = (formData: FormData) => Promise<void>;

type ReportsContentProps = {
  data: ReportsPageData;
  action: SaveReportAction;
  canSendTelegram: boolean;
  sendTelegramAction: SendReportToTelegramAction;
  deleteAction: DeleteReportAction;
  telegramConnection: ActiveIntegrationSummary | null;
};

const STATUSES: ReportStatus[] = ["done", "in_progress", "blocked"];

export function ReportsContent({
  data,
  action,
  canSendTelegram,
  sendTelegramAction,
  deleteAction,
  telegramConnection,
}: ReportsContentProps) {
  const editorPanelId = useId();
  const [isEditorOpen, setIsEditorOpen] = useState(
    !data.isLeadView || Boolean(data.editorRequested),
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<{
    employeeName?: string | null;
    employeeTitle?: string | null;
    employeeProfileStatus?: string | null;
    reportDate: string;
    updatedAt: string;
    status: ReportStatus;
    completedWork: string;
    currentWork: string;
    nextPlan: string;
    blockers?: string | null;
  } | null>(null);
  const detailCloseTimeoutRef = useRef<number | null>(null);
  const { language } = usePreferences();
  const copy = getReportsCopy(language);
  const activeFilterCount =
    Number(Boolean(data.filters.date)) +
    Number(Boolean(data.filters.status)) +
    Number(Boolean(data.isLeadView && data.filters.employeeId));
  const editorQueryBase = useMemo(
    () => ({
      ...(data.filters.date ? { date: data.filters.date } : {}),
      ...(data.filters.status ? { status: data.filters.status } : {}),
      ...(data.filters.employeeId ? { employeeId: data.filters.employeeId } : {}),
      ...(data.filters.page > 1 ? { page: String(data.filters.page) } : {}),
    }),
    [data.filters.date, data.filters.employeeId, data.filters.page, data.filters.status],
  );
  const editorKey = `${data.editorEmployeeId}:${data.editorDate}:${data.reportForEditor?.id ?? "new"}`;

  useEffect(() => {
    return () => {
      if (detailCloseTimeoutRef.current !== null) {
        window.clearTimeout(detailCloseTimeoutRef.current);
      }
    };
  }, []);

  function openReportDetail(report: ReportsPageData["history"][number]) {
    if (detailCloseTimeoutRef.current !== null) {
      window.clearTimeout(detailCloseTimeoutRef.current);
      detailCloseTimeoutRef.current = null;
    }

    setSelectedReport({
      employeeName: report.employee?.full_name,
      employeeTitle: report.employee?.title,
      employeeProfileStatus: report.employee?.profile_status,
      reportDate: report.reportDate,
      updatedAt: report.updatedAt,
      status: report.status,
      completedWork: report.completedWork,
      currentWork: report.currentWork,
      nextPlan: report.nextPlan,
      blockers: report.blockers,
    });
    setIsDetailOpen(true);
  }

  function closeReportDetail() {
    setIsDetailOpen(false);

    if (detailCloseTimeoutRef.current !== null) {
      window.clearTimeout(detailCloseTimeoutRef.current);
    }

    detailCloseTimeoutRef.current = window.setTimeout(() => {
      setSelectedReport(null);
      detailCloseTimeoutRef.current = null;
    }, 240);
  }

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
                    htmlFor="reportFilterDate"
                  >
                    {copy.filters.date}
                  </label>
                  <input
                    id="reportFilterDate"
                    name="date"
                    type="date"
                    className="app-field"
                    defaultValue={data.filters.date}
                  />
                </div>

                {data.isLeadView ? (
                  <div className="space-y-1.5">
                    <label
                      className="block text-xs font-semibold uppercase tracking-[0.12em] text-app-text-subtle"
                      htmlFor="reportFilterEmployee"
                    >
                      {copy.filters.employee}
                    </label>
                    <select
                      id="reportFilterEmployee"
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
                    htmlFor="reportFilterStatus"
                  >
                    {copy.filters.status}
                  </label>
                  <select
                    id="reportFilterStatus"
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

                <button type="submit" className="app-button w-full">
                  {copy.filters.submit}
                </button>
              </form>
            </FilterModal>

            <button
              type="button"
              className={isEditorOpen ? "app-button-secondary" : "app-button"}
              onClick={() => setIsEditorOpen((current) => !current)}
            >
              {isEditorOpen ? copy.editor.closeComposer : copy.editor.openComposer}
            </button>
          </div>
        )}
      />

      {isEditorOpen ? (
        <section className="app-panel p-4 md:p-5">
          <div className="flex flex-col gap-4 border-b border-app-border pb-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1.5">
              <p className="app-kicker">{copy.editor.eyebrow}</p>
              <h2 className="text-lg font-semibold tracking-tight text-app-text">
                {formatDate(data.editorDate, undefined, language)}
              </h2>
              <p className="max-w-2xl text-[13px] leading-5 text-app-text-muted">
                {data.reportForEditor ? copy.editor.existingDescription : copy.editor.newDescription}
              </p>
              <p className="rounded-2xl border border-dashed border-app-border bg-app-bg-elevated px-3 py-2.5 text-[12px] text-app-text-muted">
                {copy.editor.quickHint}
              </p>
            </div>

            <button
              type="button"
              aria-expanded={isEditorOpen}
              aria-controls={editorPanelId}
              className="app-button-secondary shrink-0 gap-2 self-start px-3 py-1.5 text-xs"
              onClick={() => setIsEditorOpen(false)}
            >
              <span>{copy.editor.collapse}</span>
              <ChevronDownIcon className="h-4 w-4 rotate-180" />
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-app-border bg-app-bg-elevated p-4">
            <form
              action="/reports"
              className="grid gap-3 lg:grid-cols-[180px_minmax(0,1fr)_auto]"
            >
              <input type="hidden" name="date" value={data.filters.date} />
              <input type="hidden" name="status" value={data.filters.status} />
              <input type="hidden" name="employeeId" value={data.filters.employeeId} />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-app-text-subtle" htmlFor="editorDate">
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
                <div className="space-y-1.5">
                  <label
                    className="block text-xs font-semibold uppercase tracking-[0.12em] text-app-text-subtle"
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
                <div className="flex items-end">
                  <div className="w-full rounded-2xl border border-app-border bg-app-surface px-3 py-2 text-[13px] text-app-text-muted">
                    {copy.editor.quickHint}
                  </div>
                </div>
              )}

              <div className="flex items-end">
                <button type="submit" className="app-button w-full lg:w-auto">
                  {copy.editor.openSelected}
                </button>
              </div>
            </form>
          </div>

          <div id={editorPanelId} className="mt-5">
            <ReportForm
              key={editorKey}
              action={action}
              canSendTelegram={canSendTelegram}
              sendTelegramAction={sendTelegramAction}
              employeeId={data.editorEmployeeId}
              employeeName={data.editorEmployee?.full_name ?? copy.history.unknownEmployee}
              employeeTitle={data.editorEmployee?.title}
              initialValue={data.reportForEditor}
              selectedDate={data.editorDate}
              telegramConnection={telegramConnection}
              completedPlans={data.reportForEditorCompletedPlans}
            />
          </div>
        </section>
      ) : null}

      <div className="space-y-5">
        <section className="space-y-5">
          <div className="app-panel p-4 md:p-5">
            <div className="flex flex-col gap-3 border-b border-app-border pb-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="app-kicker">
                  {data.isLeadView ? copy.history.leadEyebrow : copy.history.employeeEyebrow}
                </p>
                <h2 className="mt-2 text-lg font-semibold tracking-tight text-app-text">
                  {data.isLeadView ? copy.history.leadTitle : copy.history.employeeTitle}
                </h2>
              </div>
              <p className="text-[13px] text-app-text-muted">
                {copy.history.entries(data.totalCount)}
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {data.history.length > 0 ? (
                data.history.map((report) => (
                  <article
                    key={report.id}
                    className="cursor-pointer rounded-2xl border border-app-border bg-app-bg-elevated p-3.5 transition hover:border-app-border-strong hover:bg-app-surface"
                    role="button"
                    tabIndex={0}
                    onClick={() => openReportDetail(report)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openReportDetail(report);
                      }
                    }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-app-text">
                          {data.isLeadView
                            ? report.employee?.full_name ?? copy.history.unknownEmployee
                            : formatDate(report.reportDate, undefined, language)}
                        </p>
                        <p className="mt-1 text-[12px] text-app-text-muted">
                          {data.isLeadView
                            ? `${formatDate(report.reportDate, undefined, language)} · ${
                                report.employee?.title ?? copy.history.noTitle
                              }`
                            : formatDateTime(report.updatedAt, language)}
                        </p>
                        {data.isLeadView && report.employee?.profile_status ? (
                          <div className="mt-2">
                            <ProfileStatusBadge
                              status={report.employee.profile_status}
                              className="max-w-44 truncate"
                            />
                          </div>
                        ) : null}
                      </div>
                      <div
                        className="flex flex-wrap items-center gap-2"
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                      >
                        {(data.viewer.id === report.employeeId || data.viewer.role === "admin") ? (
                          <>
                            <Link
                              href={buildEditorHref(report.reportDate, report.employeeId)}
                              className="app-button-secondary px-2.5 py-1.5 text-[11px]"
                              onClick={() => setIsEditorOpen(true)}
                            >
                              {copy.history.edit}
                            </Link>
                            <form action={deleteAction}>
                              <input type="hidden" name="reportId" value={report.id} />
                              <button
                                type="submit"
                                className="app-button-secondary px-2.5 py-1.5 text-[11px] text-rose-700"
                              >
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
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                          {copy.history.completedWork}
                        </p>
                        <p className="mt-2 text-[13px] leading-5 text-app-text-muted">
                          {truncate(report.completedWork, 150)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                          {copy.history.currentWork}
                        </p>
                        <p className="mt-2 text-[13px] leading-5 text-app-text-muted">
                          {truncate(report.currentWork, 150)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                          {copy.history.nextPlan}
                        </p>
                        <p className="mt-2 text-[13px] leading-5 text-app-text-muted">
                          {truncate(report.nextPlan, 150)}
                        </p>
                      </div>
                    </div>

                    {report.blockers ? (
                      <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
                        <span className="font-semibold">{copy.form.blockers}: </span>
                        {truncate(report.blockers, 140)}
                      </div>
                    ) : null}
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-app-border bg-app-bg-elevated px-5 py-10 text-center text-[13px] text-app-text-muted">
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

      <ReportDetailModal
        isOpen={isDetailOpen}
        report={selectedReport}
        onClose={closeReportDetail}
      />
    </div>
  );
}
