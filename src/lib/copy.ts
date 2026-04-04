import type { AppLanguage, AppTheme } from "@/lib/preferences";

type ShellCopy = {
  subtitle: string;
  menuAndProfile: string;
  openProfile: string;
  closeProfile: string;
  expandSidebar: string;
  collapseSidebar: string;
  collapseSidebarShort: string;
  expandSidebarShort: string;
  profileTitle: string;
  profileDescription: string;
  profileSettings: string;
  loadingName: string;
  loadingProfile: string;
  noStatus: string;
  addStatus: string;
  statusLabel: string;
  statusPlaceholder: string;
  statusSubmit: string;
  statusPending: string;
  signOut: string;
  signOutConfirmTitle: string;
  signOutConfirmDescription: string;
  signOutConfirmAction: string;
  search: {
    placeholder: string;
    loading: string;
    empty: string;
    minQuery: string;
    clear: string;
    reports: string;
    plans: string;
    suggestions: string;
    employees: string;
    open: string;
    metaDate: string;
    metaDeadline: string;
    metaUpdated: string;
  };
  nav: {
    dashboard: string;
    reports: string;
    plans: string;
    suggestions: string;
    employees: string;
    integrations: string;
    settings: string;
  };
};

type SettingsCopy = {
  eyebrow: string;
  title: string;
  description: string;
  navigationEyebrow: string;
  navigationTitle: string;
  navigationDescription: string;
  sections: {
    account: {
      label: string;
      description: string;
    };
    preferences: {
      label: string;
      description: string;
    };
    profile: {
      label: string;
      description: string;
    };
    integrations: {
      label: string;
      description: string;
    };
  };
  accountEyebrow: string;
  accountTitle: string;
  accountDescription: string;
  emailLabel: string;
  roleLabel: string;
  updatedAtLabel: string;
  preferencesEyebrow: string;
  preferencesTitle: string;
  preferencesDescription: string;
  currentSelection: string;
  languageLabel: string;
  themeLabel: string;
  profileEyebrow: string;
  profileTitle: string;
  integrationsEyebrow: string;
  integrationsTitle: string;
  integrationsDescription: string;
  profileForm: {
    fullName: string;
    title: string;
    department: string;
    profileStatus: string;
    telegramContact: string;
    titlePlaceholder: string;
    departmentPlaceholder: string;
    profileStatusPlaceholder: string;
    telegramContactPlaceholder: string;
    telegramContactHint: string;
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
      expandSidebar: "Yon panelni ochish",
      collapseSidebar: "Yon panelni yopish",
      collapseSidebarShort: "Yopish",
      expandSidebarShort: "Ochish",
      profileTitle: "Profil",
      profileDescription: "Hisob ma'lumoti va sessiya boshqaruvi.",
      profileSettings: "Profil sozlamalari",
      loadingName: "Yuklanmoqda...",
      loadingProfile: "Profil ma'lumoti yuklanmoqda",
      noStatus: "Status belgilanmagan",
      addStatus: "Status qo'shish",
      statusLabel: "Profil statusi",
      statusPlaceholder: "Masalan, Ofisda ishlayapman",
      statusSubmit: "Statusni saqlash",
      statusPending: "Saqlanmoqda...",
      signOut: "Chiqish",
      signOutConfirmTitle: "Rostdan ham hisobdan chiqmoqchimisiz?",
      signOutConfirmDescription:
        "Joriy sessiya yakunlanadi va tizimga qayta kirish talab qilinadi.",
      signOutConfirmAction: "Ha, aniq chiqaman",
      search: {
        placeholder: "Global qidiruv",
        loading: "Qidirilmoqda...",
        empty: "Hech narsa topilmadi.",
        minQuery: "Kamida 2 ta belgi yozing.",
        clear: "Tozalash",
        reports: "Hisobotlar",
        plans: "Vazifalar",
        suggestions: "Takliflar",
        employees: "Xodimlar",
        open: "Ochish",
        metaDate: "Sana",
        metaDeadline: "Deadline",
        metaUpdated: "Yangilandi",
      },
      nav: {
        dashboard: "Asosiy",
        reports: "Kunlik hisobotlar",
        plans: "Vazifalar",
        suggestions: "Takliflar",
        employees: "Xodimlar",
        integrations: "Integratsiyalar",
        settings: "Sozlamalar",
      },
    },
    settings: {
      eyebrow: "Sozlamalar",
      title: "Profil sozlamalari",
      description:
        "Asosiy profilingizni yangilang. Role boshqaruvi manager/admin tomonidan amalga oshiriladi.",
      navigationEyebrow: "Kategoriyalar",
      navigationTitle: "Sozlamalar xaritasi",
      navigationDescription:
        "Kerakli bo'limni tez topish uchun sozlamalar kategoriyalar bo'yicha ajratildi.",
      sections: {
        account: {
          label: "Akkaunt",
          description: "Email, rol va so'nggi yangilanish holati.",
        },
        preferences: {
          label: "Interfeys",
          description: "Til va yorug'lik mavzusini boshqaring.",
        },
        profile: {
          label: "Profil",
          description: "Ism, ish lavozimi, status va bo'lim ma'lumotlarini yangilang.",
        },
        integrations: {
          label: "Integratsiya",
          description: "Tashqi servislar, API credential va kelajak sync ulanishlari.",
        },
      },
      accountEyebrow: "Akkaunt",
      accountTitle: "Asosiy ma'lumot",
      accountDescription:
        "Login uchun ishlatiladigan email, joriy rol va oxirgi yangilanish holatini ko'ring.",
      emailLabel: "Email",
      roleLabel: "Rol",
      updatedAtLabel: "Oxirgi yangilanish",
      preferencesEyebrow: "Interfeys",
      preferencesTitle: "Til va ko'rinish",
      preferencesDescription: "Interfeys tilini va mavzusini tanlang.",
      currentSelection: "Tanlangan",
      languageLabel: "Til",
      themeLabel: "Mavzu",
      profileEyebrow: "Profil",
      profileTitle: "Tahrirlash",
      integrationsEyebrow: "Integratsiyalar",
      integrationsTitle: "Servis ulanishlari",
      integrationsDescription:
        "ClickUp va boshqa servislar bilan kelajak integratsiyasi uchun credential hamda mapping ma'lumotlarini boshqaring.",
      profileForm: {
        fullName: "F.I.Sh.",
        title: "Ish lavozimi",
        department: "Bo'lim",
        profileStatus: "Profil statusi",
        telegramContact: "Telegram chat ID yoki @username",
        titlePlaceholder: "Masalan, Product Manager",
        departmentPlaceholder: "Masalan, Operations",
        profileStatusPlaceholder: "Masalan, Ofisda ishlayapman",
        telegramContactPlaceholder: "Masalan, 123456789 yoki @username",
        telegramContactHint:
          "Bu maydon chat ID yoki @username qabul qiladi. Vazifa bo'yicha private xabarlarning ishonchli ishlashi uchun chat ID afzal.",
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
        {
          value: "ru",
          label: "Русский",
          hint: "Русскоязычная команда uchun qulay ko'rinish.",
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
      expandSidebar: "Expand sidebar",
      collapseSidebar: "Collapse sidebar",
      collapseSidebarShort: "Collapse",
      expandSidebarShort: "Expand",
      profileTitle: "Profile",
      profileDescription: "Account details and session controls.",
      profileSettings: "Profile settings",
      loadingName: "Loading...",
      loadingProfile: "Profile data is loading",
      noStatus: "No status set",
      addStatus: "Add status",
      statusLabel: "Profile status",
      statusPlaceholder: "For example, Working from the office",
      statusSubmit: "Save status",
      statusPending: "Saving...",
      signOut: "Sign out",
      signOutConfirmTitle: "Are you sure you want to sign out?",
      signOutConfirmDescription:
        "Your current session will end and you will need to sign in again.",
      signOutConfirmAction: "Yes, sign out",
      search: {
        placeholder: "Global search",
        loading: "Searching...",
        empty: "Nothing was found.",
        minQuery: "Type at least 2 characters.",
        clear: "Clear",
        reports: "Reports",
        plans: "Tasks",
        suggestions: "Suggestions",
        employees: "Employees",
        open: "Open",
        metaDate: "Date",
        metaDeadline: "Deadline",
        metaUpdated: "Updated",
      },
      nav: {
        dashboard: "Home",
        reports: "Daily Reports",
        plans: "Tasks",
        suggestions: "Suggestions",
        employees: "Employees",
        integrations: "Integrations",
        settings: "Settings",
      },
    },
    settings: {
      eyebrow: "Settings",
      title: "Profile settings",
      description:
        "Update your primary profile details. Role management is handled by managers and admins.",
      navigationEyebrow: "Categories",
      navigationTitle: "Settings map",
      navigationDescription:
        "Each area is grouped into clear categories so the right control is easier to find.",
      sections: {
        account: {
          label: "Account",
          description: "Email, role, and the latest update status.",
        },
        preferences: {
          label: "Interface",
          description: "Manage language and light or dark theme.",
        },
        profile: {
          label: "Profile",
          description: "Update your name, job title, status, and department details.",
        },
        integrations: {
          label: "Integrations",
          description: "External services, API credentials, and future sync connections.",
        },
      },
      accountEyebrow: "Account",
      accountTitle: "Primary information",
      accountDescription:
        "Review your sign-in email, current role, and the latest profile update timestamp.",
      emailLabel: "Email",
      roleLabel: "Role",
      updatedAtLabel: "Last updated",
      preferencesEyebrow: "Preferences",
      preferencesTitle: "Language and theme",
      preferencesDescription: "Choose your interface language and theme.",
      currentSelection: "Selected",
      languageLabel: "Language",
      themeLabel: "Theme",
      profileEyebrow: "Profile",
      profileTitle: "Edit profile",
      integrationsEyebrow: "Integrations",
      integrationsTitle: "Service connections",
      integrationsDescription:
        "Manage credentials and mapping details for future ClickUp and external service integrations.",
      profileForm: {
        fullName: "Full name",
        title: "Job title",
        department: "Department",
        profileStatus: "Profile status",
        telegramContact: "Telegram chat ID or @username",
        titlePlaceholder: "For example, Product Manager",
        departmentPlaceholder: "For example, Operations",
        profileStatusPlaceholder: "For example, Working from the office",
        telegramContactPlaceholder: "For example, 123456789 or @username",
        telegramContactHint:
          "This field accepts a chat ID or @username. A real chat ID is still the most reliable option for private task alerts.",
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
        {
          value: "ru",
          label: "Русский",
          hint: "A better fit for Russian-speaking teams.",
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
  ru: {
    common: {
      active: "Активно",
      cancel: "Отмена",
      close: "Закрыть",
    },
    shell: {
      subtitle: "ERP-система Uyqur Support",
      menuAndProfile: "Меню",
      openProfile: "Открыть панель профиля",
      closeProfile: "Закрыть панель профиля",
      expandSidebar: "Развернуть боковую панель",
      collapseSidebar: "Свернуть боковую панель",
      collapseSidebarShort: "Свернуть",
      expandSidebarShort: "Развернуть",
      profileTitle: "Профиль",
      profileDescription: "Данные аккаунта и управление сессией.",
      profileSettings: "Настройки профиля",
      loadingName: "Загрузка...",
      loadingProfile: "Загружаются данные профиля",
      noStatus: "Статус не указан",
      addStatus: "Добавить статус",
      statusLabel: "Статус профиля",
      statusPlaceholder: "Например, Работаю из офиса",
      statusSubmit: "Сохранить статус",
      statusPending: "Сохранение...",
      signOut: "Выйти",
      signOutConfirmTitle: "Вы действительно хотите выйти из аккаунта?",
      signOutConfirmDescription:
        "Текущая сессия завершится, и вам нужно будет войти снова.",
      signOutConfirmAction: "Да, выйти",
      search: {
        placeholder: "Глобальный поиск",
        loading: "Поиск...",
        empty: "Ничего не найдено.",
        minQuery: "Введите минимум 2 символа.",
        clear: "Очистить",
        reports: "Отчеты",
        plans: "Задачи",
        suggestions: "Предложения",
        employees: "Сотрудники",
        open: "Открыть",
        metaDate: "Дата",
        metaDeadline: "Срок",
        metaUpdated: "Обновлено",
      },
      nav: {
        dashboard: "Главная",
        reports: "Ежедневные отчеты",
        plans: "Задачи",
        suggestions: "Предложения",
        employees: "Сотрудники",
        integrations: "Интеграции",
        settings: "Настройки",
      },
    },
    settings: {
      eyebrow: "Настройки",
      title: "Настройки профиля",
      description:
        "Обновите основные данные профиля. Управление ролями выполняют менеджеры и администраторы.",
      navigationEyebrow: "Категории",
      navigationTitle: "Карта настроек",
      navigationDescription:
        "Настройки разделены на категории, чтобы нужный раздел находился быстрее.",
      sections: {
        account: {
          label: "Аккаунт",
          description: "Email, роль и статус последнего обновления.",
        },
        preferences: {
          label: "Интерфейс",
          description: "Управление языком и светлой или темной темой.",
        },
        profile: {
          label: "Профиль",
          description: "Обновите имя, должность, статус и отдел.",
        },
        integrations: {
          label: "Интеграция",
          description: "Внешние сервисы, API credentials и будущие sync-подключения.",
        },
      },
      accountEyebrow: "Аккаунт",
      accountTitle: "Основная информация",
      accountDescription:
        "Просматривайте email для входа, текущую роль и время последнего обновления профиля.",
      emailLabel: "Email",
      roleLabel: "Роль",
      updatedAtLabel: "Последнее обновление",
      preferencesEyebrow: "Интерфейс",
      preferencesTitle: "Язык и тема",
      preferencesDescription: "Выберите язык интерфейса и тему.",
      currentSelection: "Выбрано",
      languageLabel: "Язык",
      themeLabel: "Тема",
      profileEyebrow: "Профиль",
      profileTitle: "Редактирование",
      integrationsEyebrow: "Интеграции",
      integrationsTitle: "Подключения сервисов",
      integrationsDescription:
        "Управляйте credentials и mapping-данными для будущей интеграции с ClickUp и другими сервисами.",
      profileForm: {
        fullName: "Ф.И.О.",
        title: "Должность",
        department: "Отдел",
        profileStatus: "Статус профиля",
        telegramContact: "Telegram chat ID или @username",
        titlePlaceholder: "Например, Product Manager",
        departmentPlaceholder: "Например, Operations",
        profileStatusPlaceholder: "Например, Работаю из офиса",
        telegramContactPlaceholder: "Например, 123456789 или @username",
        telegramContactHint:
          "Поле принимает chat ID или @username. Для личных уведомлений о задачах chat ID все еще остается самым надежным вариантом.",
        submit: "Обновить профиль",
        pending: "Обновление...",
      },
      languageOptions: [
        {
          value: "uz",
          label: "O'zbekcha",
          hint: "Подходит для внутреннего узбекского рабочего процесса.",
        },
        {
          value: "en",
          label: "English",
          hint: "Удобно для смешанных или международных команд.",
        },
        {
          value: "ru",
          label: "Русский",
          hint: "Полная русскоязычная локализация интерфейса.",
        },
      ],
      themeOptions: [
        {
          value: "light",
          label: "Светлая",
          hint: "Чистый вид для ежедневной офисной работы.",
        },
        {
          value: "dark",
          label: "Темная",
          hint: "Комфортнее для глаз при слабом освещении.",
        },
      ],
    },
  },
};

const PROFILE_MESSAGE_COPY: Record<string, Record<AppLanguage, string>> = {
  "Profil maydonlarini tekshiring.": {
    uz: "Profil maydonlarini tekshiring.",
    en: "Please review the profile fields.",
    ru: "Проверьте поля профиля.",
  },
  "Supabase ulanishi sozlanmagan.": {
    uz: "Supabase ulanishi sozlanmagan.",
    en: "Supabase connection is not configured.",
    ru: "Подключение Supabase не настроено.",
  },
  "Profil yangilandi.": {
    uz: "Profil yangilandi.",
    en: "Profile updated.",
    ru: "Профиль обновлен.",
  },
  "Status yangilandi.": {
    uz: "Status yangilandi.",
    en: "Status updated.",
    ru: "Статус обновлен.",
  },
  "Status maydonini tekshiring.": {
    uz: "Status maydonini tekshiring.",
    en: "Please review the status field.",
    ru: "Проверьте поле статуса.",
  },
  "Ism kamida 2 ta belgidan iborat bo'lsin.": {
    uz: "Ism kamida 2 ta belgidan iborat bo'lsin.",
    en: "Full name must be at least 2 characters long.",
    ru: "Полное имя должно содержать минимум 2 символа.",
  },
  "Profil statusi 60 ta belgidan oshmasin.": {
    uz: "Profil statusi 60 ta belgidan oshmasin.",
    en: "Profile status must be 60 characters or fewer.",
    ru: "Статус профиля не должен превышать 60 символов.",
  },
  "Telegram identifikatori noto'g'ri ko'rinmoqda.": {
    uz: "Telegram identifikatori noto'g'ri ko'rinmoqda.",
    en: "The Telegram identifier looks invalid.",
    ru: "Похоже, Telegram идентификатор указан неверно.",
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
