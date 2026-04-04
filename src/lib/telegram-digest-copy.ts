import type { AppLanguage } from "@/lib/preferences";

type TelegramDigestCopy = {
  eyebrow: string;
  title: string;
  description: string;
  todayLabel: string;
  previewLabel: string;
  managerOnlyHint: string;
  reportsTitle: string;
  reportsDescription: string;
  reportsCount: (count: number) => string;
  sendReports: string;
  sendingReports: string;
  completedPlansTitle: string;
  completedPlansDescription: string;
  completedPlansCount: (count: number) => string;
  sendCompletedPlans: string;
  sendingCompletedPlans: string;
  messages: {
    reportsSent: string;
    completedPlansSent: string;
    reportsEmpty: string;
    completedPlansEmpty: string;
  };
};

const COPY: Record<AppLanguage, TelegramDigestCopy> = {
  uz: {
    eyebrow: "Telegram broadcast",
    title: "Kunlik digest yuborish",
    description:
      "Shu sahifadan bugungi kunlik hisobotlar va bugun yakunlangan vazifalarni guruhga alohida digest sifatida yuborishingiz mumkin.",
    todayLabel: "Bugun",
    previewLabel: "Preview",
    managerOnlyHint:
      "Digest yuborish va preview ko'rish admin yoki manager roli uchun ochiq.",
    reportsTitle: "Bugungi kunlik hisobotlar",
    reportsDescription:
      "Bugun topshirilgan barcha kunlik hisobotlar bitta Telegram xabari bo'lib yuboriladi.",
    reportsCount: (count: number) => `${count} ta hisobot`,
    sendReports: "Hisobotlarni yuborish",
    sendingReports: "Yuborilmoqda...",
    completedPlansTitle: "Bugun yakunlangan vazifalar",
    completedPlansDescription:
      "Bugun `done` holatiga o'tgan vazifalar alohida Telegram digest sifatida yuboriladi.",
    completedPlansCount: (count: number) => `${count} ta vazifa`,
    sendCompletedPlans: "Vazifalarni yuborish",
    sendingCompletedPlans: "Yuborilmoqda...",
    messages: {
      reportsSent: "Bugungi kunlik hisobotlar Telegramga yuborildi.",
      completedPlansSent: "Bugun yakunlangan vazifalar Telegramga yuborildi.",
      reportsEmpty: "Bugun yuboriladigan kunlik hisobot topilmadi.",
      completedPlansEmpty: "Bugun yuboriladigan yakunlangan vazifa topilmadi.",
    },
  },
  en: {
    eyebrow: "Telegram broadcast",
    title: "Send daily digests",
    description:
      "From this page you can send today's daily reports and today's completed tasks to the group as separate Telegram digests.",
    todayLabel: "Today",
    previewLabel: "Preview",
    managerOnlyHint:
      "Digest preview and sending are available only to admins and managers.",
    reportsTitle: "Today's daily reports",
    reportsDescription:
      "All daily reports submitted today are bundled into a single Telegram message.",
    reportsCount: (count: number) => `${count} reports`,
    sendReports: "Send reports",
    sendingReports: "Sending...",
    completedPlansTitle: "Tasks completed today",
    completedPlansDescription:
      "Tasks moved to `done` today are sent as a separate Telegram digest.",
    completedPlansCount: (count: number) => `${count} tasks`,
    sendCompletedPlans: "Send tasks",
    sendingCompletedPlans: "Sending...",
    messages: {
      reportsSent: "Today's daily reports were sent to Telegram.",
      completedPlansSent: "Today's completed tasks were sent to Telegram.",
      reportsEmpty: "No daily reports are available to send today.",
      completedPlansEmpty: "No completed tasks are available to send today.",
    },
  },
  ru: {
    eyebrow: "Telegram broadcast",
    title: "Отправка дневных дайджестов",
    description:
      "С этой страницы можно отдельно отправлять в группу сегодняшние ежедневные отчеты и завершенные сегодня задачи.",
    todayLabel: "Сегодня",
    previewLabel: "Предпросмотр",
    managerOnlyHint:
      "Предпросмотр и отправка дайджестов доступны только администраторам и менеджерам.",
    reportsTitle: "Сегодняшние ежедневные отчеты",
    reportsDescription:
      "Все ежедневные отчеты, отправленные сегодня, объединяются в одно сообщение Telegram.",
    reportsCount: (count: number) => `${count} отчетов`,
    sendReports: "Отправить отчеты",
    sendingReports: "Отправка...",
    completedPlansTitle: "Завершенные сегодня задачи",
    completedPlansDescription:
      "Задачи, переведенные сегодня в `done`, отправляются отдельным дайджестом Telegram.",
    completedPlansCount: (count: number) => `${count} задач`,
    sendCompletedPlans: "Отправить задачи",
    sendingCompletedPlans: "Отправка...",
    messages: {
      reportsSent: "Сегодняшние ежедневные отчеты отправлены в Telegram.",
      completedPlansSent: "Завершенные сегодня задачи отправлены в Telegram.",
      reportsEmpty: "Сегодня нет ежедневных отчетов для отправки.",
      completedPlansEmpty: "Сегодня нет завершенных задач для отправки.",
    },
  },
};

export function getTelegramDigestCopy(language: AppLanguage) {
  return COPY[language];
}
