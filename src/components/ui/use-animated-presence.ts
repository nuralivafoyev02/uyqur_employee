"use client";

import { useEffect, useState } from "react";

export function useAnimatedPresence(isOpen: boolean, duration = 220) {
  const [isMounted, setIsMounted] = useState(isOpen);
  const [dataState, setDataState] = useState<"open" | "closed">(
    isOpen ? "open" : "closed",
  );

  useEffect(() => {
    let mountFrameId: number | null = null;
    let openFrameId: number | null = null;
    let closeFrameId: number | null = null;
    let timeoutId: number | null = null;

    if (isOpen) {
      mountFrameId = window.requestAnimationFrame(() => {
        setIsMounted(true);
        setDataState("closed");

        openFrameId = window.requestAnimationFrame(() => {
          setDataState("open");
        });
      });
    } else {
      closeFrameId = window.requestAnimationFrame(() => {
        setDataState("closed");
      });

      timeoutId = window.setTimeout(() => {
        setIsMounted(false);
      }, duration);
    }

    return () => {
      if (mountFrameId !== null) {
        window.cancelAnimationFrame(mountFrameId);
      }

      if (openFrameId !== null) {
        window.cancelAnimationFrame(openFrameId);
      }

      if (closeFrameId !== null) {
        window.cancelAnimationFrame(closeFrameId);
      }

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [duration, isOpen]);

  return {
    isMounted,
    dataState,
  } as const;
}
