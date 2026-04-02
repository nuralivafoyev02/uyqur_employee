"use client";

import { useEffect, useId } from "react";
import { createPortal } from "react-dom";

import { CloseIcon } from "@/components/layout/dashboard-icons";
import { usePreferences } from "@/components/providers/preferences-provider";
import { ProfileStatusBadge, ReportStatusBadge } from "@/components/ui/badges";
import { useAnimatedPresence } from "@/components/ui/use-animated-presence";
import { getReportsCopy } from "@/lib/reports-copy";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { ReportStatus } from "@/types/database";

export type ReportDetailItem = {
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
};

type ReportDetailModalProps = {
  isOpen: boolean;
  report: ReportDetailItem | null;
  onClose: () => void;
};

export function ReportDetailModal({
  isOpen,
  report,
  onClose,
}: ReportDetailModalProps) {
  const { language } = usePreferences();
  const copy = getReportsCopy(language);
  const titleId = useId();
  const descriptionId = useId();
  const { isMounted, dataState } = useAnimatedPresence(isOpen, 240);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMounted, onClose]);

  if (!isMounted || !report) {
    return null;
  }

  return createPortal(
    <div
      data-state={dataState}
      className="app-overlay fixed inset-0 z-[120] flex justify-end bg-slate-950/35 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        data-state={dataState}
        className="app-drawer-panel app-panel h-full w-full max-w-2xl rounded-none border-y-0 border-r-0 p-5 sm:rounded-l-[28px] sm:border"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-app-border pb-4">
            <div className="space-y-1.5">
              <p className="app-kicker">{copy.detail.title}</p>
              <h2 id={titleId} className="text-lg font-semibold tracking-tight text-app-text">
                {report.employeeName ?? formatDate(report.reportDate, undefined, language)}
              </h2>
              <p
                id={descriptionId}
                className="text-[13px] leading-5 text-app-text-muted"
              >
                {formatDate(report.reportDate, undefined, language)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <ReportStatusBadge status={report.status} language={language} />
              <button
                type="button"
                className="app-icon-button h-9 w-9"
                aria-label={copy.detail.close}
                onClick={onClose}
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-5 flex-1 space-y-4 overflow-y-auto pr-1">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-app-border bg-app-bg-elevated p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                  {report.employeeName ? copy.detail.employee : copy.detail.reportDate}
                </p>
                <p className="mt-2 text-sm font-semibold text-app-text">
                  {report.employeeName ?? formatDate(report.reportDate, undefined, language)}
                </p>
                <p className="mt-1 text-[12px] text-app-text-muted">
                  {report.employeeName
                    ? report.employeeTitle ?? copy.history.noTitle
                    : formatDateTime(report.updatedAt, language)}
                </p>
                {report.employeeProfileStatus ? (
                  <div className="mt-3">
                    <ProfileStatusBadge
                      status={report.employeeProfileStatus}
                      className="max-w-full truncate"
                    />
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-app-border bg-app-bg-elevated p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                  {copy.detail.updatedAt}
                </p>
                <p className="mt-2 text-sm font-semibold text-app-text">
                  {formatDateTime(report.updatedAt, language)}
                </p>
                <p className="mt-1 text-[12px] text-app-text-muted">
                  {formatDate(report.reportDate, undefined, language)}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-app-border bg-app-surface p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                {copy.history.completedWork}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-[14px] leading-6 text-app-text">
                {report.completedWork}
              </p>
            </div>

            <div className="rounded-2xl border border-app-border bg-app-surface p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                {copy.history.currentWork}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-[14px] leading-6 text-app-text">
                {report.currentWork}
              </p>
            </div>

            <div className="rounded-2xl border border-app-border bg-app-surface p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                {copy.history.nextPlan}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-[14px] leading-6 text-app-text">
                {report.nextPlan}
              </p>
            </div>

            <div className="rounded-2xl border border-app-border bg-app-bg-elevated p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                {copy.form.blockers}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-[14px] leading-6 text-app-text">
                {report.blockers?.trim() ? report.blockers : copy.detail.noBlockers}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
