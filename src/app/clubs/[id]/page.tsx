import Link from "next/link";
import { notFound } from "next/navigation";
import { getClubs, getClubById } from "@/services/clubs";
import { getMatchesByClubId } from "@/services/matches";
import { getPlayersByClubId } from "@/services/players";
import type { Club, Match, Player } from "@/types/database";
import { formatMoney } from "@/utils/formatMoney";

export const dynamic = "force-dynamic";

type ClubPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getClubShortName(clubsById: Map<string, Club>, clubId: string) {
  return clubsById.get(clubId)?.short_name ?? "TBD";
}

function getMatchTitle(match: Match, clubsById: Map<string, Club>) {
  const home = getClubShortName(clubsById, match.home_club_id);
  const away = getClubShortName(clubsById, match.away_club_id);

  return `${home} vs ${away}`;
}

function getMatchScore(match: Match) {
  if (match.home_score === null || match.away_score === null) {
    return match.status;
  }

  return `${match.home_score}:${match.away_score}`;
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-3xl font-black">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{detail}</p>
    </section>
  );
}

function DataWarning({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
      {message}
    </div>
  );
}

export default async function ClubPage({ params }: ClubPageProps) {
  const { id } = await params;
  const [clubResult, clubsResult, playersResult, matchesResult] =
    await Promise.all([
      getClubById(id),
      getClubs(),
      getPlayersByClubId(id),
      getMatchesByClubId(id),
    ]);

  if (!clubResult.data && !clubResult.error) {
    notFound();
  }

  if (!clubResult.data) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
        <section className="mx-auto max-w-4xl">
          <Link href="/dashboard" className="text-sm font-bold text-emerald-200">
            Back to dashboard
          </Link>
          <h1 className="mt-4 text-4xl font-black">Club details</h1>
          <div className="mt-6">
            <DataWarning message={clubResult.error ?? "Club not found."} />
          </div>
        </section>
      </main>
    );
  }

  const club = clubResult.data;
  const players = playersResult.data;
  const matches = matchesResult.data;
  const clubsById = new Map(clubsResult.data.map((item) => [item.id, item]));
  const squadValue = players.reduce(
    (sum, player) => sum + Number(player.value),
    0,
  );
  const wageBill = players.reduce((sum, player) => sum + Number(player.wage), 0);
  const averageOverall =
    players.length > 0
      ? Math.round(
          players.reduce((sum, player) => sum + player.overall, 0) /
            players.length,
        )
      : 0;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link
              href="/dashboard"
              className="text-sm font-bold text-emerald-200 transition hover:text-emerald-100"
            >
              Back to dashboard
            </Link>
            <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-emerald-200">
              {club.short_name} · {club.city ?? "Unknown city"}
            </p>
            <h1 className="mt-2 text-5xl font-black">{club.name}</h1>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] px-5 py-4 text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Reputation
            </p>
            <p className="mt-1 text-3xl font-black text-emerald-200">
              {club.reputation}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Budget"
            value={formatMoney(Number(club.budget))}
            detail="Available club budget"
          />
          <StatCard
            label="Squad value"
            value={formatMoney(squadValue)}
            detail="Total player value"
          />
          <StatCard
            label="Weekly wages"
            value={formatMoney(wageBill)}
            detail="Current wage bill"
          />
          <StatCard
            label="Squad level"
            value={playersResult.error ? "-" : String(averageOverall)}
            detail="Average overall"
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold">Squad</h2>
              <span className="text-sm text-slate-400">
                {players.length} players
              </span>
            </div>
            {playersResult.error ? (
              <DataWarning message={playersResult.error} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] border-separate border-spacing-0 text-left text-sm">
                  <thead className="text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="border-b border-white/10 pb-3">Player</th>
                      <th className="border-b border-white/10 pb-3">Pos.</th>
                      <th className="border-b border-white/10 pb-3">Age</th>
                      <th className="border-b border-white/10 pb-3">OVR</th>
                      <th className="border-b border-white/10 pb-3">Value</th>
                      <th className="border-b border-white/10 pb-3">Wage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player: Player) => (
                      <tr key={player.id} className="text-slate-200">
                        <td className="border-b border-white/5 py-3 font-semibold text-white">
                          {player.first_name} {player.last_name}
                        </td>
                        <td className="border-b border-white/5 py-3">
                          {player.position}
                        </td>
                        <td className="border-b border-white/5 py-3">
                          {player.age}
                        </td>
                        <td className="border-b border-white/5 py-3">
                          <span className="rounded-md bg-emerald-300 px-2 py-1 text-xs font-black text-slate-950">
                            {player.overall}
                          </span>
                        </td>
                        <td className="border-b border-white/5 py-3">
                          {formatMoney(Number(player.value))}
                        </td>
                        <td className="border-b border-white/5 py-3">
                          {formatMoney(Number(player.wage))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold">Matches</h2>
              <span className="text-sm text-slate-400">{matches.length}</span>
            </div>
            {matchesResult.error ? (
              <DataWarning message={matchesResult.error} />
            ) : (
              <div className="grid gap-3">
                {matches.map((match) => (
                  <article
                    key={match.id}
                    className="rounded-md border border-white/10 bg-slate-950/55 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold">
                        {getMatchTitle(match, clubsById)}
                      </p>
                      <span className="rounded-md border border-white/10 px-2 py-1 text-sm font-bold text-emerald-200">
                        {getMatchScore(match)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">
                      {formatDate(match.scheduled_at)}
                    </p>
                  </article>
                ))}
                {matches.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    No matches found for this club.
                  </p>
                ) : null}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
