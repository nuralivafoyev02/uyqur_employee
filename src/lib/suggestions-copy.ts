import type { AppLanguage } from "@/lib/preferences";

type SuggestionsCopy = {
  header: {
    eyebrow: string;
    title: string;
    description: string;
    compact: string;
    expanded: string;
  };
  filters: {
    open: string;
    title: string;
    close: string;
    search: string;
    employee: string;
    status: string;
    all: string;
    submit: string;
  };
  stats: {
    total: string;
    fresh: string;
    accepted: string;
    prepared: string;
    canceled: string;
  };
  create: {
    eyebrow: string;
    title: string;
    description: string;
    toggleDetails: string;
    hideDetails: string;
    titleLabel: string;
    descriptionLabel: string;
    titlePlaceholder: string;
    descriptionPlaceholder: string;
    submit: string;
    pending: string;
    success: string;
  };
  list: {
    eyebrow: string;
    title: string;
    description: string;
    active: string;
    archive: string;
    archiveOpen: string;
    archiveClose: string;
    openDetail: string;
    noDescription: string;
    noSuggestionsTitle: string;
    noSuggestionsDescription: string;
    emptyActive: string;
    emptyArchive: string;
    compactHint: string;
    fullHint: string;
  };
  detail: {
    title: string;
    close: string;
    createdAt: string;
    updatedAt: string;
    employee: string;
    titleLabel: string;
    descriptionLabel: string;
    noDescription: string;
    statusActions: string;
    accept: string;
    cancel: string;
    prepare: string;
    updating: string;
  };
  pagination: {
    summary: (page: number, pageCount: number) => string;
  };
};

const COPY: Record<AppLanguage, SuggestionsCopy> = {
  uz: {
    header: {
      eyebrow: "Takliflar",
      title: "Takliflar trackingi",
      description:
        "Xodimlar g'oyalari, ularning statusi va umumiy takliflar oqimi bir joyda boshqariladi.",
      compact: "Qisqa ko'rinish",
      expanded: "To'liq ko'rinish",
    },
    filters: {
      open: "Filtrlash",
      title: "Takliflarni filtrlash",
      close: "Filterni yopish",
      search: "Qidiruv",
      employee: "Xodim",
      status: "Status",
      all: "Barchasi",
      submit: "Qo'llash",
    },
    stats: {
      total: "Jami takliflar",
      fresh: "Yangi",
      accepted: "Qabul qilingan",
      prepared: "Tayyorlangan",
      canceled: "Bekor qilingan",
    },
    create: {
      eyebrow: "Tezkor qo'shish",
      title: "Yangi taklif qoldiring",
      description:
        "Bitta sarlavha bilan tez qo'shing, xohlasangiz pastda batafsil izoh ham yozing.",
      toggleDetails: "Izoh qo'shish",
      hideDetails: "Izohni yopish",
      titleLabel: "Taklif sarlavhasi",
      descriptionLabel: "Batafsil izoh",
      titlePlaceholder: "Yozing...",
      descriptionPlaceholder: "Yozing...",
      submit: "Taklif qo'shish",
      pending: "Yuborilmoqda...",
      success: "Taklif saqlandi.",
    },
    list: {
      eyebrow: "Takliflar ro'yxati",
      title: "Barcha takliflar",
      description:
        "Faol takliflar yuqorida, yakunlangan yoki bekor qilingan takliflar pastdagi archive ichida.",
      active: "Yangi takliflar",
      archive: "Arxiv",
      archiveOpen: "Arxivni ochish",
      archiveClose: "Arxivni yopish",
      openDetail: "To'liq ko'rish",
      noDescription: "Batafsil izoh kiritilmagan.",
      noSuggestionsTitle: "Takliflar hali yo'q",
      noSuggestionsDescription: "Birinchi taklif qo'shilgach shu yerda ko'rinadi.",
      emptyActive: "Hozircha faol taklif topilmadi.",
      emptyArchive: "Archive bo'sh.",
      compactHint: "Qisqa ko'rinish yoqilgan",
      fullHint: "To'liq ko'rinish yoqilgan",
    },
    detail: {
      title: "Taklif tafsiloti",
      close: "Yopish",
      createdAt: "Yaratilgan",
      updatedAt: "Yangilangan",
      employee: "Muallif",
      titleLabel: "Sarlavha",
      descriptionLabel: "Batafsil izoh",
      noDescription: "Batafsil izoh qoldirilmagan.",
      statusActions: "Statusni yangilash",
      accept: "Qabul qilish",
      cancel: "Bekor qilish",
      prepare: "Tayyorlandi",
      updating: "Yangilanmoqda...",
    },
    pagination: {
      summary: (page, pageCount) => `Sahifa ${page} / ${pageCount}`,
    },
  },
  en: {
    header: {
      eyebrow: "Suggestions",
      title: "Suggestion tracker",
      description:
        "Track employee ideas, their statuses, and the overall suggestion pipeline in one place.",
      compact: "Compact view",
      expanded: "Expanded view",
    },
    filters: {
      open: "Filter",
      title: "Filter suggestions",
      close: "Close filters",
      search: "Search",
      employee: "Employee",
      status: "Status",
      all: "All",
      submit: "Apply",
    },
    stats: {
      total: "Total suggestions",
      fresh: "New",
      accepted: "Accepted",
      prepared: "Prepared",
      canceled: "Canceled",
    },
    create: {
      eyebrow: "Quick add",
      title: "Share a new suggestion",
      description:
        "Add it quickly with a short title, and expand the details field only when needed.",
      toggleDetails: "Add details",
      hideDetails: "Hide details",
      titleLabel: "Suggestion title",
      descriptionLabel: "Details",
      titlePlaceholder: "Type here...",
      descriptionPlaceholder: "Type here...",
      submit: "Add suggestion",
      pending: "Saving...",
      success: "Suggestion saved.",
    },
    list: {
      eyebrow: "Suggestion list",
      title: "All suggestions",
      description:
        "Active suggestions stay on top, while prepared and canceled items stay inside the archive.",
      active: "Active suggestions",
      archive: "Archive",
      archiveOpen: "Open archive",
      archiveClose: "Close archive",
      openDetail: "Open full view",
      noDescription: "No detailed description was added.",
      noSuggestionsTitle: "No suggestions yet",
      noSuggestionsDescription: "Suggestions will appear here once they are submitted.",
      emptyActive: "No active suggestions found.",
      emptyArchive: "The archive is empty.",
      compactHint: "Compact view is on",
      fullHint: "Expanded view is on",
    },
    detail: {
      title: "Suggestion detail",
      close: "Close",
      createdAt: "Created",
      updatedAt: "Updated",
      employee: "Author",
      titleLabel: "Title",
      descriptionLabel: "Details",
      noDescription: "No detailed description was provided.",
      statusActions: "Update status",
      accept: "Accept",
      cancel: "Cancel",
      prepare: "Prepared",
      updating: "Updating...",
    },
    pagination: {
      summary: (page, pageCount) => `Page ${page} / ${pageCount}`,
    },
  },
  ru: {
    header: {
      eyebrow: "Предложения",
      title: "Трекинг предложений",
      description:
        "Идеи сотрудников, их статусы и общий поток предложений управляются в одном месте.",
      compact: "Компактный вид",
      expanded: "Полный вид",
    },
    filters: {
      open: "Фильтр",
      title: "Фильтр предложений",
      close: "Закрыть фильтр",
      search: "Поиск",
      employee: "Сотрудник",
      status: "Статус",
      all: "Все",
      submit: "Применить",
    },
    stats: {
      total: "Всего предложений",
      fresh: "Новые",
      accepted: "Принятые",
      prepared: "Подготовленные",
      canceled: "Отмененные",
    },
    create: {
      eyebrow: "Быстрое добавление",
      title: "Оставьте новое предложение",
      description:
        "Быстро добавьте предложение по заголовку, а детали раскройте только при необходимости.",
      toggleDetails: "Добавить детали",
      hideDetails: "Скрыть детали",
      titleLabel: "Заголовок предложения",
      descriptionLabel: "Подробности",
      titlePlaceholder: "Напишите...",
      descriptionPlaceholder: "Напишите...",
      submit: "Добавить предложение",
      pending: "Сохранение...",
      success: "Предложение сохранено.",
    },
    list: {
      eyebrow: "Список предложений",
      title: "Все предложения",
      description:
        "Активные предложения отображаются сверху, а подготовленные и отмененные перемещаются в архив.",
      active: "Активные предложения",
      archive: "Архив",
      archiveOpen: "Открыть архив",
      archiveClose: "Закрыть архив",
      openDetail: "Открыть полностью",
      noDescription: "Подробное описание не указано.",
      noSuggestionsTitle: "Пока нет предложений",
      noSuggestionsDescription: "После отправки первое предложение появится здесь.",
      emptyActive: "Активных предложений пока нет.",
      emptyArchive: "Архив пуст.",
      compactHint: "Включен компактный режим",
      fullHint: "Включен полный режим",
    },
    detail: {
      title: "Детали предложения",
      close: "Закрыть",
      createdAt: "Создано",
      updatedAt: "Обновлено",
      employee: "Автор",
      titleLabel: "Заголовок",
      descriptionLabel: "Подробности",
      noDescription: "Подробное описание не оставлено.",
      statusActions: "Обновить статус",
      accept: "Принять",
      cancel: "Отменить",
      prepare: "Подготовлено",
      updating: "Обновление...",
    },
    pagination: {
      summary: (page, pageCount) => `Страница ${page} / ${pageCount}`,
    },
  },
};

export function getSuggestionsCopy(language: AppLanguage) {
  return COPY[language];
}

const SUGGESTION_MESSAGE_COPY: Record<string, Record<AppLanguage, string>> = {
  "Taklif maydonlarini tekshirib chiqing.": {
    uz: "Taklif maydonlarini tekshirib chiqing.",
    en: "Please review the suggestion fields.",
    ru: "Проверьте поля предложения.",
  },
  "Supabase ulanishi sozlanmagan.": {
    uz: "Supabase ulanishi sozlanmagan.",
    en: "Supabase connection is not configured.",
    ru: "Подключение Supabase не настроено.",
  },
  "Taklif saqlandi.": {
    uz: "Taklif saqlandi.",
    en: "Suggestion saved.",
    ru: "Предложение сохранено.",
  },
  "Taklif sarlavhasi kamida 3 ta belgidan iborat bo'lsin.": {
    uz: "Taklif sarlavhasi kamida 3 ta belgidan iborat bo'lsin.",
    en: "Suggestion title must be at least 3 characters long.",
    ru: "Заголовок предложения должен содержать минимум 3 символа.",
  },
  "Taklif sarlavhasi 120 ta belgidan oshmasin.": {
    uz: "Taklif sarlavhasi 120 ta belgidan oshmasin.",
    en: "Suggestion title must not exceed 120 characters.",
    ru: "Заголовок предложения не должен превышать 120 символов.",
  },
  "Batafsil izoh 1500 ta belgidan oshmasin.": {
    uz: "Batafsil izoh 1500 ta belgidan oshmasin.",
    en: "Detailed description must not exceed 1500 characters.",
    ru: "Подробное описание не должно превышать 1500 символов.",
  },
};

export function translateSuggestionMessage(message: string, language: AppLanguage) {
  return SUGGESTION_MESSAGE_COPY[message]?.[language] ?? message;
}
