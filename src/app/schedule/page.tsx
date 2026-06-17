import Link from "next/link";
import { DataWarning, GameShell } from "@/components/GameShell";
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
    return match.status.toUpperCase();
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
    <GameShell
      eyebrow="Match calendar"
      title="Schedule"
      description={`Current round: ${stateResult.currentRound}. Review fixtures, results and match reports.`}
      actions={
        <Link href="/league" className="game-button-secondary">
          League table
        </Link>
      }
    >
      {matchesResult.error ? (
        <DataWarning message={matchesResult.error} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {matchesResult.data.map((match) => (
            <article key={match.id} className="game-panel p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="game-kicker text-slate-400">
                    Round {match.round_number}
                  </p>
                  <h2 className="mt-2 text-2xl font-black">
                    {clubName(clubsById, match.home_club_id)} vs{" "}
                    {clubName(clubsById, match.away_club_id)}
                  </h2>
                </div>
                <span className="rounded-md bg-slate-950 px-4 py-3 text-lg font-black text-teal-200 ring-1 ring-white/10">
                  {score(match)}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-400">
                {formatDate(match.scheduled_at)}
              </p>
              {match.report ? (
                <pre className="mt-4 whitespace-pre-wrap rounded-md bg-slate-950/70 p-4 text-sm leading-6 text-slate-300 ring-1 ring-white/10">
                  {match.report}
                </pre>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </GameShell>
  );
}
