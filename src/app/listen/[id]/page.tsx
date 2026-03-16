import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ListenerView } from "@/components/stream/listener-view";

export default async function ListenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: stream } = await supabase
    .from("streams")
    .select("*, narrator:profiles(*), event:events(*)")
    .eq("id", id)
    .single();

  if (!stream) notFound();

  const roomName = `${stream.event_id}:${stream.narrator_id}`;

  return (
    <ListenerView
      stream={stream}
      narrator={stream.narrator}
      event={stream.event}
      roomName={roomName}
    />
  );
}
