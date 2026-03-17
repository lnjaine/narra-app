"use client";

import { useEffect } from "react";

interface MediaSessionOptions {
  title: string;
  artist: string;
  album: string;
  artworkUrl?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  isPlaying: boolean;
}

export function useMediaSession({
  title,
  artist,
  album,
  artworkUrl,
  onPlay,
  onPause,
  onStop,
  isPlaying,
}: MediaSessionOptions) {
  // Set metadata
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    const artwork: MediaImage[] = artworkUrl
      ? [{ src: artworkUrl, sizes: "256x256", type: "image/png" }]
      : [];

    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist,
      album,
      artwork,
    });
  }, [title, artist, album, artworkUrl]);

  // Register action handlers
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    const handlers: [MediaSessionAction, MediaSessionActionHandler | null][] = [
      ["play", onPlay ? () => onPlay() : null],
      ["pause", onPause ? () => onPause() : null],
      ["stop", onStop ? () => onStop() : null],
    ];

    for (const [action, handler] of handlers) {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {
        // Action not supported
      }
    }

    return () => {
      for (const [action] of handlers) {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch {}
      }
    };
  }, [onPlay, onPause, onStop]);

  // Update playback state
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [isPlaying]);
}
