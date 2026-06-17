import Link from "next/link";
import { AuthNav } from "@/components/AuthNav";
import { NavLink } from "@/components/NavLink";

export default function Home() {
  return (
    <main className="game-bg min-h-screen overflow-hidden text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-7">
        <nav className="flex items-center justify-between gap-4">
          <Link href="/" className="block">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-teal-200">
              Overr
            </p>
            <p className="mt-1 text-xl font-black leading-none text-white">
              Super League
            </p>
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/status">Database</NavLink>
            <AuthNav />
          </div>
        </nav>

        <div className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[0.92fr_1.08fr]">
          <div>
            <p className="game-kicker">Private career mode for friends</p>
            <h1 className="game-title mt-4">Overr Super League</h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300">
              A multiplayer football manager base for clubs, tactics, transfers,
              league rounds and Supabase-powered accounts.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dashboard" className="game-button-primary">
                Enter league HQ
              </Link>
              <Link href="/my-club" className="game-button-secondary">
                Manage my club
              </Link>
            </div>

            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {[
                ["Mode", "Manager"],
                ["Clubs", "10-16"],
                ["Matchday", "20:00"],
              ].map(([label, value]) => (
                <div key={label} className="game-panel-soft p-4">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                    {label}
                  </p>
                  <p className="mt-2 text-xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pitch-card p-6">
            <div className="relative z-10 grid h-full min-h-[340px] content-between">
              <div className="flex items-start justify-between gap-4">
                <div className="rounded-md bg-slate-950/80 p-4 ring-1 ring-white/10">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-200">
                    Match Centre
                  </p>
                  <p className="mt-2 text-3xl font-black">Season 01</p>
                </div>
                <div className="rounded-md bg-amber-300 px-3 py-2 text-sm font-black text-slate-950">
                  LIVE HUB
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {["Tactics", "Market", "Fixtures"].map((label) => (
                  <div
                    key={label}
                    className="rounded-md bg-slate-950/82 p-4 ring-1 ring-white/10"
                  >
                    <p className="text-sm font-black text-white">{label}</p>
                    <div className="mt-3 h-1.5 rounded bg-teal-300" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
