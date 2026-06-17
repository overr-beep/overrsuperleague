import Link from "next/link";
import { AuthNav } from "@/components/AuthNav";
import { getClubs } from "@/services/clubs";
import { getLeagueState, getMatches } from "@/services/matches";
import type { Club, Match } from "@/types/database";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function clubName(clubs: Map<string, Club>, id: string) {
  return clubs.get(id)?.short_name ?? "TBD";
}

function score(match: Match) {
  if (match.home_score === null || match.away_score === null) {
    return match.status;
  }

  return `${match.home_score}:${match.away_score}`;
}

export default async function SchedulePage() {
  const [matchesResult, clubsResult, stateResult] = await Promise.all([
    getMatches(),
    getClubs(),
    getLeagueState(),
  ]);
  const clubsById = new Map(clubsResult.data.map((club) => [club.id, club]));

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
              Match calendar
            </p>
            <h1 className="mt-2 text-4xl font-black">Schedule</h1>
            <p className="mt-2 text-sm text-slate-400">
              Current round: {stateResult.currentRound}
            </p>
          </div>
          <Link
            href="/league"
            className="rounded-md border border-white/15 px-4 py-2 text-sm font-bold text-white transition hover:border-emerald-300/70"
          >
            League table
          </Link>
        </div>

        {matchesResult.error ? (
          <p className="rounded-md border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            {matchesResult.error}
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {matchesResult.data.map((match) => (
              <article
                key={match.id}
                className="rounded-lg border border-white/10 bg-white/[0.04] p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Round {match.round_number}
                    </p>
                    <h2 className="mt-2 text-xl font-bold">
                      {clubName(clubsById, match.home_club_id)} vs{" "}
                      {clubName(clubsById, match.away_club_id)}
                    </h2>
                  </div>
                  <span className="rounded-md border border-white/10 px-3 py-2 text-sm font-black text-emerald-200">
                    {score(match)}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-400">
                  {formatDate(match.scheduled_at)}
                </p>
                {match.report ? (
                  <p className="mt-4 rounded-md bg-slate-950/55 p-4 text-sm leading-6 text-slate-300">
                    {match.report}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
