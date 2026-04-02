import type { AppLanguage } from "@/lib/preferences";

type PlansCopy = {
  header: {
    eyebrow: string;
    title: string;
    description: string;
  };
  stats: {
    total: string;
    inProgress: string;
    overdue: string;
    done: string;
  };
  create: {
    eyebrow: string;
    title: string;
    description: string;
    quickHint: string;
    openComposer: string;
    closeComposer: string;
    details: string;
    hideDetails: string;
  };
  filters: {
    open: string;
    title: string;
    close: string;
    employee: string;
    status: string;
    priority: string;
    all: string;
    submit: string;
  };
  form: {
    title: string;
    titlePlaceholder: string;
    description: string;
    descriptionOptional: string;
    descriptionPlaceholder: string;
    assignee: string;
    assigneePlaceholder: string;
    dueDate: string;
    priority: string;
    initialStatus: string;
    quickSubmit: string;
    submit: string;
    pending: string;
  };
  list: {
    boardTitle: string;
    boardDescription: string;
    collapsedState: string;
    expandColumn: string;
    collapseColumn: string;
    assigneeMissing: string;
    noDescription: string;
    deadlinePrefix: string;
    noDeadline: string;
    updatedPrefix: string;
    emptyColumn: string;
    update: string;
    updating: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  pagination: {
    summary: (page: number, pageCount: number) => string;
    previous: string;
    next: string;
  };
};

const COPY: Record<AppLanguage, PlansCopy> = {
  uz: {
    header: {
      eyebrow: "Rejalar / Vazifalar",
      title: "Vazifalar oqimi",
      description:
        "Deadline, prioritet va status yangilanishlari bilan ishlovchi plan board.",
    },
    stats: {
      total: "Jami",
      inProgress: "Jarayonda",
      overdue: "Muddati o'tgan",
      done: "Yakunlangan",
    },
    create: {
      eyebrow: "Yangi vazifa",
      title: "Vazifa qo'shish",
      description: "Sarlavha, ijrochi va deadline bilan vazifani bir necha soniyada yarating.",
      quickHint: "ClickUp uslubida tez yarating: avval nom, keyin mas'ul va muhimlikni belgilang.",
      openComposer: "Vazifa qo'shish",
      closeComposer: "Yopish",
      details: "Batafsil",
      hideDetails: "Qisqartirish",
    },
    filters: {
      open: "Filtrlash",
      title: "Vazifalarni filtrlash",
      close: "Yopish",
      employee: "Xodim",
      status: "Status",
      priority: "Prioritet",
      all: "Barchasi",
      submit: "Filtrlash",
    },
    form: {
      title: "Vazifa nomi",
      titlePlaceholder: "Yozing...",
      description: "Tavsif",
      descriptionOptional: "Tavsif (ixtiyoriy)",
      descriptionPlaceholder: "Yozing...",
      assignee: "Ijrochi",
      assigneePlaceholder: "Xodim tanlang",
      dueDate: "Deadline",
      priority: "Prioritet",
      initialStatus: "Boshlang'ich status",
      quickSubmit: "Tez yaratish",
      submit: "Vazifani saqlash",
      pending: "Saqlanmoqda...",
    },
    list: {
      boardTitle: "Vazifalar board",
      boardDescription: "Status bo'yicha tez ko'ring va bir tegishda boshqa bosqichga o'tkazing.",
      collapsedState: "Yopiq ko'rinish",
      expandColumn: "Ochish",
      collapseColumn: "Yopish",
      assigneeMissing: "Ijrochi topilmadi",
      noDescription: "Qo'shimcha tavsif berilmagan.",
      deadlinePrefix: "Deadline",
      noDeadline: "Deadline yo'q",
      updatedPrefix: "Yangilandi",
      emptyColumn: "Bu statusda vazifa yo'q.",
      update: "Yangilash",
      updating: "...",
      emptyTitle: "Vazifalar topilmadi",
      emptyDescription: "Tanlangan filtrlar bo'yicha hozircha vazifalar mavjud emas.",
    },
    pagination: {
      summary: (page, pageCount) => `Sahifa ${page} / ${pageCount}`,
      previous: "Oldingi",
      next: "Keyingi",
    },
  },
  en: {
    header: {
      eyebrow: "Plans / Tasks",
      title: "Task pipeline",
      description:
        "A planning board for work items with deadlines, priorities, and status updates.",
    },
    stats: {
      total: "Total",
      inProgress: "In progress",
      overdue: "Overdue",
      done: "Done",
    },
    create: {
      eyebrow: "Create task",
      title: "New task",
      description: "Create a task in seconds with title, assignee, deadline, and status.",
      quickHint: "Use the quick composer first, then expand details only when needed.",
      openComposer: "Create task",
      closeComposer: "Close",
      details: "Details",
      hideDetails: "Compact",
    },
    filters: {
      open: "Filters",
      title: "Filter tasks",
      close: "Close",
      employee: "Employee",
      status: "Status",
      priority: "Priority",
      all: "All",
      submit: "Apply filters",
    },
    form: {
      title: "Task title",
      titlePlaceholder: "Write...",
      description: "Description",
      descriptionOptional: "Description (optional)",
      descriptionPlaceholder: "Write...",
      assignee: "Assignee",
      assigneePlaceholder: "Select an employee",
      dueDate: "Deadline",
      priority: "Priority",
      initialStatus: "Initial status",
      quickSubmit: "Quick create",
      submit: "Save task",
      pending: "Saving...",
    },
    list: {
      boardTitle: "Task board",
      boardDescription: "Review by status and move work forward with one quick action.",
      collapsedState: "Collapsed",
      expandColumn: "Expand",
      collapseColumn: "Collapse",
      assigneeMissing: "Assignee not found",
      noDescription: "No additional description provided.",
      deadlinePrefix: "Deadline",
      noDeadline: "No deadline",
      updatedPrefix: "Updated",
      emptyColumn: "No tasks in this status.",
      update: "Update",
      updating: "...",
      emptyTitle: "No tasks found",
      emptyDescription: "There are no tasks for the selected filters yet.",
    },
    pagination: {
      summary: (page, pageCount) => `Page ${page} / ${pageCount}`,
      previous: "Previous",
      next: "Next",
    },
  },
};

const PLAN_MESSAGE_COPY: Record<string, Record<AppLanguage, string>> = {
  "Bu amal faqat admin yoki manager uchun ochiq.": {
    uz: "Bu amal faqat admin yoki manager uchun ochiq.",
    en: "This action is only available to admins or managers.",
  },
  "Vazifa maydonlarini tekshirib chiqing.": {
    uz: "Vazifa maydonlarini tekshirib chiqing.",
    en: "Please review the task fields.",
  },
  "Supabase ulanishi sozlanmagan.": {
    uz: "Supabase ulanishi sozlanmagan.",
    en: "Supabase connection is not configured.",
  },
  "Vazifa saqlandi.": {
    uz: "Vazifa saqlandi.",
    en: "Task saved.",
  },
  "Vazifa nomi kamida 3 ta belgi bo'lsin.": {
    uz: "Vazifa nomi kamida 3 ta belgi bo'lsin.",
    en: "Task title must be at least 3 characters long.",
  },
  "Ijrochi tanlang.": {
    uz: "Ijrochi tanlang.",
    en: "Select an assignee.",
  },
  "Deadline noto'g'ri formatda.": {
    uz: "Deadline noto'g'ri formatda.",
    en: "Deadline has an invalid format.",
  },
  "Prioritet noto'g'ri tanlangan.": {
    uz: "Prioritet noto'g'ri tanlangan.",
    en: "Priority selection is invalid.",
  },
  "Status noto'g'ri tanlangan.": {
    uz: "Status noto'g'ri tanlangan.",
    en: "Status selection is invalid.",
  },
};

export function getPlansCopy(language: AppLanguage) {
  return COPY[language];
}

export function translatePlanMessage(
  message: string | undefined,
  language: AppLanguage,
) {
  if (!message) {
    return message;
  }

  return PLAN_MESSAGE_COPY[message]?.[language] ?? message;
}
