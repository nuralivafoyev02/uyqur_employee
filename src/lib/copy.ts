import type { AppLanguage, AppTheme } from "@/lib/preferences";

type ShellCopy = {
  subtitle: string;
  menuAndProfile: string;
  openProfile: string;
  closeProfile: string;
  profileTitle: string;
  profileDescription: string;
  loadingName: string;
  loadingProfile: string;
  signOut: string;
  signOutConfirmTitle: string;
  signOutConfirmDescription: string;
  signOutConfirmAction: string;
  nav: {
    dashboard: string;
    reports: string;
    plans: string;
    employees: string;
    settings: string;
  };
};

type SettingsCopy = {
  eyebrow: string;
  title: string;
  description: string;
  accountEyebrow: string;
  accountTitle: string;
  emailLabel: string;
  updatedAtLabel: string;
  preferencesEyebrow: string;
  preferencesTitle: string;
  preferencesDescription: string;
  currentSelection: string;
  languageLabel: string;
  themeLabel: string;
  profileEyebrow: string;
  profileTitle: string;
  profileForm: {
    fullName: string;
    title: string;
    department: string;
    titlePlaceholder: string;
    departmentPlaceholder: string;
    submit: string;
    pending: string;
  };
  languageOptions: Array<{
    value: AppLanguage;
    label: string;
    hint: string;
  }>;
  themeOptions: Array<{
    value: AppTheme;
    label: string;
    hint: string;
  }>;
};

export type AppCopy = {
  common: {
    active: string;
    cancel: string;
    close: string;
  };
  shell: ShellCopy;
  settings: SettingsCopy;
};

const COPY: Record<AppLanguage, AppCopy> = {
  uz: {
    common: {
      active: "Faol",
      cancel: "Fikrimdan qaytdim",
      close: "Yopish",
    },
    shell: {
      subtitle: "Uyqur Support ERP tizimi",
      menuAndProfile: "Menyu",
      openProfile: "Profil panelini ochish",
      closeProfile: "Profil panelini yopish",
      profileTitle: "Profil",
      profileDescription: "Hisob ma'lumoti va sessiya boshqaruvi.",
      loadingName: "Yuklanmoqda...",
      loadingProfile: "Profil ma'lumoti yuklanmoqda",
      signOut: "Chiqish",
      signOutConfirmTitle: "Rostdan ham hisobdan chiqmoqchimisiz?",
      signOutConfirmDescription:
        "Joriy sessiya yakunlanadi va tizimga qayta kirish talab qilinadi.",
      signOutConfirmAction: "Ha, aniq chiqaman",
      nav: {
        dashboard: "Asosiy",
        reports: "Kunlik hisobotlar",
        plans: "Vazifalar",
        employees: "Xodimlar",
        settings: "Sozlamalar",
      },
    },
    settings: {
      eyebrow: "Sozlamalar",
      title: "Profil sozlamalari",
      description:
        "Asosiy profilingizni yangilang. Role boshqaruvi manager/admin tomonidan amalga oshiriladi.",
      accountEyebrow: "Akkaunt",
      accountTitle: "Asosiy ma'lumot",
      emailLabel: "Email",
      updatedAtLabel: "Oxirgi yangilanish",
      preferencesEyebrow: "Interfeys",
      preferencesTitle: "Til va ko'rinish",
      preferencesDescription:
        "Interfeys tilini va mavzusini tanlang.",
      currentSelection: "Tanlangan",
      languageLabel: "Til",
      themeLabel: "Mavzu",
      profileEyebrow: "Profil",
      profileTitle: "Tahrirlash",
      profileForm: {
        fullName: "F.I.Sh.",
        title: "Lavozim",
        department: "Bo'lim",
        titlePlaceholder: "Masalan, Product Manager",
        departmentPlaceholder: "Masalan, Operations",
        submit: "Profilni yangilash",
        pending: "Yangilanmoqda...",
      },
      languageOptions: [
        {
          value: "uz",
          label: "O'zbekcha",
          hint: "Default ichki ish jarayoni uchun tavsiya etiladi.",
        },
        {
          value: "en",
          label: "English",
          hint: "Aralash yoki xalqaro jamoalar uchun qulay.",
        },
      ],
      themeOptions: [
        {
          value: "light",
          label: "Yorug'",
          hint: "Toza va kundalik ish uchun qulay ko'rinish.",
        },
        {
          value: "dark",
          label: "Qorong'i",
          hint: "Kam yorug'likda ko'zga yengilroq ko'rinish.",
        },
      ],
    },
  },
  en: {
    common: {
      active: "Active",
      cancel: "Cancel",
      close: "Close",
    },
    shell: {
      subtitle: "Uyqur Support ERP system",
      menuAndProfile: "Menu",
      openProfile: "Open profile panel",
      closeProfile: "Close profile panel",
      profileTitle: "Profile",
      profileDescription: "Account details and session controls.",
      loadingName: "Loading...",
      loadingProfile: "Profile data is loading",
      signOut: "Sign out",
      signOutConfirmTitle: "Are you sure you want to sign out?",
      signOutConfirmDescription:
        "Your current session will end and you will need to sign in again.",
      signOutConfirmAction: "Yes, sign out",
      nav: {
        dashboard: "Home",
        reports: "Daily Reports",
        plans: "Tasks",
        employees: "Employees",
        settings: "Settings",
      },
    },
    settings: {
      eyebrow: "Settings",
      title: "Profile settings",
      description:
        "Update your primary profile details. Role management is handled by managers and admins.",
      accountEyebrow: "Account",
      accountTitle: "Primary information",
      emailLabel: "Email",
      updatedAtLabel: "Last updated",
      preferencesEyebrow: "Preferences",
      preferencesTitle: "Language and theme",
      preferencesDescription:
        "Choose your interface language and theme.",
      currentSelection: "Selected",
      languageLabel: "Language",
      themeLabel: "Theme",
      profileEyebrow: "Profile",
      profileTitle: "Edit profile",
      profileForm: {
        fullName: "Full name",
        title: "Title",
        department: "Department",
        titlePlaceholder: "For example, Product Manager",
        departmentPlaceholder: "For example, Operations",
        submit: "Update profile",
        pending: "Updating...",
      },
      languageOptions: [
        {
          value: "uz",
          label: "O'zbekcha",
          hint: "Recommended default for the internal team workflow.",
        },
        {
          value: "en",
          label: "English",
          hint: "Better for mixed or international teams.",
        },
      ],
      themeOptions: [
        {
          value: "light",
          label: "Light",
          hint: "Clean look for everyday office work.",
        },
        {
          value: "dark",
          label: "Dark",
          hint: "Easier on the eyes in low-light environments.",
        },
      ],
    },
  },
};

const PROFILE_MESSAGE_COPY: Record<string, Record<AppLanguage, string>> = {
  "Profil maydonlarini tekshiring.": {
    uz: "Profil maydonlarini tekshiring.",
    en: "Please review the profile fields.",
  },
  "Supabase ulanishi sozlanmagan.": {
    uz: "Supabase ulanishi sozlanmagan.",
    en: "Supabase connection is not configured.",
  },
  "Profil yangilandi.": {
    uz: "Profil yangilandi.",
    en: "Profile updated.",
  },
  "Ism kamida 2 ta belgidan iborat bo'lsin.": {
    uz: "Ism kamida 2 ta belgidan iborat bo'lsin.",
    en: "Full name must be at least 2 characters long.",
  },
};

export function getAppCopy(language: AppLanguage) {
  return COPY[language];
}

export function translateProfileMessage(
  message: string | undefined,
  language: AppLanguage,
) {
  if (!message) {
    return message;
  }

  return PROFILE_MESSAGE_COPY[message]?.[language] ?? message;
}
