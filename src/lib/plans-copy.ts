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
  };
  filters: {
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
    descriptionPlaceholder: string;
    assignee: string;
    assigneePlaceholder: string;
    dueDate: string;
    priority: string;
    initialStatus: string;
    submit: string;
    pending: string;
  };
  list: {
    assigneeMissing: string;
    noDescription: string;
    deadlinePrefix: string;
    noDeadline: string;
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
    },
    filters: {
      employee: "Xodim",
      status: "Status",
      priority: "Prioritet",
      all: "Barchasi",
      submit: "Filtrlash",
    },
    form: {
      title: "Vazifa nomi",
      titlePlaceholder: "Masalan, Yangi hisobot oqimini tayyorlash",
      description: "Tavsif",
      descriptionPlaceholder: "Kutilayotgan natija, eslatmalar yoki kontekst.",
      assignee: "Ijrochi",
      assigneePlaceholder: "Xodim tanlang",
      dueDate: "Deadline",
      priority: "Prioritet",
      initialStatus: "Boshlang'ich status",
      submit: "Vazifani saqlash",
      pending: "Saqlanmoqda...",
    },
    list: {
      assigneeMissing: "Ijrochi topilmadi",
      noDescription: "Qo'shimcha tavsif berilmagan.",
      deadlinePrefix: "Deadline",
      noDeadline: "Deadline yo'q",
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
    },
    filters: {
      employee: "Employee",
      status: "Status",
      priority: "Priority",
      all: "All",
      submit: "Apply filters",
    },
    form: {
      title: "Task title",
      titlePlaceholder: "For example, prepare the new report workflow",
      description: "Description",
      descriptionPlaceholder: "Expected outcome, notes, or context.",
      assignee: "Assignee",
      assigneePlaceholder: "Select an employee",
      dueDate: "Deadline",
      priority: "Priority",
      initialStatus: "Initial status",
      submit: "Save task",
      pending: "Saving...",
    },
    list: {
      assigneeMissing: "Assignee not found",
      noDescription: "No additional description provided.",
      deadlinePrefix: "Deadline",
      noDeadline: "No deadline",
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
