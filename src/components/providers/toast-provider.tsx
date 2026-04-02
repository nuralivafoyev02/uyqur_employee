"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { CloseIcon } from "@/components/layout/dashboard-icons";
import { cx } from "@/lib/utils";

export type ToastTone = "success" | "error" | "info" | "warning";

type ToastInput = {
  message: string;
  tone?: ToastTone;
  duration?: number;
};

type ToastRecord = {
  id: number;
  message: string;
  tone: ToastTone;
  dataState: "open" | "closed";
};

type ToastContextValue = {
  pushToast: (input: ToastInput) => void;
  dismissToast: (id: number) => void;
};

const TOAST_DURATION = 2500;
const TOAST_EXIT_DURATION = 220;

const ToastContext = createContext<ToastContextValue | null>(null);

const toneClasses: Record<ToastTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-rose-200 bg-rose-50 text-rose-900",
  info: "border-sky-200 bg-sky-50 text-sky-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const nextIdRef = useRef(1);
  const closeTimersRef = useRef(new Map<number, number>());
  const removeTimersRef = useRef(new Map<number, number>());
  const frameTimersRef = useRef(new Map<number, number>());

  useEffect(() => {
    const closeTimers = closeTimersRef.current;
    const removeTimers = removeTimersRef.current;
    const frameTimers = frameTimersRef.current;

    return () => {
      closeTimers.forEach((timer) => window.clearTimeout(timer));
      removeTimers.forEach((timer) => window.clearTimeout(timer));
      frameTimers.forEach((frame) => window.cancelAnimationFrame(frame));
    };
  }, []);

  const dismissToast = useCallback((id: number) => {
    const closeTimer = closeTimersRef.current.get(id);
    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimersRef.current.delete(id);
    }

    const frameTimer = frameTimersRef.current.get(id);
    if (frameTimer) {
      window.cancelAnimationFrame(frameTimer);
      frameTimersRef.current.delete(id);
    }

    setToasts((current) =>
      current.map((toast) =>
        toast.id === id ? { ...toast, dataState: "closed" } : toast,
      ),
    );

    const existingRemoveTimer = removeTimersRef.current.get(id);
    if (existingRemoveTimer) {
      window.clearTimeout(existingRemoveTimer);
    }

    const removeTimer = window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
      removeTimersRef.current.delete(id);
    }, TOAST_EXIT_DURATION);

    removeTimersRef.current.set(id, removeTimer);
  }, []);

  const pushToast = useCallback(
    (input: ToastInput) => {
      const id = nextIdRef.current++;
      const duration = input.duration ?? TOAST_DURATION;
      const tone = input.tone ?? "success";

      setToasts((current) => [
        ...current,
        {
          id,
          message: input.message,
          tone,
          dataState: "closed",
        },
      ]);

      const frame = window.requestAnimationFrame(() => {
        setToasts((current) =>
          current.map((toast) =>
            toast.id === id ? { ...toast, dataState: "open" } : toast,
          ),
        );
        frameTimersRef.current.delete(id);
      });

      frameTimersRef.current.set(id, frame);

      const closeTimer = window.setTimeout(() => {
        dismissToast(id);
      }, duration);

      closeTimersRef.current.set(id, closeTimer);
    },
    [dismissToast],
  );

  const value = useMemo(
    () => ({
      pushToast,
      dismissToast,
    }),
    [dismissToast, pushToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[140] flex w-[min(420px,calc(100vw-2rem))] flex-col gap-3 md:right-5 md:top-5">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            data-state={toast.dataState}
            className={cx(
              "app-toast pointer-events-auto rounded-2xl border px-4 py-3 shadow-lg",
              toneClasses[toast.tone],
            )}
          >
            <div className="flex items-start gap-3">
              <p className="min-w-0 flex-1 text-[13px] font-medium leading-5">{toast.message}</p>
              <button
                type="button"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-current/10 bg-white/55 transition hover:bg-white/75"
                onClick={() => dismissToast(toast.id)}
                aria-label="Close toast"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }

  return context;
}
