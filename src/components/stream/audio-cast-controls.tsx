"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Airplay } from "lucide-react";

interface AudioCastControlsProps {
  audioRef: ((el: HTMLAudioElement | null) => void) | null;
  captureStream: MediaStream | null;
}

export function AudioCastControls({
  audioRef,
  captureStream,
}: AudioCastControlsProps) {
  const [airplayAvailable, setAirplayAvailable] = useState(false);
  const internalAudioRef = useRef<HTMLAudioElement | null>(null);

  // Combined ref callback: sets internal ref + calls parent ref
  const setRef = useCallback(
    (el: HTMLAudioElement | null) => {
      internalAudioRef.current = el;
      audioRef?.(el);
    },
    [audioRef]
  );

  // Detect AirPlay availability
  useEffect(() => {
    const audio = internalAudioRef.current;
    if (!audio) return;

    // Check Safari AirPlay support
    if ("webkitShowPlaybackTargetPicker" in audio) {
      const handler = (e: Event) => {
        const event = e as CustomEvent & { availability?: string };
        setAirplayAvailable(event.availability === "available");
      };

      audio.addEventListener(
        "webkitplaybacktargetavailabilitychanged",
        handler
      );
      // Assume available on Safari if the API exists (event may not fire immediately)
      setAirplayAvailable(true);

      return () => {
        audio.removeEventListener(
          "webkitplaybacktargetavailabilitychanged",
          handler
        );
      };
    }
  }, [captureStream]);

  const showPicker = useCallback(() => {
    const audio = internalAudioRef.current;
    if (!audio) return;

    if ("webkitShowPlaybackTargetPicker" in audio) {
      (audio as any).webkitShowPlaybackTargetPicker();
    }
  }, []);

  // Update srcObject when captureStream changes
  useEffect(() => {
    const audio = internalAudioRef.current;
    if (audio && captureStream) {
      audio.srcObject = captureStream;
      audio.play().catch(() => {});
    }
  }, [captureStream]);

  return (
    <>
      {/* Hidden audio element for casting */}
      <audio
        ref={setRef}
        playsInline
        x-webkit-airplay="allow"
        style={{ display: "none" }}
      />

      {/* AirPlay button */}
      {airplayAvailable && (
        <button
          onClick={showPicker}
          className="text-zinc-400 hover:text-white transition-colors"
          title="Transmitir audio (AirPlay)"
        >
          <Airplay className="w-5 h-5" />
        </button>
      )}
    </>
  );
}
