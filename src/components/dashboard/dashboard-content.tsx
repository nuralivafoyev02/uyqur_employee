"use client";

import Link from "next/link";

import { usePreferences } from "@/components/providers/preferences-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import {
  PlanStatusBadge,
  PriorityBadge,
  ProfileStatusBadge,
  ReportStatusBadge,
} from "@/components/ui/badges";
import { getDashboardCopy } from "@/lib/dashboard-copy";
import { formatDate, formatDateTime, truncate } from "@/lib/utils";
import type { DashboardData } from "@/lib/queries/dashboard";

type DashboardContentProps = {
  data: DashboardData;
  viewerName: string;
  isLeadView: boolean;
};

export function DashboardContent({
  data,
  viewerName,
  isLeadView,
}: DashboardContentProps) {
  const { language } = usePreferences();
  const copy = getDashboardCopy(language);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={copy.header.eyebrow}
        title={
          isLeadView
            ? copy.header.leadTitle
            : copy.header.employeeTitle(viewerName.split(" ")[0] ?? viewerName)
        }
        description={
          isLeadView ? copy.header.leadDescription : copy.header.employeeDescription
        }
        actions={
          <Link href="/reports" className="app-button">
            {copy.header.cta}
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={copy.metrics.totalEmployees.label}
          value={data.metrics.totalEmployees}
          helper={copy.metrics.totalEmployees.helper}
        />
        <MetricCard
          label={copy.metrics.submittedToday.label}
          value={data.metrics.submittedToday}
          helper={copy.metrics.submittedToday.helper}
        />
        <MetricCard
          label={copy.metrics.pendingToday.label}
          value={data.metrics.pendingToday}
          helper={copy.metrics.pendingToday.helper}
        />
        <MetricCard
          label={copy.metrics.openPlans.label}
          value={data.metrics.openPlans}
          helper={copy.metrics.openPlans.helper}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_minmax(0,0.85fr)]">
        <section className="app-panel p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="app-kicker">
                {isLeadView ? copy.reports.leadEyebrow : copy.reports.employeeEyebrow}
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-app-text">
                {isLeadView ? copy.reports.leadTitle : copy.reports.employeeTitle}
              </h2>
            </div>
            <Link href="/reports" className="text-sm font-medium text-app-accent">
              {copy.reports.viewAll}
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {(isLeadView ? data.latestReports : data.ownRecentReports).length > 0 ? (
              isLeadView ? (
                data.latestReports.map((report) => (
                  <article
                    key={report.id}
                    className="rounded-2xl border border-app-border bg-app-bg-elevated p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-app-text">
                          {report.employee?.full_name ?? copy.reports.unknownEmployee}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <p className="text-sm text-app-text-muted">
                            {report.employee?.title ?? copy.reports.noTitle}
                          </p>
                          {report.employee?.profile_status ? (
                            <ProfileStatusBadge
                              status={report.employee.profile_status}
                              className="max-w-40 truncate"
                            />
                          ) : null}
                        </div>
                      </div>
                      <ReportStatusBadge status={report.status} language={language} />
                    </div>
                    <p className="mt-4 text-sm leading-6 text-app-text-muted">
                      {truncate(report.completedWork, 160)}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-app-text-subtle">
                      <span>{formatDate(report.reportDate, undefined, language)}</span>
                      <span>{formatDateTime(report.updatedAt, language)}</span>
                    </div>
                  </article>
                ))
              ) : (
                data.ownRecentReports.map((report) => (
                  <article
                    key={report.id}
                    className="rounded-2xl border border-app-border bg-app-bg-elevated p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-semibold text-app-text">
                        {formatDate(report.report_date, undefined, language)}
                      </p>
                      <ReportStatusBadge status={report.status} language={language} />
                    </div>
                    <p className="mt-4 text-sm leading-6 text-app-text-muted">
                      {truncate(report.completed_work, 170)}
                    </p>
                  </article>
                ))
              )
            ) : (
              <EmptyState
                title={copy.reports.emptyTitle}
                description={copy.reports.emptyDescription}
              />
            )}
          </div>
        </section>

        <div className="space-y-6">
          <section className="app-panel p-6">
            <p className="app-kicker">
              {isLeadView ? copy.coverage.leadEyebrow : copy.coverage.employeeEyebrow}
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-app-text">
              {isLeadView ? copy.coverage.leadTitle : copy.coverage.employeeTitle}
            </h2>

            {isLeadView ? (
              data.missingEmployees.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {data.missingEmployees.slice(0, 8).map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center justify-between rounded-2xl border border-app-border bg-app-bg-elevated px-4 py-3"
                    >
                      <div>
                        <p className="font-medium text-app-text">{employee.full_name}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <p className="text-sm text-app-text-muted">
                            {employee.title ?? copy.coverage.noTitle}
                          </p>
                          {employee.profile_status ? (
                            <ProfileStatusBadge
                              status={employee.profile_status}
                              className="max-w-40 truncate"
                            />
                          ) : null}
                        </div>
                      </div>
                      <Link
                        href={`/employees/${employee.id}`}
                        className="text-sm font-medium text-app-accent"
                      >
                        {copy.coverage.profile}
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                  {copy.coverage.allSubmitted}
                </div>
              )
            ) : data.ownTodayReport ? (
              <div className="mt-6 space-y-4 rounded-2xl border border-app-border bg-app-bg-elevated p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold text-app-text">
                    {formatDate(data.ownTodayReport.report_date, undefined, language)}
                  </p>
                  <ReportStatusBadge status={data.ownTodayReport.status} language={language} />
                </div>
                <p className="text-sm leading-6 text-app-text-muted">
                  {truncate(data.ownTodayReport.current_work, 180)}
                </p>
                <Link href="/reports" className="text-sm font-medium text-app-accent">
                  {copy.coverage.editReport}
                </Link>
              </div>
            ) : (
              <div className="mt-6">
                <EmptyState
                  title={copy.coverage.emptyTitle}
                  description={copy.coverage.emptyDescription}
                  action={
                    <Link href="/reports" className="app-button">
                      {copy.coverage.submitReport}
                    </Link>
                  }
                />
              </div>
            )}
          </section>

          <section className="app-panel p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="app-kicker">{copy.plans.eyebrow}</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-app-text">
                  {copy.plans.title}
                </h2>
              </div>
              <Link href="/plans" className="text-sm font-medium text-app-accent">
                {copy.plans.pageLink}
              </Link>
            </div>

            <div className="mt-6 space-y-3">
              {data.activePlans.length > 0 ? (
                data.activePlans.map((plan) => (
                  <article
                    key={plan.id}
                    className="rounded-2xl border border-app-border bg-app-bg-elevated p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-medium text-app-text">{plan.title}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <PriorityBadge priority={plan.priority} language={language} />
                        <PlanStatusBadge status={plan.status} language={language} />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-app-text-muted">
                      <span>{plan.assignee?.full_name ?? viewerName}</span>
                      <span>
                        {plan.dueDate
                          ? formatDate(plan.dueDate, undefined, language)
                          : copy.plans.noDeadline}
                      </span>
                    </div>
                  </article>
                ))
              ) : (
                <EmptyState
                  title={copy.plans.emptyTitle}
                  description={copy.plans.emptyDescription}
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
