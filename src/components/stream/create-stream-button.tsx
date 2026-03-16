"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/use-auth";

interface CreateStreamButtonProps {
  eventId: string;
  eventTitle: string;
}

export function CreateStreamButton({
  eventId,
  eventTitle,
}: CreateStreamButtonProps) {
  const { user, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");

  const handleCreate = async () => {
    if (!user) {
      signInWithGoogle();
      return;
    }

    if (!showForm) {
      setShowForm(true);
      return;
    }

    const finalTitle = title.trim() || `Narração do ${eventTitle}`;

    setIsCreating(true);
    try {
      const res = await fetch("/api/streams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId, title: finalTitle }),
      });
      const stream = await res.json();
      console.log("Stream response:", stream);
      if (stream.id) {
        router.push(`/studio/${stream.id}`);
      } else {
        alert(`Erro ao criar: ${stream.error || "Tente novamente"}`);
      }
    } catch (err) {
      console.error("Create stream error:", err);
      alert("Erro de conexão. Tente novamente.");
    } finally {
      setIsCreating(false);
    }
  };

  if (showForm) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`Narração do ${eventTitle}`}
          className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 w-64"
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          autoFocus
        />
        <Button size="sm" onClick={handleCreate} disabled={isCreating}>
          <Mic className="w-4 h-4" />
          {isCreating ? "Criando..." : "Criar"}
        </Button>
      </div>
    );
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleCreate}>
      <Mic className="w-4 h-4" />
      Narrar este jogo
    </Button>
  );
}
