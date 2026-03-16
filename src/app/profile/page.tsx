"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mic, User, Save, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import type { Stream } from "@/types/database";

export default function ProfilePage() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [style, setStyle] = useState("");
  const [saving, setSaving] = useState(false);
  const [myStreams, setMyStreams] = useState<Stream[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    if (profile) {
      setName(profile.name || "");
      setBio(profile.bio || "");
      setStyle(profile.style || "");
    }
  }, [user, profile, loading, router]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("streams")
      .select("*")
      .eq("narrator_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data) setMyStreams(data);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase
      .from("profiles")
      .update({
        name: name.trim(),
        bio: bio.trim() || null,
        style: style.trim() || null,
        role: style.trim() ? "both" : profile?.role,
      })
      .eq("id", user.id);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!user || !profile) return null;

  const styles = ["funny", "technical", "fan", "coach"];

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Meu Perfil</h1>

      {/* Avatar */}
      <div className="text-center mb-8">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt=""
            className="w-20 h-20 rounded-full object-cover mx-auto mb-2"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-2">
            <User className="w-8 h-8 text-zinc-600" />
          </div>
        )}
        <p className="text-sm text-zinc-500">{profile.email}</p>
      </div>

      {/* Form */}
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Nome
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Conte sobre voce como narrador..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Estilo de narração
          </label>
          <div className="flex flex-wrap gap-2">
            {styles.map((s) => (
              <button
                key={s}
                onClick={() => setStyle(style === s ? "" : s)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  style === s
                    ? "bg-green-500/20 border-green-500/30 text-green-400"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                {s === "funny"
                  ? "Humorista"
                  : s === "technical"
                    ? "Técnico"
                    : s === "fan"
                      ? "Torcedor"
                      : "Treinador"}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          <Save className="w-4 h-4" />
          {saving ? "Salvando..." : "Salvar perfil"}
        </Button>
      </div>

      {/* My streams */}
      {myStreams.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-4">Minhas transmissões</h2>
          <div className="space-y-2">
            {myStreams.map((stream) => (
              <Link
                key={stream.id}
                href={
                  stream.status === "ended"
                    ? "#"
                    : `/studio/${stream.id}`
                }
                className="block bg-zinc-900/50 border border-zinc-800 rounded-xl p-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{stream.title}</p>
                  <Badge
                    variant={
                      stream.status === "live"
                        ? "live"
                        : stream.status === "ended"
                          ? "ended"
                          : "scheduled"
                    }
                  >
                    {stream.status === "live"
                      ? "Ao Vivo"
                      : stream.status === "ended"
                        ? "Encerrado"
                        : "Agendado"}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
