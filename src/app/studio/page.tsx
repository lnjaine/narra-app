import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, Mic, Radio, Headphones } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CreateStreamButton } from "@/components/stream/create-stream-button";
import type { Event } from "@/types/database";

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function StudioPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch user's active streams with event data
  const { data: myStreams } = await supabase
    .from("streams")
    .select("*, event:events(*)")
    .eq("narrator_id", user.id)
    .neq("status", "ended")
    .order("created_at", { ascending: false });

  // Fetch upcoming and live events
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .in("status", ["live", "scheduled"])
    .order("start_time", { ascending: true });

  const liveEvents = events?.filter((e) => e.status === "live") ?? [];
  const upcomingEvents = events?.filter((e) => e.status === "scheduled") ?? [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
        <Mic className="w-6 h-6" />
        Studio
      </h1>

      {/* My active streams */}
      {myStreams && myStreams.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-medium text-green-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Headphones className="w-4 h-4" />
            Suas narrações
          </h2>
          <div className="space-y-3">
            {myStreams.map((stream) => {
              const event = stream.event as Event;
              const statusVariant =
                stream.status === "live" ? "live" : "scheduled";
              const statusLabel =
                stream.status === "live" ? "Ao Vivo" : "Agendado";

              return (
                <Link
                  key={stream.id}
                  href={`/studio/${stream.id}`}
                  className="block bg-zinc-900/50 border border-green-900/30 rounded-2xl p-5 hover:border-green-700/50 hover:bg-zinc-900 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                      {stream.title}
                    </span>
                    <Badge variant={statusVariant}>{statusLabel}</Badge>
                  </div>
                  {event && (
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <span>{event.league}</span>
                      <span>
                        {event.home_team} vs {event.away_team}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(event.start_time)}
                      </span>
                    </div>
                  )}
                  {stream.status === "live" && (
                    <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
                      <Radio className="w-3 h-3" />
                      {stream.listener_count} ouvinte
                      {stream.listener_count !== 1 ? "s" : ""}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Pick a match to narrate */}
      <section>
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
          Escolha um jogo para narrar
        </h2>

        {liveEvents.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Ao vivo agora
            </h3>
            <div className="space-y-3">
              {liveEvents.map((event) => (
                <MatchCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {upcomingEvents.length > 0 && (
          <div className="space-y-3">
            {liveEvents.length > 0 && (
              <h3 className="text-xs text-zinc-500 uppercase tracking-wider mb-3">
                Proximos jogos
              </h3>
            )}
            {upcomingEvents.map((event) => (
              <MatchCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {liveEvents.length === 0 && upcomingEvents.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500">Nenhum jogo disponivel no momento.</p>
            <p className="text-zinc-600 text-sm mt-1">
              Novos jogos aparecerão aqui quando forem agendados.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function MatchCard({ event }: { event: Event }) {
  const statusVariant = event.status === "live" ? "live" : "scheduled";
  const statusLabel = event.status === "live" ? "Ao Vivo" : "Agendado";

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-zinc-500">{event.league}</span>
        <Badge variant={statusVariant}>{statusLabel}</Badge>
      </div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 text-right">
          <p className="font-semibold text-lg">{event.home_team}</p>
        </div>
        <div className="px-4">
          <span className="text-zinc-600 text-sm font-medium">vs</span>
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-lg">{event.away_team}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs text-zinc-500">
          <Calendar className="w-3 h-3" />
          {formatDate(event.start_time)}
        </span>
        <CreateStreamButton eventId={event.id} eventTitle={event.title} />
      </div>
    </div>
  );
}
