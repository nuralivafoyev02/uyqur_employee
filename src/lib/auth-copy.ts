import type { AppLanguage } from "@/lib/preferences";

type AuthCopy = {
  layout: {
    eyebrow: string;
    title: string;
    description: string;
    featuresTitle: string;
    features: string[];
    brand: string;
  };
  login: {
    eyebrow: string;
    title: string;
    description: string;
    noAccount: string;
    registerLink: string;
  };
  register: {
    eyebrow: string;
    title: string;
    description: string;
    hasAccount: string;
    loginLink: string;
  };
  form: {
    fullName: string;
    fullNamePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    showPassword: string;
    hidePassword: string;
    createAccount: string;
    creating: string;
    signIn: string;
    signingIn: string;
  };
  warnings: {
    supabaseNotReady: string;
  };
};

const COPY: Record<AppLanguage, AuthCopy> = {
  uz: {
    layout: {
      eyebrow: "Uyqur Employee",
      title: "Hisobot, reja va xodim nazorati bir joyda.",
      description:
        "Ichki jamoa uchun tezkor web app. Har bir hisobot server tomondan himoyalangan, rollarga asoslangan access bilan boshqariladi.",
      featuresTitle: "Asosiy imkoniyatlar",
      features: [
        "Bugungi hisobotni 2-3 bosishda topshirish",
        "Admin va manager uchun filtrlash va kuzatish",
        "Rejalar va vazifalarni deadline hamda prioritet bilan boshqarish",
      ],
      brand: "Uyqur",
    },
    login: {
      eyebrow: "Kirish",
      title: "Ish jarayoniga qayting",
      description: "Hisobotlar, vazifalar va rejalar shu yerdan boshqariladi.",
      noAccount: "Hisob yo'qmi?",
      registerLink: "Ro'yxatdan o'tish",
    },
    register: {
      eyebrow: "Ro'yxatdan o'tish",
      title: "Yangi xodim hisobi yarating",
      description: "Yangi foydalanuvchilar standart holatda `employee` roli bilan yaratiladi.",
      hasAccount: "Hisob mavjudmi?",
      loginLink: "Login qilish",
    },
    form: {
      fullName: "F.I.Sh.",
      fullNamePlaceholder: "Masalan, Sardor Qodirov",
      email: "Email",
      emailPlaceholder: "name@company.com",
      password: "Parol",
      passwordPlaceholder: "Kamida 8 ta belgi",
      showPassword: "Ko'rsat",
      hidePassword: "Yashir",
      createAccount: "Hisob yaratish",
      creating: "Yaratilmoqda...",
      signIn: "Kirish",
      signingIn: "Kirilmoqda...",
    },
    warnings: {
      supabaseNotReady: "`.env.local` ichiga haqiqiy Supabase qiymatlari kiritilmaguncha auth ishlamaydi.",
    },
  },
  en: {
    layout: {
      eyebrow: "Uyqur Employee",
      title: "Reports, plans, and employee visibility in one place.",
      description:
        "A fast internal web app for the team. Every report is protected on the server and managed with role-based access.",
      featuresTitle: "Core capabilities",
      features: [
        "Submit today's report in 2-3 quick steps",
        "Filter and monitor work for admins and managers",
        "Manage plans and tasks with deadlines and priorities",
      ],
      brand: "Uyqur",
    },
    login: {
      eyebrow: "Sign in",
      title: "Return to your workflow",
      description: "Reports, tasks, and planning are managed from here.",
      noAccount: "Don't have an account?",
      registerLink: "Register",
    },
    register: {
      eyebrow: "Register",
      title: "Create a new employee account",
      description: "New users are created with the default `employee` role.",
      hasAccount: "Already have an account?",
      loginLink: "Sign in",
    },
    form: {
      fullName: "Full name",
      fullNamePlaceholder: "For example, Sardor Qodirov",
      email: "Email",
      emailPlaceholder: "name@company.com",
      password: "Password",
      passwordPlaceholder: "At least 8 characters",
      showPassword: "Show",
      hidePassword: "Hide",
      createAccount: "Create account",
      creating: "Creating...",
      signIn: "Sign in",
      signingIn: "Signing in...",
    },
    warnings: {
      supabaseNotReady: "Auth will not work until real Supabase values are added to `.env.local`.",
    },
  },
  ru: {
    layout: {
      eyebrow: "Uyqur Employee",
      title: "Отчеты, планы и контроль сотрудников в одном месте.",
      description:
        "Быстрое внутреннее веб-приложение для команды. Каждый отчет защищен на сервере и управляется через роли.",
      featuresTitle: "Ключевые возможности",
      features: [
        "Сдавайте сегодняшний отчет за 2-3 быстрых шага",
        "Фильтрация и мониторинг для администраторов и менеджеров",
        "Управление планами и задачами по срокам и приоритетам",
      ],
      brand: "Uyqur",
    },
    login: {
      eyebrow: "Вход",
      title: "Вернитесь к рабочему процессу",
      description: "Отчеты, задачи и планы управляются отсюда.",
      noAccount: "Нет аккаунта?",
      registerLink: "Регистрация",
    },
    register: {
      eyebrow: "Регистрация",
      title: "Создайте новый аккаунт сотрудника",
      description: "Новые пользователи по умолчанию создаются с ролью `employee`.",
      hasAccount: "Уже есть аккаунт?",
      loginLink: "Войти",
    },
    form: {
      fullName: "Ф.И.О.",
      fullNamePlaceholder: "Например, Sardor Qodirov",
      email: "Email",
      emailPlaceholder: "name@company.com",
      password: "Пароль",
      passwordPlaceholder: "Минимум 8 символов",
      showPassword: "Показать",
      hidePassword: "Скрыть",
      createAccount: "Создать аккаунт",
      creating: "Создание...",
      signIn: "Войти",
      signingIn: "Вход...",
    },
    warnings: {
      supabaseNotReady: "Авторизация не будет работать, пока в `.env.local` не добавлены реальные значения Supabase.",
    },
  },
};

const AUTH_MESSAGE_COPY: Record<string, Record<AppLanguage, string>> = {
  "Ism kamida 2 ta belgidan iborat bo'lsin.": {
    uz: "Ism kamida 2 ta belgidan iborat bo'lsin.",
    en: "Full name must be at least 2 characters long.",
    ru: "Имя должно содержать минимум 2 символа.",
  },
  "To'g'ri email kiriting.": {
    uz: "To'g'ri email kiriting.",
    en: "Enter a valid email address.",
    ru: "Введите корректный email.",
  },
  "Parol kamida 8 ta belgidan iborat bo'lsin.": {
    uz: "Parol kamida 8 ta belgidan iborat bo'lsin.",
    en: "Password must be at least 8 characters long.",
    ru: "Пароль должен содержать минимум 8 символов.",
  },
  "Maydonlarni tekshirib qayta urinib ko'ring.": {
    uz: "Maydonlarni tekshirib qayta urinib ko'ring.",
    en: "Check the fields and try again.",
    ru: "Проверьте поля и попробуйте снова.",
  },
  "Supabase ulanishi sozlanmagan. `.env.local` ni tekshirib ko'ring.": {
    uz: "Supabase ulanishi sozlanmagan. `.env.local` ni tekshirib ko'ring.",
    en: "Supabase connection is not configured. Check `.env.local`.",
    ru: "Подключение Supabase не настроено. Проверьте `.env.local`.",
  },
  "Login muvaffaqiyatsiz bo'ldi. Email yoki parol noto'g'ri.": {
    uz: "Login muvaffaqiyatsiz bo'ldi. Email yoki parol noto'g'ri.",
    en: "Sign in failed. The email or password is incorrect.",
    ru: "Не удалось войти. Email или пароль указаны неверно.",
  },
  "Maydonlarni to'g'rilab qayta yuboring.": {
    uz: "Maydonlarni to'g'rilab qayta yuboring.",
    en: "Correct the fields and submit again.",
    ru: "Исправьте поля и отправьте форму снова.",
  },
  "Hisob yaratildi. Endi email va parol bilan tizimga kiring.": {
    uz: "Hisob yaratildi. Endi email va parol bilan tizimga kiring.",
    en: "Account created. Now sign in with your email and password.",
    ru: "Аккаунт создан. Теперь войдите с помощью email и пароля.",
  },
};

export function getAuthCopy(language: AppLanguage) {
  return COPY[language];
}

export function translateAuthMessage(
  message: string | undefined,
  language: AppLanguage,
) {
  if (!message) {
    return message;
  }

  return AUTH_MESSAGE_COPY[message]?.[language] ?? message;
}
