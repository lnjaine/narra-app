import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const updateData: Record<string, string | number | null> = {};
  if (body.status) updateData.status = body.status;
  if (body.title) updateData.title = body.title;
  if (body.listener_count !== undefined)
    updateData.listener_count = body.listener_count;
  if (body.peak_listeners !== undefined)
    updateData.peak_listeners = body.peak_listeners;
  if (body.sync_offset_ms !== undefined)
    updateData.sync_offset_ms = body.sync_offset_ms;
  if (body.status === "live") updateData.started_at = new Date().toISOString();
  if (body.status === "ended") updateData.ended_at = new Date().toISOString();

  const { data: stream, error } = await supabase
    .from("streams")
    .update(updateData)
    .eq("id", id)
    .eq("narrator_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(stream);
}
