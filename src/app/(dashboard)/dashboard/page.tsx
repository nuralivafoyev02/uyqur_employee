import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { PlanStatusBadge, PriorityBadge, ReportStatusBadge } from "@/components/ui/badges";
import { getDashboardData } from "@/lib/queries/dashboard";
import { hasRole, requireViewer } from "@/lib/auth";
import { formatDate, formatDateTime, truncate } from "@/lib/utils";

export default async function DashboardPage() {
  const viewer = await requireViewer();
  const data = await getDashboardData(viewer);
  const isLeadView = hasRole(viewer.role, ["admin", "manager"]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title={
          isLeadView
            ? "Jamoa faoliyati overview"
            : `Xush kelibsiz, ${viewer.full_name.split(" ")[0]}`
        }
        description={
          isLeadView
            ? "Bugungi holat, xodim kesimidagi hisobotlar va ochiq vazifalar bir ekranda."
            : "Bugungi hisobot, faol vazifalar va so'nggi update'lar shu yerda jamlangan."
        }
        actions={
          <Link href="/reports" className="app-button">
            Bugungi hisobot
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Jami xodimlar"
          value={data.metrics.totalEmployees}
          helper="Tizimda faol profillar soni"
        />
        <MetricCard
          label="Bugun topshirilgan"
          value={data.metrics.submittedToday}
          helper="Bugungi hisobot yuborgan xodimlar"
        />
        <MetricCard
          label="Kutilayotgan hisobotlar"
          value={data.metrics.pendingToday}
          helper="Bugun hali report topshirmaganlar"
        />
        <MetricCard
          label="Ochiq vazifalar"
          value={data.metrics.openPlans}
          helper="Tugallanmagan plans/tasks"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_minmax(0,0.85fr)]">
        <section className="app-panel p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="app-kicker">
                {isLeadView ? "Latest Reports" : "Mening hisobotlarim"}
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-app-text">
                {isLeadView ? "So'nggi yangilanishlar" : "So'nggi activity"}
              </h2>
            </div>
            <Link href="/reports" className="text-sm font-medium text-app-accent">
              {"Barchasini ko'rish"}
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
                          {report.employee?.full_name ?? "Noma'lum xodim"}
                        </p>
                        <p className="text-sm text-app-text-muted">
                          {report.employee?.title ?? "Lavozim ko'rsatilmagan"}
                        </p>
                      </div>
                      <ReportStatusBadge status={report.status} />
                    </div>
                    <p className="mt-4 text-sm leading-6 text-app-text-muted">
                      {truncate(report.completedWork, 160)}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-app-text-subtle">
                      <span>{formatDate(report.reportDate)}</span>
                      <span>{formatDateTime(report.updatedAt)}</span>
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
                      <p className="font-semibold text-app-text">{formatDate(report.report_date)}</p>
                      <ReportStatusBadge status={report.status} />
                    </div>
                    <p className="mt-4 text-sm leading-6 text-app-text-muted">
                      {truncate(report.completed_work, 170)}
                    </p>
                  </article>
                ))
              )
            ) : (
              <EmptyState
                title="Hisobotlar hali yo'q"
                description="Daily reports yuborilgach shu yerda ko'rinadi."
              />
            )}
          </div>
        </section>

        <div className="space-y-6">
          <section className="app-panel p-6">
            <p className="app-kicker">
              {isLeadView ? "Coverage" : "Bugungi hisobot holati"}
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-app-text">
              {isLeadView ? "Topshirilmagan hisobotlar" : "Bugungi status"}
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
                        <p className="text-sm text-app-text-muted">
                          {employee.title ?? "Lavozim ko'rsatilmagan"}
                        </p>
                      </div>
                      <Link
                        href={`/employees/${employee.id}`}
                        className="text-sm font-medium text-app-accent"
                      >
                        Profil
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                  {"Bugungi hisobotlar to'liq topshirilgan."}
                </div>
              )
            ) : data.ownTodayReport ? (
              <div className="mt-6 space-y-4 rounded-2xl border border-app-border bg-app-bg-elevated p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold text-app-text">
                    {formatDate(data.ownTodayReport.report_date)}
                  </p>
                  <ReportStatusBadge status={data.ownTodayReport.status} />
                </div>
                <p className="text-sm leading-6 text-app-text-muted">
                  {truncate(data.ownTodayReport.current_work, 180)}
                </p>
                <Link href="/reports" className="text-sm font-medium text-app-accent">
                  Hisobotni tahrirlash
                </Link>
              </div>
            ) : (
              <div className="mt-6">
                <EmptyState
                  title="Bugungi hisobot hali topshirilmadi"
                  description="2-3 maydonni to'ldirib, joriy holatni jamoaga ko'rsating."
                  action={
                    <Link href="/reports" className="app-button">
                      Hisobot yuborish
                    </Link>
                  }
                />
              </div>
            )}
          </section>

          <section className="app-panel p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="app-kicker">Plans</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-app-text">
                  Faol vazifalar
                </h2>
              </div>
              <Link href="/plans" className="text-sm font-medium text-app-accent">
                Plans sahifasi
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
                        <PriorityBadge priority={plan.priority} />
                        <PlanStatusBadge status={plan.status} />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-app-text-muted">
                      <span>{plan.assignee?.full_name ?? viewer.full_name}</span>
                      <span>{plan.dueDate ? formatDate(plan.dueDate) : "Deadline yo'q"}</span>
                    </div>
                  </article>
                ))
              ) : (
                <EmptyState
                  title="Faol vazifa topilmadi"
                  description="Plans qo'shilgach shu blokda ko'rinadi."
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
