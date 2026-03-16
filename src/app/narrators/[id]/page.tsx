import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Mic, Calendar, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FollowButton } from "@/components/narrator/follow-button";
import Link from "next/link";

export default async function NarratorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: narrator } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!narrator) notFound();

  const { data: streams } = await supabase
    .from("streams")
    .select("*, event:events(*)")
    .eq("narrator_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  const { count: followerCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("narrator_id", id);

  const liveStreams = streams?.filter((s) => s.status === "live") ?? [];
  const pastStreams = streams?.filter((s) => s.status === "ended") ?? [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="text-center mb-8">
        {narrator.avatar_url ? (
          <img
            src={narrator.avatar_url}
            alt={narrator.name || ""}
            className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
            <Mic className="w-10 h-10 text-zinc-600" />
          </div>
        )}
        <h1 className="text-2xl font-bold">{narrator.name || "Narrador"}</h1>
        <div className="flex items-center justify-center gap-3 mt-2">
          {narrator.style && <Badge>{narrator.style}</Badge>}
          <span className="text-sm text-zinc-500 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {followerCount || 0} seguidores
          </span>
        </div>
        {narrator.bio && (
          <p className="text-zinc-400 mt-4 max-w-md mx-auto">{narrator.bio}</p>
        )}
        <div className="mt-4">
          <FollowButton narratorId={id} />
        </div>
      </div>

      {/* Live streams */}
      {liveStreams.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-medium text-red-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Ao vivo agora
          </h2>
          <div className="space-y-3">
            {liveStreams.map((stream) => (
              <Link
                key={stream.id}
                href={`/listen/${stream.id}`}
                className="block bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{stream.title}</p>
                    <p className="text-sm text-zinc-500">
                      {stream.event?.home_team} vs {stream.event?.away_team}
                    </p>
                  </div>
                  <Badge variant="live">Ao Vivo</Badge>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Past streams */}
      {pastStreams.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
            Transmissões anteriores
          </h2>
          <div className="space-y-2">
            {pastStreams.map((stream) => (
              <div
                key={stream.id}
                className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-300">
                    {stream.title}
                  </p>
                  <p className="text-xs text-zinc-600">
                    {stream.event?.title} &middot; Pico: {stream.peak_listeners}{" "}
                    ouvintes
                  </p>
                </div>
                <Badge variant="ended">Encerrado</Badge>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
