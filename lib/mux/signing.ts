import Mux from "@mux/mux-node";

const mux = new Mux();

type TokenType = "video" | "thumbnail" | "storyboard";

// Signs a short-lived Mux playback token for a signed-policy playback ID.
// Free-tier content stays on public playback IDs and never calls this.
export function signMuxPlaybackToken(
  playbackId: string,
  type: TokenType = "video",
  expiration = "6h"
) {
  const keyId = process.env.MUX_SIGNING_KEY_ID;
  const keySecret = process.env.MUX_SIGNING_KEY_PRIVATE;
  if (!keyId || !keySecret) {
    throw new Error("Mux signing key env vars are not configured.");
  }

  return mux.jwt.signPlaybackId(playbackId, { keyId, keySecret, type, expiration });
}
