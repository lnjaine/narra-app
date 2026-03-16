"use client";

import { useState, useCallback, useRef } from "react";

export function useSync() {
  const [offset, setOffset] = useState(0);
  const [narratorTapTime, setNarratorTapTime] = useState<number | null>(null);
  const [isSynced, setIsSynced] = useState(false);
  const audioDelayRef = useRef(0);

  // Narrator taps when a visible event happens (kickoff, goal, etc)
  const narratorSync = useCallback(() => {
    const now = Date.now();
    setNarratorTapTime(now);
    return now;
  }, []);

  // Listener taps when they see the same event on their TV
  const listenerSync = useCallback(
    (narratorTimestamp: number) => {
      const now = Date.now();
      const calculatedOffset = now - narratorTimestamp;
      setOffset(calculatedOffset);
      audioDelayRef.current = calculatedOffset;
      setIsSynced(true);
      return calculatedOffset;
    },
    []
  );

  // Fine-tune adjustment (+/- milliseconds)
  const adjustOffset = useCallback((deltaMs: number) => {
    setOffset((prev) => {
      const newOffset = prev + deltaMs;
      audioDelayRef.current = newOffset;
      return newOffset;
    });
  }, []);

  const resetSync = useCallback(() => {
    setOffset(0);
    setNarratorTapTime(null);
    setIsSynced(false);
    audioDelayRef.current = 0;
  }, []);

  return {
    offset,
    narratorTapTime,
    isSynced,
    narratorSync,
    listenerSync,
    adjustOffset,
    resetSync,
    audioDelayRef,
  };
}
