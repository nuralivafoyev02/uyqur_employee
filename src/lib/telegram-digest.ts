import type { AppLanguage } from "@/lib/preferences";
import {
  formatDate,
  getPriorityLabel,
  getReportStatusLabel,
  truncate,
} from "@/lib/utils";
import type { PlanPriority, ReportStatus } from "@/types/database";

export type TelegramDigestReportItem = {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeTitle: string | null;
  reportDate: string;
  status: ReportStatus;
  completedWork: string;
  currentWork: string;
  nextPlan: string;
  blockers: string | null;
  updatedAt: string;
};

export type TelegramDigestPlanItem = {
  id: string;
  assigneeId: string;
  assigneeName: string;
  assigneeTitle: string | null;
  title: string;
  dueDate: string | null;
  priority: PlanPriority;
  updatedAt: string;
};

export type TelegramDigestOverview = {
  date: string;
  reports: TelegramDigestReportItem[];
  completedPlans: TelegramDigestPlanItem[];
};

const MAX_TELEGRAM_MESSAGE_LENGTH = 3800;

const COPY = {
  uz: {
    reports: {
      title: "Uyqur Yordamchi | Bugungi kunlik hisobotlar",
      date: "Sana",
      total: "Hisobotlar soni",
      employeeFallback: "Noma'lum xodim",
      status: "Holat",
      completed: "Yakunlandi",
      current: "Jarayon",
      next: "Keyingi",
      blockers: "To'siq",
      sectionEmpty: "Kiritilmagan.",
      blockersEmpty: "Yo'q.",
      omitted: (count: number) => `... va yana ${count} ta hisobot sig'madi.`,
      empty: "Bugun hali hisobot topshirilmagan.",
    },
    completedPlans: {
      title: "Uyqur Yordamchi | Bugun yakunlangan vazifalar",
      date: "Sana",
      total: "Vazifalar soni",
      assignee: "Mas'ul",
      assigneeFallback: "Noma'lum xodim",
      priority: "Muhimlik",
      dueDate: "Muddat",
      omitted: (count: number) => `... va yana ${count} ta vazifa sig'madi.`,
      empty: "Bugun hali yakunlangan vazifa yo'q.",
    },
  },
  en: {
    reports: {
      title: "Uyqur Yordamchi | Today's daily reports",
      date: "Date",
      total: "Reports",
      employeeFallback: "Unknown employee",
      status: "Status",
      completed: "Completed",
      current: "Current",
      next: "Next",
      blockers: "Blockers",
      sectionEmpty: "Not provided.",
      blockersEmpty: "None.",
      omitted: (count: number) => `... and ${count} more reports were omitted.`,
      empty: "No daily reports have been submitted yet today.",
    },
    completedPlans: {
      title: "Uyqur Yordamchi | Tasks completed today",
      date: "Date",
      total: "Tasks",
      assignee: "Owner",
      assigneeFallback: "Unknown employee",
      priority: "Priority",
      dueDate: "Due",
      omitted: (count: number) => `... and ${count} more tasks were omitted.`,
      empty: "No tasks have been completed yet today.",
    },
  },
  ru: {
    reports: {
      title: "Uyqur Yordamchi | Ежедневные отчеты за сегодня",
      date: "Дата",
      total: "Количество отчетов",
      employeeFallback: "Неизвестный сотрудник",
      status: "Статус",
      completed: "Завершено",
      current: "Текущая работа",
      next: "Следующее",
      blockers: "Блокеры",
      sectionEmpty: "Не указано.",
      blockersEmpty: "Нет.",
      omitted: (count: number) => `... и еще ${count} отчетов не поместились.`,
      empty: "Сегодня еще не отправили ни одного отчета.",
    },
    completedPlans: {
      title: "Uyqur Yordamchi | Завершенные сегодня задачи",
      date: "Дата",
      total: "Количество задач",
      assignee: "Ответственный",
      assigneeFallback: "Неизвестный сотрудник",
      priority: "Приоритет",
      dueDate: "Срок",
      omitted: (count: number) => `... и еще ${count} задач не поместились.`,
      empty: "Сегодня еще нет завершенных задач.",
    },
  },
} satisfies Record<AppLanguage, unknown>;

function joinMultiline(value: string | null | undefined) {
  return (value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("; ");
}

function formatReportSectionValue(
  value: string | null | undefined,
  emptyFallback: string,
  maxLength: number,
) {
  const normalized = joinMultiline(value);

  if (!normalized) {
    return emptyFallback;
  }

  return truncate(normalized, maxLength);
}

function appendWithLimit(
  baseMessage: string,
  sections: string[],
  omittedLabel: (count: number) => string,
) {
  let message = baseMessage;
  let included = 0;

  for (const section of sections) {
    const nextMessage = `${message}\n\n${section}`;
    if (nextMessage.length > MAX_TELEGRAM_MESSAGE_LENGTH) {
      break;
    }

    message = nextMessage;
    included += 1;
  }

  const omitted = sections.length - included;

  if (!omitted) {
    return message;
  }

  const suffix = `\n\n${omittedLabel(omitted)}`;

  if (message.length + suffix.length <= MAX_TELEGRAM_MESSAGE_LENGTH) {
    return `${message}${suffix}`;
  }

  return truncate(message, MAX_TELEGRAM_MESSAGE_LENGTH - 3);
}

export function buildTelegramReportsDigestMessage(
  language: AppLanguage,
  overview: Pick<TelegramDigestOverview, "date" | "reports">,
) {
  const copy = COPY[language].reports;
  const header = [
    copy.title,
    `${copy.date}: ${formatDate(overview.date, undefined, language)}`,
    `${copy.total}: ${overview.reports.length}`,
  ].join("\n");

  if (overview.reports.length === 0) {
    return `${header}\n\n${copy.empty}`;
  }

  const sections = overview.reports.map((report, index) => {
    const employeeLabel = report.employeeTitle
      ? `${report.employeeName} / ${report.employeeTitle}`
      : report.employeeName || copy.employeeFallback;

    return [
      `${index + 1}. ${employeeLabel || copy.employeeFallback}`,
      `${copy.status}: ${getReportStatusLabel(report.status, language)}`,
      `${copy.completed}: ${formatReportSectionValue(
        report.completedWork,
        copy.sectionEmpty,
        180,
      )}`,
      `${copy.current}: ${formatReportSectionValue(report.currentWork, copy.sectionEmpty, 150)}`,
      `${copy.next}: ${formatReportSectionValue(report.nextPlan, copy.sectionEmpty, 150)}`,
      `${copy.blockers}: ${formatReportSectionValue(
        report.blockers,
        copy.blockersEmpty,
        120,
      )}`,
    ].join("\n");
  });

  return appendWithLimit(header, sections, copy.omitted);
}

export function buildTelegramCompletedPlansDigestMessage(
  language: AppLanguage,
  overview: Pick<TelegramDigestOverview, "date" | "completedPlans">,
) {
  const copy = COPY[language].completedPlans;
  const header = [
    copy.title,
    `${copy.date}: ${formatDate(overview.date, undefined, language)}`,
    `${copy.total}: ${overview.completedPlans.length}`,
  ].join("\n");

  if (overview.completedPlans.length === 0) {
    return `${header}\n\n${copy.empty}`;
  }

  const sections = overview.completedPlans.map((plan, index) => {
    const ownerLabel = plan.assigneeTitle
      ? `${plan.assigneeName} / ${plan.assigneeTitle}`
      : plan.assigneeName || copy.assigneeFallback;
    const meta = [
      `${copy.assignee}: ${ownerLabel || copy.assigneeFallback}`,
      `${copy.priority}: ${getPriorityLabel(plan.priority, language)}`,
      plan.dueDate ? `${copy.dueDate}: ${formatDate(plan.dueDate, undefined, language)}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    return [`${index + 1}. ${truncate(plan.title, 180)}`, meta].join("\n");
  });

  return appendWithLimit(header, sections, copy.omitted);
}
