import type { AppLanguage } from "@/lib/preferences";
import type { IntegrationStatus } from "@/types/database";

type LocalizedText = Record<AppLanguage, string>;

export type IntegrationProviderSlug =
  | "clickup"
  | "jira"
  | "trello"
  | "slack"
  | "telegram";

export type IntegrationFieldDefinition = {
  key: string;
  type: "text" | "password" | "url";
  required?: boolean;
  secret?: boolean;
  store: "public" | "secret";
  label: LocalizedText;
  placeholder: LocalizedText;
  helper?: LocalizedText;
};

export type IntegrationProviderDefinition = {
  slug: IntegrationProviderSlug;
  displayName: string;
  summary: LocalizedText;
  description: LocalizedText;
  capabilities: LocalizedText[];
  fields: IntegrationFieldDefinition[];
};

export type ActiveIntegrationSummary = {
  id: string;
  provider: IntegrationProviderSlug;
  displayName: string;
  status: IntegrationStatus;
  publicConfig: Record<string, string>;
  createdAt: string;
  updatedAt: string;
};

export const INTEGRATIONS_EVENT = "uyqur:integrations-change";

export const INTEGRATION_PROVIDERS: IntegrationProviderDefinition[] = [
  {
    slug: "clickup",
    displayName: "ClickUp",
    summary: {
      uz: "Task board, list va workflow’larni sinxronlash uchun tayyor.",
      en: "Ready for task boards, lists, and workflow sync.",
      ru: "Готово для синхронизации досок, списков и рабочих процессов.",
    },
    description: {
      uz: "ClickUp workspace va API key ulab, keyinchalik task oqimlarini ikki tomonga sinxronlash mumkin bo'ladi.",
      en: "Connect a ClickUp workspace and API key to prepare for future two-way task sync.",
      ru: "Подключите workspace ClickUp и API key, чтобы подготовить будущую двустороннюю синхронизацию задач.",
    },
    capabilities: [
      {
        uz: "Task status sync",
        en: "Task status sync",
        ru: "Синхронизация статусов задач",
      },
      {
        uz: "Space mapping",
        en: "Space mapping",
        ru: "Связка со space",
      },
      {
        uz: "Deadline flow",
        en: "Deadline flow",
        ru: "Передача сроков",
      },
    ],
    fields: [
      {
        key: "workspaceId",
        type: "text",
        store: "public",
        required: true,
        label: {
          uz: "Workspace ID",
          en: "Workspace ID",
          ru: "Workspace ID",
        },
        placeholder: {
          uz: "Masalan, team_12345",
          en: "For example, team_12345",
          ru: "Например, team_12345",
        },
      },
      {
        key: "spaceId",
        type: "text",
        store: "public",
        required: false,
        label: {
          uz: "Default Space ID",
          en: "Default Space ID",
          ru: "Default Space ID",
        },
        placeholder: {
          uz: "Masalan, space_87",
          en: "For example, space_87",
          ru: "Например, space_87",
        },
      },
      {
        key: "apiKey",
        type: "password",
        store: "secret",
        required: true,
        secret: true,
        label: {
          uz: "API key",
          en: "API key",
          ru: "API key",
        },
        placeholder: {
          uz: "ClickUp API key kiriting",
          en: "Enter the ClickUp API key",
          ru: "Введите ClickUp API key",
        },
      },
    ],
  },
  {
    slug: "jira",
    displayName: "Jira",
    summary: {
      uz: "Issue, sprint va loyiha oqimlarini bog'lash uchun.",
      en: "For linking issues, sprints, and project delivery flows.",
      ru: "Для связки задач, спринтов и проектного потока.",
    },
    description: {
      uz: "Jira project bilan ulab, issue tracking va status oqimini keyingi bosqichlarda birlashtirish mumkin.",
      en: "Connect a Jira project to unify issue tracking and status flow in future phases.",
      ru: "Подключите проект Jira, чтобы в следующих этапах объединить трекинг задач и статусов.",
    },
    capabilities: [
      {
        uz: "Issue sync",
        en: "Issue sync",
        ru: "Синхронизация задач",
      },
      {
        uz: "Sprint mirror",
        en: "Sprint mirror",
        ru: "Зеркало спринтов",
      },
      {
        uz: "Assignee map",
        en: "Assignee map",
        ru: "Сопоставление исполнителей",
      },
    ],
    fields: [
      {
        key: "baseUrl",
        type: "url",
        store: "public",
        required: true,
        label: {
          uz: "Jira URL",
          en: "Jira URL",
          ru: "URL Jira",
        },
        placeholder: {
          uz: "https://company.atlassian.net",
          en: "https://company.atlassian.net",
          ru: "https://company.atlassian.net",
        },
      },
      {
        key: "projectKey",
        type: "text",
        store: "public",
        required: true,
        label: {
          uz: "Project key",
          en: "Project key",
          ru: "Ключ проекта",
        },
        placeholder: {
          uz: "Masalan, OPS",
          en: "For example, OPS",
          ru: "Например, OPS",
        },
      },
      {
        key: "email",
        type: "text",
        store: "public",
        required: true,
        label: {
          uz: "Account email",
          en: "Account email",
          ru: "Email аккаунта",
        },
        placeholder: {
          uz: "api@company.com",
          en: "api@company.com",
          ru: "api@company.com",
        },
      },
      {
        key: "apiToken",
        type: "password",
        store: "secret",
        required: true,
        secret: true,
        label: {
          uz: "API token",
          en: "API token",
          ru: "API token",
        },
        placeholder: {
          uz: "Jira API token kiriting",
          en: "Enter the Jira API token",
          ru: "Введите API token Jira",
        },
      },
    ],
  },
  {
    slug: "trello",
    displayName: "Trello",
    summary: {
      uz: "Board va card jarayonlarini yengil sync qilish uchun.",
      en: "For lightweight board and card synchronization.",
      ru: "Для легкой синхронизации досок и карточек.",
    },
    description: {
      uz: "Trello board ulanishi bilan oddiy task oqimlari va card statuslari kelajakda birlashtiriladi.",
      en: "A Trello board connection prepares simple task and card status flows for future sync.",
      ru: "Подключение Trello board подготавливает простую синхронизацию задач и статусов карточек.",
    },
    capabilities: [
      {
        uz: "Board sync",
        en: "Board sync",
        ru: "Синхронизация досок",
      },
      {
        uz: "Card mirror",
        en: "Card mirror",
        ru: "Зеркало карточек",
      },
      {
        uz: "List status map",
        en: "List status map",
        ru: "Связка списков и статусов",
      },
    ],
    fields: [
      {
        key: "workspaceId",
        type: "text",
        store: "public",
        required: true,
        label: {
          uz: "Workspace ID",
          en: "Workspace ID",
          ru: "Workspace ID",
        },
        placeholder: {
          uz: "Masalan, trello_workspace",
          en: "For example, trello_workspace",
          ru: "Например, trello_workspace",
        },
      },
      {
        key: "boardId",
        type: "text",
        store: "public",
        required: true,
        label: {
          uz: "Board ID",
          en: "Board ID",
          ru: "Board ID",
        },
        placeholder: {
          uz: "Masalan, board_a18",
          en: "For example, board_a18",
          ru: "Например, board_a18",
        },
      },
      {
        key: "apiKey",
        type: "password",
        store: "secret",
        required: true,
        secret: true,
        label: {
          uz: "API key",
          en: "API key",
          ru: "API key",
        },
        placeholder: {
          uz: "Trello API key kiriting",
          en: "Enter the Trello API key",
          ru: "Введите API key Trello",
        },
      },
      {
        key: "token",
        type: "password",
        store: "secret",
        required: true,
        secret: true,
        label: {
          uz: "Token",
          en: "Token",
          ru: "Token",
        },
        placeholder: {
          uz: "Trello token kiriting",
          en: "Enter the Trello token",
          ru: "Введите token Trello",
        },
      },
    ],
  },
  {
    slug: "slack",
    displayName: "Slack",
    summary: {
      uz: "Bildirishnoma va workflow alertlarni jo'natish uchun.",
      en: "For notifications and workflow alert delivery.",
      ru: "Для отправки уведомлений и workflow-алертов.",
    },
    description: {
      uz: "Slack kanalini ulab, taklif, task va hisobotlar bo'yicha avtomatik signal oqimini tayyorlash mumkin.",
      en: "Connect a Slack channel to prepare automatic alerts for suggestions, tasks, and reports.",
      ru: "Подключите канал Slack, чтобы подготовить автоматические сигналы по предложениям, задачам и отчетам.",
    },
    capabilities: [
      {
        uz: "Alert delivery",
        en: "Alert delivery",
        ru: "Отправка уведомлений",
      },
      {
        uz: "Team updates",
        en: "Team updates",
        ru: "Командные обновления",
      },
      {
        uz: "Workflow triggers",
        en: "Workflow triggers",
        ru: "Триггеры workflow",
      },
    ],
    fields: [
      {
        key: "workspaceId",
        type: "text",
        store: "public",
        required: true,
        label: {
          uz: "Workspace ID",
          en: "Workspace ID",
          ru: "Workspace ID",
        },
        placeholder: {
          uz: "Masalan, T01ABCDE",
          en: "For example, T01ABCDE",
          ru: "Например, T01ABCDE",
        },
      },
      {
        key: "channelId",
        type: "text",
        store: "public",
        required: true,
        label: {
          uz: "Channel ID",
          en: "Channel ID",
          ru: "Channel ID",
        },
        placeholder: {
          uz: "Masalan, C03ABCDE",
          en: "For example, C03ABCDE",
          ru: "Например, C03ABCDE",
        },
      },
      {
        key: "botToken",
        type: "password",
        store: "secret",
        required: true,
        secret: true,
        label: {
          uz: "Bot token",
          en: "Bot token",
          ru: "Bot token",
        },
        placeholder: {
          uz: "xoxb-... tokenni kiriting",
          en: "Enter the xoxb-... token",
          ru: "Введите токен xoxb-...",
        },
      },
    ],
  },
  {
    slug: "telegram",
    displayName: "Telegram",
    summary: {
      uz: "Bot orqali tezkor xabar va signal yuborish uchun.",
      en: "For fast bot-driven messages and alerts.",
      ru: "Для быстрых сообщений и сигналов через бота.",
    },
    description: {
      uz: "Telegram bot token va chat ID saqlanib, keyinchalik muhim statuslar yoki ogohlantirishlar yuboriladi.",
      en: "Store a Telegram bot token and chat ID to prepare future status or alert delivery.",
      ru: "Сохраните bot token и chat ID Telegram для будущей отправки статусов и уведомлений.",
    },
    capabilities: [
      {
        uz: "Alert bot",
        en: "Alert bot",
        ru: "Бот уведомлений",
      },
      {
        uz: "Chat updates",
        en: "Chat updates",
        ru: "Обновления в чате",
      },
      {
        uz: "Fast delivery",
        en: "Fast delivery",
        ru: "Быстрая доставка",
      },
    ],
    fields: [
      {
        key: "chatId",
        type: "text",
        store: "public",
        required: true,
        label: {
          uz: "Chat ID",
          en: "Chat ID",
          ru: "Chat ID",
        },
        placeholder: {
          uz: "Masalan, -1001234567890",
          en: "For example, -1001234567890",
          ru: "Например, -1001234567890",
        },
      },
      {
        key: "botUsername",
        type: "text",
        store: "public",
        required: false,
        label: {
          uz: "Bot username",
          en: "Bot username",
          ru: "Имя бота",
        },
        placeholder: {
          uz: "@uyqur_support_bot",
          en: "@uyqur_support_bot",
          ru: "@uyqur_support_bot",
        },
      },
      {
        key: "botToken",
        type: "password",
        store: "secret",
        required: true,
        secret: true,
        label: {
          uz: "Bot token",
          en: "Bot token",
          ru: "Токен бота",
        },
        placeholder: {
          uz: "Telegram bot token kiriting",
          en: "Enter the Telegram bot token",
          ru: "Введите токен Telegram бота",
        },
      },
    ],
  },
];

const PROVIDER_ORDER = new Map(
  INTEGRATION_PROVIDERS.map((provider, index) => [provider.slug, index]),
);

function stringifyValue(value: unknown) {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  return "";
}

export function getIntegrationProvider(
  slug: string | null | undefined,
): IntegrationProviderDefinition | null {
  if (!slug) {
    return null;
  }

  return INTEGRATION_PROVIDERS.find((provider) => provider.slug === slug) ?? null;
}

export function sortIntegrationsByProviderOrder<T extends { provider: string }>(
  items: T[],
): T[] {
  return [...items].sort((left, right) => {
    const leftIndex = PROVIDER_ORDER.get(left.provider as IntegrationProviderSlug) ?? 999;
    const rightIndex = PROVIDER_ORDER.get(right.provider as IntegrationProviderSlug) ?? 999;

    if (leftIndex !== rightIndex) {
      return leftIndex - rightIndex;
    }

    return left.provider.localeCompare(right.provider);
  });
}

export function getIntegrationPublicSummary(
  providerSlug: string,
  publicConfig: Record<string, string>,
  language: AppLanguage,
) {
  const provider = getIntegrationProvider(providerSlug);

  if (!provider) {
    return [];
  }

  return provider.fields
    .filter((field) => field.store === "public")
    .map((field) => ({
      key: field.key,
      label: field.label[language],
      value: stringifyValue(publicConfig[field.key]).trim(),
    }))
    .filter((item) => item.value.length > 0);
}
