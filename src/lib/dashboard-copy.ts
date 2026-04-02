import type { AppLanguage } from "@/lib/preferences";

type DashboardCopy = {
  header: {
    eyebrow: string;
    leadTitle: string;
    leadDescription: string;
    employeeTitle: (firstName: string) => string;
    employeeDescription: string;
    primaryCta: string;
    secondaryCta: string;
  };
  hero: {
    eyebrow: string;
    leadTitle: string;
    employeeTitle: string;
    todayLabel: string;
    leadSummary: (
      submitted: number,
      total: number,
      pending: number,
      blocked: number,
      openPlans: number,
    ) => string;
    employeeSummary: (
      submitted: number,
      total: number,
      myOpenPlans: number,
      dueSoon: number,
    ) => string;
    reportHealth: string;
    taskHealth: string;
    reported: string;
    awaiting: string;
    blockers: string;
    overdue: string;
    submitted: string;
    open: string;
  };
  highlights: {
    totalEmployees: { label: string; helper: string };
    submittedToday: { label: string; helper: string };
    pendingToday: { label: string; helper: string };
    blockedToday: { label: string; helper: string };
    openPlans: { label: string; helper: string };
    overduePlans: { label: string; helper: string };
    myReport: {
      label: string;
      ready: string;
      missing: string;
    };
    myOpenPlans: { label: string; helper: string };
    dueSoon: { label: string; helper: string };
    myBlocked: { label: string; helper: string };
    teamCoverage: {
      label: string;
      helper: (rate: number) => string;
    };
  };
  quickActions: {
    title: string;
    description: string;
    reports: { title: string; description: string };
    plans: { title: string; description: string };
    employees: { title: string; description: string };
    settings: { title: string; description: string };
  };
  attention: {
    title: string;
    leadDescription: string;
    employeeDescription: string;
    blockedReports: string;
    urgentPlans: string;
    missingReports: string;
    personalBlockers: string;
    noBlockedReports: string;
    noUrgentPlans: string;
    noMissingReports: string;
    noPersonalBlockers: string;
    viewProfile: string;
  };
  reports: {
    leadEyebrow: string;
    employeeEyebrow: string;
    leadTitle: string;
    employeeTitle: string;
    viewAll: string;
    openDetail: string;
    unknownEmployee: string;
    noTitle: string;
    noDepartment: string;
    emptyTitle: string;
    emptyDescription: string;
    today: string;
    updated: string;
  };
  focus: {
    leadEyebrow: string;
    employeeEyebrow: string;
    leadTitle: string;
    employeeTitle: string;
    noTitle: string;
    allSubmitted: string;
    editReport: string;
    emptyTitle: string;
    emptyDescription: string;
    submitReport: string;
    currentWork: string;
    nextPlan: string;
    blockers: string;
  };
  plans: {
    eyebrow: string;
    leadTitle: string;
    employeeTitle: string;
    pageLink: string;
    noDeadline: string;
    dueSoon: string;
    overdue: string;
    noAssignee: string;
    emptyLeadTitle: string;
    emptyLeadDescription: string;
    emptyEmployeeTitle: string;
    emptyEmployeeDescription: string;
  };
};

const COPY: Record<AppLanguage, DashboardCopy> = {
  uz: {
    header: {
      eyebrow: "Asosiy",
      leadTitle: "Mukammal boshqaruv paneli",
      leadDescription:
        "Coverage, blocker va faol vazifalarni bir qarashda boshqarish uchun qisqa va kuchli dashboard.",
      employeeTitle: (firstName) => `Xush kelibsiz, ${firstName}`,
      employeeDescription: "Bugungi hisobot, yaqin deadline va shaxsiy fokus bir joyda.",
      primaryCta: "Hisobotlar",
      secondaryCta: "Vazifalar",
    },
    hero: {
      eyebrow: "Bugungi holat",
      leadTitle: "Jamoa pulse",
      employeeTitle: "Bugungi fokus",
      todayLabel: "Bugun",
      leadSummary: (submitted, total, pending, blocked, openPlans) =>
        `${submitted}/${total} xodim hisobot yubordi. ${pending} ta kutilmoqda, ${blocked} ta blocker va ${openPlans} ta ochiq vazifa bor.`,
      employeeSummary: (submitted, total, myOpenPlans, dueSoon) =>
        `Jamoa coverage ${submitted}/${total}. Sizda ${myOpenPlans} ta faol vazifa va ${dueSoon} ta yaqin deadline bor.`,
      reportHealth: "Hisobot oqimi",
      taskHealth: "Vazifa oqimi",
      reported: "Topshirilgan",
      awaiting: "Kutilmoqda",
      blockers: "To'siq",
      overdue: "Kechikkan",
      submitted: "Yuborilgan",
      open: "Ochiq",
    },
    highlights: {
      totalEmployees: { label: "Jami xodimlar", helper: "Faol profillar soni" },
      submittedToday: { label: "Bugun topshirildi", helper: "Hisobot yuborganlar" },
      pendingToday: { label: "Kutilmoqda", helper: "Hisobot hali yo'q" },
      blockedToday: { label: "Blocker report", helper: "To'siqli statuslar" },
      openPlans: { label: "Ochiq vazifa", helper: "Tugallanmagan tasklar" },
      overduePlans: { label: "Kechikkan", helper: "Deadline o'tib ketgan" },
      myReport: { label: "Hisobot holati", ready: "Yuborilgan", missing: "Kutilmoqda" },
      myOpenPlans: { label: "Mening vazifalarim", helper: "Faol tasklar soni" },
      dueSoon: { label: "Yaqin deadline", helper: "3 kun ichida tugaydi" },
      myBlocked: { label: "Bloklangan", helper: "To'siqli tasklar" },
      teamCoverage: { label: "Jamoa coverage", helper: (rate) => `${rate}% topshirish darajasi` },
    },
    quickActions: {
      title: "Tezkor amallar",
      description: "Ko'p ishlatiladigan bo'limlarga tez o'ting.",
      reports: { title: "Hisobotlar", description: "Daily report yaratish va tarixni ko'rish." },
      plans: { title: "Vazifalar", description: "Task board va tezkor boshqaruv." },
      employees: { title: "Xodimlar", description: "Jamoa profillari va activity holati." },
      settings: { title: "Sozlamalar", description: "Profil va interfeys sozlamalari." },
    },
    attention: {
      title: "E'tibor talab qiladi",
      leadDescription: "Blocker, kechikkan va kutilayotgan itemlar.",
      employeeDescription: "Sizga taalluqli risk va eslatmalar.",
      blockedReports: "Blocker reportlar",
      urgentPlans: "Shoshilinch vazifalar",
      missingReports: "Hisobot kutilayotganlar",
      personalBlockers: "Mening to'siqlarim",
      noBlockedReports: "Hozircha blocker report yo'q.",
      noUrgentPlans: "Shoshilinch vazifa topilmadi.",
      noMissingReports: "Barcha xodimlar hisobot topshirgan.",
      noPersonalBlockers: "Sizda blocker qayd etilmagan.",
      viewProfile: "Profil",
    },
    reports: {
      leadEyebrow: "So'nggi hisobotlar",
      employeeEyebrow: "So'nggi hisobotlarim",
      leadTitle: "Jamoa yangilanishlari",
      employeeTitle: "Hisobot tarixi",
      viewAll: "Hisobotlar sahifasi",
      openDetail: "To'liq ko'rish",
      unknownEmployee: "Noma'lum xodim",
      noTitle: "Lavozim ko'rsatilmagan",
      noDepartment: "Bo'lim ko'rsatilmagan",
      emptyTitle: "Hisobotlar hali yo'q",
      emptyDescription: "Hisobotlar kelgach shu yerda ko'rinadi.",
      today: "Sana",
      updated: "Yangilangan",
    },
    focus: {
      leadEyebrow: "Coverage va ijro",
      employeeEyebrow: "Bugungi hisobot",
      leadTitle: "Report coverage",
      employeeTitle: "Bugungi status",
      noTitle: "Lavozim ko'rsatilmagan",
      allSubmitted: "Bugungi hisobotlar to'liq topshirilgan.",
      editReport: "Hisobotni tahrirlash",
      emptyTitle: "Bugungi hisobot hali topshirilmagan",
      emptyDescription: "Asosiy 3 maydonni to'ldirib, jamoaga holatni ko'rsating.",
      submitReport: "Hisobot yuborish",
      currentWork: "Joriy ish",
      nextPlan: "Keyingi reja",
      blockers: "To'siqlar",
    },
    plans: {
      eyebrow: "Vazifalar",
      leadTitle: "Faol jamoa vazifalari",
      employeeTitle: "Mening vazifalarim",
      pageLink: "Vazifalar bo'limi",
      noDeadline: "Deadline yo'q",
      dueSoon: "Yaqin",
      overdue: "Kechikkan",
      noAssignee: "Mas'ul ko'rsatilmagan",
      emptyLeadTitle: "Faol vazifa topilmadi",
      emptyLeadDescription: "Tasklar qo'shilgach shu yerda ko'rinadi.",
      emptyEmployeeTitle: "Sizga biriktirilgan vazifa yo'q",
      emptyEmployeeDescription: "Yangi vazifalar kelgach shu blok yangilanadi.",
    },
  },
  en: {
    header: {
      eyebrow: "Dashboard",
      leadTitle: "Operational control center",
      leadDescription:
        "A compact dashboard for tracking coverage, blockers, and active work at a glance.",
      employeeTitle: (firstName) => `Welcome, ${firstName}`,
      employeeDescription: "Your report, near deadlines, and personal focus in one place.",
      primaryCta: "Reports",
      secondaryCta: "Tasks",
    },
    hero: {
      eyebrow: "Today's status",
      leadTitle: "Team pulse",
      employeeTitle: "Today's focus",
      todayLabel: "Today",
      leadSummary: (submitted, total, pending, blocked, openPlans) =>
        `${submitted}/${total} employees submitted a report. ${pending} pending, ${blocked} blocked, and ${openPlans} open tasks remain.`,
      employeeSummary: (submitted, total, myOpenPlans, dueSoon) =>
        `Team coverage is ${submitted}/${total}. You have ${myOpenPlans} active tasks and ${dueSoon} upcoming deadlines.`,
      reportHealth: "Report flow",
      taskHealth: "Task flow",
      reported: "Reported",
      awaiting: "Pending",
      blockers: "Blocked",
      overdue: "Overdue",
      submitted: "Submitted",
      open: "Open",
    },
    highlights: {
      totalEmployees: { label: "Total employees", helper: "Active profiles in the workspace" },
      submittedToday: { label: "Submitted today", helper: "Reports received" },
      pendingToday: { label: "Pending", helper: "No report yet" },
      blockedToday: { label: "Blocked reports", helper: "Blocked report statuses" },
      openPlans: { label: "Open tasks", helper: "Incomplete tasks" },
      overduePlans: { label: "Overdue", helper: "Past due date" },
      myReport: { label: "Report status", ready: "Submitted", missing: "Pending" },
      myOpenPlans: { label: "My tasks", helper: "Active workload" },
      dueSoon: { label: "Due soon", helper: "Due within 3 days" },
      myBlocked: { label: "Blocked", helper: "Blocked tasks" },
      teamCoverage: { label: "Team coverage", helper: (rate) => `${rate}% submission rate` },
    },
    quickActions: {
      title: "Quick actions",
      description: "Jump into the sections you use most.",
      reports: { title: "Reports", description: "Create daily reports and review history." },
      plans: { title: "Tasks", description: "Open the board and manage work fast." },
      employees: { title: "Employees", description: "Check team profiles and activity." },
      settings: { title: "Settings", description: "Update profile and interface preferences." },
    },
    attention: {
      title: "Needs attention",
      leadDescription: "Blocked, overdue, and missing items.",
      employeeDescription: "Risks and reminders related to you.",
      blockedReports: "Blocked reports",
      urgentPlans: "Urgent tasks",
      missingReports: "Missing reports",
      personalBlockers: "My blockers",
      noBlockedReports: "No blocked reports right now.",
      noUrgentPlans: "No urgent tasks found.",
      noMissingReports: "Everyone has submitted a report today.",
      noPersonalBlockers: "No blockers were recorded for you.",
      viewProfile: "Profile",
    },
    reports: {
      leadEyebrow: "Latest reports",
      employeeEyebrow: "My recent reports",
      leadTitle: "Team updates",
      employeeTitle: "Report history",
      viewAll: "Open reports page",
      openDetail: "Open full view",
      unknownEmployee: "Unknown employee",
      noTitle: "Title not provided",
      noDepartment: "Department not provided",
      emptyTitle: "No reports yet",
      emptyDescription: "Reports will appear here as they come in.",
      today: "Date",
      updated: "Updated",
    },
    focus: {
      leadEyebrow: "Coverage and execution",
      employeeEyebrow: "Today's report",
      leadTitle: "Report coverage",
      employeeTitle: "Today's status",
      noTitle: "Title not provided",
      allSubmitted: "All reports for today have been submitted.",
      editReport: "Edit report",
      emptyTitle: "Today's report has not been submitted",
      emptyDescription: "Fill the 3 core fields and share your current status.",
      submitReport: "Submit report",
      currentWork: "Current work",
      nextPlan: "Next plan",
      blockers: "Blockers",
    },
    plans: {
      eyebrow: "Tasks",
      leadTitle: "Active team tasks",
      employeeTitle: "My tasks",
      pageLink: "Open tasks page",
      noDeadline: "No deadline",
      dueSoon: "Soon",
      overdue: "Overdue",
      noAssignee: "No assignee",
      emptyLeadTitle: "No active tasks found",
      emptyLeadDescription: "This area will update when tasks are added.",
      emptyEmployeeTitle: "No tasks assigned to you",
      emptyEmployeeDescription: "This area will update when new tasks arrive.",
    },
  },
  ru: {
    header: {
      eyebrow: "Главная",
      leadTitle: "Операционный центр управления",
      leadDescription:
        "Компактная панель для контроля покрытия, блокеров и активной работы с одного взгляда.",
      employeeTitle: (firstName) => `Добро пожаловать, ${firstName}`,
      employeeDescription: "Ваш отчет, ближайшие сроки и личный фокус в одном месте.",
      primaryCta: "Отчеты",
      secondaryCta: "Задачи",
    },
    hero: {
      eyebrow: "Состояние на сегодня",
      leadTitle: "Пульс команды",
      employeeTitle: "Фокус на сегодня",
      todayLabel: "Сегодня",
      leadSummary: (submitted, total, pending, blocked, openPlans) =>
        `${submitted}/${total} сотрудников отправили отчет. ${pending} ожидаются, ${blocked} с блокерами, открытых задач: ${openPlans}.`,
      employeeSummary: (submitted, total, myOpenPlans, dueSoon) =>
        `Покрытие команды ${submitted}/${total}. У вас ${myOpenPlans} активных задач и ${dueSoon} ближайших сроков.`,
      reportHealth: "Поток отчетов",
      taskHealth: "Поток задач",
      reported: "Отправлено",
      awaiting: "Ожидается",
      blockers: "Блокеры",
      overdue: "Просрочено",
      submitted: "Сдано",
      open: "Открыто",
    },
    highlights: {
      totalEmployees: { label: "Всего сотрудников", helper: "Активные профили в системе" },
      submittedToday: { label: "Сдано сегодня", helper: "Полученные отчеты" },
      pendingToday: { label: "Ожидается", helper: "Отчета пока нет" },
      blockedToday: { label: "Отчеты с блокерами", helper: "Статусы с блокерами" },
      openPlans: { label: "Открытые задачи", helper: "Незавершенные задачи" },
      overduePlans: { label: "Просрочено", helper: "Срок уже прошел" },
      myReport: { label: "Статус отчета", ready: "Сдан", missing: "Ожидается" },
      myOpenPlans: { label: "Мои задачи", helper: "Активная загрузка" },
      dueSoon: { label: "Скоро срок", helper: "Срок в течение 3 дней" },
      myBlocked: { label: "Заблокировано", helper: "Задачи с блокерами" },
      teamCoverage: { label: "Покрытие команды", helper: (rate) => `${rate}% уровень сдачи` },
    },
    quickActions: {
      title: "Быстрые действия",
      description: "Переходите к самым используемым разделам быстрее.",
      reports: { title: "Отчеты", description: "Создавайте ежедневные отчеты и смотрите историю." },
      plans: { title: "Задачи", description: "Откройте доску и быстро управляйте работой." },
      employees: { title: "Сотрудники", description: "Профили команды и активность." },
      settings: { title: "Настройки", description: "Профиль и параметры интерфейса." },
    },
    attention: {
      title: "Требует внимания",
      leadDescription: "Блокеры, просроченные и ожидаемые элементы.",
      employeeDescription: "Риски и напоминания, связанные с вами.",
      blockedReports: "Отчеты с блокерами",
      urgentPlans: "Срочные задачи",
      missingReports: "Отсутствующие отчеты",
      personalBlockers: "Мои блокеры",
      noBlockedReports: "Сейчас отчетов с блокерами нет.",
      noUrgentPlans: "Срочные задачи не найдены.",
      noMissingReports: "Сегодня все сотрудники сдали отчет.",
      noPersonalBlockers: "Для вас блокеры не зафиксированы.",
      viewProfile: "Профиль",
    },
    reports: {
      leadEyebrow: "Последние отчеты",
      employeeEyebrow: "Мои последние отчеты",
      leadTitle: "Обновления команды",
      employeeTitle: "История отчетов",
      viewAll: "Открыть страницу отчетов",
      openDetail: "Открыть полностью",
      unknownEmployee: "Неизвестный сотрудник",
      noTitle: "Должность не указана",
      noDepartment: "Отдел не указан",
      emptyTitle: "Отчетов пока нет",
      emptyDescription: "Отчеты появятся здесь, как только начнут поступать.",
      today: "Дата",
      updated: "Обновлено",
    },
    focus: {
      leadEyebrow: "Покрытие и исполнение",
      employeeEyebrow: "Отчет за сегодня",
      leadTitle: "Покрытие отчетов",
      employeeTitle: "Статус на сегодня",
      noTitle: "Должность не указана",
      allSubmitted: "Все отчеты за сегодня уже отправлены.",
      editReport: "Редактировать отчет",
      emptyTitle: "Сегодняшний отчет еще не отправлен",
      emptyDescription: "Заполните 3 ключевых поля и поделитесь текущим статусом.",
      submitReport: "Отправить отчет",
      currentWork: "Текущая работа",
      nextPlan: "Следующий план",
      blockers: "Блокеры",
    },
    plans: {
      eyebrow: "Задачи",
      leadTitle: "Активные задачи команды",
      employeeTitle: "Мои задачи",
      pageLink: "Открыть задачи",
      noDeadline: "Без срока",
      dueSoon: "Скоро",
      overdue: "Просрочено",
      noAssignee: "Исполнитель не указан",
      emptyLeadTitle: "Активные задачи не найдены",
      emptyLeadDescription: "Этот блок обновится после добавления задач.",
      emptyEmployeeTitle: "На вас пока нет задач",
      emptyEmployeeDescription: "Этот блок обновится, когда появятся новые задачи.",
    },
  },
};

export function getDashboardCopy(language: AppLanguage) {
  return COPY[language];
}
