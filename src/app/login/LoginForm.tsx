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
      <section className="mt-8 max-w-md rounded-lg border border-white/10 bg-white/[0.04] p-6">
        <h2 className="text-xl font-bold">You are logged in</h2>
        <p className="mt-3 break-words text-sm text-slate-300">
          Signed in as {session.user.email}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={nextPath}
            className="rounded-md bg-emerald-300 px-4 py-2 text-sm font-bold text-slate-950"
          >
            Continue
          </Link>
          <Link
            href="/logout"
            className="rounded-md border border-white/15 px-4 py-2 text-sm font-bold text-white"
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
      className="mt-8 max-w-md rounded-lg border border-white/10 bg-white/[0.04] p-6"
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
        className="mt-2 w-full rounded-md border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-300"
        placeholder="manager@example.com"
      />
      <button
        type="submit"
        disabled={submitting}
        className="mt-4 w-full rounded-md bg-emerald-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Sending..." : "Send login link"}
      </button>
      {message ? <p className="mt-4 text-sm text-slate-300">{message}</p> : null}
    </form>
  );
}
