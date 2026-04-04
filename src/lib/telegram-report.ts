import type { AppLanguage } from "@/lib/preferences";
import { formatDate, getReportStatusLabel, truncate } from "@/lib/utils";
import type { PlanPriority, ReportStatus } from "@/types/database";

export type TelegramCompletedPlanItem = {
  id: string;
  title: string;
  dueDate: string | null;
  priority: PlanPriority;
  updatedAt: string;
};

type TelegramReportPayload = {
  language: AppLanguage;
  employeeName: string;
  employeeTitle?: string | null;
  reportDate: string;
  status: ReportStatus;
  completedWork: string;
  currentWork: string;
  nextPlan: string;
  blockers?: string | null;
  completedPlans: TelegramCompletedPlanItem[];
};

type TelegramCompletedPlansPayload = {
  language: AppLanguage;
  employeeName: string;
  employeeTitle?: string | null;
  reportDate: string;
  completedPlans: TelegramCompletedPlanItem[];
};

const COPY: Record<
  AppLanguage,
  {
    title: string;
    employee: string;
    titleLabel: string;
    reportDate: string;
    status: string;
    completedWork: string;
    currentWork: string;
    nextPlan: string;
    blockers: string;
    sectionEmpty: string;
    blockersEmpty: string;
    completedPlans: string;
    completedPlansEmpty: string;
  }
> = {
  uz: {
    title: "Uyqur Yordamchi hisoboti",
    employee: "Xodim",
    titleLabel: "Lavozim",
    reportDate: "Sana",
    status: "Holat",
    completedWork: "Bugun yakunlangan ishlar",
    currentWork: "Hozirgi ishlar",
    nextPlan: "Keyingi reja",
    blockers: "To'siq va muammolar",
    sectionEmpty: "Ma'lumot kiritilmagan.",
    blockersEmpty: "To'siq ko'rsatilmagan.",
    completedPlans: "Bugun yakunlangan vazifalar",
    completedPlansEmpty: "Bugun yakunlangan vazifa yo'q.",
  },
  en: {
    title: "Uyqur Yordamchi report",
    employee: "Employee",
    titleLabel: "Title",
    reportDate: "Date",
    status: "Status",
    completedWork: "Completed work today",
    currentWork: "Current work",
    nextPlan: "Next plan",
    blockers: "Blockers",
    sectionEmpty: "No details were provided.",
    blockersEmpty: "No blockers were reported.",
    completedPlans: "Tasks completed today",
    completedPlansEmpty: "No tasks were completed today.",
  },
  ru: {
    title: "Отчет Uyqur Yordamchi",
    employee: "Сотрудник",
    titleLabel: "Должность",
    reportDate: "Дата",
    status: "Статус",
    completedWork: "Что завершено сегодня",
    currentWork: "Текущая работа",
    nextPlan: "Следующий план",
    blockers: "Блокеры и проблемы",
    sectionEmpty: "Детали не указаны.",
    blockersEmpty: "Блокеры не указаны.",
    completedPlans: "Завершенные сегодня задачи",
    completedPlansEmpty: "Сегодня завершенных задач нет.",
  },
};

const COMPLETED_PLANS_COPY: Record<
  AppLanguage,
  {
    title: string;
    employee: string;
    titleLabel: string;
    reportDate: string;
    total: string;
    completedPlans: string;
    completedPlansEmpty: string;
  }
> = {
  uz: {
    title: "Uyqur Yordamchi | Bugun yakunlangan vazifalar",
    employee: "Xodim",
    titleLabel: "Lavozim",
    reportDate: "Sana",
    total: "Vazifalar soni",
    completedPlans: "Bugun yakunlangan vazifalar",
    completedPlansEmpty: "Bugun yakunlangan vazifa yo'q.",
  },
  en: {
    title: "Uyqur Yordamchi | Tasks completed today",
    employee: "Employee",
    titleLabel: "Title",
    reportDate: "Date",
    total: "Task count",
    completedPlans: "Tasks completed today",
    completedPlansEmpty: "No tasks were completed today.",
  },
  ru: {
    title: "Uyqur Yordamchi | Завершенные сегодня задачи",
    employee: "Сотрудник",
    titleLabel: "Должность",
    reportDate: "Дата",
    total: "Количество задач",
    completedPlans: "Завершенные сегодня задачи",
    completedPlansEmpty: "Сегодня завершенных задач нет.",
  },
};

function formatMultilineSection(value: string, emptyFallback: string) {
  const lines = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return `- ${emptyFallback}`;
  }

  return lines.map((line) => `- ${line}`).join("\n");
}

function trimTelegramMessage(value: string) {
  const MAX_TELEGRAM_MESSAGE_LENGTH = 3800;

  if (value.length <= MAX_TELEGRAM_MESSAGE_LENGTH) {
    return value;
  }

  return `${truncate(value, MAX_TELEGRAM_MESSAGE_LENGTH - 3)}...`;
}

export function buildTelegramReportMessage({
  language,
  employeeName,
  employeeTitle,
  reportDate,
  status,
  completedWork,
  currentWork,
  nextPlan,
  blockers,
  completedPlans,
}: TelegramReportPayload) {
  const copy = COPY[language];
  const completedPlansSection =
    completedPlans.length > 0
      ? completedPlans.map((plan) => `- ${plan.title}`).join("\n")
      : `- ${copy.completedPlansEmpty}`;

  const message = [
    copy.title,
    "",
    `${copy.employee}: ${employeeName}`,
    employeeTitle ? `${copy.titleLabel}: ${employeeTitle}` : null,
    `${copy.reportDate}: ${formatDate(reportDate, undefined, language)}`,
    `${copy.status}: ${getReportStatusLabel(status, language)}`,
    "",
    `${copy.completedWork}:`,
    formatMultilineSection(completedWork, copy.sectionEmpty),
    "",
    `${copy.currentWork}:`,
    formatMultilineSection(currentWork, copy.sectionEmpty),
    "",
    `${copy.nextPlan}:`,
    formatMultilineSection(nextPlan, copy.sectionEmpty),
    "",
    `${copy.completedPlans}:`,
    completedPlansSection,
    "",
    `${copy.blockers}:`,
    formatMultilineSection(blockers?.trim() ?? "", copy.blockersEmpty),
  ]
    .filter(Boolean)
    .join("\n");

  return trimTelegramMessage(message);
}

export function buildTelegramCompletedPlansMessage({
  language,
  employeeName,
  employeeTitle,
  reportDate,
  completedPlans,
}: TelegramCompletedPlansPayload) {
  const copy = COMPLETED_PLANS_COPY[language];
  const completedPlansSection =
    completedPlans.length > 0
      ? completedPlans.map((plan) => `- ${plan.title}`).join("\n")
      : `- ${copy.completedPlansEmpty}`;

  const message = [
    copy.title,
    "",
    `${copy.employee}: ${employeeName}`,
    employeeTitle ? `${copy.titleLabel}: ${employeeTitle}` : null,
    `${copy.reportDate}: ${formatDate(reportDate, undefined, language)}`,
    `${copy.total}: ${completedPlans.length}`,
    "",
    `${copy.completedPlans}:`,
    completedPlansSection,
  ]
    .filter(Boolean)
    .join("\n");

  return trimTelegramMessage(message);
}
