import { hasRole } from "@/lib/auth";
import { SUPABASE_SETUP_MESSAGE } from "@/lib/supabase/config";
import { createServerComponentClient } from "@/lib/supabase/server";
import { escapeLikeQuery } from "@/lib/utils";
import type {
  PlanPriority,
  PlanStatus,
  Profile,
  ReportStatus,
  SuggestionStatus,
  UserRole,
  Viewer,
} from "@/types/database";

const SEARCH_LIMIT = 4;

type SearchKind = "report" | "plan" | "suggestion" | "employee";

type SearchReportRow = {
  id: string;
  employee_id: string;
  report_date: string;
  completed_work: string;
  current_work: string;
  next_plan: string;
  status: ReportStatus;
  updated_at: string;
  profiles: Pick<Profile, "id" | "full_name" | "title" | "department"> | null;
};

type SearchPlanRow = {
  id: string;
  assignee_id: string;
  title: string;
  description: string | null;
  priority: PlanPriority;
  status: PlanStatus;
  due_date: string | null;
  updated_at: string;
  profiles: Pick<Profile, "id" | "full_name" | "title" | "department"> | null;
};

type SearchSuggestionRow = {
  id: string;
  employee_id: string;
  title: string;
  description: string | null;
  status: SuggestionStatus;
  updated_at: string;
  profiles: Pick<Profile, "id" | "full_name" | "title" | "department"> | null;
};

type SearchEmployeeRow = Pick<
  Profile,
  "id" | "full_name" | "title" | "department" | "profile_status" | "role" | "updated_at"
>;

export type GlobalSearchResult = {
  id: string;
  kind: SearchKind;
  href: string;
  title: string;
  description: string | null;
  updatedAt: string;
  employeeName?: string | null;
  employeeTitle?: string | null;
  employeeDepartment?: string | null;
  reportDate?: string;
  dueDate?: string | null;
  status?: ReportStatus | PlanStatus | SuggestionStatus;
  role?: UserRole;
  priority?: PlanPriority;
};

export async function searchGlobalData(viewer: Viewer, query: string) {
  const supabase = await createServerComponentClient();

  if (!supabase) {
    throw new Error(SUPABASE_SETUP_MESSAGE);
  }

  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 2) {
    return {
      results: [] as GlobalSearchResult[],
    };
  }

  const safeQuery = escapeLikeQuery(trimmedQuery);
  const queryParts = safeQuery.split(/\s+/).filter(Boolean);

  if (queryParts.length === 0) {
    return {
      results: [] as GlobalSearchResult[],
    };
  }

  const pattern = `%${queryParts.join("%")}%`;
  const isLeadView = hasRole(viewer.role, ["admin", "manager"]);

  let reportsQuery = supabase
    .from("daily_reports")
    .select(
      "id, employee_id, report_date, completed_work, current_work, next_plan, status, updated_at, profiles!daily_reports_employee_id_fkey(id, full_name, title, department)",
    )
    .or(
      `completed_work.ilike.${pattern},current_work.ilike.${pattern},next_plan.ilike.${pattern}`,
    )
    .order("updated_at", { ascending: false })
    .limit(SEARCH_LIMIT);

  let plansQuery = supabase
    .from("plans")
    .select(
      "id, assignee_id, title, description, priority, status, due_date, updated_at, profiles!plans_assignee_id_fkey(id, full_name, title, department)",
    )
    .or(`title.ilike.${pattern},description.ilike.${pattern}`)
    .order("updated_at", { ascending: false })
    .limit(SEARCH_LIMIT);

  let suggestionsQuery = supabase
    .from("suggestions")
    .select(
      "id, employee_id, title, description, status, updated_at, profiles!suggestions_employee_id_fkey(id, full_name, title, department)",
    )
    .or(`title.ilike.${pattern},description.ilike.${pattern}`)
    .order("updated_at", { ascending: false })
    .limit(SEARCH_LIMIT);

  if (!isLeadView) {
    reportsQuery = reportsQuery.eq("employee_id", viewer.id);
    plansQuery = plansQuery.eq("assignee_id", viewer.id);
    suggestionsQuery = suggestionsQuery.eq("employee_id", viewer.id);
  }

  const employeesPromise = isLeadView
    ? supabase
        .from("profiles")
        .select("id, full_name, title, department, profile_status, role, updated_at")
        .or(
          `full_name.ilike.${pattern},title.ilike.${pattern},department.ilike.${pattern},profile_status.ilike.${pattern}`,
        )
        .order("updated_at", { ascending: false })
        .limit(SEARCH_LIMIT)
    : Promise.resolve({
        data: [] as SearchEmployeeRow[],
      });

  const [reportsRes, plansRes, suggestionsRes, employeesRes] = await Promise.all([
    reportsQuery,
    plansQuery,
    suggestionsQuery,
    employeesPromise,
  ]);

  const results: GlobalSearchResult[] = [
    ...((reportsRes.data ?? []) as unknown as SearchReportRow[]).map((report) => {
      const params = new URLSearchParams();
      params.set("date", report.report_date);

      if (isLeadView) {
        params.set("employeeId", report.employee_id);
      }

      return {
        id: report.id,
        kind: "report" as const,
        href: `/reports?${params.toString()}`,
        title: report.profiles?.full_name ?? report.report_date,
        description: report.completed_work,
        updatedAt: report.updated_at,
        employeeName: report.profiles?.full_name,
        employeeTitle: report.profiles?.title,
        employeeDepartment: report.profiles?.department,
        reportDate: report.report_date,
        status: report.status,
      };
    }),
    ...((plansRes.data ?? []) as unknown as SearchPlanRow[]).map((plan) => {
      const params = new URLSearchParams();
      params.set("q", plan.title);
      params.set("status", plan.status);

      if (isLeadView) {
        params.set("employeeId", plan.assignee_id);
      }

      return {
        id: plan.id,
        kind: "plan" as const,
        href: `/plans?${params.toString()}`,
        title: plan.title,
        description: plan.description,
        updatedAt: plan.updated_at,
        employeeName: plan.profiles?.full_name,
        employeeTitle: plan.profiles?.title,
        employeeDepartment: plan.profiles?.department,
        dueDate: plan.due_date,
        status: plan.status,
        priority: plan.priority,
      };
    }),
    ...((suggestionsRes.data ?? []) as unknown as SearchSuggestionRow[]).map((suggestion) => {
      const params = new URLSearchParams();
      params.set("q", suggestion.title);
      params.set("status", suggestion.status);

      if (isLeadView) {
        params.set("employeeId", suggestion.employee_id);
      }

      return {
        id: suggestion.id,
        kind: "suggestion" as const,
        href: `/suggestions?${params.toString()}`,
        title: suggestion.title,
        description: suggestion.description,
        updatedAt: suggestion.updated_at,
        employeeName: suggestion.profiles?.full_name,
        employeeTitle: suggestion.profiles?.title,
        employeeDepartment: suggestion.profiles?.department,
        status: suggestion.status,
      };
    }),
    ...((employeesRes.data ?? []) as unknown as SearchEmployeeRow[]).map((employee) => ({
      id: employee.id,
      kind: "employee" as const,
      href: `/employees/${employee.id}`,
      title: employee.full_name,
      description: employee.profile_status,
      updatedAt: employee.updated_at,
      employeeName: employee.full_name,
      employeeTitle: employee.title,
      employeeDepartment: employee.department,
      role: employee.role,
    })),
  ];

  return { results };
}
