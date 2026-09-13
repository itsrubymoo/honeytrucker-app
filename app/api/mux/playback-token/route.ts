import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { signMuxPlaybackToken } from "@/lib/mux/signing";

// Given a content item, returns its playback ID plus (for member-tier items)
// a short-lived signed token. Free-tier items get the public playback ID
// straight back with no token. The authoritative tier/membership check
// happens here, server-side — never trust a client-supplied tier.
export async function POST(request: NextRequest) {
  const { contentItemId } = await request.json();
  if (!contentItemId) {
    return NextResponse.json({ error: "contentItemId is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: item } = await supabase
    .from("content_items")
    .select("id, tier, mux_playback_id, published")
    .eq("id", contentItemId)
    .returns<{ id: string; tier: string; mux_playback_id: string | null; published: boolean }[]>()
    .single();

  if (!item || !item.published || !item.mux_playback_id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (item.tier === "free") {
    return NextResponse.json({ playbackId: item.mux_playback_id, token: null });
  }

  const user = await getCurrentUser();
  if (!user?.isMember) {
    return NextResponse.json({ error: "Membership required" }, { status: 403 });
  }

  const token = await signMuxPlaybackToken(item.mux_playback_id, "video");
  return NextResponse.json({ playbackId: item.mux_playback_id, token });
}
