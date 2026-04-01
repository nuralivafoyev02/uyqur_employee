import Link from "next/link";

import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { RoleBadge } from "@/components/ui/badges";
import { getEmployeesPageData } from "@/lib/queries/employees";
import { requireRole } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

type EmployeesPageProps = {
  searchParams: Promise<{
    q?: string;
    role?: string;
    department?: string;
    page?: string;
  }>;
};

export default async function EmployeesPage({ searchParams }: EmployeesPageProps) {
  const viewer = await requireRole(["admin", "manager"]);
  const filters = await searchParams;
  const data = await getEmployeesPageData(viewer, filters);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Employees"
        title="Xodimlar"
        description="Qidiruv, filter va individual activity history ko'rinishi."
      />

      <section className="app-panel p-6">
        <form className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-app-text" htmlFor="q">
              Qidiruv
            </label>
            <input
              id="q"
              name="q"
              className="app-field"
              defaultValue={data.filters.q}
              placeholder="Ism, lavozim yoki bo'lim"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-app-text" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              name="role"
              className="app-field"
              defaultValue={data.filters.role}
            >
              <option value="">Barchasi</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Xodim</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-app-text" htmlFor="department">
              {"Bo'lim"}
            </label>
            <select
              id="department"
              name="department"
              className="app-field"
              defaultValue={data.filters.department}
            >
              <option value="">Barchasi</option>
              {data.departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end md:col-span-4">
            <button type="submit" className="app-button">
              {"Qo'llash"}
            </button>
          </div>
        </form>
      </section>

      <section className="app-panel p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.employees.map((employee) => (
            <article
              key={employee.id}
              className="rounded-2xl border border-app-border bg-app-bg-elevated p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-app-text">
                    {employee.full_name}
                  </h2>
                  <p className="mt-1 text-sm text-app-text-muted">
                    {employee.title ?? "Lavozim ko'rsatilmagan"}
                  </p>
                </div>
                <RoleBadge role={employee.role} />
              </div>

              <div className="mt-5 grid gap-3 text-sm text-app-text-muted">
                <div className="flex items-center justify-between gap-3">
                  <span>{"Bo'lim"}</span>
                  <span className="font-medium text-app-text">
                    {employee.department ?? "Belgilanmagan"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Oxirgi report</span>
                  <span className="font-medium text-app-text">
                    {employee.lastReportDate ? formatDate(employee.lastReportDate) : "Yo'q"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Ochiq vazifa</span>
                  <span className="font-medium text-app-text">{employee.openPlanCount}</span>
                </div>
              </div>

              <Link href={`/employees/${employee.id}`} className="mt-5 inline-flex text-sm font-medium text-app-accent">
                Profilni ochish
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-6">
          <Pagination
            pathname="/employees"
            page={data.filters.page}
            pageCount={data.pageCount}
            query={{
              ...(data.filters.q ? { q: data.filters.q } : {}),
              ...(data.filters.role ? { role: data.filters.role } : {}),
              ...(data.filters.department ? { department: data.filters.department } : {}),
            }}
          />
        </div>
      </section>
    </div>
  );
}
