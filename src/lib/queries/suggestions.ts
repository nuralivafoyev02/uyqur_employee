import { hasRole } from "@/lib/auth";
import { SUPABASE_SETUP_MESSAGE } from "@/lib/supabase/config";
import { createServerComponentClient } from "@/lib/supabase/server";
import { escapeLikeQuery } from "@/lib/utils";
import type { Profile, Suggestion, SuggestionStatus, Viewer } from "@/types/database";

const SUGGESTION_PAGE_SIZE = 18;

type SuggestionFilters = {
  q?: string;
  status?: string;
  employeeId?: string;
  page?: string;
};

type SuggestionRow = Pick<
  Suggestion,
  "id" | "employee_id" | "title" | "description" | "status" | "created_at" | "updated_at"
> & {
  profiles: Pick<Profile, "id" | "full_name" | "title" | "department"> | null;
};

export type SuggestionListItem = {
  id: string;
  employeeId: string;
  title: string;
  description: string | null;
  status: SuggestionStatus;
  createdAt: string;
  updatedAt: string;
  employee: Pick<Profile, "id" | "full_name" | "title" | "department"> | null;
};

export type SuggestionsPageData = {
  filters: {
    q: string;
    status: SuggestionStatus | "";
    employeeId: string;
    page: number;
  };
  suggestions: SuggestionListItem[];
  employees: Array<Pick<Profile, "id" | "full_name" | "title" | "department" | "role">>;
  totalCount: number;
  pageCount: number;
  isLeadView: boolean;
  stats: {
    total: number;
    fresh: number;
    accepted: number;
    prepared: number;
    canceled: number;
  };
};

function normalizeStatus(value: string | undefined) {
  return value === "new" ||
    value === "accepted" ||
    value === "prepared" ||
    value === "canceled"
    ? value
    : "";
}

function normalizePage(value: string | undefined) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? Math.floor(numeric) : 1;
}

function mapSuggestions(rows: SuggestionRow[]) {
  return rows.map(
    (row): SuggestionListItem => ({
      id: row.id,
      employeeId: row.employee_id,
      title: row.title,
      description: row.description,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      employee: row.profiles,
    }),
  );
}

export async function getSuggestionsPageData(
  viewer: Viewer,
  filters: SuggestionFilters,
): Promise<SuggestionsPageData> {
  const supabase = await createServerComponentClient();

  if (!supabase) {
    throw new Error(SUPABASE_SETUP_MESSAGE);
  }

  const isLeadView = hasRole(viewer.role, ["admin", "manager"]);
  const q = filters.q?.trim() ?? "";
  const status = normalizeStatus(filters.status);
  const employeeId = filters.employeeId?.trim() ?? "";
  const page = normalizePage(filters.page);
  const from = (page - 1) * SUGGESTION_PAGE_SIZE;
  const to = from + SUGGESTION_PAGE_SIZE - 1;

  let suggestionsQuery = supabase
    .from("suggestions")
    .select(
      "id, employee_id, title, description, status, created_at, updated_at, profiles!suggestions_employee_id_fkey(id, full_name, title, department)",
      {
        count: "exact",
      },
    )
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (status) {
    suggestionsQuery = suggestionsQuery.eq("status", status);
  }

  if (isLeadView && employeeId) {
    suggestionsQuery = suggestionsQuery.eq("employee_id", employeeId);
  }

  const sanitizedQuery = escapeLikeQuery(q);

  if (sanitizedQuery) {
    const pattern = `%${sanitizedQuery.split(/\s+/).filter(Boolean).join("%")}%`;
    suggestionsQuery = suggestionsQuery.or(`title.ilike.${pattern},description.ilike.${pattern}`);
  }

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

  const [suggestionsRes, employeesRes, totalRes, newRes, acceptedRes, preparedRes, canceledRes] =
    await Promise.all([
      suggestionsQuery,
      employeesPromise,
      supabase.from("suggestions").select("id", { count: "exact", head: true }),
      supabase.from("suggestions").select("id", { count: "exact", head: true }).eq("status", "new"),
      supabase
        .from("suggestions")
        .select("id", { count: "exact", head: true })
        .eq("status", "accepted"),
      supabase
        .from("suggestions")
        .select("id", { count: "exact", head: true })
        .eq("status", "prepared"),
      supabase
        .from("suggestions")
        .select("id", { count: "exact", head: true })
        .eq("status", "canceled"),
    ]);

  return {
    filters: {
      q,
      status,
      employeeId,
      page,
    },
    suggestions: mapSuggestions((suggestionsRes.data ?? []) as unknown as SuggestionRow[]),
    employees: employeesRes.data ?? [],
    totalCount: suggestionsRes.count ?? 0,
    pageCount: Math.max(1, Math.ceil((suggestionsRes.count ?? 0) / SUGGESTION_PAGE_SIZE)),
    isLeadView,
    stats: {
      total: totalRes.count ?? 0,
      fresh: newRes.count ?? 0,
      accepted: acceptedRes.count ?? 0,
      prepared: preparedRes.count ?? 0,
      canceled: canceledRes.count ?? 0,
    },
  };
}
