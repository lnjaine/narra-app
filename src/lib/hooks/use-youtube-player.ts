"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { extractVideoId } from "@/lib/youtube";

// Minimal YT.Player types
interface YTPlayer {
  destroy(): void;
  loadVideoById(videoId: string): void;
  getIframe(): HTMLIFrameElement;
}

interface YTPlayerOptions {
  height: string;
  width: string;
  videoId: string;
  playerVars?: Record<string, number | string>;
  events?: {
    onReady?: (event: { target: YTPlayer }) => void;
    onError?: (event: { data: number }) => void;
  };
}

declare global {
  interface Window {
    YT?: {
      Player: new (elementId: string, options: YTPlayerOptions) => YTPlayer;
      PlayerState: Record<string, number>;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

// Module-level promise to load the API script once
let apiLoadPromise: Promise<void> | null = null;

function loadYouTubeAPI(): Promise<void> {
  if (apiLoadPromise) return apiLoadPromise;

  apiLoadPromise = new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve();
      return;
    }

    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.head.appendChild(script);
  });

  return apiLoadPromise;
}

export function useYouTubePlayer(containerId: string) {
  const playerRef = useRef<YTPlayer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);

  const destroyPlayer = useCallback(() => {
    playerRef.current?.destroy();
    playerRef.current = null;
    setIsReady(false);
    setCurrentVideoId(null);
  }, []);

  const loadVideo = useCallback(
    async (url: string) => {
      const videoId = extractVideoId(url);
      if (!videoId) {
        setError("URL do YouTube invalida");
        return;
      }

      setError(null);

      try {
        await loadYouTubeAPI();
      } catch {
        setError("Erro ao carregar YouTube API");
        return;
      }

      // If player exists, just load new video
      if (playerRef.current) {
        playerRef.current.loadVideoById(videoId);
        setCurrentVideoId(videoId);
        return;
      }

      // Create new player
      const container = document.getElementById(containerId);
      if (!container) {
        setError("Container nao encontrado");
        return;
      }

      playerRef.current = new window.YT!.Player(containerId, {
        height: "100%",
        width: "100%",
        videoId,
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: () => {
            setIsReady(true);
            setCurrentVideoId(videoId);
          },
          onError: (event) => {
            const codes: Record<number, string> = {
              2: "ID de video invalido",
              5: "Erro no player HTML5",
              100: "Video nao encontrado",
              101: "Video nao pode ser embutido",
              150: "Video nao pode ser embutido",
            };
            setError(codes[event.data] || "Erro no YouTube");
          },
        },
      });
    },
    [containerId]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, []);

  return { loadVideo, destroyPlayer, isReady, error, currentVideoId };
}
