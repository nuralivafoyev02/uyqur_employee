import { SUPABASE_SETUP_MESSAGE } from "@/lib/supabase/config";
import { createServerComponentClient } from "@/lib/supabase/server";
import { getTodayIsoDate } from "@/lib/utils";
import type { DailyReport, Plan, Profile, Viewer } from "@/types/database";

type ReportFeedRow = Pick<
  DailyReport,
  | "id"
  | "employee_id"
  | "report_date"
  | "completed_work"
  | "current_work"
  | "next_plan"
  | "blockers"
  | "status"
  | "updated_at"
> & {
  profiles: Pick<Profile, "id" | "full_name" | "title" | "department" | "profile_status"> | null;
};

type PlanFeedRow = Pick<
  Plan,
  "id" | "assignee_id" | "title" | "due_date" | "status" | "priority"
> & {
  profiles: Pick<Profile, "id" | "full_name" | "title"> | null;
};

type OpenPlanSummaryRow = Pick<Plan, "id" | "assignee_id" | "due_date" | "status">;

type SummaryProfile = Pick<
  Profile,
  "id" | "full_name" | "title" | "department" | "profile_status" | "role"
>;

export type ReportFeedItem = {
  id: string;
  employeeId: string;
  reportDate: string;
  completedWork: string;
  currentWork: string;
  nextPlan: string;
  blockers: string | null;
  status: DailyReport["status"];
  updatedAt: string;
  employee: Pick<Profile, "id" | "full_name" | "title" | "department" | "profile_status"> | null;
};

export type PlanFeedItem = {
  id: string;
  assigneeId: string;
  title: string;
  dueDate: string | null;
  status: Plan["status"];
  priority: Plan["priority"];
  assignee: Pick<Profile, "id" | "full_name" | "title"> | null;
};

export type DashboardData = {
  today: string;
  metrics: {
    totalEmployees: number;
    submittedToday: number;
    pendingToday: number;
    blockedToday: number;
    openPlans: number;
    overduePlans: number;
    submissionRate: number;
  };
  reportStatus: {
    done: number;
    inProgress: number;
    blocked: number;
  };
  planStatus: {
    todo: number;
    inProgress: number;
    blocked: number;
  };
  latestReports: ReportFeedItem[];
  blockedReports: ReportFeedItem[];
  activePlans: PlanFeedItem[];
  urgentPlans: PlanFeedItem[];
  missingEmployees: SummaryProfile[];
  employees: SummaryProfile[];
  ownTodayReport: Pick<
    DailyReport,
    | "id"
    | "report_date"
    | "completed_work"
    | "current_work"
    | "next_plan"
    | "blockers"
    | "status"
    | "updated_at"
  > | null;
  ownRecentReports: Array<
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
  ownActivePlans: PlanFeedItem[];
  ownPlanMetrics: {
    active: number;
    blocked: number;
    overdue: number;
    dueSoon: number;
  };
};

function mapReportFeed(rows: ReportFeedRow[]) {
  return rows.map(
    (row): ReportFeedItem => ({
      id: row.id,
      employeeId: row.employee_id,
      reportDate: row.report_date,
      completedWork: row.completed_work,
      currentWork: row.current_work,
      nextPlan: row.next_plan,
      blockers: row.blockers,
      status: row.status,
      updatedAt: row.updated_at,
      employee: row.profiles,
    }),
  );
}

function mapPlanFeed(rows: PlanFeedRow[]) {
  return rows.map(
    (row): PlanFeedItem => ({
      id: row.id,
      assigneeId: row.assignee_id,
      title: row.title,
      dueDate: row.due_date,
      status: row.status,
      priority: row.priority,
      assignee: row.profiles,
    }),
  );
}

function shiftIsoDate(value: string, days: number) {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function isOverdue(dueDate: string | null, today: string) {
  return Boolean(dueDate && dueDate < today);
}

function isDueSoon(dueDate: string | null, today: string, threshold: string) {
  return Boolean(dueDate && dueDate >= today && dueDate <= threshold);
}

export async function getDashboardData(viewer: Viewer): Promise<DashboardData> {
  const supabase = await createServerComponentClient();

  if (!supabase) {
    throw new Error(SUPABASE_SETUP_MESSAGE);
  }

  const today = getTodayIsoDate();
  const dueSoonThreshold = shiftIsoDate(today, 3);

  const [
    employeesRes,
    todayReportsRes,
    latestReportsRes,
    blockedReportsRes,
    openPlansRes,
    activePlansRes,
    urgentPlansRes,
    ownActivePlansRes,
  ] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, title, department, profile_status, role")
        .order("full_name"),
      supabase
        .from("daily_reports")
        .select("id, employee_id, status")
        .eq("report_date", today),
      supabase
        .from("daily_reports")
        .select(
          "id, employee_id, report_date, completed_work, current_work, next_plan, blockers, status, updated_at, profiles!daily_reports_employee_id_fkey(id, full_name, title, department, profile_status)",
        )
        .order("updated_at", { ascending: false })
        .limit(6),
      supabase
        .from("daily_reports")
        .select(
          "id, employee_id, report_date, completed_work, current_work, next_plan, blockers, status, updated_at, profiles!daily_reports_employee_id_fkey(id, full_name, title, department, profile_status)",
        )
        .eq("status", "blocked")
        .order("updated_at", { ascending: false })
        .limit(4),
      supabase
        .from("plans")
        .select("id, assignee_id, due_date, status")
        .neq("status", "done"),
      supabase
        .from("plans")
        .select(
          "id, assignee_id, title, due_date, status, priority, profiles!plans_assignee_id_fkey(id, full_name, title)",
        )
        .neq("status", "done")
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("updated_at", { ascending: false })
        .limit(6),
      supabase
        .from("plans")
        .select(
          "id, assignee_id, title, due_date, status, priority, profiles!plans_assignee_id_fkey(id, full_name, title)",
        )
        .neq("status", "done")
        .or(`status.eq.blocked,due_date.lt.${today}`)
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("updated_at", { ascending: false })
        .limit(6),
      supabase
        .from("plans")
        .select(
          "id, assignee_id, title, due_date, status, priority, profiles!plans_assignee_id_fkey(id, full_name, title)",
        )
        .eq("assignee_id", viewer.id)
        .neq("status", "done")
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("updated_at", { ascending: false })
        .limit(6),
    ]);

  const employees = (employeesRes.data ?? []) as SummaryProfile[];
  const todayReports = (todayReportsRes.data ?? []) as Array<
    Pick<DailyReport, "id" | "employee_id" | "status">
  >;
  const latestReports = mapReportFeed(
    (latestReportsRes.data ?? []) as unknown as ReportFeedRow[],
  );
  const blockedReports = mapReportFeed(
    (blockedReportsRes.data ?? []) as unknown as ReportFeedRow[],
  );
  const openPlanRows = (openPlansRes.data ?? []) as OpenPlanSummaryRow[];
  const activePlans = mapPlanFeed(
    (activePlansRes.data ?? []) as unknown as PlanFeedRow[],
  );
  const urgentPlans = mapPlanFeed(
    (urgentPlansRes.data ?? []) as unknown as PlanFeedRow[],
  );
  const ownActivePlans = mapPlanFeed(
    (ownActivePlansRes.data ?? []) as unknown as PlanFeedRow[],
  );
  const submittedEmployeeIds = new Set(todayReports.map((report) => report.employee_id));
  const ownOpenPlanRows = openPlanRows.filter((plan) => plan.assignee_id === viewer.id);

  const [ownTodayReportRes, ownRecentReportsRes] = await Promise.all([
    supabase
      .from("daily_reports")
      .select(
        "id, report_date, completed_work, current_work, next_plan, blockers, status, updated_at",
      )
      .eq("employee_id", viewer.id)
      .eq("report_date", today)
      .maybeSingle(),
    supabase
      .from("daily_reports")
      .select(
        "id, report_date, completed_work, current_work, next_plan, blockers, status, updated_at",
      )
      .eq("employee_id", viewer.id)
      .order("report_date", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(6),
  ]);

  return {
    today,
    metrics: {
      totalEmployees: employees.length,
      submittedToday: todayReports.length,
      pendingToday: employees.filter((employee) => !submittedEmployeeIds.has(employee.id))
        .length,
      blockedToday: todayReports.filter((report) => report.status === "blocked").length,
      openPlans: openPlanRows.length,
      overduePlans: openPlanRows.filter((plan) => isOverdue(plan.due_date, today)).length,
      submissionRate: employees.length
        ? Math.round((todayReports.length / employees.length) * 100)
        : 0,
    },
    reportStatus: {
      done: todayReports.filter((report) => report.status === "done").length,
      inProgress: todayReports.filter((report) => report.status === "in_progress").length,
      blocked: todayReports.filter((report) => report.status === "blocked").length,
    },
    planStatus: {
      todo: openPlanRows.filter((plan) => plan.status === "todo").length,
      inProgress: openPlanRows.filter((plan) => plan.status === "in_progress").length,
      blocked: openPlanRows.filter((plan) => plan.status === "blocked").length,
    },
    latestReports,
    blockedReports,
    activePlans,
    urgentPlans,
    missingEmployees: employees.filter(
      (employee) => !submittedEmployeeIds.has(employee.id),
    ),
    employees,
    ownTodayReport: ownTodayReportRes.data,
    ownRecentReports: ownRecentReportsRes.data ?? [],
    ownActivePlans,
    ownPlanMetrics: {
      active: ownOpenPlanRows.length,
      blocked: ownOpenPlanRows.filter((plan) => plan.status === "blocked").length,
      overdue: ownOpenPlanRows.filter((plan) => isOverdue(plan.due_date, today)).length,
      dueSoon: ownOpenPlanRows.filter((plan) =>
        isDueSoon(plan.due_date, today, dueSoonThreshold),
      ).length,
    },
  };
}
