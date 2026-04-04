import type { AppLanguage } from "@/lib/preferences";

type IntegrationsCopy = {
  panelEyebrow: string;
  panelTitle: string;
  panelDescription: string;
  availableTitle: string;
  availableDescription: string;
  connectedTitle: string;
  connectedDescription: string;
  connectedEmptyTitle: string;
  connectedEmptyDescription: string;
  manageHint: string;
  readOnlyHint: string;
  themeLanguageHint: string;
  capabilitiesLabel: string;
  publicConfigLabel: string;
  publicConfigEmpty: string;
  secureStorageLabel: string;
  secureStorageDescription: string;
  sidebarHint: string;
  connectedAtLabel: string;
  updatedAtLabel: string;
  statusLabel: string;
  connectedStatus: string;
  save: string;
  saving: string;
  connect: string;
  update: string;
  open: string;
  close: string;
  disconnect: string;
  disconnecting: string;
  testMessage: string;
  testingMessage: string;
  testConnection: string;
  testingConnection: string;
  required: string;
  optional: string;
  privateField: string;
  publicField: string;
  keepCurrentSecret: string;
  modalDescription: string;
  modalDescriptionExisting: string;
  pageOverviewTitle: string;
  pageOverviewDescription: string;
  pageFutureTitle: string;
  pageFutureDescription: string;
  pageBackToSettings: string;
  accessNotice: string;
  privacyTriggerLabel: string;
  privacyTitle: string;
  privacyDescription: string;
  privacyPoints: string[];
  messages: {
    reviewFields: string;
    unauthorized: string;
    providerUnavailable: string;
    supabaseMissing: string;
    tablesMissing: string;
    telegramTestSent: string;
    telegramConfigMissing: string;
    telegramOnly: string;
    clickUpOnly: string;
    clickUpSaved: string;
    clickUpReady: string;
    clickUpConfigMissing: string;
    clickUpInvalidApiKey: string;
    clickUpWorkspaceMissing: string;
    clickUpSpaceMissing: string;
    clickUpValidationFailed: string;
    connectionSaved: (providerName: string) => string;
    disconnected: (providerName: string) => string;
    requiredField: (fieldLabel: string) => string;
    invalidUrl: (fieldLabel: string) => string;
  };
};

const COPY: Record<AppLanguage, IntegrationsCopy> = {
  uz: {
    panelEyebrow: "Integratsiyalar",
    panelTitle: "Kelajak ulanishlarini tayyorlang",
    panelDescription:
      "Tizim hozircha credential va asosiy mapping ma'lumotlarini saqlaydi. Keyingi bosqichlarda ClickUp va boshqa servislar bilan real sync shu poydevor ustiga ulanadi.",
    availableTitle: "Ulanishi mumkin bo'lgan dasturlar",
    availableDescription:
      "Kartani ochib kerakli API ma'lumotlarini kiriting. Saqlangandan keyin integratsiya hammaga sidebar ichida ko'rinadi.",
    connectedTitle: "Faol integratsiyalar",
    connectedDescription:
      "Faol ulanishlar umumiy navigatsiyada chiqadi va barcha foydalanuvchilar integration sahifasini ko'ra oladi.",
    connectedEmptyTitle: "Hali faol integratsiya yo'q",
    connectedEmptyDescription:
      "Avval biror servisni ulab ko'ring, shunda u umumiy chap menu ichida paydo bo'ladi.",
    manageHint: "API credential va mapping ma'lumotlarini admin yoki manager boshqaradi.",
    readOnlyHint: "Siz bu yerda faqat faol integratsiyalarni ko'ra olasiz.",
    themeLanguageHint:
      "Integration sahifalari joriy til va light/dark theme bilan avtomatik moslashadi.",
    capabilitiesLabel: "Imkoniyatlar",
    publicConfigLabel: "Ko'rinadigan konfiguratsiya",
    publicConfigEmpty: "Public konfiguratsiya hali kiritilmagan.",
    secureStorageLabel: "Maxfiy credential",
    secureStorageDescription:
      "API key va tokenlar alohida xavfsiz qatlamda saqlanadi va foydalanuvchilarga ko'rsatilmaydi.",
    sidebarHint: "Ulanganidan keyin chap menu ichida alohida bo'lim chiqadi.",
    connectedAtLabel: "Ulandi",
    updatedAtLabel: "Yangilandi",
    statusLabel: "Status",
    connectedStatus: "Ulangan",
    save: "Integratsiyani saqlash",
    saving: "Saqlanmoqda...",
    connect: "Ulash",
    update: "Yangilash",
    open: "Ochish",
    close: "Yopish",
    disconnect: "Uzish",
    disconnecting: "Uzilmoqda...",
    testMessage: "Test xabar yuborish",
    testingMessage: "Yuborilmoqda...",
    testConnection: "Ulanishni tekshirish",
    testingConnection: "Tekshirilmoqda...",
    required: "Majburiy",
    optional: "Ixtiyoriy",
    privateField: "Maxfiy",
    publicField: "Public",
    keepCurrentSecret: "Bo'sh qoldirsangiz, hozirgi maxfiy qiymat saqlanadi.",
    modalDescription:
      "Kelajakdagi sync uchun kerakli API credential va mapping ma'lumotlarini kiriting.",
    modalDescriptionExisting:
      "Yangilash paytida bo'sh maxfiy maydonlar eski qiymatni saqlab qoladi.",
    pageOverviewTitle: "Integratsiya overview",
    pageOverviewDescription:
      "Bu sahifada xavfsiz bo'lmagan konfiguratsiya xulosasi va kelajak sync tayyorgarligi ko'rsatiladi.",
    pageFutureTitle: "Kelajak sync tayyorgarligi",
    pageFutureDescription:
      "Bu integration hozir credential va mapping bilan tayyor turadi. Keyingi iteratsiyada real API oqimlari shu sozlamaga ulanadi.",
    pageBackToSettings: "Integratsiyalar sozlamasiga qaytish",
    accessNotice: "Theme va til bu sahifada global preference bilan boshqariladi.",
    privacyTriggerLabel: "Maxfiylik ma'lumoti",
    privacyTitle: "Integratsiya maxfiyligi",
    privacyDescription:
      "Bu bo'limda foydalanuvchiga ko'rinadigan va maxfiy saqlanadigan ma'lumotlar aniq ajratilgan.",
    privacyPoints: [
      "API key, token va shunga o'xshash credential alohida xavfsiz qatlamda saqlanadi.",
      "Oddiy foydalanuvchilar faqat public konfiguratsiya qiymatlarini ko'radi.",
      "Integratsiyani ulash yoki tahrirlash faqat admin va manager rollari uchun ochiq.",
      "Ulangan servislar barcha foydalanuvchilarga sidebar orqali ko'rinadi, lekin maxfiy qiymatlar ko'rsatilmaydi.",
    ],
    messages: {
      reviewFields: "Integratsiya maydonlarini tekshirib chiqing.",
      unauthorized: "Integratsiyalarni faqat admin yoki manager sozlay oladi.",
      providerUnavailable: "Tanlangan integratsiya turi topilmadi.",
      supabaseMissing: "Supabase ulanishi sozlanmagan.",
      tablesMissing:
        "Integratsiya jadvallari hali bazaga qo'llanmagan. Migratsiyani ishga tushiring.",
      telegramTestSent: "Telegramga test xabar yuborildi.",
      telegramConfigMissing: "Telegram bot token yoki chat ID topilmadi.",
      telegramOnly: "Test xabar faqat Telegram integratsiyasi uchun mavjud.",
      clickUpOnly: "Bu amal faqat ClickUp integratsiyasi uchun mavjud.",
      clickUpSaved: "ClickUp integratsiyasi saqlandi va ulanish tekshirildi.",
      clickUpReady: "ClickUp ulanishi tekshirildi, integratsiya tayyor.",
      clickUpConfigMissing: "ClickUp workspace ID yoki API key topilmadi.",
      clickUpInvalidApiKey: "ClickUp API key noto'g'ri yoki bu workspace uchun ruxsat yetarli emas.",
      clickUpWorkspaceMissing: "Berilgan ClickUp Workspace ID topilmadi yoki token bu workspace'ga kira olmaydi.",
      clickUpSpaceMissing: "Berilgan ClickUp Space ID topilmadi yoki tanlangan workspace ichida emas.",
      clickUpValidationFailed: "ClickUp ulanishini tekshirishda xatolik yuz berdi.",
      connectionSaved: (providerName: string) => `${providerName} integratsiyasi saqlandi.`,
      disconnected: (providerName: string) => `${providerName} integratsiyasi uzildi.`,
      requiredField: (fieldLabel: string) => `${fieldLabel} maydonini to'ldiring.`,
      invalidUrl: (fieldLabel: string) => `${fieldLabel} to'g'ri URL formatida bo'lsin.`,
    },
  },
  en: {
    panelEyebrow: "Integrations",
    panelTitle: "Prepare future connections",
    panelDescription:
      "The system currently stores credentials and core mapping details. Future ClickUp and service sync will be built on top of this foundation.",
    availableTitle: "Apps available for integration",
    availableDescription:
      "Open any card and enter the required API details. Once saved, the integration becomes visible in the shared sidebar.",
    connectedTitle: "Active integrations",
    connectedDescription:
      "Connected apps appear in the shared navigation and can be viewed by every authenticated user.",
    connectedEmptyTitle: "No active integrations yet",
    connectedEmptyDescription:
      "Connect a service first and it will appear in the shared sidebar.",
    manageHint: "API credentials and mapping details are managed by admins or managers.",
    readOnlyHint: "You can review active integrations here, but only leads can edit them.",
    themeLanguageHint:
      "Integration pages automatically follow the current language and light or dark theme.",
    capabilitiesLabel: "Capabilities",
    publicConfigLabel: "Visible configuration",
    publicConfigEmpty: "No public configuration has been saved yet.",
    secureStorageLabel: "Secret credentials",
    secureStorageDescription:
      "API keys and tokens are stored in a separate secure layer and are never exposed to regular users.",
    sidebarHint: "After a successful connection, a dedicated sidebar item will appear.",
    connectedAtLabel: "Connected",
    updatedAtLabel: "Updated",
    statusLabel: "Status",
    connectedStatus: "Connected",
    save: "Save integration",
    saving: "Saving...",
    connect: "Connect",
    update: "Update",
    open: "Open",
    close: "Close",
    disconnect: "Disconnect",
    disconnecting: "Disconnecting...",
    testMessage: "Send test message",
    testingMessage: "Sending...",
    testConnection: "Test connection",
    testingConnection: "Checking...",
    required: "Required",
    optional: "Optional",
    privateField: "Private",
    publicField: "Public",
    keepCurrentSecret: "Leave blank to keep the current secret value.",
    modalDescription:
      "Enter the API credentials and mapping details needed for future synchronization.",
    modalDescriptionExisting:
      "When updating, blank secret fields will keep the existing saved value.",
    pageOverviewTitle: "Integration overview",
    pageOverviewDescription:
      "This page shows a safe configuration summary and the current readiness for future sync.",
    pageFutureTitle: "Future sync readiness",
    pageFutureDescription:
      "This integration is currently prepared with credentials and mapping data. A future iteration can attach the real API flow to this setup.",
    pageBackToSettings: "Back to integration settings",
    accessNotice: "Theme and language on this page follow the global preferences.",
    privacyTriggerLabel: "Privacy details",
    privacyTitle: "Integration privacy",
    privacyDescription:
      "This area clearly separates user-visible values from confidential credentials.",
    privacyPoints: [
      "API keys, tokens, and similar credentials are stored in a separate secure layer.",
      "Regular users can only see public configuration values.",
      "Only admins and managers can connect or edit integrations.",
      "Connected services are visible in the sidebar for everyone, but secret values are never shown there.",
    ],
    messages: {
      reviewFields: "Please review the integration fields.",
      unauthorized: "Only admins or managers can configure integrations.",
      providerUnavailable: "The selected integration provider was not found.",
      supabaseMissing: "Supabase connection is not configured.",
      tablesMissing:
        "Integration tables have not been applied to the database yet. Run the migration first.",
      telegramTestSent: "A Telegram test message was sent.",
      telegramConfigMissing: "The Telegram bot token or chat ID is missing.",
      telegramOnly: "Test messages are only available for the Telegram integration.",
      clickUpOnly: "This action is only available for the ClickUp integration.",
      clickUpSaved: "The ClickUp integration was saved and the connection was verified.",
      clickUpReady: "The ClickUp connection was verified and is ready.",
      clickUpConfigMissing: "The ClickUp workspace ID or API key is missing.",
      clickUpInvalidApiKey: "The ClickUp API key is invalid or does not have enough access for this workspace.",
      clickUpWorkspaceMissing: "The provided ClickUp Workspace ID was not found or the token cannot access it.",
      clickUpSpaceMissing: "The provided ClickUp Space ID was not found or does not belong to the selected workspace.",
      clickUpValidationFailed: "The ClickUp connection check failed.",
      connectionSaved: (providerName: string) => `${providerName} integration saved.`,
      disconnected: (providerName: string) => `${providerName} integration disconnected.`,
      requiredField: (fieldLabel: string) => `Please fill in ${fieldLabel}.`,
      invalidUrl: (fieldLabel: string) => `${fieldLabel} must use a valid URL format.`,
    },
  },
  ru: {
    panelEyebrow: "Интеграции",
    panelTitle: "Подготовьте будущие подключения",
    panelDescription:
      "Сейчас система сохраняет credentials и базовые mapping-данные. Будущая интеграция с ClickUp и другими сервисами будет строиться на этом фундаменте.",
    availableTitle: "Программы, доступные для интеграции",
    availableDescription:
      "Откройте карточку и введите нужные API-данные. После сохранения интеграция появится в общем sidebar.",
    connectedTitle: "Активные интеграции",
    connectedDescription:
      "Подключенные сервисы появляются в общей навигации и доступны для просмотра всем авторизованным пользователям.",
    connectedEmptyTitle: "Активных интеграций пока нет",
    connectedEmptyDescription:
      "Сначала подключите хотя бы один сервис, и он появится в общем sidebar.",
    manageHint: "API credentials и mapping-данные настраивают администраторы или менеджеры.",
    readOnlyHint: "Здесь можно только просматривать активные интеграции.",
    themeLanguageHint:
      "Страницы интеграций автоматически подстраиваются под текущий язык и light/dark theme.",
    capabilitiesLabel: "Возможности",
    publicConfigLabel: "Видимая конфигурация",
    publicConfigEmpty: "Публичная конфигурация пока не сохранена.",
    secureStorageLabel: "Секретные credentials",
    secureStorageDescription:
      "API key и token хранятся в отдельном защищенном слое и не показываются обычным пользователям.",
    sidebarHint: "После подключения в sidebar появится отдельный раздел.",
    connectedAtLabel: "Подключено",
    updatedAtLabel: "Обновлено",
    statusLabel: "Статус",
    connectedStatus: "Подключено",
    save: "Сохранить интеграцию",
    saving: "Сохранение...",
    connect: "Подключить",
    update: "Обновить",
    open: "Открыть",
    close: "Закрыть",
    disconnect: "Отключить",
    disconnecting: "Отключение...",
    testMessage: "Отправить тест",
    testingMessage: "Отправка...",
    testConnection: "Проверить соединение",
    testingConnection: "Проверка...",
    required: "Обязательно",
    optional: "Опционально",
    privateField: "Секретно",
    publicField: "Публично",
    keepCurrentSecret: "Оставьте пустым, чтобы сохранить текущее секретное значение.",
    modalDescription:
      "Введите API credentials и mapping-данные, необходимые для будущей синхронизации.",
    modalDescriptionExisting:
      "При обновлении пустые секретные поля сохранят текущее значение.",
    pageOverviewTitle: "Обзор интеграции",
    pageOverviewDescription:
      "На этой странице показывается безопасная сводка конфигурации и готовность к будущей синхронизации.",
    pageFutureTitle: "Готовность к будущему sync",
    pageFutureDescription:
      "Сейчас интеграция подготовлена за счет credentials и mapping-данных. В следующей итерации к этой настройке можно подключить реальный API-поток.",
    pageBackToSettings: "Назад к настройкам интеграций",
    accessNotice: "Тема и язык на этой странице берутся из глобальных предпочтений.",
    privacyTriggerLabel: "О конфиденциальности",
    privacyTitle: "Конфиденциальность интеграции",
    privacyDescription:
      "В этом разделе четко разделены видимые пользователю данные и конфиденциальные credentials.",
    privacyPoints: [
      "API key, token и похожие credentials хранятся в отдельном защищенном слое.",
      "Обычные пользователи видят только публичные значения конфигурации.",
      "Подключать и редактировать интеграции могут только администраторы и менеджеры.",
      "Подключенные сервисы видны всем в sidebar, но секретные значения там не показываются.",
    ],
    messages: {
      reviewFields: "Проверьте поля интеграции.",
      unauthorized: "Только администратор или менеджер может настраивать интеграции.",
      providerUnavailable: "Выбранный тип интеграции не найден.",
      supabaseMissing: "Подключение Supabase не настроено.",
      tablesMissing:
        "Таблицы интеграций еще не применены в базе. Сначала запустите миграцию.",
      telegramTestSent: "Тестовое сообщение отправлено в Telegram.",
      telegramConfigMissing: "Не найден bot token или chat ID Telegram.",
      telegramOnly: "Тестовое сообщение доступно только для интеграции Telegram.",
      clickUpOnly: "Это действие доступно только для интеграции ClickUp.",
      clickUpSaved: "Интеграция ClickUp сохранена и соединение проверено.",
      clickUpReady: "Соединение ClickUp проверено и готово к работе.",
      clickUpConfigMissing: "Не найден Workspace ID или API key ClickUp.",
      clickUpInvalidApiKey: "API key ClickUp неверный или у него недостаточно прав для этого workspace.",
      clickUpWorkspaceMissing: "Указанный Workspace ID ClickUp не найден или токен не имеет к нему доступа.",
      clickUpSpaceMissing: "Указанный Space ID ClickUp не найден или не относится к выбранному workspace.",
      clickUpValidationFailed: "Не удалось проверить соединение с ClickUp.",
      connectionSaved: (providerName: string) => `Интеграция ${providerName} сохранена.`,
      disconnected: (providerName: string) => `Интеграция ${providerName} отключена.`,
      requiredField: (fieldLabel: string) => `Заполните поле ${fieldLabel}.`,
      invalidUrl: (fieldLabel: string) => `Поле ${fieldLabel} должно быть в корректном формате URL.`,
    },
  },
};

export function getIntegrationsCopy(language: AppLanguage) {
  return COPY[language];
}
