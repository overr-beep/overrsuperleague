import Link from "next/link";
import { AuthNav } from "@/components/AuthNav";
import { getLeagueTable } from "@/services/clubs";

export const dynamic = "force-dynamic";

export default async function LeaguePage() {
  const tableResult = await getLeagueTable();
  const clubs = tableResult.data;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <section className="mx-auto max-w-7xl">
        <nav className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="text-sm font-bold uppercase tracking-wider text-emerald-200"
          >
            Overr Super League
          </Link>
          <AuthNav />
        </nav>

        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-200">
              League table
            </p>
            <h1 className="mt-2 text-4xl font-black">Standings</h1>
          </div>
          <Link
            href="/schedule"
            className="rounded-md border border-white/15 px-4 py-2 text-sm font-bold text-white transition hover:border-emerald-300/70"
          >
            Schedule
          </Link>
        </div>

        {tableResult.error ? (
          <p className="rounded-md border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            {tableResult.error}
          </p>
        ) : (
          <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-separate border-spacing-0 text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="border-b border-white/10 pb-3">#</th>
                    <th className="border-b border-white/10 pb-3">Club</th>
                    <th className="border-b border-white/10 pb-3">P</th>
                    <th className="border-b border-white/10 pb-3">W</th>
                    <th className="border-b border-white/10 pb-3">D</th>
                    <th className="border-b border-white/10 pb-3">L</th>
                    <th className="border-b border-white/10 pb-3">GF</th>
                    <th className="border-b border-white/10 pb-3">GA</th>
                    <th className="border-b border-white/10 pb-3">GD</th>
                    <th className="border-b border-white/10 pb-3">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {clubs.map((club, index) => (
                    <tr key={club.id} className="text-slate-200">
                      <td className="border-b border-white/5 py-3">
                        {index + 1}
                      </td>
                      <td className="border-b border-white/5 py-3 font-semibold text-white">
                        <Link
                          href={`/clubs/${club.id}`}
                          className="transition hover:text-emerald-200"
                        >
                          {club.name}
                          <span className="ml-2 text-xs text-emerald-200">
                            {club.short_name}
                          </span>
                        </Link>
                      </td>
                      <td className="border-b border-white/5 py-3">
                        {club.wins + club.draws + club.losses}
                      </td>
                      <td className="border-b border-white/5 py-3">{club.wins}</td>
                      <td className="border-b border-white/5 py-3">{club.draws}</td>
                      <td className="border-b border-white/5 py-3">{club.losses}</td>
                      <td className="border-b border-white/5 py-3">
                        {club.goals_for}
                      </td>
                      <td className="border-b border-white/5 py-3">
                        {club.goals_against}
                      </td>
                      <td className="border-b border-white/5 py-3">
                        {club.goals_for - club.goals_against}
                      </td>
                      <td className="border-b border-white/5 py-3 font-black text-emerald-200">
                        {club.league_points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
