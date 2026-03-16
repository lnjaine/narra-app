import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { NarratorStudio } from "@/components/stream/narrator-studio";

export default async function StudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: stream } = await supabase
    .from("streams")
    .select("*, event:events(*)")
    .eq("id", id)
    .eq("narrator_id", user.id)
    .single();

  if (!stream) notFound();

  const roomName = `${stream.event_id}:${user.id}`;

  return (
    <NarratorStudio stream={stream} event={stream.event} roomName={roomName} />
  );
}
