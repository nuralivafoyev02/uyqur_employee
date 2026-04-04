"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useToast } from "@/components/providers/toast-provider";
import {
  ArrowRightIcon,
  CloseIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/layout/dashboard-icons";
import { useAnimatedPresence } from "@/components/ui/use-animated-presence";
import type {
  AssistantMessageRecord,
  AssistantThreadDetail,
  AssistantThreadSummary,
} from "@/lib/assistant-types";
import { cx } from "@/lib/utils";

type AssistantWidgetProps = {
  viewer: {
    fullName: string | null;
    role: "admin" | "manager" | "employee" | null;
  } | null;
};

type ThreadMap = Record<string, AssistantMessageRecord[]>;

const STARTER_PROMPTS = [
  "Bugun manga nima vazifalar bor?",
  "Bugun yakunlagan vazifalarimni ko'rsat",
  "Bugungi hisobotim holatini ayt",
  "Bugungi blockerlarim bormi?",
  "Mendagi kechikkan vazifalarni ko'rsat",
];

const LEAD_STARTER_PROMPTS = [
  "Bugun kim hisobot topshirmadi?",
  "Eng faol xodimlar reytingini ko'rsat",
  "Dilbekning bugungi holatini ayt",
  'Ali ga "Savdo hisobotini tayyorlash" vazifasini ertaga biriktir',
];

const DEFAULT_THREAD_TITLE = "Yangi chat";

function MessageBubble({
  message,
  isTyping = false,
}: {
  message: AssistantMessageRecord;
  isTyping?: boolean;
}) {
  const isUser = message.sender === "user";
  const isError = message.kind === "error";

  return (
    <div className={cx("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cx(
          "max-w-[88%] rounded-3xl px-4 py-3 text-[13px] leading-6 shadow-sm",
          isUser
            ? "rounded-br-xl bg-[#1c90ff] text-white"
            : isError
              ? "rounded-bl-xl border border-rose-200 bg-rose-50 text-rose-900"
              : "rounded-bl-xl border border-app-border bg-app-surface text-app-text",
        )}
      >
        {isTyping ? (
          <div className="flex items-center gap-1.5 py-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-app-text-subtle/70" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-app-text-subtle/70 [animation-delay:120ms]" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-app-text-subtle/70 [animation-delay:240ms]" />
          </div>
        ) : (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        )}
      </div>
    </div>
  );
}

export function AssistantWidget({ viewer }: AssistantWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const [threads, setThreads] = useState<AssistantThreadSummary[]>([]);
  const [threadMessages, setThreadMessages] = useState<ThreadMap>({});
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [creatingThread, setCreatingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { pushToast } = useToast();
  const { isMounted, dataState } = useAnimatedPresence(isOpen, 260);

  const messages = activeThreadId ? threadMessages[activeThreadId] ?? [] : [];
  const isLead = viewer?.role === "admin" || viewer?.role === "manager";

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || loadedOnce) {
      return;
    }

    void loadThreads();
  }, [isOpen, loadedOnce]);

  useEffect(() => {
    if (!activeThreadId || threadMessages[activeThreadId]) {
      return;
    }

    void loadThread(activeThreadId);
  }, [activeThreadId, threadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, sending, activeThreadId]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    textareaRef.current?.focus();
  }, [isOpen, activeThreadId]);

  const starterPrompts = useMemo(
    () => (isLead ? [...STARTER_PROMPTS, ...LEAD_STARTER_PROMPTS] : STARTER_PROMPTS),
    [isLead],
  );

  function isThreadEmpty(thread: AssistantThreadSummary) {
    const localMessages = threadMessages[thread.id];

    if (localMessages) {
      return localMessages.length === 0;
    }

    return !thread.lastMessagePreview && thread.title === DEFAULT_THREAD_TITLE;
  }

  function findReusableEmptyThread(excludedThreadId?: string | null) {
    return (
      threads.find(
        (thread) => thread.id !== excludedThreadId && isThreadEmpty(thread),
      ) ?? null
    );
  }

  async function loadThreads() {
    setLoadingThreads(true);
    setInlineError(null);

    try {
      const response = await fetch("/api/ai/threads", {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
      });

      const payload = (await response.json().catch(() => null)) as
        | AssistantThreadSummary[]
        | { message?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          payload && !Array.isArray(payload) && payload.message
            ? payload.message
            : "AI chatlarni yuklab bo'lmadi.",
        );
      }

      const items = Array.isArray(payload) ? payload : [];
      setThreads(items);
      setActiveThreadId((current) => current ?? items[0]?.id ?? null);
      setLoadedOnce(true);
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "AI chatlarni yuklab bo'lmadi.";
      setInlineError(message);
      pushToast({ message, tone: "error" });
    } finally {
      setLoadingThreads(false);
    }
  }

  async function loadThread(threadId: string) {
    try {
      const response = await fetch(`/api/ai/threads/${threadId}`, {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
      });

      const payload = (await response.json().catch(() => null)) as
        | AssistantThreadDetail
        | { message?: string }
        | null;

      if (!response.ok || !payload || "message" in payload) {
        throw new Error(
          payload && "message" in payload && payload.message
            ? payload.message
            : "AI chatni ochib bo'lmadi.",
        );
      }

      const detail = payload as AssistantThreadDetail;

      setThreadMessages((current) => ({
        ...current,
        [threadId]: detail.messages,
      }));
      setThreads((current) =>
        current.map((thread) => (thread.id === threadId ? detail.thread : thread)),
      );
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "AI chatni ochib bo'lmadi.";
      setInlineError(message);
      pushToast({ message, tone: "error" });
    }
  }

  async function createThread() {
    const reusableThread = activeThreadId
      ? threads.find((thread) => thread.id === activeThreadId && isThreadEmpty(thread)) ?? null
      : findReusableEmptyThread();

    if (reusableThread) {
      setActiveThreadId(reusableThread.id);
      setInlineError(null);
      return reusableThread.id;
    }

    setCreatingThread(true);
    setInlineError(null);

    try {
      const response = await fetch("/api/ai/threads", {
        method: "POST",
        credentials: "same-origin",
      });

      const payload = (await response.json().catch(() => null)) as
        | AssistantThreadSummary
        | { message?: string }
        | null;

      if (!response.ok || !payload || "message" in payload) {
        throw new Error(
          payload && "message" in payload && payload.message
            ? payload.message
            : "Yangi AI chat yaratib bo'lmadi.",
        );
      }

      const thread = payload as AssistantThreadSummary;

      setThreads((current) => [thread, ...current.filter((item) => item.id !== thread.id)]);
      setThreadMessages((current) => ({
        ...current,
        [thread.id]: [],
      }));
      setActiveThreadId(thread.id);

      return thread.id;
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Yangi AI chat yaratib bo'lmadi.";
      setInlineError(message);
      pushToast({ message, tone: "error" });
      return null;
    } finally {
      setCreatingThread(false);
    }
  }

  async function ensureActiveThread() {
    if (activeThreadId) {
      return activeThreadId;
    }

    return createThread();
  }

  function reorderThreads(updated: AssistantThreadSummary) {
    setThreads((current) => [updated, ...current.filter((thread) => thread.id !== updated.id)]);
  }

  async function handleDeleteThread(threadId: string) {
    const thread = threads.find((item) => item.id === threadId);

    if (!thread) {
      return;
    }

    const confirmed = window.confirm(
      `"${thread.title}" suhbatini o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.`,
    );

    if (!confirmed) {
      return;
    }

    setInlineError(null);

    try {
      const response = await fetch(`/api/ai/threads/${threadId}`, {
        method: "DELETE",
        credentials: "same-origin",
      });

      const payload = (await response.json().catch(() => null)) as
        | { success?: boolean; message?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message || "AI chatni o'chirib bo'lmadi.");
      }

      const nextThreads = threads.filter((item) => item.id !== threadId);
      setThreads(nextThreads);
      setThreadMessages((current) => {
        const next = { ...current };
        delete next[threadId];
        return next;
      });

      if (activeThreadId === threadId) {
        setActiveThreadId(nextThreads[0]?.id ?? null);
      }
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "AI chatni o'chirib bo'lmadi.";
      setInlineError(message);
      pushToast({ message, tone: "error" });
    }
  }

  async function handleSendMessage(nextContent?: string) {
    const content = (nextContent ?? draft).trim();

    if (!content || sending) {
      return;
    }

    setDraft("");
    setInlineError(null);
    setSending(true);

    const threadId = await ensureActiveThread();

    if (!threadId) {
      setSending(false);
      return;
    }

    const tempUserId = `temp-user-${Date.now()}`;
    const tempAssistantId = `temp-assistant-${Date.now()}`;
    const optimisticMessages: AssistantMessageRecord[] = [
      {
        id: tempUserId,
        sender: "user",
        content,
        createdAt: new Date().toISOString(),
        kind: "reply",
      },
      {
        id: tempAssistantId,
        sender: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
        kind: "info",
      },
    ];

    setActiveThreadId(threadId);
    setThreadMessages((current) => ({
      ...current,
      [threadId]: [...(current[threadId] ?? []), ...optimisticMessages],
    }));

    try {
      const response = await fetch(`/api/ai/threads/${threadId}/messages`, {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | {
          thread: AssistantThreadSummary;
          userMessage: AssistantMessageRecord;
          assistantMessage: AssistantMessageRecord;
        }
        | { message?: string }
        | null;

      if (!response.ok || !payload || "message" in payload) {
        throw new Error(
          payload && "message" in payload && payload.message
            ? payload.message
            : "AI xabariga javob olib bo'lmadi.",
        );
      }

      const messageResponse = payload as {
        thread: AssistantThreadSummary;
        userMessage: AssistantMessageRecord;
        assistantMessage: AssistantMessageRecord;
      };

      setThreadMessages((current) => ({
        ...current,
        [threadId]: [
          ...(current[threadId] ?? []).filter(
            (message) => message.id !== tempUserId && message.id !== tempAssistantId,
          ),
          messageResponse.userMessage,
          messageResponse.assistantMessage,
        ],
      }));
      reorderThreads(messageResponse.thread);
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "AI xabariga javob olib bo'lmadi.";

      setThreadMessages((current) => ({
        ...current,
        [threadId]: [
          ...(current[threadId] ?? []).filter((item) => item.id !== tempAssistantId),
          {
            id: `local-error-${Date.now()}`,
            sender: "assistant",
            content: message,
            createdAt: new Date().toISOString(),
            kind: "error",
          },
        ],
      }));
      setInlineError(message);
      pushToast({ message, tone: "error" });
    } finally {
      setSending(false);
    }
  }

  if (!portalReady) {
    return (
      <button
        type="button"
        aria-label="Uyqur AI"
        className="fixed bottom-4 right-4 z-[120] flex h-14 w-14 items-center justify-center rounded-full bg-[#101828] text-sm font-bold text-white shadow-[0_18px_40px_rgba(16,24,40,0.24)] transition-transform hover:scale-[1.03] md:bottom-6 md:right-6"
        onClick={() => setIsOpen(true)}
      >
        AI
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        aria-label="Uyqur AI"
        className="group fixed bottom-4 right-4 z-[120] inline-flex h-14 w-14 items-center overflow-hidden rounded-full bg-[#101828] pr-5 text-white shadow-[0_18px_40px_rgba(16,24,40,0.24)] transition-[width,transform] duration-300 hover:w-[152px] hover:scale-[1.02] md:bottom-6 md:right-6"
        onClick={() => setIsOpen(true)}
      >
        <span className="ml-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/12 text-sm font-bold">
          AI
        </span>
        <span className="ml-2 max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold opacity-0 transition-all duration-300 group-hover:max-w-[96px] group-hover:opacity-100">
          Uyqur AI
        </span>
      </button>

      {isMounted
        ? createPortal(
          <>
            <button
              type="button"
              aria-label="AI oynasini yopish"
              className="app-overlay fixed inset-0 z-[130] bg-slate-950/18 backdrop-blur-[2px]"
              data-state={dataState}
              onClick={() => setIsOpen(false)}
            />

            <section
              className="assistant-widget-panel fixed inset-x-3 bottom-3 top-[76px] z-[131] overflow-hidden rounded-[30px] border border-app-border bg-app-surface shadow-[0_26px_90px_rgba(16,24,40,0.26)] sm:inset-auto sm:bottom-5 sm:right-5 sm:top-auto sm:h-[min(780px,calc(100vh-2rem))] sm:w-[min(680px,calc(100vw-2rem))] xl:w-[760px]"
              data-state={dataState}
              role="dialog"
              aria-modal="true"
              aria-label="Uyqur AI"
            >
              <div className="flex h-full min-h-0 flex-col">
                <header className="border-b border-app-border bg-app-bg-elevated/80 px-4 py-4 backdrop-blur">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-app-text-subtle">
                        Ichki Assistant
                      </p>
                      <h2 className="mt-1 text-lg font-semibold tracking-tight text-app-text">
                        Uyqur AI
                      </h2>
                      <p className="mt-1 text-[12px] leading-5 text-app-text-muted">
                        {viewer?.fullName
                          ? `${viewer.fullName.split(/\s+/)[0]} uchun alohida chat va ichki ish oqimlari.`
                          : "Alohida chatlar, xotira va ichki ish oqimlari."}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="app-icon-button h-10 w-10"
                        onClick={() => void createThread()}
                        aria-label="Yangi chat"
                        disabled={creatingThread}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="app-icon-button h-10 w-10"
                        onClick={() => setIsOpen(false)}
                        aria-label="Yopish"
                      >
                        <CloseIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {inlineError ? (
                    <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] leading-5 text-rose-900">
                      {inlineError}
                    </div>
                  ) : null}
                </header>

                <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] lg:grid-cols-[190px_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
                  <aside className="border-b border-app-border bg-app-bg-elevated/35 p-3 lg:border-b-0 lg:border-r">
                    <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
                      <button
                        type="button"
                        className="app-button shrink-0 whitespace-nowrap px-3 py-2 text-[12px]"
                        onClick={() => void createThread()}
                        disabled={creatingThread}
                      >
                        {creatingThread ? "Yaratilmoqda..." : "Yangi chat"}
                      </button>

                      {threads.map((thread) => (
                        <div
                          key={thread.id}
                          className={cx(
                            "min-w-[160px] rounded-2xl border px-2 py-2 transition lg:min-w-0",
                            activeThreadId === thread.id
                              ? "border-app-border-strong bg-app-surface text-app-text"
                              : "border-app-border bg-app-bg-elevated text-app-text-muted hover:bg-app-surface",
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <button
                              type="button"
                              className="min-w-0 flex-1 text-left"
                              onClick={() => setActiveThreadId(thread.id)}
                            >
                              <p className="truncate text-[12px] font-semibold">
                                {thread.title}
                              </p>
                              <p className="mt-1 app-line-clamp-2 text-[11px] leading-4 text-app-text-subtle">
                                {thread.lastMessagePreview ?? "Yangi suhbat"}
                              </p>
                            </button>

                            <button
                              type="button"
                              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-app-border bg-app-surface text-app-text-subtle transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                              onClick={() => void handleDeleteThread(thread.id)}
                              aria-label={`${thread.title} suhbatini o'chirish`}
                            >
                              <TrashIcon className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </aside>

                  <div className="flex min-h-0 flex-col">
                    <div className="border-b border-app-border px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-[14px] font-semibold text-app-text">
                            {threads.find((thread) => thread.id === activeThreadId)?.title ?? "Yangi chat"}
                          </h3>
                          <p className="text-[12px] text-app-text-muted">
                            {activeThreadId
                              ? "Oxirgi yozishmalar eslab qolinadi va shu chat ichida davom etadi."
                              : "Yangi chat yarating yoki savol yozishni boshlang."}
                          </p>
                        </div>

                        <button
                          type="button"
                          className="app-button-secondary px-2.5 py-2 text-[12px]"
                          onClick={() => void loadThreads()}
                          disabled={loadingThreads}
                        >
                          {loadingThreads ? "Yangilanmoqda..." : "Yangilash"}
                        </button>
                      </div>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(28,144,255,0.08),transparent_30%)] px-4 py-4">
                      {!activeThreadId && !loadingThreads ? (
                        <div className="mx-auto flex h-full max-w-[320px] flex-col items-center justify-center text-center">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#101828] text-lg font-bold text-white">
                            AI
                          </div>
                          <h4 className="mt-5 text-lg font-semibold text-app-text">
                            Uyqur AI bilan suhbatni boshlang
                          </h4>
                          <p className="mt-2 text-[13px] leading-6 text-app-text-muted">
                            Men vazifalar, hisobotlar, blockerlar va rahbarlar uchun xodimlar faolligi bo'yicha yordam bera olaman.
                          </p>

                          <div className="mt-5 flex flex-wrap justify-center gap-2">
                            {starterPrompts.map((prompt) => (
                              <button
                                key={prompt}
                                type="button"
                                className="rounded-full border border-app-border bg-app-surface px-2.5 py-1.5 text-[12px] font-medium text-app-text transition hover:bg-app-bg-elevated"
                                onClick={() => {
                                  setDraft(prompt);
                                  setIsOpen(true);
                                }}
                              >
                                {prompt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {(messages.length > 0 ? messages : [{
                            id: "assistant-welcome",
                            sender: "assistant",
                            content: viewer?.fullName
                              ? `Salom, ${viewer.fullName.split(/\s+/)[0]}! Men Uyqur AI man. Bugungi vazifalar, hisobotlar va ichki ish oqimlari bo'yicha yordam bera olaman.`
                              : "Salom! Men Uyqur AI man. Savolingizni yozing.",
                            createdAt: new Date().toISOString(),
                            kind: "reply",
                          } as AssistantMessageRecord]).map((message) => (
                            <MessageBubble
                              key={message.id}
                              message={message}
                              isTyping={message.id.startsWith("temp-assistant-")}
                            />
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </div>

                    <div className="border-t border-app-border bg-app-surface px-4 py-4">
                      <div className="rounded-[26px] border border-app-border bg-app-bg-elevated p-2">
                        <div className="flex items-end gap-2">
                          <textarea
                            ref={textareaRef}
                            value={draft}
                            onChange={(event) => setDraft(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" && !event.shiftKey) {
                                event.preventDefault();
                                void handleSendMessage();
                              }
                            }}
                            placeholder="Savolingizni yozing..."
                            className="min-h-[52px] flex-1 resize-none border-0 bg-transparent px-3 py-2 text-[13px] leading-6 text-app-text outline-none placeholder:text-app-text-subtle"
                            rows={2}
                            maxLength={1200}
                          />

                          <button
                            type="button"
                            className="app-button h-10 min-w-10 rounded-full px-2.5"
                            onClick={() => void handleSendMessage()}
                            disabled={sending || !draft.trim()}
                            aria-label="Yuborish"
                          >
                            <ArrowRightIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {starterPrompts.slice(0, 3).map((prompt) => (
                          <button
                            key={prompt}
                            type="button"
                            className="rounded-full border border-app-border px-2.5 py-1 text-[11px] font-medium text-app-text-muted transition hover:bg-app-bg-elevated hover:text-app-text"
                            onClick={() => void handleSendMessage(prompt)}
                            disabled={sending}
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>,
          document.body,
        )
        : null}
    </>
  );
}
