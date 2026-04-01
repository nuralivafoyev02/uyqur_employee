import type { AppLanguage } from "@/lib/preferences";

type ReportsCopy = {
  header: {
    eyebrow: string;
    title: string;
    description: string;
  };
  editor: {
    eyebrow: string;
    existingDescription: string;
    newDescription: string;
  };
  filters: {
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
  };
  form: {
    completedWork: string;
    completedWorkPlaceholder: string;
    currentWork: string;
    currentWorkPlaceholder: string;
    nextPlan: string;
    nextPlanPlaceholder: string;
    blockers: string;
    blockersPlaceholder: string;
    status: string;
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
      eyebrow: "Editor",
      existingDescription: "Mavjud report tahrirlash holatida ochildi.",
      newDescription: "Tanlangan sana uchun yangi hisobot yarating.",
    },
    filters: {
      date: "Sana",
      employee: "Xodim",
      status: "Status",
      all: "Barchasi",
      submit: "Filtrlash",
    },
    history: {
      leadEyebrow: "Report feed",
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
    },
    form: {
      completedWork: "Bugun nimalarni yakunladingiz?",
      completedWorkPlaceholder: "Qisqa, aniq va natijaga yo'naltirilgan yozing.",
      currentWork: "Hozir nima ustida ishlayapsiz?",
      currentWorkPlaceholder: "Joriy fokusni kiriting.",
      nextPlan: "Keyingi reja",
      nextPlanPlaceholder: "Keyingi qadamlarni kiriting.",
      blockers: "To'siq yoki muammo",
      blockersPlaceholder: "Agar muammo bo'lsa, shu yerga yozing.",
      status: "Umumiy holat",
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
      existingDescription: "An existing report was opened in edit mode.",
      newDescription: "Create a new report for the selected date.",
    },
    filters: {
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
    },
    form: {
      completedWork: "What did you complete today?",
      completedWorkPlaceholder: "Keep it concise, clear, and outcome-oriented.",
      currentWork: "What are you working on now?",
      currentWorkPlaceholder: "Describe your current focus.",
      nextPlan: "Next plan",
      nextPlanPlaceholder: "Outline the next steps.",
      blockers: "Blocker or issue",
      blockersPlaceholder: "If there is an issue, write it here.",
      status: "Overall status",
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
