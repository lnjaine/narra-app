"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  streamId: string;
  streamTitle: string;
  variant?: "full" | "icon";
}

export function ShareButton({
  streamId,
  streamTitle,
  variant = "full",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const url = `${window.location.origin}/listen/${streamId}`;
    const text = `${streamTitle} - Ouça ao vivo no Narra!`;

    if (navigator.share) {
      try {
        await navigator.share({ title: streamTitle, text, url });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleShare}
        className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        title="Compartilhar"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Share2 className="w-4 h-4" />
        )}
      </button>
    );
  }

  return (
    <Button variant="secondary" onClick={handleShare} className="w-full">
      {copied ? (
        <>
          <Check className="w-5 h-5 text-green-500" />
          Link copiado!
        </>
      ) : (
        <>
          <Share2 className="w-5 h-5" />
          Compartilhar
        </>
      )}
    </Button>
  );
}
