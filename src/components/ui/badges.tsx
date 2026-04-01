import type { AppLanguage } from "@/lib/preferences";
import { Badge } from "@/components/ui/badge";
import {
  getPlanStatusLabel,
  getPriorityLabel,
  getReportStatusLabel,
  getRoleLabel,
} from "@/lib/utils";
import type { PlanPriority, PlanStatus, ReportStatus, UserRole } from "@/types/database";

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
