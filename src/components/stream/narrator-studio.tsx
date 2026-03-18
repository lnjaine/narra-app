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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { YouTubeEmbed } from "@/components/stream/youtube-embed";
import { ShareButton } from "@/components/stream/share-button";
import { useAuth } from "@/lib/hooks/use-auth";
import type { Stream, Event } from "@/types/database";

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
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();
  const listenerCount = Math.max(participants.length - 1, 0);
  const [micEnabled, setMicEnabled] = useState(true);
  const [peakListeners, setPeakListeners] = useState(stream.peak_listeners);
  const [syncSent, setSyncSent] = useState(false);
  const [hasYouTube, setHasYouTube] = useState(false);
  const startTimeRef = useRef<Date | null>(
    stream.started_at ? new Date(stream.started_at) : null
  );
  const [elapsed, setElapsed] = useState("00:00");

  // Track peak listeners
  useEffect(() => {
    if (listenerCount > peakListeners) {
      setPeakListeners(listenerCount);
    }
  }, [listenerCount, peakListeners]);

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
      await localParticipant.setMicrophoneEnabled(!micEnabled);
      setMicEnabled(!micEnabled);
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
  }, [sendData]);

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
                  micEnabled
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                {micEnabled ? (
                  <Mic className="w-8 h-8" />
                ) : (
                  <MicOff className="w-8 h-8" />
                )}
              </button>
            </div>
            <p className="text-center text-sm text-zinc-500">
              {micEnabled ? "Microfone ligado" : "Microfone mutado"}
            </p>

            {/* Sync button */}
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
              Pressione quando acontecer um evento visivel (inicio do jogo, gol,
              etc)
            </p>

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
