"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { TextInput, Field } from "@/components/ui/form";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4">
      <h1 className="mb-2 text-2xl font-serif text-stone-900">welcome back</h1>
      <p className="mb-6 text-sm text-stone-600">
        enter your email and we&apos;ll send you a link to sign in — no password needed.
      </p>
      <LoginForm />
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    const next = new URLSearchParams(window.location.search).get("next") ?? "/";
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setStatus(error ? "error" : "sent");
  }

  if (status === "sent") {
    return (
      <p className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">
        check your inbox for a sign-in link — it&apos;ll bring you right back here.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="email" htmlFor="email">
        <TextInput
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </Field>
      <Button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "sending…" : "send me a link"}
      </Button>
      {status === "error" ? (
        <p className="text-sm text-red-700">something went wrong — try again in a moment.</p>
      ) : null}
    </form>
  );
}
