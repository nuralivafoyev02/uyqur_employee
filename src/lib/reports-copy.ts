import type { AppLanguage } from "@/lib/preferences";

type ReportsCopy = {
  header: {
    eyebrow: string;
    title: string;
    description: string;
  };
  editor: {
    eyebrow: string;
    openComposer: string;
    closeComposer: string;
    quickHint: string;
    existingDescription: string;
    newDescription: string;
    collapse: string;
    expand: string;
    date: string;
    employee: string;
    openSelected: string;
    employeePlaceholder: string;
  };
  filters: {
    open: string;
    title: string;
    close: string;
    date: string;
    employee: string;
    status: string;
    all: string;
    submit: string;
  };
  history: {
    leadEyebrow: string;
    employeeEyebrow: string;
    leadTitle: string;
    employeeTitle: string;
    entries: (count: number) => string;
    unknownEmployee: string;
    noTitle: string;
    completedWork: string;
    currentWork: string;
    nextPlan: string;
    empty: string;
    edit: string;
    delete: string;
  };
  detail: {
    title: string;
    close: string;
    employee: string;
    reportDate: string;
    updatedAt: string;
    noBlockers: string;
  };
  form: {
    completedWork: string;
    completedWorkPlaceholder: string;
    completedWorkHint: string;
    currentWork: string;
    currentWorkPlaceholder: string;
    currentWorkHint: string;
    nextPlan: string;
    nextPlanPlaceholder: string;
    nextPlanHint: string;
    blockers: string;
    blockersPlaceholder: string;
    blockersHint: string;
    optional: string;
    status: string;
    statusHint: string;
    progressTitle: string;
    progressDescription: string;
    progressReady: string;
    progressPending: string;
    submit: string;
    pending: string;
  };
  pagination: {
    summary: (page: number, pageCount: number) => string;
    previous: string;
    next: string;
  };
};

const COPY: Record<AppLanguage, ReportsCopy> = {
  uz: {
    header: {
      eyebrow: "Kunlik hisobotlar",
      title: "Hisobotlar",
      description:
        "Bugungi progress, joriy ishlar va keyingi reja server action orqali saqlanadi.",
    },
    editor: {
      eyebrow: "Hisobot yaratish",
      openComposer: "Hisobot yaratish",
      closeComposer: "Editorni yopish",
      quickHint: "3 ta asosiy blokni to'ldirsangiz, hisobot tayyor bo'ladi.",
      existingDescription: "Mavjud report tahrirlash holatida ochildi.",
      newDescription: "Tanlangan sana uchun yangi hisobot yarating.",
      collapse: "Yopish",
      expand: "Ochish",
      date: "Hisobot sanasi",
      employee: "Xodim",
      openSelected: "Ochish",
      employeePlaceholder: "Xodim tanlang",
    },
    filters: {
      open: "Filtrlash",
      title: "Hisobotlarni filtrlash",
      close: "Yopish",
      date: "Sana",
      employee: "Xodim",
      status: "Status",
      all: "Barchasi",
      submit: "Filtrlash",
    },
    history: {
      leadEyebrow: "Yuborilgan hisobotlar",
      employeeEyebrow: "History",
      leadTitle: "Jamoa hisobotlari",
      employeeTitle: "Mening hisobotlarim",
      entries: (count) => `${count} ta yozuv`,
      unknownEmployee: "Noma'lum xodim",
      noTitle: "Lavozim ko'rsatilmagan",
      completedWork: "Bajarilgan ish",
      currentWork: "Joriy ish",
      nextPlan: "Keyingi reja",
      empty: "Tanlangan filter bo'yicha hisobot topilmadi.",
      edit: "Tahrirlash",
      delete: "O'chirish",
    },
    detail: {
      title: "To'liq hisobot",
      close: "Yopish",
      employee: "Xodim",
      reportDate: "Hisobot sanasi",
      updatedAt: "Yangilangan vaqti",
      noBlockers: "To'siq ko'rsatilmagan.",
    },
    form: {
      completedWork: "Bugun nimalarni yakunladingiz?",
      completedWorkPlaceholder: "Yozing...",
      completedWorkHint: "Tugatgan ish, natija va chiqgan foydani yozing.",
      currentWork: "Hozir nima ustida ishlayapsiz?",
      currentWorkPlaceholder: "Yozing...",
      currentWorkHint: "Ayni paytdagi asosiy fokus va davom etayotgan ish.",
      nextPlan: "Keyingi reja",
      nextPlanPlaceholder: "Yozing...",
      nextPlanHint: "Ertaga yoki keyingi blokda nima qilishni aniq yozing.",
      blockers: "To'siq yoki muammo",
      blockersPlaceholder: "Yozing...",
      blockersHint: "Kutish, risk yoki yordam kerak bo'lgan joylarni kiriting.",
      optional: "ixtiyoriy",
      status: "Umumiy holat",
      statusHint: "Umumiy pacing'ni bitta tugma bilan belgilang.",
      progressTitle: "Hisobot holati",
      progressDescription: "3 ta asosiy blok to'lsa, hisobot yuborishga tayyor bo'ladi.",
      progressReady: "Tayyor",
      progressPending: "Yana to'ldirish kerak",
      submit: "Hisobotni saqlash",
      pending: "Saqlanmoqda...",
    },
    pagination: {
      summary: (page, pageCount) => `Sahifa ${page} / ${pageCount}`,
      previous: "Oldingi",
      next: "Keyingi",
    },
  },
  en: {
    header: {
      eyebrow: "Daily reports",
      title: "Reports",
      description:
        "Today's progress, current work, and next steps are saved through server actions.",
    },
    editor: {
      eyebrow: "Editor",
      openComposer: "Create report",
      closeComposer: "Close editor",
      quickHint: "Complete the 3 core sections and send the update without extra friction.",
      existingDescription: "An existing report was opened in edit mode.",
      newDescription: "Create a new report for the selected date.",
      collapse: "Collapse",
      expand: "Expand",
      date: "Report date",
      employee: "Employee",
      openSelected: "Open",
      employeePlaceholder: "Select an employee",
    },
    filters: {
      open: "Filters",
      title: "Filter reports",
      close: "Close",
      date: "Date",
      employee: "Employee",
      status: "Status",
      all: "All",
      submit: "Apply filters",
    },
    history: {
      leadEyebrow: "Report feed",
      employeeEyebrow: "History",
      leadTitle: "Team reports",
      employeeTitle: "My reports",
      entries: (count) => `${count} entries`,
      unknownEmployee: "Unknown employee",
      noTitle: "Title not provided",
      completedWork: "Completed work",
      currentWork: "Current work",
      nextPlan: "Next plan",
      empty: "No reports found for the selected filters.",
      edit: "Edit",
      delete: "Delete",
    },
    detail: {
      title: "Full report",
      close: "Close",
      employee: "Employee",
      reportDate: "Report date",
      updatedAt: "Last updated",
      noBlockers: "No blockers were reported.",
    },
    form: {
      completedWork: "What did you complete today?",
      completedWorkPlaceholder: "Write...",
      completedWorkHint: "Describe what was finished and the outcome it created.",
      currentWork: "What are you working on now?",
      currentWorkPlaceholder: "Write...",
      currentWorkHint: "Capture the main focus or work currently in progress.",
      nextPlan: "Next plan",
      nextPlanPlaceholder: "Write...",
      nextPlanHint: "State the next concrete action or tomorrow's plan.",
      blockers: "Blocker or issue",
      blockersPlaceholder: "Write...",
      blockersHint: "Call out dependencies, risks, or where you need help.",
      optional: "optional",
      status: "Overall status",
      statusHint: "Pick the overall pace in one tap.",
      progressTitle: "Report health",
      progressDescription: "Once the 3 core sections are filled, the report is ready to send.",
      progressReady: "Ready",
      progressPending: "Needs attention",
      submit: "Save report",
      pending: "Saving...",
    },
    pagination: {
      summary: (page, pageCount) => `Page ${page} / ${pageCount}`,
      previous: "Previous",
      next: "Next",
    },
  },
};

const REPORT_MESSAGE_COPY: Record<string, Record<AppLanguage, string>> = {
  "Hisobotdagi maydonlarni tekshirib chiqing.": {
    uz: "Hisobotdagi maydonlarni tekshirib chiqing.",
    en: "Please review the report fields.",
  },
  "Supabase ulanishi sozlanmagan.": {
    uz: "Supabase ulanishi sozlanmagan.",
    en: "Supabase connection is not configured.",
  },
  "Hisobot saqlandi.": {
    uz: "Hisobot saqlandi.",
    en: "Report saved.",
  },
  "Sana noto'g'ri formatda.": {
    uz: "Sana noto'g'ri formatda.",
    en: "The date format is invalid.",
  },
  "Bajarilgan ishlar qismini to'ldiring.": {
    uz: "Bajarilgan ishlar qismini to'ldiring.",
    en: "Fill in the completed work section.",
  },
  "Joriy ishlar qismini to'ldiring.": {
    uz: "Joriy ishlar qismini to'ldiring.",
    en: "Fill in the current work section.",
  },
  "Keyingi reja qismini to'ldiring.": {
    uz: "Keyingi reja qismini to'ldiring.",
    en: "Fill in the next plan section.",
  },
  "Holat noto'g'ri tanlangan.": {
    uz: "Holat noto'g'ri tanlangan.",
    en: "The selected status is invalid.",
  },
  "Bu hisobotni tahrirlash huquqi yo'q.": {
    uz: "Bu hisobotni tahrirlash huquqi yo'q.",
    en: "You do not have permission to edit this report.",
  },
  "Bu hisobotni o'chirish huquqi yo'q.": {
    uz: "Bu hisobotni o'chirish huquqi yo'q.",
    en: "You do not have permission to delete this report.",
  },
  "Hisobot topilmadi.": {
    uz: "Hisobot topilmadi.",
    en: "Report not found.",
  },
  "Hisobot o'chirildi.": {
    uz: "Hisobot o'chirildi.",
    en: "Report deleted.",
  },
};

export function getReportsCopy(language: AppLanguage) {
  return COPY[language];
}

export function translateReportMessage(
  message: string | undefined,
  language: AppLanguage,
) {
  if (!message) {
    return message;
  }

  return REPORT_MESSAGE_COPY[message]?.[language] ?? message;
}
