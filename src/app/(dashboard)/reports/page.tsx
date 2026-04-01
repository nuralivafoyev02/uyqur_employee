import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { ReportStatusBadge } from "@/components/ui/badges";
import { ReportForm } from "@/components/reports/report-form";
import { getReportsPageData } from "@/lib/queries/reports";
import { requireViewer } from "@/lib/auth";
import { saveReportAction } from "@/lib/actions/reports";
import { formatDate, formatDateTime, truncate } from "@/lib/utils";

type ReportsPageProps = {
  searchParams: Promise<{
    date?: string;
    status?: string;
    employeeId?: string;
    page?: string;
  }>;
};

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const viewer = await requireViewer();
  const filters = await searchParams;
  const data = await getReportsPageData(viewer, filters);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Daily Reports"
        title="Hisobotlar"
        description="Bugungi progress, joriy ishlar va keyingi reja server action orqali saqlanadi."
      />

      <div className="grid gap-6 xl:grid-cols-[0.92fr_minmax(0,1.08fr)]">
        <section className="app-panel p-6">
          <div className="space-y-2">
            <p className="app-kicker">Editor</p>
            <h2 className="text-xl font-semibold tracking-tight text-app-text">
              {formatDate(data.editorDate)}
            </h2>
            <p className="text-sm text-app-text-muted">
              {data.reportForEditor
                ? "Mavjud report tahrirlash holatida ochildi."
                : "Tanlangan sana uchun yangi hisobot yarating."}
            </p>
          </div>

          <div className="mt-6">
            <ReportForm
              action={saveReportAction}
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
                    Sana
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
                    Xodim
                  </label>
                  <select
                    id="employeeId"
                    name="employeeId"
                    className="app-field"
                    defaultValue={data.filters.employeeId}
                  >
                    <option value="">Barchasi</option>
                    {data.employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-app-text" htmlFor="status">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="app-field"
                    defaultValue={data.filters.status}
                  >
                    <option value="">Barchasi</option>
                    <option value="done">Bajarildi</option>
                    <option value="in_progress">Jarayonda</option>
                    <option value="blocked">{"To'siq bor"}</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button type="submit" className="app-button w-full">
                    Filterlash
                  </button>
                </div>
              </form>
            </div>
          ) : null}

          <div className="app-panel p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="app-kicker">{data.isLeadView ? "Report Feed" : "History"}</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-app-text">
                  {data.isLeadView ? "Jamoa hisobotlari" : "Mening hisobotlarim"}
                </h2>
              </div>
              <p className="text-sm text-app-text-muted">{data.totalCount} ta yozuv</p>
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
                            ? report.employee?.full_name ?? "Noma'lum xodim"
                            : formatDate(report.reportDate)}
                        </p>
                        <p className="text-sm text-app-text-muted">
                          {data.isLeadView
                            ? `${formatDate(report.reportDate)} · ${
                                report.employee?.title ?? "Lavozim ko'rsatilmagan"
                              }`
                            : formatDateTime(report.updatedAt)}
                        </p>
                      </div>
                      <ReportStatusBadge status={report.status} />
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                          Bajarilgan ish
                        </p>
                        <p className="mt-2 text-sm leading-6 text-app-text-muted">
                          {truncate(report.completedWork, 150)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                          Joriy ish
                        </p>
                        <p className="mt-2 text-sm leading-6 text-app-text-muted">
                          {truncate(report.currentWork, 150)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-app-text-subtle">
                          Keyingi reja
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
                  {"Tanlangan filter bo'yicha hisobot topilmadi."}
                </div>
              )}
            </div>

            <div className="mt-6">
              <Pagination
                pathname="/reports"
                page={data.filters.page}
                pageCount={data.pageCount}
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
