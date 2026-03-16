"use client";

import { useState, useEffect } from "react";
import { UserPlus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";

export function FollowButton({ narratorId }: { narratorId: string }) {
  const { user, signInWithGoogle } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const checkFollow = async () => {
      const { data } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("follower_id", user.id)
        .eq("narrator_id", narratorId)
        .single();
      setIsFollowing(!!data);
      setLoading(false);
    };

    checkFollow();
  }, [user, narratorId]);

  const handleFollow = async () => {
    if (!user) {
      signInWithGoogle();
      return;
    }

    setLoading(true);
    if (isFollowing) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("narrator_id", narratorId);
      setIsFollowing(false);
    } else {
      await supabase
        .from("follows")
        .insert({ follower_id: user.id, narrator_id: narratorId });
      setIsFollowing(true);
    }
    setLoading(false);
  };

  return (
    <Button
      variant={isFollowing ? "secondary" : "primary"}
      onClick={handleFollow}
      disabled={loading}
    >
      {isFollowing ? (
        <>
          <UserCheck className="w-4 h-4" />
          Seguindo
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          Seguir
        </>
      )}
    </Button>
  );
}
