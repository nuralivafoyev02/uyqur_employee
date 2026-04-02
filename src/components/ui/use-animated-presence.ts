"use client";

import { useEffect, useState } from "react";

export function useAnimatedPresence(isOpen: boolean, duration = 220) {
  const [isMounted, setIsMounted] = useState(isOpen);

  useEffect(() => {
    let frameId: number | null = null;
    let timeoutId: number | null = null;

    if (isOpen) {
      frameId = window.requestAnimationFrame(() => {
        setIsMounted(true);
      });
    } else {
      timeoutId = window.setTimeout(() => {
        setIsMounted(false);
      }, duration);
    }

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [duration, isOpen]);

  return {
    isMounted,
    dataState: isOpen ? "open" : "closed",
  } as const;
}
