import type { AppLanguage } from "@/lib/preferences";
import type {
  PlanPriority,
  PlanStatus,
  ReportStatus,
  SuggestionStatus,
  UserRole,
} from "@/types/database";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const MONTHS_BY_LANGUAGE: Record<AppLanguage, string[]> = {
  uz: ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

function parseDateValue(value: string | Date) {
  if (value instanceof Date) {
    return value;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00`);
  }

  return new Date(value);
}

function padNumber(value: number) {
  return String(value).padStart(2, "0");
}

export function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(
  value: string | Date,
  options?: Intl.DateTimeFormatOptions,
  language: AppLanguage = "uz",
) {
  const date = parseDateValue(value);
  const month = MONTHS_BY_LANGUAGE[language][date.getMonth()];
  const year = date.getFullYear();
  const day = padNumber(date.getDate());
  const includeTime = options?.hour || options?.minute;

  const dateLabel =
    language === "en" ? `${month} ${day}, ${year}` : `${day}-${month}, ${year}`;

  if (!includeTime) {
    return dateLabel;
  }

  const timeLabel = `${padNumber(date.getHours())}:${padNumber(date.getMinutes())}`;
  return `${dateLabel}, ${timeLabel}`;
}

export function formatDateTime(value: string | Date, language: AppLanguage = "uz") {
  return formatDate(
    value,
    {
      hour: "2-digit",
      minute: "2-digit",
    },
    language,
  );
}

export function formatDateInputValue(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function isValidIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function getInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function toSentenceCase(value: string) {
  return value
    .split("_")
    .map((part, index) => {
      if (index === 0) {
        return part.charAt(0).toUpperCase() + part.slice(1);
      }

      return part;
    })
    .join(" ");
}

export function getRoleLabel(role: UserRole, language: AppLanguage = "uz") {
  const labels: Record<AppLanguage, Record<UserRole, string>> = {
    uz: {
      admin: "Admin",
      manager: "Manager",
      employee: "Xodim",
    },
    en: {
      admin: "Admin",
      manager: "Manager",
      employee: "Employee",
    },
  };

  return labels[language][role];
}

export function getReportStatusLabel(
  status: ReportStatus,
  language: AppLanguage = "uz",
) {
  const labels: Record<AppLanguage, Record<ReportStatus, string>> = {
    uz: {
      done: "Bajarildi",
      in_progress: "Jarayonda",
      blocked: "To'siq bor",
    },
    en: {
      done: "Done",
      in_progress: "In progress",
      blocked: "Blocked",
    },
  };

  return labels[language][status];
}

export function getPlanStatusLabel(status: PlanStatus, language: AppLanguage = "uz") {
  const labels: Record<AppLanguage, Record<PlanStatus, string>> = {
    uz: {
      todo: "Boshlanmagan",
      in_progress: "Jarayonda",
      done: "Yakunlangan",
      blocked: "To'siq bor",
    },
    en: {
      todo: "Not started",
      in_progress: "In progress",
      done: "Done",
      blocked: "Blocked",
    },
  };

  return labels[language][status];
}

export function getPriorityLabel(priority: PlanPriority, language: AppLanguage = "uz") {
  const labels: Record<AppLanguage, Record<PlanPriority, string>> = {
    uz: {
      low: "Past",
      medium: "O'rtacha",
      high: "Yuqori",
    },
    en: {
      low: "Low",
      medium: "Medium",
      high: "High",
    },
  };

  return labels[language][priority];
}

export function getSuggestionStatusLabel(
  status: SuggestionStatus,
  language: AppLanguage = "uz",
) {
  const labels: Record<AppLanguage, Record<SuggestionStatus, string>> = {
    uz: {
      new: "Yangi",
      accepted: "Qabul qilindi",
      prepared: "Tayyorlandi",
      canceled: "Bekor qilindi",
    },
    en: {
      new: "New",
      accepted: "Accepted",
      prepared: "Prepared",
      canceled: "Canceled",
    },
  };

  return labels[language][status];
}

export function truncate(value: string, max = 140) {
  if (value.length <= max) {
    return value;
  }

  return `${value.slice(0, max).trimEnd()}...`;
}

export function escapeLikeQuery(value: string) {
  return value.replace(/[%_,]/g, " ").trim();
}
