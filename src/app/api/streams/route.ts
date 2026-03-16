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

  const { event_id, title } = await request.json();

  if (!event_id || !title) {
    return NextResponse.json(
      { error: "event_id and title are required" },
      { status: 400 }
    );
  }

  // Upsert the user role to narrator/both
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile && profile.role === "listener") {
    await supabase
      .from("profiles")
      .update({ role: "both" })
      .eq("id", user.id);
  }

  const { data: stream, error } = await supabase
    .from("streams")
    .insert({
      event_id,
      narrator_id: user.id,
      title,
      status: "scheduled",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(stream);
}
