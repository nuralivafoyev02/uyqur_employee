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
    search: string;
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
    quickAddTitle: (statusLabel: string) => string;
    quickAddDescription: string;
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
    quickAdd: string;
    dragSuccess: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  telegram: {
    title: string;
    completedPlansTitle: string;
    description: string;
    employeeLabel: string;
    dateLabel: string;
    completedPlans: string;
    completedPlansEmpty: string;
    botLabel: string;
    chatLabel: string;
    preview: string;
    send: string;
    sending: string;
    notConnected: string;
    notConnectedHint: string;
    restrictedHint: string;
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
      search: "Qidiruv",
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
      boardDescription:
        "Status bo'yicha tez ko'ring, drag-drop bilan o'tkazing va ustun ichidan mini form bilan yangi task qo'shing.",
      quickAddTitle: (statusLabel) => `${statusLabel} uchun tezkor vazifa`,
      quickAddDescription:
        "Tezkor qo'shishda avval task nomi va tavsifini yozing, so'ng kerak bo'lsa ijrochi va deadline kiriting.",
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
      quickAdd: "Mini qo'shish",
      dragSuccess: "Vazifa boshqa ustunga o'tkazildi.",
      emptyTitle: "Vazifalar topilmadi",
      emptyDescription: "Tanlangan filtrlar bo'yicha hozircha vazifalar mavjud emas.",
    },
    telegram: {
      title: "Telegram",
      completedPlansTitle: "Bugun yakunlangan vazifalar",
      description:
        "Bugun `done` holatiga o'tgan va sizga biriktirilgan vazifalarni Uyqur Yordamchi bot orqali guruhga yuboring.",
      employeeLabel: "Xodim",
      dateLabel: "Sana",
      completedPlans: "Yuboriladigan vazifalar",
      completedPlansEmpty: "Bugun yakunlangan vazifa topilmadi.",
      botLabel: "Bot",
      chatLabel: "Chat ID",
      preview: "Yuboriladigan xabar",
      send: "Telegramga yuborish",
      sending: "Yuborilmoqda...",
      notConnected: "Telegram integratsiyasi ulanmagan.",
      notConnectedHint:
        "Bot token va chat ID sozlangandan keyin shu yerdan vazifalarni guruhga yuborish mumkin bo'ladi.",
      restrictedHint:
        "Xodim yakunlangan vazifalarini yuborishi uchun serverda `SUPABASE_SERVICE_ROLE_KEY` sozlanishi kerak.",
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
      search: "Search",
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
      boardDescription:
        "Review by status, move cards with drag and drop, and add new tasks directly inside each column.",
      quickAddTitle: (statusLabel) => `Quick task for ${statusLabel}`,
      quickAddDescription:
        "Start with the task title and description, then add assignee and deadline if needed.",
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
      quickAdd: "Quick add",
      dragSuccess: "Task moved to the new column.",
      emptyTitle: "No tasks found",
      emptyDescription: "There are no tasks for the selected filters yet.",
    },
    telegram: {
      title: "Telegram",
      completedPlansTitle: "Tasks completed today",
      description:
        "Send the tasks assigned to you that moved to `done` today to the group through the Uyqur Yordamchi bot.",
      employeeLabel: "Employee",
      dateLabel: "Date",
      completedPlans: "Tasks to send",
      completedPlansEmpty: "No completed tasks were found for today.",
      botLabel: "Bot",
      chatLabel: "Chat ID",
      preview: "Outgoing message",
      send: "Send to Telegram",
      sending: "Sending...",
      notConnected: "The Telegram integration is not connected.",
      notConnectedHint:
        "Once the bot token and chat ID are configured, you can send completed tasks to the group from here.",
      restrictedHint:
        "To let employees send completed tasks, configure `SUPABASE_SERVICE_ROLE_KEY` on the server.",
    },
    pagination: {
      summary: (page, pageCount) => `Page ${page} / ${pageCount}`,
      previous: "Previous",
      next: "Next",
    },
  },
  ru: {
    header: {
      eyebrow: "Планы / Задачи",
      title: "Поток задач",
      description:
        "Доска задач с дедлайнами, приоритетами и быстрым обновлением статусов.",
    },
    stats: {
      total: "Всего",
      inProgress: "В работе",
      overdue: "Просрочено",
      done: "Завершено",
    },
    create: {
      eyebrow: "Новая задача",
      title: "Добавить задачу",
      description: "Создайте задачу за несколько секунд: заголовок, исполнитель и срок.",
      quickHint: "Сначала быстро создайте задачу, а детали откройте только при необходимости.",
      openComposer: "Добавить задачу",
      closeComposer: "Закрыть",
      details: "Подробнее",
      hideDetails: "Свернуть",
    },
    filters: {
      open: "Фильтр",
      title: "Фильтр задач",
      close: "Закрыть",
      search: "Поиск",
      employee: "Сотрудник",
      status: "Статус",
      priority: "Приоритет",
      all: "Все",
      submit: "Применить",
    },
    form: {
      title: "Название задачи",
      titlePlaceholder: "Напишите...",
      description: "Описание",
      descriptionOptional: "Описание (необязательно)",
      descriptionPlaceholder: "Напишите...",
      assignee: "Исполнитель",
      assigneePlaceholder: "Выберите сотрудника",
      dueDate: "Срок",
      priority: "Приоритет",
      initialStatus: "Начальный статус",
      quickSubmit: "Быстро создать",
      submit: "Сохранить задачу",
      pending: "Сохранение...",
    },
    list: {
      boardTitle: "Доска задач",
      boardDescription:
        "Смотрите задачи по статусам, переносите drag-and-drop и добавляйте новые прямо из колонки.",
      quickAddTitle: (statusLabel) => `Быстрая задача для статуса «${statusLabel}»`,
      quickAddDescription:
        "Сначала укажите название и описание задачи, затем при необходимости выберите исполнителя и срок.",
      collapsedState: "Свернуто",
      expandColumn: "Открыть",
      collapseColumn: "Скрыть",
      assigneeMissing: "Исполнитель не найден",
      noDescription: "Дополнительное описание не указано.",
      deadlinePrefix: "Срок",
      noDeadline: "Без срока",
      updatedPrefix: "Обновлено",
      emptyColumn: "В этом статусе задач нет.",
      update: "Обновить",
      updating: "...",
      quickAdd: "Быстро добавить",
      dragSuccess: "Задача перенесена в новую колонку.",
      emptyTitle: "Задачи не найдены",
      emptyDescription: "По выбранным фильтрам задачи пока отсутствуют.",
    },
    telegram: {
      title: "Telegram",
      completedPlansTitle: "Завершенные сегодня задачи",
      description:
        "Отправляйте в группу через бота Uyqur Yordamchi задачи, которые были назначены вам и переведены сегодня в `done`.",
      employeeLabel: "Сотрудник",
      dateLabel: "Дата",
      completedPlans: "Задачи к отправке",
      completedPlansEmpty: "На сегодня завершенных задач не найдено.",
      botLabel: "Бот",
      chatLabel: "Chat ID",
      preview: "Сообщение к отправке",
      send: "Отправить в Telegram",
      sending: "Отправка...",
      notConnected: "Интеграция Telegram не подключена.",
      notConnectedHint:
        "После настройки bot token и chat ID отсюда можно будет отправлять завершенные задачи в группу.",
      restrictedHint:
        "Чтобы сотрудники могли отправлять завершенные задачи, на сервере нужно настроить `SUPABASE_SERVICE_ROLE_KEY`.",
    },
    pagination: {
      summary: (page, pageCount) => `Страница ${page} / ${pageCount}`,
      previous: "Назад",
      next: "Далее",
    },
  },
};

const PLAN_MESSAGE_COPY: Record<string, Record<AppLanguage, string>> = {
  "Bu amal faqat admin yoki manager uchun ochiq.": {
    uz: "Bu amal faqat admin yoki manager uchun ochiq.",
    en: "This action is only available to admins or managers.",
    ru: "Это действие доступно только администраторам и менеджерам.",
  },
  "Vazifa maydonlarini tekshirib chiqing.": {
    uz: "Vazifa maydonlarini tekshirib chiqing.",
    en: "Please review the task fields.",
    ru: "Проверьте поля задачи.",
  },
  "Supabase ulanishi sozlanmagan.": {
    uz: "Supabase ulanishi sozlanmagan.",
    en: "Supabase connection is not configured.",
    ru: "Подключение Supabase не настроено.",
  },
  "Vazifa saqlandi.": {
    uz: "Vazifa saqlandi.",
    en: "Task saved.",
    ru: "Задача сохранена.",
  },
  "Vazifa nomi kamida 3 ta belgi bo'lsin.": {
    uz: "Vazifa nomi kamida 3 ta belgi bo'lsin.",
    en: "Task title must be at least 3 characters long.",
    ru: "Название задачи должно содержать минимум 3 символа.",
  },
  "Ijrochi tanlang.": {
    uz: "Ijrochi tanlang.",
    en: "Select an assignee.",
    ru: "Выберите исполнителя.",
  },
  "Deadline noto'g'ri formatda.": {
    uz: "Deadline noto'g'ri formatda.",
    en: "Deadline has an invalid format.",
    ru: "Некорректный формат срока.",
  },
  "Prioritet noto'g'ri tanlangan.": {
    uz: "Prioritet noto'g'ri tanlangan.",
    en: "Priority selection is invalid.",
    ru: "Выбран некорректный приоритет.",
  },
  "Status noto'g'ri tanlangan.": {
    uz: "Status noto'g'ri tanlangan.",
    en: "Status selection is invalid.",
    ru: "Выбран некорректный статус.",
  },
  "Vazifa topilmadi.": {
    uz: "Vazifa topilmadi.",
    en: "Task not found.",
    ru: "Задача не найдена.",
  },
  "Bu vazifa statusini yangilashga ruxsat yo'q.": {
    uz: "Bu vazifa statusini yangilashga ruxsat yo'q.",
    en: "You do not have permission to update this task status.",
    ru: "У вас нет прав на изменение статуса этой задачи.",
  },
  "Vazifa statusi yangilandi.": {
    uz: "Vazifa statusi yangilandi.",
    en: "Task status updated.",
    ru: "Статус задачи обновлен.",
  },
  "Vazifa statusini yangilab bo'lmadi.": {
    uz: "Vazifa statusini yangilab bo'lmadi.",
    en: "Could not update the task status.",
    ru: "Не удалось обновить статус задачи.",
  },
  "Bu xodimning yakunlangan vazifalarini Telegramga yuborish huquqi yo'q.": {
    uz: "Bu xodimning yakunlangan vazifalarini Telegramga yuborish huquqi yo'q.",
    en: "You do not have permission to send this employee's completed tasks to Telegram.",
    ru: "У вас нет прав на отправку завершенных задач этого сотрудника в Telegram.",
  },
  "Xodim yakunlangan vazifalarini Telegramga yuborish uchun serverda SUPABASE_SERVICE_ROLE_KEY sozlanishi kerak.": {
    uz: "Xodim yakunlangan vazifalarini Telegramga yuborish uchun serverda SUPABASE_SERVICE_ROLE_KEY sozlanishi kerak.",
    en: "To send an employee's completed tasks to Telegram, SUPABASE_SERVICE_ROLE_KEY must be configured on the server.",
    ru: "Чтобы отправлять завершенные задачи сотрудника в Telegram, на сервере нужно настроить SUPABASE_SERVICE_ROLE_KEY.",
  },
  "Telegram chat ID yoki bot token topilmadi.": {
    uz: "Telegram chat ID yoki bot token topilmadi.",
    en: "Telegram chat ID or bot token is missing.",
    ru: "Не найден chat ID или bot token Telegram.",
  },
  "Xodim topilmadi.": {
    uz: "Xodim topilmadi.",
    en: "Employee not found.",
    ru: "Сотрудник не найден.",
  },
  "Bugun yakunlangan vazifa topilmadi.": {
    uz: "Bugun yakunlangan vazifa topilmadi.",
    en: "No completed task was found for today.",
    ru: "На сегодня завершенная задача не найдена.",
  },
  "Yakunlangan vazifalar Telegramga yuborildi.": {
    uz: "Yakunlangan vazifalar Telegramga yuborildi.",
    en: "Completed tasks were sent to Telegram.",
    ru: "Завершенные задачи отправлены в Telegram.",
  },
  "Telegramga yuborishda xatolik yuz berdi.": {
    uz: "Telegramga yuborishda xatolik yuz berdi.",
    en: "An error occurred while sending to Telegram.",
    ru: "Произошла ошибка при отправке в Telegram.",
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
