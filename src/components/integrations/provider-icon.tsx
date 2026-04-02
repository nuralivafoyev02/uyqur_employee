"use client";

import type { ComponentType } from "react";

import {
  ClickUpIcon,
  IntegrationIcon,
  JiraIcon,
  SlackIcon,
  TelegramIcon,
  TrelloIcon,
} from "@/components/layout/dashboard-icons";
import { cx } from "@/lib/utils";

type IconComponent = ComponentType<{ className?: string }>;

const iconMap: Record<string, IconComponent> = {
  clickup: ClickUpIcon,
  jira: JiraIcon,
  trello: TrelloIcon,
  slack: SlackIcon,
  telegram: TelegramIcon,
};

const surfaceMap: Record<string, string> = {
  clickup: "bg-[linear-gradient(135deg,#8B5CF6_0%,#EC4899_100%)] text-white",
  jira: "bg-[linear-gradient(135deg,#0C66E4_0%,#7AA7FF_100%)] text-white",
  trello: "bg-[linear-gradient(135deg,#0EA5E9_0%,#2563EB_100%)] text-white",
  slack: "bg-[linear-gradient(135deg,#611F69_0%,#E01E5A_100%)] text-white",
  telegram: "bg-[linear-gradient(135deg,#38BDF8_0%,#0EA5E9_100%)] text-white",
};

export function getIntegrationIconComponent(provider: string): IconComponent {
  return iconMap[provider] ?? IntegrationIcon;
}

export function getIntegrationSurfaceClasses(provider: string) {
  return surfaceMap[provider] ?? "bg-app-accent-muted text-app-accent";
}

function renderIntegrationIcon(provider: string, className?: string) {
  switch (provider) {
    case "clickup":
      return <ClickUpIcon className={className} />;
    case "jira":
      return <JiraIcon className={className} />;
    case "trello":
      return <TrelloIcon className={className} />;
    case "slack":
      return <SlackIcon className={className} />;
    case "telegram":
      return <TelegramIcon className={className} />;
    default:
      return <IntegrationIcon className={className} />;
  }
}

export function IntegrationProviderBadge({
  provider,
  className,
  iconClassName,
}: {
  provider: string;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span
      className={cx(
        "flex items-center justify-center rounded-2xl",
        getIntegrationSurfaceClasses(provider),
        className,
      )}
    >
      {renderIntegrationIcon(provider, iconClassName)}
    </span>
  );
}
