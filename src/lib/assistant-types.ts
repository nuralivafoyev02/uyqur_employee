export type AssistantSender = "user" | "assistant" | "system";

export type AssistantMessageKind = "reply" | "error" | "info";

export type AssistantThreadSummary = {
  id: string;
  title: string;
  lastMessagePreview: string | null;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
};

export type AssistantMessageRecord = {
  id: string;
  sender: AssistantSender;
  content: string;
  createdAt: string;
  kind: AssistantMessageKind;
};

export type AssistantThreadDetail = {
  thread: AssistantThreadSummary;
  messages: AssistantMessageRecord[];
};
