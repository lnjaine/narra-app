import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Calendar, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StreamList } from "@/components/stream/stream-list";
import { CreateStreamButton } from "@/components/stream/create-stream-button";

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (!event) notFound();

  const { data: streams } = await supabase
    .from("streams")
    .select("*, narrator:profiles(*)")
    .eq("event_id", id)
    .neq("status", "ended")
    .order("listener_count", { ascending: false });

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
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Event header */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-zinc-500">{event.league}</span>
          <Badge variant={statusVariant}>{statusLabel}</Badge>
        </div>
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-6">
            <span className="text-2xl font-bold">{event.home_team}</span>
            <span className="text-zinc-600 text-lg">vs</span>
            <span className="text-2xl font-bold">{event.away_team}</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 text-sm text-zinc-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatDate(event.start_time)}
          </span>
          {streams && streams.length > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {streams.length} narrador{streams.length > 1 ? "es" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Narrators streaming this match */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Narradores</h2>
        <CreateStreamButton eventId={event.id} eventTitle={event.title} />
      </div>

      <StreamList streams={streams ?? []} eventId={event.id} />
    </div>
  );
}
