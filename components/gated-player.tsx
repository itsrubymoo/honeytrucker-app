"use client";

import { useEffect, useState } from "react";
import MuxPlayer from "@mux/mux-player-react";

export function GatedPlayer({ contentItemId, poster }: { contentItemId: string; poster?: string }) {
  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "denied" }
    | { status: "ready"; playbackId: string; token: string | null }
  >({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/mux/playback-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentItemId }),
    })
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          setState({ status: "denied" });
          return;
        }
        const data = await res.json();
        setState({ status: "ready", playbackId: data.playbackId, token: data.token });
      })
      .catch(() => !cancelled && setState({ status: "denied" }));

    return () => {
      cancelled = true;
    };
  }, [contentItemId]);

  if (state.status === "loading") {
    return <div className="aspect-video w-full animate-pulse rounded-lg bg-stone-200" />;
  }

  if (state.status === "denied") {
    return (
      <p className="rounded-lg bg-stone-100 px-4 py-6 text-center text-sm text-stone-600">
        couldn&apos;t load this — try refreshing, or check you&apos;re signed in.
      </p>
    );
  }

  return (
    <MuxPlayer
      playbackId={state.playbackId}
      tokens={state.token ? { playback: state.token } : undefined}
      poster={poster}
      streamType="on-demand"
      className="w-full rounded-lg"
      accentColor="#92400e"
    />
  );
}
