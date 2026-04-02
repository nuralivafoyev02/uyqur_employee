import type { AppLanguage } from "@/lib/preferences";
import { Badge } from "@/components/ui/badge";
import {
  getPlanStatusLabel,
  getPriorityLabel,
  getReportStatusLabel,
  getRoleLabel,
  getSuggestionStatusLabel,
} from "@/lib/utils";
import type {
  PlanPriority,
  PlanStatus,
  ReportStatus,
  SuggestionStatus,
  UserRole,
} from "@/types/database";

export function RoleBadge({
  role,
  language,
}: {
  role: UserRole;
  language?: AppLanguage;
}) {
  const tone =
    role === "admin" ? "danger" : role === "manager" ? "warning" : "neutral";

  return <Badge tone={tone}>{getRoleLabel(role, language)}</Badge>;
}

export function ReportStatusBadge({
  status,
  language,
}: {
  status: ReportStatus;
  language?: AppLanguage;
}) {
  const tone =
    status === "done" ? "success" : status === "blocked" ? "danger" : "info";

  return <Badge tone={tone}>{getReportStatusLabel(status, language)}</Badge>;
}

export function PlanStatusBadge({
  status,
  language,
}: {
  status: PlanStatus;
  language?: AppLanguage;
}) {
  const tone =
    status === "done"
      ? "success"
      : status === "blocked"
        ? "danger"
        : status === "todo"
          ? "warning"
          : "info";

  return <Badge tone={tone}>{getPlanStatusLabel(status, language)}</Badge>;
}

export function PriorityBadge({
  priority,
  language,
}: {
  priority: PlanPriority;
  language?: AppLanguage;
}) {
  const tone =
    priority === "high" ? "danger" : priority === "medium" ? "warning" : "neutral";

  return <Badge tone={tone}>{getPriorityLabel(priority, language)}</Badge>;
}

export function ProfileStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return <Badge className={className}>{status}</Badge>;
}

export function SuggestionStatusBadge({
  status,
  language,
}: {
  status: SuggestionStatus;
  language?: AppLanguage;
}) {
  const tone =
    status === "prepared"
      ? "success"
      : status === "accepted"
        ? "info"
        : status === "canceled"
          ? "danger"
          : "warning";

  return <Badge tone={tone}>{getSuggestionStatusLabel(status, language)}</Badge>;
}
