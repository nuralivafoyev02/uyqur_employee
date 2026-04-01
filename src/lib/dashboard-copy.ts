import type { AppLanguage } from "@/lib/preferences";

type DashboardCopy = {
  header: {
    eyebrow: string;
    leadTitle: string;
    leadDescription: string;
    employeeTitle: (firstName: string) => string;
    employeeDescription: string;
    cta: string;
  };
  metrics: {
    totalEmployees: { label: string; helper: string };
    submittedToday: { label: string; helper: string };
    pendingToday: { label: string; helper: string };
    openPlans: { label: string; helper: string };
  };
  reports: {
    leadEyebrow: string;
    employeeEyebrow: string;
    leadTitle: string;
    employeeTitle: string;
    viewAll: string;
    unknownEmployee: string;
    noTitle: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  coverage: {
    leadEyebrow: string;
    employeeEyebrow: string;
    leadTitle: string;
    employeeTitle: string;
    noTitle: string;
    profile: string;
    allSubmitted: string;
    editReport: string;
    emptyTitle: string;
    emptyDescription: string;
    submitReport: string;
  };
  plans: {
    eyebrow: string;
    title: string;
    pageLink: string;
    noDeadline: string;
    emptyTitle: string;
    emptyDescription: string;
  };
};

const COPY: Record<AppLanguage, DashboardCopy> = {
  uz: {
    header: {
      eyebrow: "Asosiy",
      leadTitle: "Jamoa faoliyati overview",
      leadDescription:
        "Bugungi holat, xodim kesimidagi hisobotlar va ochiq vazifalar bir ekranda.",
      employeeTitle: (firstName) => `Xush kelibsiz, ${firstName}`,
      employeeDescription:
        "Bugungi hisobot, faol vazifalar va so'nggi update'lar shu yerda jamlangan.",
      cta: "Bugungi hisobot",
    },
    metrics: {
      totalEmployees: {
        label: "Jami xodimlar",
        helper: "Tizimda faol profillar soni",
      },
      submittedToday: {
        label: "Bugun topshirilgan",
        helper: "Bugungi hisobot yuborgan xodimlar",
      },
      pendingToday: {
        label: "Kutilayotgan hisobotlar",
        helper: "Bugun hali report topshirmaganlar",
      },
      openPlans: {
        label: "Ochiq vazifalar",
        helper: "Tugallanmagan plans/tasks",
      },
    },
    reports: {
      leadEyebrow: "So'nggi hisobotlar",
      employeeEyebrow: "Mening hisobotlarim",
      leadTitle: "So'nggi yangilanishlar",
      employeeTitle: "So'nggi activity",
      viewAll: "Barchasini ko'rish",
      unknownEmployee: "Noma'lum xodim",
      noTitle: "Lavozim ko'rsatilmagan",
      emptyTitle: "Hisobotlar hali yo'q",
      emptyDescription: "Daily reports yuborilgach shu yerda ko'rinadi.",
    },
    coverage: {
      leadEyebrow: "Coverage",
      employeeEyebrow: "Bugungi hisobot holati",
      leadTitle: "Topshirilmagan hisobotlar",
      employeeTitle: "Bugungi status",
      noTitle: "Lavozim ko'rsatilmagan",
      profile: "Profil",
      allSubmitted: "Bugungi hisobotlar to'liq topshirilgan.",
      editReport: "Hisobotni tahrirlash",
      emptyTitle: "Bugungi hisobot hali topshirilmadi",
      emptyDescription: "2-3 maydonni to'ldirib, joriy holatni jamoaga ko'rsating.",
      submitReport: "Hisobot yuborish",
    },
    plans: {
      eyebrow: "Plans",
      title: "Faol vazifalar",
      pageLink: "Plans sahifasi",
      noDeadline: "Deadline yo'q",
      emptyTitle: "Faol vazifa topilmadi",
      emptyDescription: "Plans qo'shilgach shu blokda ko'rinadi.",
    },
  },
  en: {
    header: {
      eyebrow: "Dashboard",
      leadTitle: "Team activity overview",
      leadDescription:
        "Today's state, employee reports, and open tasks in one place.",
      employeeTitle: (firstName) => `Welcome, ${firstName}`,
      employeeDescription:
        "Your daily report, active tasks, and latest updates are gathered here.",
      cta: "Today's report",
    },
    metrics: {
      totalEmployees: {
        label: "Total employees",
        helper: "Number of active profiles in the system",
      },
      submittedToday: {
        label: "Submitted today",
        helper: "Employees who sent a report today",
      },
      pendingToday: {
        label: "Pending reports",
        helper: "Employees who have not submitted today",
      },
      openPlans: {
        label: "Open tasks",
        helper: "Incomplete plans/tasks",
      },
    },
    reports: {
      leadEyebrow: "Latest reports",
      employeeEyebrow: "My reports",
      leadTitle: "Latest updates",
      employeeTitle: "Recent activity",
      viewAll: "View all",
      unknownEmployee: "Unknown employee",
      noTitle: "Title not provided",
      emptyTitle: "No reports yet",
      emptyDescription: "Daily reports will appear here once they are submitted.",
    },
    coverage: {
      leadEyebrow: "Coverage",
      employeeEyebrow: "Today's report status",
      leadTitle: "Missing reports",
      employeeTitle: "Today's status",
      noTitle: "Title not provided",
      profile: "Profile",
      allSubmitted: "All reports for today have been submitted.",
      editReport: "Edit report",
      emptyTitle: "Today's report has not been submitted",
      emptyDescription: "Fill in 2-3 fields and share your current status with the team.",
      submitReport: "Submit report",
    },
    plans: {
      eyebrow: "Plans",
      title: "Active tasks",
      pageLink: "Open plans page",
      noDeadline: "No deadline",
      emptyTitle: "No active tasks found",
      emptyDescription: "This block will update when plans are added.",
    },
  },
};

export function getDashboardCopy(language: AppLanguage) {
  return COPY[language];
}
