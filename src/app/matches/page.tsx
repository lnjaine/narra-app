import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Calendar, MapPin, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

function EventCard({ event }: { event: Event }) {
  const statusVariant =
    event.status === "live"
      ? "live"
      : event.status === "finished"
        ? "ended"
        : "scheduled";
  const statusLabel =
    event.status === "live"
      ? "Ao Vivo"
      : event.status === "finished"
        ? "Encerrado"
        : "Agendado";

  return (
    <Link
      href={`/matches/${event.id}`}
      className="block bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 hover:bg-zinc-900 transition-all group"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-zinc-500">{event.league}</span>
        <Badge variant={statusVariant}>{statusLabel}</Badge>
      </div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 text-right">
          <p className="font-semibold text-lg group-hover:text-white transition-colors">
            {event.home_team}
          </p>
        </div>
        <div className="px-4">
          <span className="text-zinc-600 text-sm font-medium">vs</span>
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-lg group-hover:text-white transition-colors">
            {event.away_team}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(event.start_time)}
        </span>
        {event.status === "live" && (
          <span className="flex items-center gap-1 text-green-400">
            <Radio className="w-3 h-3" />
            Narradores ao vivo
          </span>
        )}
      </div>
    </Link>
  );
}

export default async function MatchesPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("start_time", { ascending: true });

  const liveEvents = events?.filter((e) => e.status === "live") ?? [];
  const upcomingEvents = events?.filter((e) => e.status === "scheduled") ?? [];
  const finishedEvents = events?.filter((e) => e.status === "finished") ?? [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Jogos</h1>

      {liveEvents.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-medium text-red-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Ao vivo agora
          </h2>
          <div className="space-y-3">
            {liveEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {upcomingEvents.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
            Proximos jogos
          </h2>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {finishedEvents.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">
            Encerrados
          </h2>
          <div className="space-y-3">
            {finishedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {(!events || events.length === 0) && (
        <div className="text-center py-20">
          <Calendar className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500">Nenhum jogo agendado ainda.</p>
          <p className="text-zinc-600 text-sm mt-1">
            Os jogos do Brasileirão aparecerão aqui.
          </p>
        </div>
      )}
    </div>
  );
}
