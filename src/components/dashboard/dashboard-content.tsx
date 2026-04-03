"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CalendarIcon,
  DashboardIcon,
  EmployeesIcon,
  PlansIcon,
  ReportsIcon,
  SettingsIcon,
  StatusIcon,
} from "@/components/layout/dashboard-icons";
import { usePreferences } from "@/components/providers/preferences-provider";
import {
  ReportDetailModal,
  type ReportDetailItem,
} from "@/components/reports/report-detail-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import {
  PlanStatusBadge,
  PriorityBadge,
  ProfileStatusBadge,
  ReportStatusBadge,
} from "@/components/ui/badges";
import { getDashboardCopy } from "@/lib/dashboard-copy";
import type {
  DashboardData,
  ReportFeedItem,
} from "@/lib/queries/dashboard";
import {
  formatDate,
  formatDateTime,
  getPlanStatusLabel,
  getReportStatusLabel,
  truncate,
} from "@/lib/utils";

type DashboardContentProps = {
  data: DashboardData;
  viewerName: string;
  isLeadView: boolean;
};

type OverviewStat = {
  label: string;
  value: string | number;
  helper: string;
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
};

type DistributionItem = {
  label: string;
  value: number;
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
};

function shiftIsoDate(value: string, days: number) {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function getRatio(value: number, total: number) {
  if (!total) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
}

function getDueTone(dueDate: string | null, today: string, dueSoonThreshold: string) {
  if (!dueDate) {
    return null;
  }

  if (dueDate < today) {
    return "danger" as const;
  }

  if (dueDate <= dueSoonThreshold) {
    return "warning" as const;
  }

  return null;
}

function getDueLabel(
  dueDate: string | null,
  today: string,
  dueSoonThreshold: string,
  overdueLabel: string,
  dueSoonLabel: string,
) {
  const tone = getDueTone(dueDate, today, dueSoonThreshold);

  if (tone === "danger") {
    return overdueLabel;
  }

  if (tone === "warning") {
    return dueSoonLabel;
  }

  return null;
}

function getStatusBarClass(tone: DistributionItem["tone"]) {
  switch (tone) {
    case "success":
      return "bg-emerald-500";
    case "warning":
      return "bg-amber-400";
    case "danger":
      return "bg-rose-500";
    case "info":
      return "bg-sky-500";
    default:
      return "bg-slate-400";
  }
}

function SummaryMetricCard({ label, value, helper, tone = "neutral" }: OverviewStat) {
  const toneClasses: Record<NonNullable<OverviewStat["tone"]>, string> = {
    neutral: "border-app-border bg-app-surface",
    info: "border-sky-200 bg-sky-50/80",
    success: "border-emerald-200 bg-emerald-50/80",
    warning: "border-amber-200 bg-amber-50/80",
    danger: "border-rose-200 bg-rose-50/80",
  };

  return (
    <article className={`rounded-2xl border px-4 py-3 ${toneClasses[tone]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-app-text">{value}</p>
      <p className="mt-1 text-[12px] leading-5 text-app-text-muted">{helper}</p>
    </article>
  );
}

function DistributionCard({
  title,
  items,
  total,
}: {
  title: string;
  items: DistributionItem[];
  total: number;
}) {
  return (
    <div className="rounded-2xl border border-app-border bg-app-surface px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-app-text">{title}</p>
        <span className="text-[12px] text-app-text-subtle">{total}</span>
      </div>
      <div className="mt-4 space-y-3">
        {items.map((item) => {
          const ratio = getRatio(item.value, total);

          return (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-[12px]">
                <span className="font-medium text-app-text-muted">{item.label}</span>
                <span className="font-semibold text-app-text">{item.value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-app-surface-muted">
                <div
                  className={`h-full rounded-full ${getStatusBarClass(item.tone)}`}
                  style={{ width: `${ratio}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActionTile({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-app-border bg-app-surface px-4 py-3 transition hover:border-app-border-strong hover:bg-app-bg-elevated"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="app-icon-button h-9 w-9">{icon}</span>
        <ArrowRightIcon className="h-4 w-4 text-app-text-subtle transition group-hover:translate-x-0.5 group-hover:text-app-text" />
      </div>
      <p className="mt-3 text-sm font-semibold text-app-text">{title}</p>
      <p className="mt-1 text-[12px] leading-5 text-app-text-muted">{description}</p>
    </Link>
  );
}

export function DashboardContent({
  data,
  viewerName,
  isLeadView,
}: DashboardContentProps) {
  const { language } = usePreferences();
  const copy = getDashboardCopy(language);
  const dueSoonThreshold = useMemo(() => shiftIsoDate(data.today, 3), [data.today]);
  const [selectedReport, setSelectedReport] = useState<ReportDetailItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const detailCloseTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (detailCloseTimeoutRef.current !== null) {
        window.clearTimeout(detailCloseTimeoutRef.current);
      }
    };
  }, []);

  const firstName = viewerName.split(" ")[0] ?? viewerName;
  const leadHeaderTitle = copy.header.leadTitle;
  const employeeHeaderTitle = copy.header.employeeTitle(firstName);
  const reportCoverageTotal = isLeadView ? data.metrics.totalEmployees : Math.max(data.metrics.totalEmployees, 1);
  const reportItems: DistributionItem[] = [
    {
      label: copy.hero.awaiting,
      value: data.metrics.pendingToday,
      tone: "warning",
    },
    {
      label: getReportStatusLabel("done", language),
      value: data.reportStatus.done,
      tone: "success",
    },
    {
      label: getReportStatusLabel("in_progress", language),
      value: data.reportStatus.inProgress,
      tone: "info",
    },
    {
      label: getReportStatusLabel("blocked", language),
      value: data.reportStatus.blocked,
      tone: "danger",
    },
  ];
  const planItems: DistributionItem[] = [
    {
      label: getPlanStatusLabel("todo", language),
      value: data.planStatus.todo,
      tone: "warning",
    },
    {
      label: getPlanStatusLabel("in_progress", language),
      value: data.planStatus.inProgress,
      tone: "info",
    },
    {
      label: getPlanStatusLabel("blocked", language),
      value: data.planStatus.blocked,
      tone: "danger",
    },
  ];
  const personalUrgentPlans = data.ownActivePlans.filter((plan) => {
    if (plan.status === "blocked") {
      return true;
    }

    if (!plan.dueDate) {
      return false;
    }

    return plan.dueDate < data.today || plan.dueDate <= dueSoonThreshold;
  });
  const summaryMetrics: OverviewStat[] = isLeadView
    ? [
      {
        label: copy.highlights.totalEmployees.label,
        value: data.metrics.totalEmployees,
        helper: copy.highlights.totalEmployees.helper,
      },
      {
        label: copy.highlights.submittedToday.label,
        value: data.metrics.submittedToday,
        helper: copy.highlights.submittedToday.helper,
        tone: "success",
      },
      {
        label: copy.highlights.pendingToday.label,
        value: data.metrics.pendingToday,
        helper: copy.highlights.pendingToday.helper,
        tone: data.metrics.pendingToday > 0 ? "warning" : "neutral",
      },
      {
        label: copy.highlights.blockedToday.label,
        value: data.metrics.blockedToday,
        helper: copy.highlights.blockedToday.helper,
        tone: data.metrics.blockedToday > 0 ? "danger" : "neutral",
      },
      {
        label: copy.highlights.overduePlans.label,
        value: data.metrics.overduePlans,
        helper: copy.highlights.overduePlans.helper,
        tone: data.metrics.overduePlans > 0 ? "danger" : "neutral",
      },
    ]
    : [
      {
        label: copy.highlights.myReport.label,
        value: data.ownTodayReport
          ? copy.highlights.myReport.ready
          : copy.highlights.myReport.missing,
        helper: data.ownTodayReport
          ? formatDateTime(data.ownTodayReport.updated_at, language)
          : copy.focus.emptyDescription,
        tone: data.ownTodayReport ? "success" : "warning",
      },
      {
        label: copy.highlights.myOpenPlans.label,
        value: data.ownPlanMetrics.active,
        helper: copy.highlights.myOpenPlans.helper,
      },
      {
        label: copy.highlights.dueSoon.label,
        value: data.ownPlanMetrics.dueSoon,
        helper: copy.highlights.dueSoon.helper,
        tone: data.ownPlanMetrics.dueSoon > 0 ? "warning" : "neutral",
      },
      {
        label: copy.highlights.myBlocked.label,
        value: data.ownPlanMetrics.blocked,
        helper: copy.highlights.myBlocked.helper,
        tone: data.ownPlanMetrics.blocked > 0 ? "danger" : "neutral",
      },
      {
        label: copy.highlights.teamCoverage.label,
        value: `${data.metrics.submissionRate}%`,
        helper: copy.highlights.teamCoverage.helper(data.metrics.submissionRate),
        tone: data.metrics.submissionRate >= 80 ? "success" : "info",
      },
    ];
  const planFeed = isLeadView ? data.activePlans : data.ownActivePlans;
  const reportFeed = isLeadView ? data.latestReports : data.ownRecentReports;
  const heroSummary = isLeadView
    ? copy.hero.leadSummary(
      data.metrics.submittedToday,
      data.metrics.totalEmployees,
      data.metrics.pendingToday,
      data.metrics.blockedToday,
      data.metrics.openPlans,
    )
    : copy.hero.employeeSummary(
      data.metrics.submittedToday,
      data.metrics.totalEmployees,
      data.ownPlanMetrics.active,
      data.ownPlanMetrics.dueSoon,
    );
  const actionTiles = isLeadView
    ? [
      {
        href: "/reports",
        title: copy.quickActions.reports.title,
        description: copy.quickActions.reports.description,
        icon: <ReportsIcon className="h-4 w-4" />,
      },
      {
        href: "/plans",
        title: copy.quickActions.plans.title,
        description: copy.quickActions.plans.description,
        icon: <PlansIcon className="h-4 w-4" />,
      },
      {
        href: "/employees",
        title: copy.quickActions.employees.title,
        description: copy.quickActions.employees.description,
        icon: <EmployeesIcon className="h-4 w-4" />,
      },
      {
        href: "/settings",
        title: copy.quickActions.settings.title,
        description: copy.quickActions.settings.description,
        icon: <SettingsIcon className="h-4 w-4" />,
      },
    ]
    : [
      {
        href: "/reports",
        title: copy.quickActions.reports.title,
        description: copy.quickActions.reports.description,
        icon: <ReportsIcon className="h-4 w-4" />,
      },
      {
        href: "/plans",
        title: copy.quickActions.plans.title,
        description: copy.quickActions.plans.description,
        icon: <PlansIcon className="h-4 w-4" />,
      },
      {
        href: "/settings",
        title: copy.quickActions.settings.title,
        description: copy.quickActions.settings.description,
        icon: <SettingsIcon className="h-4 w-4" />,
      },
    ];

  function openReportDetail(report: ReportFeedItem | DashboardData["ownRecentReports"][number]) {
    if (detailCloseTimeoutRef.current !== null) {
      window.clearTimeout(detailCloseTimeoutRef.current);
      detailCloseTimeoutRef.current = null;
    }

    const normalized: ReportDetailItem =
      "completedWork" in report
        ? {
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
        }
        : {
          reportDate: report.report_date,
          updatedAt: report.updated_at,
          status: report.status,
          completedWork: report.completed_work,
          currentWork: report.current_work,
          nextPlan: report.next_plan,
          blockers: report.blockers,
        };

    setSelectedReport(normalized);
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
    <div className="space-y-5">
      <PageHeader
        eyebrow={copy.header.eyebrow}
        title={isLeadView ? leadHeaderTitle : employeeHeaderTitle}
        description={
          isLeadView ? copy.header.leadDescription : copy.header.employeeDescription
        }
        actions={
          <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
            <Link href="/plans" className="app-button-secondary">
              {copy.header.secondaryCta}
            </Link>
            <Link href="/reports" className="app-button">
              {copy.header.primaryCta}
            </Link>
          </div>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {summaryMetrics.map((metric) => (
          <SummaryMetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            helper={metric.helper}
            tone={metric.tone}
          />
        ))}
      </section>

      <section className="app-panel overflow-hidden p-4 md:p-5">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_320px]">
          <div className="rounded-[28px] border border-app-border bg-app-bg-elevated px-4 py-4 md:px-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <p className="app-kicker">{copy.hero.eyebrow}</p>
                <h2 className="text-lg font-semibold tracking-tight text-app-text">
                  {isLeadView ? copy.hero.leadTitle : copy.hero.employeeTitle}
                </h2>
                <p className="max-w-3xl text-[13px] leading-6 text-app-text-muted">
                  {heroSummary}
                </p>
              </div>

              <Badge className="inline-flex items-center gap-1.5 bg-app-surface px-3 py-1.5 text-[12px] font-semibold text-app-text">
                <CalendarIcon className="h-4 w-4" />
                {copy.hero.todayLabel}: {formatDate(data.today, undefined, language)}
              </Badge>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <DistributionCard
                title={copy.hero.reportHealth}
                items={reportItems}
                total={reportCoverageTotal}
              />
              <DistributionCard
                title={copy.hero.taskHealth}
                items={planItems}
                total={Math.max(data.metrics.openPlans, 1)}
              />
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <section className="rounded-2xl border border-app-border bg-app-surface px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="app-kicker">
                      {isLeadView ? copy.focus.leadEyebrow : copy.focus.employeeEyebrow}
                    </p>
                    <h3 className="mt-2 text-sm font-semibold text-app-text">
                      {isLeadView ? copy.focus.leadTitle : copy.focus.employeeTitle}
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-app-surface-muted px-3 py-1 text-[12px] font-medium text-app-text">
                    <StatusIcon className="h-4 w-4" />
                    {isLeadView ? `${data.metrics.submissionRate}%` : copy.hero.submitted}
                  </span>
                </div>

                {isLeadView ? (
                  data.missingEmployees.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {data.missingEmployees.slice(0, 5).map((employee) => (
                        <div
                          key={employee.id}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-app-border bg-app-bg-elevated px-3 py-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-app-text">
                              {employee.full_name}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-app-text-muted">
                              <span>{employee.title ?? copy.focus.noTitle}</span>
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
                            className="text-[12px] font-semibold text-app-accent"
                          >
                            {copy.attention.viewProfile}
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                      {copy.focus.allSubmitted}
                    </div>
                  )
                ) : data.ownTodayReport ? (
                  <div className="mt-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-app-border bg-app-bg-elevated px-3 py-3">
                      <div>
                        <p className="text-sm font-semibold text-app-text">
                          {formatDate(data.ownTodayReport.report_date, undefined, language)}
                        </p>
                        <p className="mt-1 text-[12px] text-app-text-muted">
                          {formatDateTime(data.ownTodayReport.updated_at, language)}
                        </p>
                      </div>
                      <ReportStatusBadge status={data.ownTodayReport.status} language={language} />
                    </div>

                    <div className="grid gap-3">
                      <div className="rounded-2xl border border-app-border bg-app-bg-elevated px-3 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                          {copy.focus.currentWork}
                        </p>
                        <p className="mt-2 text-[13px] leading-6 text-app-text">
                          {truncate(data.ownTodayReport.current_work, 170)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-app-border bg-app-bg-elevated px-3 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                          {copy.focus.nextPlan}
                        </p>
                        <p className="mt-2 text-[13px] leading-6 text-app-text">
                          {truncate(data.ownTodayReport.next_plan, 170)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-app-border bg-app-bg-elevated px-3 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                          {copy.focus.blockers}
                        </p>
                        <p className="mt-2 text-[13px] leading-6 text-app-text">
                          {data.ownTodayReport.blockers?.trim()
                            ? truncate(data.ownTodayReport.blockers, 170)
                            : copy.attention.noPersonalBlockers}
                        </p>
                      </div>
                    </div>

                    <Link href="/reports" className="text-sm font-semibold text-app-accent">
                      {copy.focus.editReport}
                    </Link>
                  </div>
                ) : (
                  <div className="mt-4">
                    <EmptyState
                      title={copy.focus.emptyTitle}
                      description={copy.focus.emptyDescription}
                      action={
                        <Link href="/reports" className="app-button">
                          {copy.focus.submitReport}
                        </Link>
                      }
                    />
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-app-border bg-app-surface px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="app-kicker">{copy.attention.title}</p>
                    <h3 className="mt-2 text-sm font-semibold text-app-text">
                      {isLeadView
                        ? copy.attention.leadDescription
                        : copy.attention.employeeDescription}
                    </h3>
                  </div>
                  <span className="app-icon-button h-9 w-9">
                    <AlertTriangleIcon className="h-4 w-4" />
                  </span>
                </div>

                {isLeadView ? (
                  <div className="mt-4 space-y-4">
                    <div className="space-y-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                        {copy.attention.blockedReports}
                      </p>
                      {data.blockedReports.length > 0 ? (
                        data.blockedReports.slice(0, 3).map((report) => (
                          <button
                            key={report.id}
                            type="button"
                            className="w-full rounded-2xl border border-app-border bg-app-bg-elevated px-3 py-3 text-left transition hover:border-app-border-strong"
                            onClick={() => openReportDetail(report)}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-app-text">
                                  {report.employee?.full_name ?? copy.reports.unknownEmployee}
                                </p>
                                <p className="mt-1 text-[12px] text-app-text-muted">
                                  {truncate(report.blockers?.trim() || report.currentWork, 78)}
                                </p>
                              </div>
                              <ReportStatusBadge status={report.status} language={language} />
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-app-border bg-app-bg-elevated px-3 py-3 text-[13px] text-app-text-muted">
                          {copy.attention.noBlockedReports}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                        {copy.attention.urgentPlans}
                      </p>
                      {data.urgentPlans.length > 0 ? (
                        data.urgentPlans.slice(0, 3).map((plan) => {
                          const dueTone = getDueTone(plan.dueDate, data.today, dueSoonThreshold);
                          const dueLabel = getDueLabel(
                            plan.dueDate,
                            data.today,
                            dueSoonThreshold,
                            copy.plans.overdue,
                            copy.plans.dueSoon,
                          );

                          return (
                            <Link
                              key={plan.id}
                              href="/plans"
                              className="block rounded-2xl border border-app-border bg-app-bg-elevated px-3 py-3 transition hover:border-app-border-strong"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="app-line-clamp-2 text-sm font-semibold text-app-text">
                                    {plan.title}
                                  </p>
                                  <p className="mt-1 text-[12px] text-app-text-muted">
                                    {plan.assignee?.full_name ?? copy.plans.noAssignee}
                                  </p>
                                </div>
                                <div className="flex flex-wrap justify-end gap-2">
                                  {dueLabel ? (
                                    <Badge tone={dueTone === "danger" ? "danger" : "warning"}>
                                      {dueLabel}
                                    </Badge>
                                  ) : null}
                                  <PlanStatusBadge status={plan.status} language={language} />
                                </div>
                              </div>
                            </Link>
                          );
                        })
                      ) : (
                        <div className="rounded-2xl border border-app-border bg-app-bg-elevated px-3 py-3 text-[13px] text-app-text-muted">
                          {copy.attention.noUrgentPlans}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    <div className="space-y-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                        {copy.attention.personalBlockers}
                      </p>
                      {data.ownTodayReport?.blockers?.trim() ? (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-3 text-[13px] leading-6 text-rose-800">
                          {data.ownTodayReport.blockers}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-app-border bg-app-bg-elevated px-3 py-3 text-[13px] text-app-text-muted">
                          {copy.attention.noPersonalBlockers}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                        {copy.attention.urgentPlans}
                      </p>
                      {personalUrgentPlans.length > 0 ? (
                        personalUrgentPlans.slice(0, 3).map((plan) => {
                          const dueTone = getDueTone(plan.dueDate, data.today, dueSoonThreshold);
                          const dueLabel = getDueLabel(
                            plan.dueDate,
                            data.today,
                            dueSoonThreshold,
                            copy.plans.overdue,
                            copy.plans.dueSoon,
                          );

                          return (
                            <Link
                              key={plan.id}
                              href="/plans"
                              className="block rounded-2xl border border-app-border bg-app-bg-elevated px-3 py-3 transition hover:border-app-border-strong"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="app-line-clamp-2 text-sm font-semibold text-app-text">
                                    {plan.title}
                                  </p>
                                  <p className="mt-1 text-[12px] text-app-text-muted">
                                    {plan.dueDate
                                      ? formatDate(plan.dueDate, undefined, language)
                                      : copy.plans.noDeadline}
                                  </p>
                                </div>
                                <div className="flex flex-wrap justify-end gap-2">
                                  {dueLabel ? (
                                    <Badge tone={dueTone === "danger" ? "danger" : "warning"}>
                                      {dueLabel}
                                    </Badge>
                                  ) : null}
                                  <PlanStatusBadge status={plan.status} language={language} />
                                </div>
                              </div>
                            </Link>
                          );
                        })
                      ) : (
                        <div className="rounded-2xl border border-app-border bg-app-bg-elevated px-3 py-3 text-[13px] text-app-text-muted">
                          {copy.attention.noUrgentPlans}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>

          <aside className="space-y-4">
            <section className="rounded-[28px] border border-app-border bg-app-surface px-4 py-4">
              <div className="space-y-1">
                <p className="app-kicker">{copy.quickActions.title}</p>
                <h3 className="text-sm font-semibold text-app-text">
                  {copy.quickActions.description}
                </h3>
              </div>
              <div className="mt-4 grid gap-3">
                {actionTiles.map((tile) => (
                  <ActionTile
                    key={tile.href}
                    href={tile.href}
                    title={tile.title}
                    description={tile.description}
                    icon={tile.icon}
                  />
                ))}
              </div>
            </section>

            {isLeadView ? (
              <section className="rounded-[28px] border border-app-border bg-app-surface px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="app-kicker">{copy.attention.missingReports}</p>
                    <h3 className="mt-2 text-sm font-semibold text-app-text">
                      {data.metrics.pendingToday} {copy.hero.awaiting.toLowerCase()}
                    </h3>
                  </div>
                  <span className="app-icon-button h-9 w-9">
                    <DashboardIcon className="h-4 w-4" />
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {data.missingEmployees.length > 0 ? (
                    data.missingEmployees.slice(0, 4).map((employee) => (
                      <div
                        key={employee.id}
                        className="rounded-2xl border border-app-border bg-app-bg-elevated px-3 py-3"
                      >
                        <p className="text-sm font-semibold text-app-text">{employee.full_name}</p>
                        <p className="mt-1 text-[12px] text-app-text-muted">
                          {employee.department ?? copy.reports.noDepartment}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-app-border bg-app-bg-elevated px-3 py-3 text-[13px] text-app-text-muted">
                      {copy.attention.noMissingReports}
                    </div>
                  )}
                </div>
              </section>
            ) : (
              <section className="rounded-[28px] border border-app-border bg-app-surface px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="app-kicker">{copy.plans.eyebrow}</p>
                    <h3 className="mt-2 text-sm font-semibold text-app-text">
                      {copy.plans.employeeTitle}
                    </h3>
                  </div>
                  <span className="app-icon-button h-9 w-9">
                    <PlansIcon className="h-4 w-4" />
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                  <div className="rounded-2xl border border-app-border bg-app-bg-elevated px-3 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                      {copy.highlights.myOpenPlans.label}
                    </p>
                    <p className="mt-2 text-xl font-semibold text-app-text">
                      {data.ownPlanMetrics.active}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-app-border bg-app-bg-elevated px-3 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                      {copy.highlights.dueSoon.label}
                    </p>
                    <p className="mt-2 text-xl font-semibold text-app-text">
                      {data.ownPlanMetrics.dueSoon}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-app-border bg-app-bg-elevated px-3 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                      {copy.highlights.myBlocked.label}
                    </p>
                    <p className="mt-2 text-xl font-semibold text-app-text">
                      {data.ownPlanMetrics.blocked}
                    </p>
                  </div>
                </div>
              </section>
            )}
          </aside>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <section className="app-panel p-4 md:p-5">
          <div className="flex items-center justify-between gap-3 border-b border-app-border pb-4">
            <div>
              <p className="app-kicker">
                {isLeadView ? copy.reports.leadEyebrow : copy.reports.employeeEyebrow}
              </p>
              <h2 className="mt-2 text-lg font-semibold tracking-tight text-app-text">
                {isLeadView ? copy.reports.leadTitle : copy.reports.employeeTitle}
              </h2>
            </div>
            <Link href="/reports" className="text-sm font-semibold text-app-accent">
              {copy.reports.viewAll}
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {reportFeed.length > 0 ? (
              reportFeed.map((report) => {
                const isTeamReport = "completedWork" in report;

                return (
                  <button
                    key={report.id}
                    type="button"
                    onClick={() => openReportDetail(report)}
                    className="w-full rounded-2xl border border-app-border bg-app-bg-elevated px-4 py-3 text-left transition hover:border-app-border-strong"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold text-app-text">
                            {isTeamReport
                              ? report.employee?.full_name ?? copy.reports.unknownEmployee
                              : formatDate(report.report_date, undefined, language)}
                          </p>
                          {isTeamReport && report.employee?.profile_status ? (
                            <ProfileStatusBadge
                              status={report.employee.profile_status}
                              className="max-w-36 truncate"
                            />
                          ) : null}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-app-text-muted">
                          <span>
                            {isTeamReport
                              ? report.employee?.title ?? copy.reports.noTitle
                              : copy.reports.updated}
                          </span>
                          <span>{isTeamReport ? "•" : ""}</span>
                          <span>
                            {formatDateTime(
                              isTeamReport ? report.updatedAt : report.updated_at,
                              language,
                            )}
                          </span>
                        </div>
                      </div>
                      <ReportStatusBadge
                        status={report.status}
                        language={language}
                      />
                    </div>

                    <p className="mt-3 text-[13px] leading-6 text-app-text-muted">
                      {truncate(
                        isTeamReport ? report.completedWork : report.completed_work,
                        170,
                      )}
                    </p>
                  </button>
                );
              })
            ) : (
              <EmptyState
                title={copy.reports.emptyTitle}
                description={copy.reports.emptyDescription}
              />
            )}
          </div>
        </section>

        <section className="app-panel p-4 md:p-5">
          <div className="flex items-center justify-between gap-3 border-b border-app-border pb-4">
            <div>
              <p className="app-kicker">{copy.plans.eyebrow}</p>
              <h2 className="mt-2 text-lg font-semibold tracking-tight text-app-text">
                {isLeadView ? copy.plans.leadTitle : copy.plans.employeeTitle}
              </h2>
            </div>
            <Link href="/plans" className="text-sm font-semibold text-app-accent">
              {copy.plans.pageLink}
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {planFeed.length > 0 ? (
              planFeed.map((plan) => {
                const dueLabel = getDueLabel(
                  plan.dueDate,
                  data.today,
                  dueSoonThreshold,
                  copy.plans.overdue,
                  copy.plans.dueSoon,
                );
                const dueTone = getDueTone(plan.dueDate, data.today, dueSoonThreshold);

                return (
                  <Link
                    key={plan.id}
                    href="/plans"
                    className="block rounded-2xl border border-app-border bg-app-bg-elevated px-4 py-3 transition hover:border-app-border-strong"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="app-line-clamp-2 text-sm font-semibold text-app-text">
                          {plan.title}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-app-text-muted">
                          {isLeadView ? (
                            <span>{plan.assignee?.full_name ?? copy.plans.noAssignee}</span>
                          ) : null}
                          {plan.assignee?.title ? <span>{plan.assignee.title}</span> : null}
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-end gap-2">
                        {dueLabel ? (
                          <Badge tone={dueTone === "danger" ? "danger" : "warning"}>
                            {dueLabel}
                          </Badge>
                        ) : null}
                        <PriorityBadge priority={plan.priority} language={language} />
                        <PlanStatusBadge status={plan.status} language={language} />
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-app-text-subtle">
                      <CalendarIcon className="h-4 w-4" />
                      <span>
                        {plan.dueDate
                          ? formatDate(plan.dueDate, undefined, language)
                          : copy.plans.noDeadline}
                      </span>
                    </div>
                  </Link>
                );
              })
            ) : (
              <EmptyState
                title={
                  isLeadView
                    ? copy.plans.emptyLeadTitle
                    : copy.plans.emptyEmployeeTitle
                }
                description={
                  isLeadView
                    ? copy.plans.emptyLeadDescription
                    : copy.plans.emptyEmployeeDescription
                }
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
