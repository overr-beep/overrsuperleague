import Link from "next/link";
import { NavLink } from "@/components/NavLink";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#0f3d38,transparent_34%),linear-gradient(135deg,#07090f_0%,#101522_58%,#111827_100%)]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8">
        <nav className="flex items-center justify-between gap-4">
          <Link href="/" className="text-sm font-semibold uppercase tracking-wider text-emerald-200">
            Overr Super League
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/status">Status bazy</NavLink>
            <NavLink href="/login">Logowanie</NavLink>
          </div>
        </nav>

        <div className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-emerald-200">
              Private career mode for friends
            </p>
            <h1 className="max-w-3xl text-5xl font-black leading-tight text-white md:text-7xl">
              Overr Super League
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Techniczny fundament prywatnej ligi menedzerskiej dla 10-16
              znajomych: kluby, zawodnicy, mecze, transfery i Supabase gotowy
              do dalszego rozwoju.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="rounded-md bg-emerald-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-200"
              >
                Otwórz dashboard
              </Link>
              <Link
                href="/status"
                className="rounded-md border border-white/15 px-5 py-3 text-sm font-bold text-white transition hover:border-emerald-300/70"
              >
                Sprawdź bazę
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/40">
            <div className="grid grid-cols-2 gap-3">
              {["Season 01", "16 clubs", "Live market", "Match weeks"].map(
                (label) => (
                  <div
                    key={label}
                    className="rounded-md border border-white/10 bg-slate-950/55 p-5"
                  >
                    <div className="h-2 w-12 rounded bg-emerald-300" />
                    <p className="mt-5 text-xl font-bold text-white">{label}</p>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
