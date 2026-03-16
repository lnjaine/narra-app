"use client";

import { Headphones, Mic, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { StreamWithNarrator } from "@/types/database";

interface StreamListProps {
  streams: StreamWithNarrator[];
  eventId: string;
}

export function StreamList({ streams, eventId }: StreamListProps) {
  if (streams.length === 0) {
    return (
      <div className="text-center py-12 bg-zinc-900/30 border border-zinc-800 rounded-2xl">
        <Mic className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
        <p className="text-zinc-500">Nenhum narrador ao vivo ainda.</p>
        <p className="text-zinc-600 text-sm mt-1">
          Seja o primeiro a narrar esse jogo!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {streams.map((stream) => (
        <Link
          key={stream.id}
          href={`/listen/${stream.id}`}
          className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 hover:bg-zinc-900 transition-all group"
        >
          {/* Narrator avatar */}
          <div className="relative">
            {stream.narrator?.avatar_url ? (
              <img
                src={stream.narrator.avatar_url}
                alt={stream.narrator.name || ""}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                <Mic className="w-5 h-5 text-zinc-600" />
              </div>
            )}
            {stream.status === "live" && (
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full border-2 border-zinc-950" />
            )}
          </div>

          {/* Stream info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-medium truncate group-hover:text-white transition-colors">
                {stream.narrator?.name || "Narrador"}
              </p>
              {stream.narrator?.style && (
                <Badge>{stream.narrator.style}</Badge>
              )}
            </div>
            <p className="text-sm text-zinc-400 truncate">{stream.title}</p>
          </div>

          {/* Listener count + CTA */}
          <div className="flex items-center gap-3">
            {stream.listener_count > 0 && (
              <span className="flex items-center gap-1 text-sm text-zinc-500">
                <Users className="w-3.5 h-3.5" />
                {stream.listener_count}
              </span>
            )}
            <Badge variant={stream.status === "live" ? "live" : "scheduled"}>
              {stream.status === "live" ? "Ao Vivo" : "Em breve"}
            </Badge>
          </div>
        </Link>
      ))}
    </div>
  );
}
