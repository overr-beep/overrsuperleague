"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";

export function LoginForm({
  nextPath = "/dashboard",
  callbackError,
}: {
  nextPath?: string;
  callbackError?: string;
}) {
  const { session, loading } = useSupabaseSession();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(callbackError ?? null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!supabase) {
      setMessage("Supabase env variables are missing in .env.local.");
      return;
    }

    setSubmitting(true);
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", nextPath);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callbackUrl.toString(),
      },
    });

    setSubmitting(false);
    setMessage(error ? error.message : "Login link sent. Check your email inbox.");
  }

  if (!loading && session) {
    return (
      <section className="mt-6 game-panel-soft p-5">
        <h2 className="text-xl font-bold">You are logged in</h2>
        <p className="mt-3 break-words text-sm text-slate-300">
          Signed in as {session.user.email}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={nextPath}
            className="game-button-primary"
          >
            Continue
          </Link>
          <Link
            href="/logout"
            className="game-button-secondary"
          >
            Logout
          </Link>
        </div>
      </section>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6"
    >
      <label htmlFor="email" className="text-sm font-semibold text-slate-200">
        Email
      </label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        className="game-input mt-2"
        placeholder="manager@example.com"
      />
      <button
        type="submit"
        disabled={submitting}
        className="game-button-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Sending..." : "Send login link"}
      </button>
      {message ? <p className="mt-4 text-sm text-slate-300">{message}</p> : null}
    </form>
  );
}
