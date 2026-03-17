"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Youtube,
  ChevronUp,
  ChevronDown,
  X,
  Headphones,
  LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { isValidYouTubeUrl } from "@/lib/youtube";
import { useYouTubePlayer } from "@/lib/hooks/use-youtube-player";

const PLAYER_CONTAINER_ID = "narra-yt-player";

interface YouTubeEmbedProps {
  onVideoLoaded?: (videoId: string) => void;
  onRemoved?: () => void;
}

export function YouTubeEmbed({ onVideoLoaded, onRemoved }: YouTubeEmbedProps) {
  const [url, setUrl] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);

  const { loadVideo, destroyPlayer, isReady, error, currentVideoId } =
    useYouTubePlayer(PLAYER_CONTAINER_ID);

  const handleSubmit = useCallback(
    async (videoUrl: string) => {
      const trimmed = videoUrl.trim();
      if (!trimmed) return;
      setHasVideo(true);
      // Defer loadVideo so React renders the container div first
      setTimeout(async () => {
        await loadVideo(trimmed);
      }, 0);
    },
    [loadVideo]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const pasted = e.clipboardData.getData("text");
      if (isValidYouTubeUrl(pasted)) {
        e.preventDefault();
        setUrl(pasted);
        handleSubmit(pasted);
      }
    },
    [handleSubmit]
  );

  const handleRemove = useCallback(() => {
    destroyPlayer();
    setUrl("");
    setHasVideo(false);
    onRemoved?.();
  }, [destroyPlayer, onRemoved]);

  // Notify parent when video loads
  useEffect(() => {
    if (currentVideoId) onVideoLoaded?.(currentVideoId);
  }, [currentVideoId, onVideoLoaded]);

  // URL input state (no video loaded yet)
  if (!hasVideo) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Youtube className="w-5 h-5 text-red-500" />
          <span className="text-sm font-medium text-zinc-300">
            Video do jogo
          </span>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onPaste={handlePaste}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit(url)}
              placeholder="Cole o link do YouTube aqui"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500/50"
            />
          </div>
          <Button
            onClick={() => handleSubmit(url)}
            disabled={!url.trim()}
            size="md"
          >
            Carregar
          </Button>
        </div>
        {error && (
          <p className="text-xs text-red-400 mt-2">{error}</p>
        )}
      </div>
    );
  }

  // Video loaded state
  return (
    <div className="mb-4">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-t-2xl px-4 py-2">
        <div className="flex items-center gap-2">
          <Youtube className="w-4 h-4 text-red-500" />
          <span className="text-xs text-zinc-400">YouTube</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            title={collapsed ? "Expandir" : "Minimizar"}
          >
            {collapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleRemove}
            className="p-1.5 text-zinc-400 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition-colors"
            title="Remover video"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Player */}
      <div
        className={`bg-black border-x border-zinc-800 overflow-hidden transition-all duration-300 ${
          collapsed ? "h-0" : "aspect-video"
        }`}
      >
        <div id={PLAYER_CONTAINER_ID} className="w-full h-full" />
      </div>

      {/* Headphones warning */}
      {!collapsed && (
        <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 border-t-0 rounded-b-2xl px-4 py-2">
          <Headphones className="w-4 h-4 text-yellow-500 shrink-0" />
          <p className="text-xs text-yellow-500/80">
            Use fones de ouvido para o audio do YouTube nao vazar na narracao
          </p>
        </div>
      )}

      {/* Collapsed warning */}
      {collapsed && (
        <div className="border-x border-b border-zinc-800 rounded-b-2xl" />
      )}

      {error && (
        <p className="text-xs text-red-400 mt-2 px-1">{error}</p>
      )}
    </div>
  );
}
