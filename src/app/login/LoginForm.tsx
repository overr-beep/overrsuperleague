"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";

export function LoginForm() {
  const { session, loading } = useSupabaseSession();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!supabase) {
      setMessage("Brakuje zmiennych Supabase w .env.local.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setSubmitting(false);
    setMessage(
      error
        ? error.message
        : "Link logowania został wysłany. Sprawdź skrzynkę pocztową.",
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
        {submitting ? "Wysyłanie..." : "Wyślij link logowania"}
      </button>
      {message ? <p className="mt-4 text-sm text-slate-300">{message}</p> : null}
      {!loading && session ? (
        <p className="mt-4 text-sm text-emerald-200">
          Zalogowano jako {session.user.email}
        </p>
      ) : null}
    </form>
  );
}
