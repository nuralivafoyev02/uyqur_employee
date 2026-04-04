import { hasRole } from "@/lib/auth";
import { SUPABASE_SETUP_MESSAGE } from "@/lib/supabase/config";
import type { TelegramCompletedPlanItem } from "@/lib/telegram-report";
import { createServerComponentClient } from "@/lib/supabase/server";
import { escapeLikeQuery, getTodayIsoDate } from "@/lib/utils";
import type { Plan, PlanPriority, PlanStatus, Profile, Viewer } from "@/types/database";

const PLAN_PAGE_SIZE = 16;

type PlanFilters = {
  q?: string;
  status?: string;
  priority?: string;
  employeeId?: string;
  page?: string;
};

type PlanRow = Pick<
  Plan,
  | "id"
  | "assignee_id"
  | "created_by"
  | "title"
  | "description"
  | "due_date"
  | "status"
  | "priority"
  | "created_at"
  | "updated_at"
> & {
  profiles: Pick<Profile, "id" | "full_name" | "title" | "department"> | null;
};

export type PlanListItem = {
  id: string;
  assigneeId: string;
  createdBy: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: PlanStatus;
  priority: PlanPriority;
  createdAt: string;
  updatedAt: string;
  assignee: Pick<Profile, "id" | "full_name" | "title" | "department"> | null;
};

export type PlansPageData = {
  filters: {
    q: string;
    status: PlanStatus | "";
    priority: PlanPriority | "";
    employeeId: string;
    page: number;
  };
  plans: PlanListItem[];
  employees: Array<Pick<Profile, "id" | "full_name" | "title" | "department" | "role">>;
  telegramCompletedPlans: TelegramCompletedPlanItem[];
  telegramDate: string;
  telegramEmployee: Pick<Profile, "id" | "full_name" | "title"> | null;
  totalCount: number;
  pageCount: number;
  isLeadView: boolean;
  stats: {
    total: number;
    overdue: number;
    inProgress: number;
    done: number;
  };
};

export type TodayCompletedPlansPreviewData = {
  date: string;
  employee: Pick<Profile, "id" | "full_name" | "title"> | null;
  completedPlans: TelegramCompletedPlanItem[];
};

type CompletedPlanRow = {
  id: string;
  title: string;
  due_date: string | null;
  priority: TelegramCompletedPlanItem["priority"];
  updated_at: string;
};

function getNextIsoDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function normalizeStatus(value: string | undefined) {
  return value === "todo" ||
    value === "in_progress" ||
    value === "done" ||
    value === "blocked"
    ? value
    : "";
}

function normalizePriority(value: string | undefined) {
  return value === "low" || value === "medium" || value === "high" ? value : "";
}

function normalizePage(value: string | undefined) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? Math.floor(numeric) : 1;
}

function mapPlans(rows: PlanRow[]) {
  return rows.map(
    (row): PlanListItem => ({
      id: row.id,
      assigneeId: row.assignee_id,
      createdBy: row.created_by,
      title: row.title,
      description: row.description,
      dueDate: row.due_date,
      status: row.status,
      priority: row.priority,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      assignee: row.profiles,
    }),
  );
}

export async function getPlansPageData(
  viewer: Viewer,
  filters: PlanFilters,
): Promise<PlansPageData> {
  const supabase = await createServerComponentClient();

  if (!supabase) {
    throw new Error(SUPABASE_SETUP_MESSAGE);
  }

  const isLeadView = hasRole(viewer.role, ["admin", "manager"]);
  const q = filters.q?.trim() ?? "";
  const status = normalizeStatus(filters.status);
  const priority = normalizePriority(filters.priority);
  const employeeId = filters.employeeId?.trim() ?? "";
  const page = normalizePage(filters.page);
  const from = (page - 1) * PLAN_PAGE_SIZE;
  const to = from + PLAN_PAGE_SIZE - 1;
  const today = getTodayIsoDate();
  const telegramEmployeeId = isLeadView && employeeId ? employeeId : viewer.id;

  let plansQuery = supabase
    .from("plans")
    .select(
      "id, assignee_id, created_by, title, description, due_date, status, priority, created_at, updated_at, profiles!plans_assignee_id_fkey(id, full_name, title, department)",
      {
        count: "exact",
      },
    )
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (q) {
    const pattern = `%${escapeLikeQuery(q).split(/\s+/).filter(Boolean).join("%")}%`;
    plansQuery = plansQuery.or(`title.ilike.${pattern},description.ilike.${pattern}`);
  }

  if (isLeadView) {
    if (status) {
      plansQuery = plansQuery.eq("status", status);
    }

    if (priority) {
      plansQuery = plansQuery.eq("priority", priority);
    }

    if (employeeId) {
      plansQuery = plansQuery.eq("assignee_id", employeeId);
    }
  } else {
    plansQuery = plansQuery.eq("assignee_id", viewer.id);

    if (status) {
      plansQuery = plansQuery.eq("status", status);
    }
  }

  const overdueQuery = supabase
    .from("plans")
    .select("id", { count: "exact", head: true })
    .lt("due_date", today)
    .neq("status", "done");

  const inProgressQuery = supabase
    .from("plans")
    .select("id", { count: "exact", head: true })
    .eq("status", "in_progress");

  const doneQuery = supabase
    .from("plans")
    .select("id", { count: "exact", head: true })
    .eq("status", "done");

  const scopedOverdueQuery = isLeadView
    ? overdueQuery
    : overdueQuery.eq("assignee_id", viewer.id);
  const scopedInProgressQuery = isLeadView
    ? inProgressQuery
    : inProgressQuery.eq("assignee_id", viewer.id);
  const scopedDoneQuery = isLeadView ? doneQuery : doneQuery.eq("assignee_id", viewer.id);

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

  const [plansRes, employeesRes, overdueRes, inProgressRes, doneRes, telegramCompletedPlansRes, telegramEmployeeRes] =
    await Promise.all([
      plansQuery,
      employeesPromise,
      scopedOverdueQuery,
      scopedInProgressQuery,
      scopedDoneQuery,
      supabase
        .from("plans")
        .select("id, title, due_date, priority, updated_at")
        .eq("assignee_id", telegramEmployeeId)
        .eq("status", "done")
        .gte("updated_at", `${today}T00:00:00`)
        .lt("updated_at", `${getNextIsoDate(today)}T00:00:00`)
        .order("updated_at", { ascending: false }),
      telegramEmployeeId === viewer.id
        ? Promise.resolve({
            data: {
              id: viewer.id,
              full_name: viewer.full_name,
              title: viewer.title,
            } satisfies Pick<Profile, "id" | "full_name" | "title">,
          })
        : supabase
            .from("profiles")
            .select("id, full_name, title")
            .eq("id", telegramEmployeeId)
            .maybeSingle(),
    ]);

  return {
    filters: {
      q,
      status,
      priority,
      employeeId,
      page,
    },
    plans: mapPlans((plansRes.data ?? []) as unknown as PlanRow[]),
    employees: employeesRes.data ?? [],
    telegramCompletedPlans: ((telegramCompletedPlansRes.data ?? []) as CompletedPlanRow[]).map(
      (plan) => ({
        id: plan.id,
        title: plan.title,
        dueDate: plan.due_date,
        priority: plan.priority,
        updatedAt: plan.updated_at,
      }),
    ),
    telegramDate: today,
    telegramEmployee: telegramEmployeeRes.data ?? null,
    totalCount: plansRes.count ?? 0,
    pageCount: Math.max(1, Math.ceil((plansRes.count ?? 0) / PLAN_PAGE_SIZE)),
    isLeadView,
    stats: {
      total: plansRes.count ?? 0,
      overdue: overdueRes.count ?? 0,
      inProgress: inProgressRes.count ?? 0,
      done: doneRes.count ?? 0,
    },
  };
}

export async function getTodayCompletedPlansPreview(
  viewer: Viewer,
  employeeId = viewer.id,
): Promise<TodayCompletedPlansPreviewData> {
  const supabase = await createServerComponentClient();

  if (!supabase) {
    throw new Error(SUPABASE_SETUP_MESSAGE);
  }

  const today = getTodayIsoDate();
  const nextDate = getNextIsoDate(today);
  const [completedPlansRes, employeeRes] = await Promise.all([
    supabase
      .from("plans")
      .select("id, title, due_date, priority, updated_at")
      .eq("assignee_id", employeeId)
      .eq("status", "done")
      .gte("updated_at", `${today}T00:00:00`)
      .lt("updated_at", `${nextDate}T00:00:00`)
      .order("updated_at", { ascending: false }),
    employeeId === viewer.id
      ? Promise.resolve({
          data: {
            id: viewer.id,
            full_name: viewer.full_name,
            title: viewer.title,
          } satisfies Pick<Profile, "id" | "full_name" | "title">,
        })
      : supabase
          .from("profiles")
          .select("id, full_name, title")
          .eq("id", employeeId)
          .maybeSingle(),
  ]);

  return {
    date: today,
    employee: employeeRes.data ?? null,
    completedPlans: ((completedPlansRes.data ?? []) as CompletedPlanRow[]).map((plan) => ({
      id: plan.id,
      title: plan.title,
      dueDate: plan.due_date,
      priority: plan.priority,
      updatedAt: plan.updated_at,
    })),
  };
}
