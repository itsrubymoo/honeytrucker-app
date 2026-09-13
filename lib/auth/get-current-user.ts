import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { rethrowIfFrameworkError } from "@/lib/rethrow-framework-errors";
import type { Profile } from "@/lib/types/database";

export interface CurrentUser {
  id: string;
  email: string;
  profile: Profile | null;
  isMember: boolean;
  isAdmin: boolean;
}

// Single source of truth for "who is this and what can they see" — every
// gated server component / route handler should call this instead of
// re-deriving session/profile/membership state itself. `cache()` dedupes
// repeat calls within one request.
//
// This is called from the site header on every page, so it must never throw
// — before Supabase is configured (missing env vars) or during an outage,
// treat everyone as logged out rather than crashing the whole site.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .returns<Profile[]>()
      .single();

    const { data: isMemberResult } = await supabase.rpc("is_member", { uid: user.id }).single();

    return {
      id: user.id,
      email: user.email,
      profile: profile ?? null,
      isMember: Boolean(isMemberResult),
      isAdmin: profile?.role === "admin",
    };
  } catch (error) {
    rethrowIfFrameworkError(error);
    console.error("getCurrentUser failed:", error);
    return null;
  }
});
