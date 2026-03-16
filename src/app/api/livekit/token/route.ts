import { AccessToken } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { roomName, isNarrator } = await request.json();

  if (!roomName) {
    return NextResponse.json(
      { error: "roomName is required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "LiveKit not configured" },
      { status: 500 }
    );
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: user.id,
    name: user.user_metadata?.full_name || user.email || "Anonymous",
    ttl: "6h",
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: !!isNarrator,
    canSubscribe: true,
    canPublishData: true,
  });

  const token = await at.toJwt();
  return NextResponse.json({ token });
}
