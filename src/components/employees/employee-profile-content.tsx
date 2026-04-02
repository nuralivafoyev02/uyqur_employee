"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { usePreferences } from "@/components/providers/preferences-provider";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import {
  PlanStatusBadge,
  PriorityBadge,
  ProfileStatusBadge,
  ReportStatusBadge,
  RoleBadge,
} from "@/components/ui/badges";
import { ReportDetailModal } from "@/components/reports/report-detail-modal";
import { getEmployeesCopy } from "@/lib/employees-copy";
import { formatDate, truncate } from "@/lib/utils";
import type { EmployeeProfileData } from "@/lib/queries/employees";

type EmployeeProfileContentProps = {
  data: EmployeeProfileData;
};

export function EmployeeProfileContent({ data }: EmployeeProfileContentProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<{
    employeeName?: string | null;
    employeeTitle?: string | null;
    employeeProfileStatus?: string | null;
    reportDate: string;
    updatedAt: string;
    status: EmployeeProfileData["reportHistory"][number]["status"];
    completedWork: string;
    currentWork: string;
    nextPlan: string;
    blockers?: string | null;
  } | null>(null);
  const detailCloseTimeoutRef = useRef<number | null>(null);
  const { language } = usePreferences();
  const copy = getEmployeesCopy(language);

  useEffect(() => {
    return () => {
      if (detailCloseTimeoutRef.current !== null) {
        window.clearTimeout(detailCloseTimeoutRef.current);
      }
    };
  }, []);

  function openReportDetail(report: EmployeeProfileData["reportHistory"][number]) {
    if (detailCloseTimeoutRef.current !== null) {
      window.clearTimeout(detailCloseTimeoutRef.current);
      detailCloseTimeoutRef.current = null;
    }

    setSelectedReport({
      employeeName: data.profile.full_name,
      employeeTitle: data.profile.title,
      employeeProfileStatus: data.profile.profile_status,
      reportDate: report.report_date,
      updatedAt: report.updated_at,
      status: report.status,
      completedWork: report.completed_work,
      currentWork: report.current_work,
      nextPlan: report.next_plan,
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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={copy.profile.headerEyebrow}
        title={data.profile.full_name}
        description={data.profile.title ?? copy.profile.noTitle}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <ProfileStatusBadge
              status={data.profile.profile_status ?? copy.profile.statusEmpty}
              className="max-w-48 truncate"
            />
            <RoleBadge role={data.profile.role} language={language} />
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label={copy.profile.metrics.totalReports.label}
          value={data.stats.totalReports}
          helper={copy.profile.metrics.totalReports.helper}
        />
        <MetricCard
          label={copy.profile.metrics.blockedReports.label}
          value={data.stats.blockedReports}
          helper={copy.profile.metrics.blockedReports.helper}
        />
        <MetricCard
          label={copy.profile.metrics.activePlans.label}
          value={data.stats.activePlans}
          helper={copy.profile.metrics.activePlans.helper}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_minmax(0,0.85fr)]">
        <section className="app-panel p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="app-kicker">{copy.profile.reports.eyebrow}</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-app-text">
                {copy.profile.reports.title}
              </h2>
            </div>
            <Link href="/reports" className="text-sm font-medium text-app-accent">
              {copy.profile.reports.pageLink}
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {data.reportHistory.length > 0 ? (
              data.reportHistory.map((report) => (
                <article
                  key={report.id}
                  className="cursor-pointer rounded-2xl border border-app-border bg-app-bg-elevated p-4 transition hover:border-app-border-strong hover:bg-app-surface"
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
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold text-app-text">
                      {formatDate(report.report_date, undefined, language)}
                    </p>
                    <ReportStatusBadge status={report.status} language={language} />
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                        {copy.profile.reports.completedWork}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-app-text-muted">
                        {truncate(report.completed_work, 180)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                        {copy.profile.reports.nextPlan}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-app-text-muted">
                        {truncate(report.next_plan, 180)}
                      </p>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState
                title={copy.profile.reports.emptyTitle}
                description={copy.profile.reports.emptyDescription}
              />
            )}
          </div>
        </section>

        <section className="app-panel p-6">
          <p className="app-kicker">{copy.profile.plans.eyebrow}</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-app-text">
            {copy.profile.plans.title}
          </h2>

          <div className="mt-6 space-y-4">
            {data.plans.length > 0 ? (
              data.plans.map((plan) => (
                <article
                  key={plan.id}
                  className="rounded-2xl border border-app-border bg-app-bg-elevated p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold text-app-text">{plan.title}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <PriorityBadge priority={plan.priority} language={language} />
                      <PlanStatusBadge status={plan.status} language={language} />
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-app-text-muted">
                    {plan.description
                      ? truncate(plan.description, 180)
                      : copy.profile.plans.noDescription}
                  </p>
                  <p className="mt-3 text-sm text-app-text-subtle">
                    {plan.due_date
                      ? `${copy.profile.plans.deadlinePrefix}: ${formatDate(plan.due_date, undefined, language)}`
                      : copy.profile.plans.noDeadline}
                  </p>
                </article>
              ))
            ) : (
              <EmptyState
                title={copy.profile.plans.emptyTitle}
                description={copy.profile.plans.emptyDescription}
              />
            )}
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
