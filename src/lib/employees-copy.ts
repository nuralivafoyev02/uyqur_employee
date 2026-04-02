import type { AppLanguage } from "@/lib/preferences";

type EmployeesCopy = {
  list: {
    header: { eyebrow: string; title: string; description: string };
    filters: {
      open: string;
      title: string;
      close: string;
      search: string;
      searchPlaceholder: string;
      role: string;
      department: string;
      all: string;
      apply: string;
    };
    cards: {
      noTitle: string;
      department: string;
      status: string;
      statusEmpty: string;
      unassigned: string;
      lastReport: string;
      none: string;
      openTasks: string;
      openProfile: string;
    };
    pagination: {
      summary: (page: number, pageCount: number) => string;
      previous: string;
      next: string;
    };
  };
  profile: {
    headerEyebrow: string;
    noTitle: string;
    statusEmpty: string;
    metrics: {
      totalReports: { label: string; helper: string };
      blockedReports: { label: string; helper: string };
      activePlans: { label: string; helper: string };
    };
    reports: {
      eyebrow: string;
      title: string;
      pageLink: string;
      completedWork: string;
      nextPlan: string;
      emptyTitle: string;
      emptyDescription: string;
    };
    plans: {
      eyebrow: string;
      title: string;
      noDescription: string;
      deadlinePrefix: string;
      noDeadline: string;
      emptyTitle: string;
      emptyDescription: string;
    };
  };
};

const COPY: Record<AppLanguage, EmployeesCopy> = {
  uz: {
    list: {
      header: {
        eyebrow: "Xodimlar",
        title: "Xodimlar",
        description: "Qidiruv, filter va individual activity history ko'rinishi.",
      },
      filters: {
        open: "Filtrlash",
        title: "Xodimlarni filtrlash",
        close: "Yopish",
        search: "Qidiruv",
        searchPlaceholder: "Ism, lavozim, status yoki bo'lim",
        role: "Role",
        department: "Bo'lim",
        all: "Barchasi",
        apply: "Qo'llash",
      },
      cards: {
        noTitle: "Lavozim ko'rsatilmagan",
        department: "Bo'lim",
        status: "Status",
        statusEmpty: "Belgilanmagan",
        unassigned: "Belgilanmagan",
        lastReport: "Oxirgi report",
        none: "Yo'q",
        openTasks: "Ochiq vazifa",
        openProfile: "Profilni ochish",
      },
      pagination: {
        summary: (page, pageCount) => `Sahifa ${page} / ${pageCount}`,
        previous: "Oldingi",
        next: "Keyingi",
      },
    },
    profile: {
      headerEyebrow: "Xodim profili",
      noTitle: "Lavozim ko'rsatilmagan",
      statusEmpty: "Status belgilanmagan",
      metrics: {
        totalReports: { label: "Jami hisobotlar", helper: "Ko'rinib turgan hisobotlar soni" },
        blockedReports: { label: "Blocked reportlar", helper: "Muammo qayd etilgan hisobotlar" },
        activePlans: { label: "Faol vazifalar", helper: "Hali yakunlanmagan plans/tasks" },
      },
      reports: {
        eyebrow: "Reports",
        title: "Faoliyat tarixi",
        pageLink: "Reports sahifasi",
        completedWork: "Bajarilgan ish",
        nextPlan: "Keyingi reja",
        emptyTitle: "Hisobotlar topilmadi",
        emptyDescription: "Bu xodim bo'yicha hozircha hisobotlar mavjud emas.",
      },
      plans: {
        eyebrow: "Plans",
        title: "Biriktirilgan vazifalar",
        noDescription: "Qo'shimcha tavsif yo'q.",
        deadlinePrefix: "Deadline",
        noDeadline: "Deadline yo'q",
        emptyTitle: "Vazifalar topilmadi",
        emptyDescription: "Bu xodimga biriktirilgan vazifalar hozircha mavjud emas.",
      },
    },
  },
  en: {
    list: {
      header: {
        eyebrow: "Employees",
        title: "Employees",
        description: "Search, filters, and individual activity history.",
      },
      filters: {
        open: "Filters",
        title: "Filter employees",
        close: "Close",
        search: "Search",
        searchPlaceholder: "Name, title, status, or department",
        role: "Role",
        department: "Department",
        all: "All",
        apply: "Apply",
      },
      cards: {
        noTitle: "Title not provided",
        department: "Department",
        status: "Status",
        statusEmpty: "Not set",
        unassigned: "Unassigned",
        lastReport: "Last report",
        none: "None",
        openTasks: "Open tasks",
        openProfile: "Open profile",
      },
      pagination: {
        summary: (page, pageCount) => `Page ${page} / ${pageCount}`,
        previous: "Previous",
        next: "Next",
      },
    },
    profile: {
      headerEyebrow: "Employee profile",
      noTitle: "Title not provided",
      statusEmpty: "No status set",
      metrics: {
        totalReports: { label: "Total reports", helper: "Number of visible reports" },
        blockedReports: { label: "Blocked reports", helper: "Reports with recorded issues" },
        activePlans: { label: "Active tasks", helper: "Plans/tasks not completed yet" },
      },
      reports: {
        eyebrow: "Reports",
        title: "Activity history",
        pageLink: "Open reports page",
        completedWork: "Completed work",
        nextPlan: "Next plan",
        emptyTitle: "No reports found",
        emptyDescription: "There are no reports for this employee yet.",
      },
      plans: {
        eyebrow: "Plans",
        title: "Assigned tasks",
        noDescription: "No additional description.",
        deadlinePrefix: "Deadline",
        noDeadline: "No deadline",
        emptyTitle: "No tasks found",
        emptyDescription: "There are no tasks assigned to this employee yet.",
      },
    },
  },
};

export function getEmployeesCopy(language: AppLanguage) {
  return COPY[language];
}
