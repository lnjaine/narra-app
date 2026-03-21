"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useParticipants,
  useDataChannel,
} from "@livekit/components-react";
import {
  Volume2,
  VolumeX,
  Zap,
  ChevronLeft,
  Users,
  Minus,
  Plus,
  Flame,
  Laugh,
  Goal,
  ThumbsDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/hooks/use-auth";
import { useSync } from "@/lib/hooks/use-sync";
import { useMediaSession } from "@/lib/hooks/use-media-session";
import { useAudioCapture } from "@/lib/hooks/use-audio-capture";
import { AudioCastControls } from "@/components/stream/audio-cast-controls";
import Link from "next/link";
import type { Profile, Event, Stream } from "@/types/database";

interface ListenerViewProps {
  stream: Stream;
  narrator: Profile;
  event: Event;
  roomName: string;
}

export function ListenerView({
  stream,
  narrator,
  event,
  roomName,
}: ListenerViewProps) {
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      try {
        const res = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomName, isNarrator: false }),
        });
        const data = await res.json();
        if (data.token) setToken(data.token);
        else setError(data.error || "Erro ao conectar");
      } catch {
        setError("Erro ao conectar ao servidor");
      }
    };

    if (user) getToken();
  }, [user, roomName]);

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-zinc-400 mb-4">
          Faça login para ouvir a narração.
        </p>
        <Link href="/login">
          <Button>Entrar</Button>
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <Link href={`/matches/${event.id}`}>
          <Button variant="secondary">Voltar</Button>
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-400">Conectando ao narrador...</p>
      </div>
    );
  }

  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL!;

  return (
    <LiveKitRoom
      serverUrl={livekitUrl}
      token={token}
      connect={true}
      audio={false}
      video={false}
    >
      <ListenerUI stream={stream} narrator={narrator} event={event} />
    </LiveKitRoom>
  );
}

function ListenerUI({
  stream,
  narrator,
  event,
}: {
  stream: Stream;
  narrator: Profile;
  event: Event;
}) {
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const { offset, isSynced, listenerSync, adjustOffset, resetSync } =
    useSync();
  const participants = useParticipants();
  const listenerCount = Math.max(participants.length - 1, 0);
  const [reactions, setReactions] = useState<
    { id: number; type: string; x: number }[]
  >([]);
  const [narratorSyncTime, setNarratorSyncTime] = useState<number | null>(null);

  // Stable callbacks for media session
  const handlePlay = useCallback(() => setMuted(false), []);
  const handlePause = useCallback(() => setMuted(true), []);

  // Media Session for lock screen controls & background audio
  useMediaSession({
    title: stream.title || "Narracao ao vivo",
    artist: narrator?.name || "Narrador",
    album: `${event.home_team} vs ${event.away_team}`,
    artworkUrl: narrator?.avatar_url || undefined,
    onPlay: handlePlay,
    onPause: handlePause,
    isPlaying: !muted,
  });

  // Audio capture for AirPlay casting - lazy, only activates on demand
  const audioVolume = muted ? 0 : volume / 100;
  const { audioRef: castAudioRef, captureStream, activate: activateCast, isActive: isCastActive } = useAudioCapture(audioVolume);

  // Listen for sync signals from narrator via data channel
  const onDataReceived = useCallback(
    (msg: { payload: Uint8Array }) => {
      try {
        const parsed = JSON.parse(new TextDecoder().decode(msg.payload));
        if (parsed.type === "sync") {
          setNarratorSyncTime(parsed.timestamp);
        }
      } catch {}
    },
    []
  );

  useDataChannel("sync", onDataReceived);

  const handleSync = useCallback(() => {
    if (narratorSyncTime) {
      listenerSync(narratorSyncTime);
    }
  }, [narratorSyncTime, listenerSync]);

  const handleReaction = useCallback((type: string) => {
    const id = Date.now();
    const x = Math.random() * 80 + 10;
    setReactions((prev) => [...prev, { id, type, x }]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== id));
    }, 1500);
  }, []);

  const reactionEmojis = useMemo(() => [
    { type: "fire", icon: Flame, label: "Fogo" },
    { type: "laugh", icon: Laugh, label: "Risada" },
    { type: "goal", icon: Goal, label: "Gol" },
    { type: "boo", icon: ThumbsDown, label: "Vaia" },
  ], []);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 min-h-[80vh] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/matches/${event.id}`}
          className="flex items-center gap-1 text-zinc-400 hover:text-white text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar
        </Link>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-zinc-500" />
          <span className="text-sm text-zinc-400">{listenerCount} ouvindo</span>
        </div>
      </div>

      {/* Narrator info */}
      <div className="text-center mb-8">
        <div className="relative inline-block mb-4">
          {narrator?.avatar_url ? (
            <img
              src={narrator.avatar_url}
              alt={narrator.name || ""}
              className="w-24 h-24 rounded-full object-cover border-2 border-green-500"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-green-500 flex items-center justify-center">
              <Volume2 className="w-10 h-10 text-green-500" />
            </div>
          )}
          {/* Pulse indicator */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-zinc-950" />
        </div>
        <h1 className="text-xl font-bold">{narrator?.name || "Narrador"}</h1>
        <p className="text-sm text-zinc-400 mt-1">{stream.title}</p>
        <p className="text-xs text-zinc-600 mt-1">
          {event.home_team} vs {event.away_team}
        </p>
      </div>

      {/* Audio renderer (LiveKit handles the audio) */}
      <RoomAudioRenderer muted={muted} volume={volume / 100} />

      {/* Sync section */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 mb-6">
        <h3 className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          Sincronização
        </h3>

        {!isSynced ? (
          <div className="space-y-3">
            <p className="text-xs text-zinc-500">
              {narratorSyncTime
                ? "O narrador marcou o ponto de sync. Toque quando voce vir o mesmo evento na sua TV."
                : "Aguardando o narrador marcar o ponto de sync..."}
            </p>
            <Button
              onClick={handleSync}
              disabled={!narratorSyncTime}
              className="w-full"
              size="lg"
            >
              <Zap className="w-5 h-5" />
              Sync!
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Offset</span>
              <span className="text-green-400 font-mono">
                {offset > 0 ? "+" : ""}
                {(offset / 1000).toFixed(1)}s
              </span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => adjustOffset(-500)}
              >
                <Minus className="w-4 h-4" />
                0.5s
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => adjustOffset(-100)}
              >
                <Minus className="w-4 h-4" />
                0.1s
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => adjustOffset(100)}
              >
                <Plus className="w-4 h-4" />
                0.1s
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => adjustOffset(500)}
              >
                <Plus className="w-4 h-4" />
                0.5s
              </Button>
            </div>
            <button
              onClick={resetSync}
              className="text-xs text-zinc-600 hover:text-zinc-400 mx-auto block"
            >
              Resetar sync
            </button>
          </div>
        )}
      </div>

      {/* Volume & Cast */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setMuted(!muted)} className="text-zinc-400 hover:text-white">
            {muted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={muted ? 0 : volume}
            onChange={(e) => {
              setVolume(Number(e.target.value));
              if (muted) setMuted(false);
            }}
            className="flex-1 accent-green-500"
          />
          <span className="text-xs text-zinc-500 w-8 text-right">
            {muted ? 0 : volume}%
          </span>
          <AudioCastControls
            audioRef={castAudioRef}
            captureStream={captureStream}
            onActivate={activateCast}
            isActive={isCastActive}
          />
        </div>
      </div>

      {/* Reactions */}
      <div className="relative mt-auto">
        {/* Floating reactions */}
        {reactions.map((r) => (
          <div
            key={r.id}
            className="absolute bottom-full animate-float-up text-2xl"
            style={{ left: `${r.x}%` }}
          >
            {r.type === "fire" && "🔥"}
            {r.type === "laugh" && "😂"}
            {r.type === "goal" && "⚽"}
            {r.type === "boo" && "👎"}
          </div>
        ))}

        <div className="flex items-center justify-center gap-3 py-4">
          {reactionEmojis.map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => handleReaction(type)}
              className="w-12 h-12 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center transition-all active:scale-90"
              title={label}
            >
              <Icon className="w-5 h-5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
