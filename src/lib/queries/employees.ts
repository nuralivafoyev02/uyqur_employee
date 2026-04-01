import { hasRole } from "@/lib/auth";
import { SUPABASE_SETUP_MESSAGE } from "@/lib/supabase/config";
import { createServerComponentClient } from "@/lib/supabase/server";
import { escapeLikeQuery } from "@/lib/utils";
import type { DailyReport, Plan, Profile, Viewer } from "@/types/database";

const EMPLOYEE_PAGE_SIZE = 12;

type EmployeeFilters = {
  q?: string;
  role?: string;
  department?: string;
  page?: string;
};

type EmployeeListItem = Pick<
  Profile,
  "id" | "full_name" | "title" | "department" | "role"
> & {
  lastReportDate: string | null;
  openPlanCount: number;
};

export type EmployeesPageData = {
  filters: {
    q: string;
    role: Profile["role"] | "";
    department: string;
    page: number;
  };
  employees: EmployeeListItem[];
  departments: string[];
  totalCount: number;
  pageCount: number;
};

export type EmployeeProfileData = {
  profile: Profile;
  reportHistory: Array<
    Pick<
      DailyReport,
      | "id"
      | "report_date"
      | "completed_work"
      | "current_work"
      | "next_plan"
      | "blockers"
      | "status"
      | "updated_at"
    >
  >;
  plans: Array<
    Pick<Plan, "id" | "title" | "description" | "due_date" | "status" | "priority">
  >;
  stats: {
    totalReports: number;
    blockedReports: number;
    activePlans: number;
  };
};

function normalizeRole(value: string | undefined) {
  return value === "admin" || value === "manager" || value === "employee"
    ? value
    : "";
}

function normalizePage(value: string | undefined) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? Math.floor(numeric) : 1;
}

export async function getEmployeesPageData(
  viewer: Viewer,
  filters: EmployeeFilters,
): Promise<EmployeesPageData> {
  const supabase = await createServerComponentClient();

  if (!supabase) {
    throw new Error(SUPABASE_SETUP_MESSAGE);
  }

  if (!hasRole(viewer.role, ["admin", "manager"])) {
    return {
      filters: {
        q: "",
        role: "",
        department: "",
        page: 1,
      },
      employees: [],
      departments: [],
      totalCount: 0,
      pageCount: 1,
    };
  }

  const q = filters.q?.trim() ?? "";
  const role = normalizeRole(filters.role);
  const department = filters.department?.trim() ?? "";
  const page = normalizePage(filters.page);
  const from = (page - 1) * EMPLOYEE_PAGE_SIZE;
  const to = from + EMPLOYEE_PAGE_SIZE - 1;

  let employeesQuery = supabase
    .from("profiles")
    .select("id, full_name, title, department, role", {
      count: "exact",
    })
    .order("full_name")
    .range(from, to);

  if (q) {
    const safeQuery = escapeLikeQuery(q);
    employeesQuery = employeesQuery.or(
      `full_name.ilike.%${safeQuery}%,title.ilike.%${safeQuery}%,department.ilike.%${safeQuery}%`,
    );
  }

  if (role) {
    employeesQuery = employeesQuery.eq("role", role);
  }

  if (department) {
    employeesQuery = employeesQuery.eq("department", department);
  }

  const [employeesRes, departmentsRes] = await Promise.all([
    employeesQuery,
    supabase
      .from("profiles")
      .select("department")
      .not("department", "is", null)
      .order("department"),
  ]);

  const employees = (employeesRes.data ?? []) as Array<
    Pick<Profile, "id" | "full_name" | "title" | "department" | "role">
  >;

  const ids = employees.map((employee) => employee.id);

  const [reportsRes, plansRes] = await Promise.all([
    ids.length > 0
      ? supabase
          .from("daily_reports")
          .select("employee_id, report_date")
          .in("employee_id", ids)
          .order("report_date", { ascending: false })
      : Promise.resolve({
          data: [] as Array<Pick<DailyReport, "employee_id" | "report_date">>,
        }),
    ids.length > 0
      ? supabase
          .from("plans")
          .select("assignee_id, status")
          .in("assignee_id", ids)
          .neq("status", "done")
      : Promise.resolve({
          data: [] as Array<Pick<Plan, "assignee_id" | "status">>,
        }),
  ]);

  const lastReportByEmployee = new Map<string, string>();

  (reportsRes.data ?? []).forEach((report) => {
    if (!lastReportByEmployee.has(report.employee_id)) {
      lastReportByEmployee.set(report.employee_id, report.report_date);
    }
  });

  const openPlansByEmployee = new Map<string, number>();

  (plansRes.data ?? []).forEach((plan) => {
    openPlansByEmployee.set(
      plan.assignee_id,
      (openPlansByEmployee.get(plan.assignee_id) ?? 0) + 1,
    );
  });

  return {
    filters: {
      q,
      role,
      department,
      page,
    },
    employees: employees.map((employee) => ({
      ...employee,
      lastReportDate: lastReportByEmployee.get(employee.id) ?? null,
      openPlanCount: openPlansByEmployee.get(employee.id) ?? 0,
    })),
    departments: Array.from(
      new Set(
        (departmentsRes.data ?? [])
          .map((item) => item.department)
          .filter((item): item is string => Boolean(item)),
      ),
    ),
    totalCount: employeesRes.count ?? 0,
    pageCount: Math.max(1, Math.ceil((employeesRes.count ?? 0) / EMPLOYEE_PAGE_SIZE)),
  };
}

export async function getEmployeeProfileData(
  viewer: Viewer,
  employeeId: string,
): Promise<EmployeeProfileData | null> {
  const supabase = await createServerComponentClient();

  if (!supabase) {
    throw new Error(SUPABASE_SETUP_MESSAGE);
  }

  if (!hasRole(viewer.role, ["admin", "manager"]) && viewer.id !== employeeId) {
    return null;
  }

  const [profileRes, reportsRes, plansRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, title, department, role, created_at, updated_at")
      .eq("id", employeeId)
      .maybeSingle(),
    supabase
      .from("daily_reports")
      .select(
        "id, report_date, completed_work, current_work, next_plan, blockers, status, updated_at",
      )
      .eq("employee_id", employeeId)
      .order("report_date", { ascending: false })
      .limit(12),
    supabase
      .from("plans")
      .select("id, title, description, due_date, status, priority")
      .eq("assignee_id", employeeId)
      .order("due_date", { ascending: true })
      .limit(12),
  ]);

  if (!profileRes.data) {
    return null;
  }

  const reportHistory = reportsRes.data ?? [];
  const plans = plansRes.data ?? [];

  return {
    profile: profileRes.data,
    reportHistory,
    plans,
    stats: {
      totalReports: reportHistory.length,
      blockedReports: reportHistory.filter((report) => report.status === "blocked")
        .length,
      activePlans: plans.filter((plan) => plan.status !== "done").length,
    },
  };
}

export async function getEmployeesApiData(viewer: Viewer, filters: EmployeeFilters) {
  const data = await getEmployeesPageData(viewer, filters);

  return {
    filters: data.filters,
    pageCount: data.pageCount,
    totalCount: data.totalCount,
    employees: data.employees,
  };
}
