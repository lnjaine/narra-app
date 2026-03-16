import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Mic, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function NarratorsPage() {
  const supabase = await createClient();

  const { data: narrators } = await supabase
    .from("profiles")
    .select("*")
    .in("role", ["narrator", "both"])
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Narradores</h1>
      <p className="text-zinc-400 text-sm mb-8">
        Encontre seu narrador favorito e siga para não perder nenhum jogo.
      </p>

      {narrators && narrators.length > 0 ? (
        <div className="grid gap-3">
          {narrators.map((narrator) => (
            <Link
              key={narrator.id}
              href={`/narrators/${narrator.id}`}
              className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 hover:bg-zinc-900 transition-all"
            >
              {narrator.avatar_url ? (
                <img
                  src={narrator.avatar_url}
                  alt={narrator.name || ""}
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center">
                  <Mic className="w-6 h-6 text-zinc-600" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium">{narrator.name || "Narrador"}</p>
                {narrator.bio && (
                  <p className="text-sm text-zinc-400 line-clamp-1">
                    {narrator.bio}
                  </p>
                )}
              </div>
              {narrator.style && <Badge>{narrator.style}</Badge>}
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Mic className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500">Nenhum narrador cadastrado ainda.</p>
          <p className="text-zinc-600 text-sm mt-1">
            Quer narrar? Crie sua conta e comece a transmitir!
          </p>
        </div>
      )}
    </div>
  );
}
