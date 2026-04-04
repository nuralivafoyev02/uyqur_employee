import { hasRole } from "@/lib/auth";
import { SUPABASE_SETUP_MESSAGE } from "@/lib/supabase/config";
import type { TelegramCompletedPlanItem } from "@/lib/telegram-report";
import { createServerComponentClient } from "@/lib/supabase/server";
import { getTodayIsoDate, isValidIsoDate } from "@/lib/utils";
import type {
  DailyReport,
  Profile,
  ReportStatus,
  TelegramDeliveryStatus,
  Viewer,
} from "@/types/database";

const REPORT_PAGE_SIZE = 20;

type ReportRow = Pick<
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

export type ReportsFilters = {
  date?: string;
  status?: string;
  employeeId?: string;
  page?: string;
  editorDate?: string;
  editorEmployeeId?: string;
};

export type ReportListItem = {
  id: string;
  employeeId: string;
  reportDate: string;
  completedWork: string;
  currentWork: string;
  nextPlan: string;
  blockers: string | null;
  status: ReportStatus;
  updatedAt: string;
  employee: Pick<Profile, "id" | "full_name" | "title" | "department" | "profile_status"> | null;
};

type EditorReportRow = Pick<
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
  | "telegram_status"
  | "telegram_payload"
  | "telegram_message_id"
  | "telegram_last_error"
  | "telegram_sent_at"
>;

type CompletedPlanRow = {
  id: string;
  title: string;
  due_date: string | null;
  priority: TelegramCompletedPlanItem["priority"];
  updated_at: string;
};

export type ReportsPageData = {
  editorDate: string;
  editorEmployeeId: string;
  editorRequested: boolean;
  canManageAllReports: boolean;
  viewer: {
    id: string;
    role: Viewer["role"];
  };
  filters: {
    date: string;
    status: ReportStatus | "";
    employeeId: string;
    page: number;
  };
  employees: Array<Pick<Profile, "id" | "full_name" | "title" | "department" | "role">>;
  reportForEditor: Pick<
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
    | "telegram_status"
    | "telegram_payload"
    | "telegram_message_id"
    | "telegram_last_error"
    | "telegram_sent_at"
  > | null;
  reportForEditorCompletedPlans: TelegramCompletedPlanItem[];
  editorEmployee: Pick<Profile, "id" | "full_name" | "title"> | null;
  history: ReportListItem[];
  totalCount: number;
  pageCount: number;
  isLeadView: boolean;
};

function getNextIsoDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function normalizeStatus(value: string | undefined) {
  return value === "done" || value === "in_progress" || value === "blocked"
    ? value
    : "";
}

function normalizePage(value: string | undefined) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? Math.floor(numeric) : 1;
}

function mapReports(rows: ReportRow[]) {
  return rows.map(
    (row): ReportListItem => ({
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

export async function getReportsPageData(
  viewer: Viewer,
  filters: ReportsFilters,
): Promise<ReportsPageData> {
  const supabase = await createServerComponentClient();

  if (!supabase) {
    throw new Error(SUPABASE_SETUP_MESSAGE);
  }

  const isLeadView = hasRole(viewer.role, ["admin", "manager"]);
  const canManageAllReports = viewer.role === "admin";
  const editorDate = isValidIsoDate(filters.editorDate ?? "")
    ? filters.editorDate!
    : getTodayIsoDate();
  const editorRequested = Boolean(filters.editorDate) || Boolean(filters.editorEmployeeId?.trim());
  const page = normalizePage(filters.page);
  const status = normalizeStatus(filters.status);
  const employeeId = filters.employeeId?.trim() ?? "";
  const editorEmployeeId =
    canManageAllReports && filters.editorEmployeeId?.trim()
      ? filters.editorEmployeeId.trim()
      : viewer.id;

  const reportForEditorPromise = supabase
    .from("daily_reports")
    .select(
      "id, employee_id, report_date, completed_work, current_work, next_plan, blockers, status, updated_at, telegram_status, telegram_payload, telegram_message_id, telegram_last_error, telegram_sent_at",
    )
    .eq("employee_id", editorEmployeeId)
    .eq("report_date", editorDate)
    .maybeSingle();

  const employeesPromise = isLeadView
    ? supabase
        .from("profiles")
        .select("id, full_name, title, department, role")
        .order("full_name")
    : Promise.resolve({
        data: [] as Array<
          Pick<Profile, "id" | "full_name" | "title" | "department" | "role">
        >,
      });

  const from = (page - 1) * REPORT_PAGE_SIZE;
  const to = from + REPORT_PAGE_SIZE - 1;

  let historyQuery = supabase
    .from("daily_reports")
    .select(
      "id, employee_id, report_date, completed_work, current_work, next_plan, blockers, status, updated_at, profiles!daily_reports_employee_id_fkey(id, full_name, title, department, profile_status)",
      {
        count: "exact",
      },
    )
    .order("report_date", { ascending: false })
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (isLeadView) {
    if (isValidIsoDate(filters.date ?? "")) {
      historyQuery = historyQuery.eq("report_date", filters.date!);
    }

    if (status) {
      historyQuery = historyQuery.eq("status", status);
    }

    if (employeeId) {
      historyQuery = historyQuery.eq("employee_id", employeeId);
    }
  } else {
    historyQuery = historyQuery.eq("employee_id", viewer.id);

    if (isValidIsoDate(filters.date ?? "")) {
      historyQuery = historyQuery.eq("report_date", filters.date!);
    }

    if (status) {
      historyQuery = historyQuery.eq("status", status);
    }
  }

  const [reportForEditorRes, employeesRes, historyRes] = await Promise.all([
    reportForEditorPromise,
    employeesPromise,
    historyQuery,
  ]);

  const reportForEditor = reportForEditorRes.data as EditorReportRow | null;
  const reportForEditorCompletedPlans = reportForEditor
    ? await supabase
        .from("plans")
        .select("id, title, due_date, priority, updated_at")
        .eq("assignee_id", editorEmployeeId)
        .eq("status", "done")
        .gte("updated_at", `${editorDate}T00:00:00`)
        .lt("updated_at", `${getNextIsoDate(editorDate)}T00:00:00`)
        .order("updated_at", { ascending: false })
    : { data: [] as TelegramCompletedPlanItem[] };

  const totalCount = historyRes.count ?? 0;
  const employees = employeesRes.data ?? [];
  const editorEmployee =
    editorEmployeeId === viewer.id
      ? {
          id: viewer.id,
          full_name: viewer.full_name,
          title: viewer.title,
        }
      : employees.find((employee) => employee.id === editorEmployeeId) ?? null;

  return {
    editorDate,
    editorEmployeeId,
    editorRequested,
    canManageAllReports,
    viewer: {
      id: viewer.id,
      role: viewer.role,
    },
    filters: {
      date: isValidIsoDate(filters.date ?? "") ? filters.date! : "",
      status,
      employeeId,
      page,
    },
    employees,
    reportForEditor,
    reportForEditorCompletedPlans: ((reportForEditorCompletedPlans.data ?? []) as CompletedPlanRow[]).map((plan) => ({
      id: plan.id,
      title: plan.title,
      dueDate: plan.due_date,
      priority: plan.priority,
      updatedAt: plan.updated_at,
    })),
    editorEmployee,
    history: mapReports((historyRes.data ?? []) as unknown as ReportRow[]),
    totalCount,
    pageCount: Math.max(1, Math.ceil(totalCount / REPORT_PAGE_SIZE)),
    isLeadView,
  };
}

export async function getReportsApiData(viewer: Viewer, filters: ReportsFilters) {
  const data = await getReportsPageData(viewer, filters);

  return {
    filters: data.filters,
    pageCount: data.pageCount,
    totalCount: data.totalCount,
    reports: data.history,
  };
}
