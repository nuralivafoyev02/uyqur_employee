import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  type TelegramDigestOverview,
  type TelegramDigestPlanItem,
  type TelegramDigestReportItem,
} from "@/lib/telegram-digest";
import { getTodayIsoDate } from "@/lib/utils";
import type { Database, DailyReport, Plan, Profile } from "@/types/database";

type DatabaseClient = SupabaseClient<Database>;

type DigestReportRow = Pick<
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
  profiles: Pick<Profile, "id" | "full_name" | "title"> | null;
};

type DigestPlanRow = Pick<
  Plan,
  "id" | "assignee_id" | "title" | "due_date" | "priority" | "updated_at"
> & {
  profiles: Pick<Profile, "id" | "full_name" | "title"> | null;
};

function getNextIsoDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function mapDigestReports(rows: DigestReportRow[]): TelegramDigestReportItem[] {
  return rows.map((report) => ({
    id: report.id,
    employeeId: report.employee_id,
    employeeName: report.profiles?.full_name ?? "Unknown",
    employeeTitle: report.profiles?.title ?? null,
    reportDate: report.report_date,
    status: report.status,
    completedWork: report.completed_work,
    currentWork: report.current_work,
    nextPlan: report.next_plan,
    blockers: report.blockers,
    updatedAt: report.updated_at,
  }));
}

function mapDigestPlans(rows: DigestPlanRow[]): TelegramDigestPlanItem[] {
  return rows.map((plan) => ({
    id: plan.id,
    assigneeId: plan.assignee_id,
    assigneeName: plan.profiles?.full_name ?? "Unknown",
    assigneeTitle: plan.profiles?.title ?? null,
    title: plan.title,
    dueDate: plan.due_date,
    priority: plan.priority,
    updatedAt: plan.updated_at,
  }));
}

export async function loadTelegramDigestOverview(
  supabase: DatabaseClient,
  date = getTodayIsoDate(),
): Promise<TelegramDigestOverview> {
  const nextDate = getNextIsoDate(date);
  const [reportsRes, completedPlansRes] = await Promise.all([
    supabase
      .from("daily_reports")
      .select(
        "id, employee_id, report_date, completed_work, current_work, next_plan, blockers, status, updated_at, profiles!daily_reports_employee_id_fkey(id, full_name, title)",
      )
      .eq("report_date", date)
      .order("updated_at", { ascending: false }),
    supabase
      .from("plans")
      .select(
        "id, assignee_id, title, due_date, priority, updated_at, profiles!plans_assignee_id_fkey(id, full_name, title)",
      )
      .eq("status", "done")
      .gte("updated_at", `${date}T00:00:00`)
      .lt("updated_at", `${nextDate}T00:00:00`)
      .order("updated_at", { ascending: false }),
  ]);

  if (reportsRes.error) {
    throw new Error(reportsRes.error.message);
  }

  if (completedPlansRes.error) {
    throw new Error(completedPlansRes.error.message);
  }

  return {
    date,
    reports: mapDigestReports((reportsRes.data ?? []) as unknown as DigestReportRow[]),
    completedPlans: mapDigestPlans(
      (completedPlansRes.data ?? []) as unknown as DigestPlanRow[],
    ),
  };
}
