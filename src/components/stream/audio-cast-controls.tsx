"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Airplay } from "lucide-react";

interface AudioCastControlsProps {
  audioRef: ((el: HTMLAudioElement | null) => void) | null;
  captureStream: MediaStream | null;
  onActivate?: () => void;
  isActive?: boolean;
}

export function AudioCastControls({
  audioRef,
  captureStream,
  onActivate,
  isActive,
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
    // Only render the audio element when casting is active
    if (!isActive) {
      // Check if Safari supports AirPlay at all
      const testEl = document.createElement("audio");
      if ("webkitShowPlaybackTargetPicker" in testEl) {
        setAirplayAvailable(true);
      }
      return;
    }

    const audio = internalAudioRef.current;
    if (!audio) return;

    if ("webkitShowPlaybackTargetPicker" in audio) {
      const handler = (e: Event) => {
        const event = e as CustomEvent & { availability?: string };
        setAirplayAvailable(event.availability === "available");
      };

      audio.addEventListener(
        "webkitplaybacktargetavailabilitychanged",
        handler
      );
      setAirplayAvailable(true);

      return () => {
        audio.removeEventListener(
          "webkitplaybacktargetavailabilitychanged",
          handler
        );
      };
    }
  }, [captureStream, isActive]);

  const showPicker = useCallback(() => {
    // Activate audio capture if not yet active
    if (!isActive && onActivate) {
      onActivate();
      // Wait a tick for the audio element to render, then show picker
      setTimeout(() => {
        const audio = internalAudioRef.current;
        if (audio && "webkitShowPlaybackTargetPicker" in audio) {
          (audio as any).webkitShowPlaybackTargetPicker();
        }
      }, 100);
      return;
    }

    const audio = internalAudioRef.current;
    if (!audio) return;

    if ("webkitShowPlaybackTargetPicker" in audio) {
      (audio as any).webkitShowPlaybackTargetPicker();
    }
  }, [isActive, onActivate]);

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
      {/* Hidden audio element for casting - only render when active */}
      {isActive && (
        <audio
          ref={setRef}
          playsInline
          x-webkit-airplay="allow"
          style={{ display: "none" }}
        />
      )}

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
