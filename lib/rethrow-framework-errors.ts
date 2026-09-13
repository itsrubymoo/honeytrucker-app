// Next.js signals control flow (redirect(), notFound(), "this route needs
// dynamic rendering") by throwing an error with a `.digest` property. Any
// try/catch around Supabase calls must rethrow these instead of swallowing
// them as if the database call itself failed.
export function rethrowIfFrameworkError(error: unknown): void {
  if (error && typeof error === "object" && "digest" in error) throw error;
}
