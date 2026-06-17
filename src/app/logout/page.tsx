"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LogoutPage() {
  const [message, setMessage] = useState("Wylogowywanie...");

  useEffect(() => {
    if (!supabase) {
      setMessage("Brakuje konfiguracji Supabase.");
      return;
    }

    supabase.auth.signOut().then(({ error }) => {
      setMessage(error ? error.message : "Wylogowano.");
    });
  }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-6 text-white">
      <section className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
        <h1 className="text-2xl font-black">Logout</h1>
        <p className="mt-3 text-slate-300">{message}</p>
        <Link
          href="/"
          className="mt-5 inline-flex rounded-md bg-emerald-300 px-4 py-2 text-sm font-bold text-slate-950"
        >
          Wróć
        </Link>
      </section>
    </main>
  );
}
