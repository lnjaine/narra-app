"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  LiveKitRoom,
  useLocalParticipant,
  useParticipants,
  useDataChannel,
} from "@livekit/components-react";
import {
  Mic,
  MicOff,
  Radio,
  Square,
  Users,
  Zap,
  BarChart3,
  Clock,
  Trash2,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { YouTubeEmbed } from "@/components/stream/youtube-embed";
import { ShareButton } from "@/components/stream/share-button";
import { useAuth } from "@/lib/hooks/use-auth";
import type { Stream, Event } from "@/types/database";

interface SyncEvent {
  id: number;
  label: string;
  matchMinute: string;
  streamTimestamp: string;
  createdAt: number;
}

interface NarratorStudioProps {
  stream: Stream;
  event: Event;
  roomName: string;
}

export function NarratorStudio({
  stream,
  event,
  roomName,
}: NarratorStudioProps) {
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(stream.status === "live");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      try {
        const res = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomName, isNarrator: true }),
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

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-400">Preparando estúdio...</p>
      </div>
    );
  }

  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL!;

  return (
    <LiveKitRoom
      serverUrl={livekitUrl}
      token={token}
      connect={true}
      audio={true}
      video={false}
    >
      <StudioUI
        stream={stream}
        event={event}
        isLive={isLive}
        setIsLive={setIsLive}
      />
    </LiveKitRoom>
  );
}

function StudioUI({
  stream,
  event,
  isLive,
  setIsLive,
}: {
  stream: Stream;
  event: Event;
  isLive: boolean;
  setIsLive: (v: boolean) => void;
}) {
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();
  const participants = useParticipants();
  const listenerCount = Math.max(participants.length - 1, 0);
  const [peakListeners, setPeakListeners] = useState(stream.peak_listeners);
  const [syncSent, setSyncSent] = useState(false);
  const [hasYouTube, setHasYouTube] = useState(false);
  const startTimeRef = useRef<Date | null>(
    stream.started_at ? new Date(stream.started_at) : null
  );
  const [elapsed, setElapsed] = useState("00:00");

  // Sync event log
  const [syncEvents, setSyncEvents] = useState<SyncEvent[]>([]);
  const [syncLabel, setSyncLabel] = useState("");
  const [syncMatchMinute, setSyncMatchMinute] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  // Track peak listeners and sync to DB periodically
  useEffect(() => {
    if (listenerCount > peakListeners) {
      setPeakListeners(listenerCount);
    }
  }, [listenerCount, peakListeners]);

  // Sync listener count and peak to DB every 10s while live
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      fetch(`/api/streams/${stream.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listener_count: listenerCount,
          peak_listeners: peakListeners,
        }),
      }).catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, [isLive, stream.id, listenerCount, peakListeners]);

  // Elapsed time
  useEffect(() => {
    if (!isLive || !startTimeRef.current) return;
    const interval = setInterval(() => {
      const diff = Date.now() - startTimeRef.current!.getTime();
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setElapsed(
        `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [isLive]);

  const goLive = async () => {
    await fetch(`/api/streams/${stream.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "live" }),
    });
    startTimeRef.current = new Date();
    setIsLive(true);
  };

  const endStream = async () => {
    await fetch(`/api/streams/${stream.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ended", peak_listeners: peakListeners }),
    });
    if (localParticipant) {
      localParticipant.setMicrophoneEnabled(false);
    }
    setIsLive(false);
  };

  const toggleMic = async () => {
    if (localParticipant) {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    }
  };

  // Send sync signal via data channel
  const { send: sendData } = useDataChannel("sync");

  const sendSync = useCallback(() => {
    const timestamp = Date.now();
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify({ type: "sync", timestamp }));
    sendData(data, { reliable: true });
    setSyncSent(true);
    setTimeout(() => setSyncSent(false), 3000);

    // Add to sync log with current stream time
    const newEvent: SyncEvent = {
      id: timestamp,
      label: syncLabel || "Sync",
      matchMinute: syncMatchMinute || "",
      streamTimestamp: elapsed,
      createdAt: timestamp,
    };
    setSyncEvents((prev) => [...prev, newEvent]);
    setSyncLabel("");
    setSyncMatchMinute("");
  }, [sendData, syncLabel, syncMatchMinute, elapsed]);

  const removeSyncEvent = (id: number) => {
    setSyncEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const updateSyncEvent = (id: number, updates: Partial<SyncEvent>) => {
    setSyncEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
    setEditingId(null);
  };

  return (
    <div className={`mx-auto px-4 py-6 ${hasYouTube ? "max-w-2xl" : "max-w-lg"}`}>
      {/* Header */}
      <div className="text-center mb-4">
        <Badge variant={isLive ? "live" : "scheduled"} className="mb-3">
          {isLive ? "Ao Vivo" : "Preparando"}
        </Badge>
        <h1 className="text-xl font-bold">{stream.title}</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {event.home_team} vs {event.away_team}
        </p>
        <div className="mt-3">
          <ShareButton streamId={stream.id} streamTitle={stream.title} />
        </div>
      </div>

      {/* YouTube Embed */}
      <YouTubeEmbed
        onVideoLoaded={() => setHasYouTube(true)}
        onRemoved={() => setHasYouTube(false)}
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
          <Users className="w-5 h-5 text-green-500 mx-auto mb-1" />
          <p className="text-2xl font-bold">{listenerCount}</p>
          <p className="text-xs text-zinc-500">Ouvindo</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
          <BarChart3 className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <p className="text-2xl font-bold">{peakListeners}</p>
          <p className="text-xs text-zinc-500">Pico</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
          <Radio className="w-5 h-5 text-red-500 mx-auto mb-1" />
          <p className="text-2xl font-bold font-mono">{elapsed}</p>
          <p className="text-xs text-zinc-500">Tempo</p>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {!isLive ? (
          <Button onClick={goLive} size="lg" className="w-full">
            <Radio className="w-5 h-5" />
            Entrar ao vivo
          </Button>
        ) : (
          <>
            {/* Mic toggle */}
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={toggleMic}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  isMicrophoneEnabled
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                {isMicrophoneEnabled ? (
                  <Mic className="w-8 h-8" />
                ) : (
                  <MicOff className="w-8 h-8" />
                )}
              </button>
            </div>
            <p className="text-center text-sm text-zinc-500">
              {isMicrophoneEnabled ? "Microfone ligado" : "Microfone mutado"}
            </p>

            {/* Sync section with event log */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                Sync &amp; Marcações
              </h3>

              {/* Quick inputs for sync */}
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Evento (ex: Gol, Início)"
                  value={syncLabel}
                  onChange={(e) => setSyncLabel(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-yellow-500/50"
                />
                <input
                  type="text"
                  placeholder="Min. do jogo (ex: 45')"
                  value={syncMatchMinute}
                  onChange={(e) => setSyncMatchMinute(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-yellow-500/50"
                />
              </div>

              <Button
                variant="secondary"
                size="lg"
                onClick={sendSync}
                className="w-full"
                disabled={syncSent}
              >
                <Zap className="w-5 h-5 text-yellow-500" />
                {syncSent ? "Sync enviado!" : "Enviar Sync"}
              </Button>
              <p className="text-xs text-zinc-600 text-center">
                Pressione quando acontecer um evento visivel (inicio do jogo, gol, etc)
              </p>

              {/* Sync event log */}
              {syncEvents.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <h4 className="text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Log de marcações
                  </h4>
                  {syncEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="flex items-center gap-2 bg-zinc-800/50 rounded-lg px-3 py-2 text-sm group"
                    >
                      {editingId === evt.id ? (
                        <>
                          <input
                            type="text"
                            defaultValue={evt.label}
                            onBlur={(e) =>
                              updateSyncEvent(evt.id, { label: e.target.value })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                updateSyncEvent(evt.id, {
                                  label: (e.target as HTMLInputElement).value,
                                });
                              }
                            }}
                            autoFocus
                            className="flex-1 bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-xs text-white focus:outline-none"
                          />
                          <input
                            type="text"
                            defaultValue={evt.matchMinute}
                            onBlur={(e) =>
                              updateSyncEvent(evt.id, {
                                matchMinute: e.target.value,
                              })
                            }
                            className="w-16 bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-xs text-white focus:outline-none"
                            placeholder="Min."
                          />
                        </>
                      ) : (
                        <>
                          <span className="text-yellow-500 font-medium text-xs min-w-[60px]">
                            {evt.label}
                          </span>
                          {evt.matchMinute && (
                            <span className="bg-zinc-700 text-zinc-300 text-[10px] px-1.5 py-0 rounded-full font-medium">
                              {evt.matchMinute}
                            </span>
                          )}
                          <span className="text-zinc-600 text-xs ml-auto font-mono">
                            {evt.streamTimestamp}
                          </span>
                          <button
                            onClick={() => setEditingId(evt.id)}
                            className="text-zinc-600 hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeSyncEvent(evt.id)}
                            className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* End stream */}
            <Button
              variant="danger"
              size="lg"
              onClick={endStream}
              className="w-full"
            >
              <Square className="w-5 h-5" />
              Encerrar transmissão
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
