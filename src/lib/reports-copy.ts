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
  telegram: {
    title: string;
    description: string;
    saveFirstHint: string;
    notConnected: string;
    notConnectedHint: string;
    restrictedHint: string;
    botLabel: string;
    chatLabel: string;
    preview: string;
    completedPlans: string;
    completedPlansEmpty: string;
    send: string;
    resend: string;
    sending: string;
    statusNotSent: string;
    statusSent: string;
    statusFailed: string;
    sentAt: string;
    lastError: string;
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
    telegram: {
      title: "Telegram",
      description: "Hisobotni Uyqur Yordamchi bot orqali guruhga yuborish uchun tayyor preview.",
      saveFirstHint: "Avval hisobotni saqlang, keyin Telegram bo'limi ochiladi.",
      notConnected: "Telegram integratsiyasi ulanmagan.",
      notConnectedHint: "Bot token va chat ID sozlangandan keyin shu yerdan guruhga yuborish mumkin bo'ladi.",
      restrictedHint:
        "Xodim hisobotini Telegramga yuborish uchun serverda `SUPABASE_SERVICE_ROLE_KEY` sozlanishi kerak.",
      botLabel: "Bot",
      chatLabel: "Chat ID",
      preview: "Yuboriladigan xabar",
      completedPlans: "Bugun yakunlangan vazifalar",
      completedPlansEmpty: "Bugun yakunlangan vazifa topilmadi.",
      send: "Guruhga yuborish",
      resend: "Qayta yuborish",
      sending: "Yuborilmoqda...",
      statusNotSent: "Yuborilmagan",
      statusSent: "Yuborildi",
      statusFailed: "Xato",
      sentAt: "Yuborilgan vaqt",
      lastError: "Oxirgi xato",
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
    telegram: {
      title: "Telegram",
      description: "Preview the message that will be delivered to the group by the Uyqur Yordamchi bot.",
      saveFirstHint: "Save the report first, then the Telegram section will appear.",
      notConnected: "The Telegram integration is not connected.",
      notConnectedHint: "Once the bot token and chat ID are configured, you can send the report to the group from here.",
      restrictedHint:
        "To let employees send reports to Telegram, configure `SUPABASE_SERVICE_ROLE_KEY` on the server.",
      botLabel: "Bot",
      chatLabel: "Chat ID",
      preview: "Outgoing message",
      completedPlans: "Tasks completed today",
      completedPlansEmpty: "No completed tasks were found for today.",
      send: "Send to group",
      resend: "Send again",
      sending: "Sending...",
      statusNotSent: "Not sent",
      statusSent: "Sent",
      statusFailed: "Failed",
      sentAt: "Sent at",
      lastError: "Last error",
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
  ru: {
    header: {
      eyebrow: "Ежедневные отчеты",
      title: "Отчеты",
      description:
        "Сегодняшний прогресс, текущая работа и следующие шаги сохраняются через server action.",
    },
    editor: {
      eyebrow: "Создание отчета",
      openComposer: "Создать отчет",
      closeComposer: "Закрыть редактор",
      quickHint: "Заполните 3 основных блока, и отчет будет готов.",
      existingDescription: "Существующий отчет открыт в режиме редактирования.",
      newDescription: "Создайте новый отчет на выбранную дату.",
      collapse: "Закрыть",
      expand: "Открыть",
      date: "Дата отчета",
      employee: "Сотрудник",
      openSelected: "Открыть",
      employeePlaceholder: "Выберите сотрудника",
    },
    filters: {
      open: "Фильтр",
      title: "Фильтр отчетов",
      close: "Закрыть",
      date: "Дата",
      employee: "Сотрудник",
      status: "Статус",
      all: "Все",
      submit: "Применить",
    },
    history: {
      leadEyebrow: "Лента отчетов",
      employeeEyebrow: "История",
      leadTitle: "Командные отчеты",
      employeeTitle: "Мои отчеты",
      entries: (count) => `${count} записей`,
      unknownEmployee: "Неизвестный сотрудник",
      noTitle: "Должность не указана",
      completedWork: "Выполненная работа",
      currentWork: "Текущая работа",
      nextPlan: "Следующий план",
      empty: "По выбранным фильтрам отчеты не найдены.",
      edit: "Редактировать",
      delete: "Удалить",
    },
    detail: {
      title: "Полный отчет",
      close: "Закрыть",
      employee: "Сотрудник",
      reportDate: "Дата отчета",
      updatedAt: "Время обновления",
      noBlockers: "Блокеры не указаны.",
    },
    telegram: {
      title: "Telegram",
      description: "Предпросмотр сообщения, которое бот Uyqur Yordamchi отправит в группу.",
      saveFirstHint: "Сначала сохраните отчет, затем здесь откроется раздел Telegram.",
      notConnected: "Интеграция Telegram не подключена.",
      notConnectedHint: "После настройки bot token и chat ID отсюда можно будет отправлять отчет в группу.",
      restrictedHint:
        "Чтобы сотрудники могли отправлять отчеты в Telegram, на сервере нужно настроить `SUPABASE_SERVICE_ROLE_KEY`.",
      botLabel: "Бот",
      chatLabel: "Chat ID",
      preview: "Сообщение к отправке",
      completedPlans: "Завершенные сегодня задачи",
      completedPlansEmpty: "На сегодня завершенных задач не найдено.",
      send: "Отправить в группу",
      resend: "Отправить повторно",
      sending: "Отправка...",
      statusNotSent: "Не отправлено",
      statusSent: "Отправлено",
      statusFailed: "Ошибка",
      sentAt: "Время отправки",
      lastError: "Последняя ошибка",
    },
    form: {
      completedWork: "Что вы завершили сегодня?",
      completedWorkPlaceholder: "Напишите...",
      completedWorkHint: "Опишите завершенную работу и полученный результат.",
      currentWork: "Над чем вы работаете сейчас?",
      currentWorkPlaceholder: "Напишите...",
      currentWorkHint: "Укажите главный текущий фокус и активную задачу.",
      nextPlan: "Следующий план",
      nextPlanPlaceholder: "Напишите...",
      nextPlanHint: "Четко укажите следующий шаг или план на завтра.",
      blockers: "Блокер или проблема",
      blockersPlaceholder: "Напишите...",
      blockersHint: "Укажите зависимости, риски или где нужна помощь.",
      optional: "необязательно",
      status: "Общий статус",
      statusHint: "Выберите общий темп одним нажатием.",
      progressTitle: "Состояние отчета",
      progressDescription: "Когда заполнены 3 основных блока, отчет готов к отправке.",
      progressReady: "Готово",
      progressPending: "Нужно дополнить",
      submit: "Сохранить отчет",
      pending: "Сохранение...",
    },
    pagination: {
      summary: (page, pageCount) => `Страница ${page} / ${pageCount}`,
      previous: "Назад",
      next: "Далее",
    },
  },
};

const REPORT_MESSAGE_COPY: Record<string, Record<AppLanguage, string>> = {
  "Hisobotdagi maydonlarni tekshirib chiqing.": {
    uz: "Hisobotdagi maydonlarni tekshirib chiqing.",
    en: "Please review the report fields.",
    ru: "Проверьте поля отчета.",
  },
  "Supabase ulanishi sozlanmagan.": {
    uz: "Supabase ulanishi sozlanmagan.",
    en: "Supabase connection is not configured.",
    ru: "Подключение Supabase не настроено.",
  },
  "Hisobot saqlandi.": {
    uz: "Hisobot saqlandi.",
    en: "Report saved.",
    ru: "Отчет сохранен.",
  },
  "Sana noto'g'ri formatda.": {
    uz: "Sana noto'g'ri formatda.",
    en: "The date format is invalid.",
    ru: "Некорректный формат даты.",
  },
  "Bajarilgan ishlar qismini to'ldiring.": {
    uz: "Bajarilgan ishlar qismini to'ldiring.",
    en: "Fill in the completed work section.",
    ru: "Заполните раздел выполненной работы.",
  },
  "Joriy ishlar qismini to'ldiring.": {
    uz: "Joriy ishlar qismini to'ldiring.",
    en: "Fill in the current work section.",
    ru: "Заполните раздел текущей работы.",
  },
  "Keyingi reja qismini to'ldiring.": {
    uz: "Keyingi reja qismini to'ldiring.",
    en: "Fill in the next plan section.",
    ru: "Заполните раздел следующего плана.",
  },
  "Holat noto'g'ri tanlangan.": {
    uz: "Holat noto'g'ri tanlangan.",
    en: "The selected status is invalid.",
    ru: "Выбран некорректный статус.",
  },
  "Bu hisobotni tahrirlash huquqi yo'q.": {
    uz: "Bu hisobotni tahrirlash huquqi yo'q.",
    en: "You do not have permission to edit this report.",
    ru: "У вас нет прав на редактирование этого отчета.",
  },
  "Bu hisobotni o'chirish huquqi yo'q.": {
    uz: "Bu hisobotni o'chirish huquqi yo'q.",
    en: "You do not have permission to delete this report.",
    ru: "У вас нет прав на удаление этого отчета.",
  },
  "Hisobot topilmadi.": {
    uz: "Hisobot topilmadi.",
    en: "Report not found.",
    ru: "Отчет не найден.",
  },
  "Bu hisobotni Telegramga yuborish huquqi yo'q.": {
    uz: "Bu hisobotni Telegramga yuborish huquqi yo'q.",
    en: "You do not have permission to send this report to Telegram.",
    ru: "У вас нет прав на отправку этого отчета в Telegram.",
  },
  "Telegram integratsiyasi ulanmagan.": {
    uz: "Telegram integratsiyasi ulanmagan.",
    en: "The Telegram integration is not connected.",
    ru: "Интеграция Telegram не подключена.",
  },
  "Telegram chat ID yoki bot token topilmadi.": {
    uz: "Telegram chat ID yoki bot token topilmadi.",
    en: "Telegram chat ID or bot token is missing.",
    ru: "Не найден chat ID или bot token Telegram.",
  },
  "Hisobot Telegramga yuborildi.": {
    uz: "Hisobot Telegramga yuborildi.",
    en: "The report was sent to Telegram.",
    ru: "Отчет отправлен в Telegram.",
  },
  "Telegramga yuborishda xatolik yuz berdi.": {
    uz: "Telegramga yuborishda xatolik yuz berdi.",
    en: "An error occurred while sending to Telegram.",
    ru: "Произошла ошибка при отправке в Telegram.",
  },
  "Xodim hisobotini Telegramga yuborish uchun serverda SUPABASE_SERVICE_ROLE_KEY sozlanishi kerak.": {
    uz: "Xodim hisobotini Telegramga yuborish uchun serverda SUPABASE_SERVICE_ROLE_KEY sozlanishi kerak.",
    en: "To send an employee report to Telegram, SUPABASE_SERVICE_ROLE_KEY must be configured on the server.",
    ru: "Чтобы отправлять отчет сотрудника в Telegram, на сервере нужно настроить SUPABASE_SERVICE_ROLE_KEY.",
  },
  "Hisobot o'chirildi.": {
    uz: "Hisobot o'chirildi.",
    en: "Report deleted.",
    ru: "Отчет удален.",
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
