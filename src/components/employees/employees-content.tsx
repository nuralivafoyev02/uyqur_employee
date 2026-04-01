"use client";

import Link from "next/link";

import { usePreferences } from "@/components/providers/preferences-provider";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { ProfileStatusBadge, RoleBadge } from "@/components/ui/badges";
import { getEmployeesCopy } from "@/lib/employees-copy";
import { formatDate, getRoleLabel } from "@/lib/utils";
import type { EmployeesPageData } from "@/lib/queries/employees";

type EmployeesContentProps = {
  data: EmployeesPageData;
};

export function EmployeesContent({ data }: EmployeesContentProps) {
  const { language } = usePreferences();
  const copy = getEmployeesCopy(language);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={copy.list.header.eyebrow}
        title={copy.list.header.title}
        description={copy.list.header.description}
      />

      <section className="app-panel p-6">
        <form className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-app-text" htmlFor="q">
              {copy.list.filters.search}
            </label>
            <input
              id="q"
              name="q"
              className="app-field"
              defaultValue={data.filters.q}
              placeholder={copy.list.filters.searchPlaceholder}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-app-text" htmlFor="role">
              {copy.list.filters.role}
            </label>
            <select id="role" name="role" className="app-field" defaultValue={data.filters.role}>
              <option value="">{copy.list.filters.all}</option>
              <option value="admin">{getRoleLabel("admin", language)}</option>
              <option value="manager">{getRoleLabel("manager", language)}</option>
              <option value="employee">{getRoleLabel("employee", language)}</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-app-text" htmlFor="department">
              {copy.list.filters.department}
            </label>
            <select
              id="department"
              name="department"
              className="app-field"
              defaultValue={data.filters.department}
            >
              <option value="">{copy.list.filters.all}</option>
              {data.departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end md:col-span-4">
            <button type="submit" className="app-button">
              {copy.list.filters.apply}
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
                    {employee.title ?? copy.list.cards.noTitle}
                  </p>
                </div>
                <RoleBadge role={employee.role} language={language} />
              </div>

              <div className="mt-5 grid gap-3 text-sm text-app-text-muted">
                <div className="flex items-center justify-between gap-3">
                  <span>{copy.list.cards.department}</span>
                  <span className="font-medium text-app-text">
                    {employee.department ?? copy.list.cards.unassigned}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>{copy.list.cards.status}</span>
                  {employee.profile_status ? (
                    <ProfileStatusBadge
                      status={employee.profile_status}
                      className="max-w-40 truncate"
                    />
                  ) : (
                    <span className="font-medium text-app-text">
                      {copy.list.cards.statusEmpty}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>{copy.list.cards.lastReport}</span>
                  <span className="font-medium text-app-text">
                    {employee.lastReportDate
                      ? formatDate(employee.lastReportDate, undefined, language)
                      : copy.list.cards.none}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>{copy.list.cards.openTasks}</span>
                  <span className="font-medium text-app-text">{employee.openPlanCount}</span>
                </div>
              </div>

              <Link
                href={`/employees/${employee.id}`}
                className="mt-5 inline-flex text-sm font-medium text-app-accent"
              >
                {copy.list.cards.openProfile}
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-6">
          <Pagination
            pathname="/employees"
            page={data.filters.page}
            pageCount={data.pageCount}
            summaryLabel={copy.list.pagination.summary(data.filters.page, data.pageCount)}
            previousLabel={copy.list.pagination.previous}
            nextLabel={copy.list.pagination.next}
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
