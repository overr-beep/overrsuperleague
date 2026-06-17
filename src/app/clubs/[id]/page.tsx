import Link from "next/link";
import { notFound } from "next/navigation";
import { DataWarning, GameShell, MetricTile } from "@/components/GameShell";
import { getClubById, getClubs } from "@/services/clubs";
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
    return match.status.toUpperCase();
  }

  return `${match.home_score}:${match.away_score}`;
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
      <GameShell eyebrow="Club profile" title="Club details">
        <DataWarning message={clubResult.error ?? "Club not found."} />
      </GameShell>
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
    <GameShell
      eyebrow={`${club.short_name} - ${club.city ?? "Unknown city"}`}
      title={club.name}
      description={`Formation ${club.formation}. Reputation ${club.reputation}. Public scouting profile for league rivals.`}
      actions={
        <Link href="/dashboard" className="game-button-secondary">
          Back to dashboard
        </Link>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="Budget"
          value={formatMoney(Number(club.budget))}
          detail="Available club budget"
          tone="teal"
        />
        <MetricTile
          label="Squad value"
          value={formatMoney(squadValue)}
          detail="Total player value"
          tone="amber"
        />
        <MetricTile
          label="Weekly wages"
          value={formatMoney(wageBill)}
          detail="Current wage bill"
        />
        <MetricTile
          label="Squad level"
          value={playersResult.error ? "-" : String(averageOverall)}
          detail="Average overall"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="game-panel p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-black">Squad</h2>
            <span className="status-pill">{players.length} players</span>
          </div>
          {playersResult.error ? (
            <DataWarning message={playersResult.error} />
          ) : (
            <div className="overflow-x-auto">
              <table className="game-table min-w-[700px]">
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Pos.</th>
                    <th>Age</th>
                    <th>OVR</th>
                    <th>Value</th>
                    <th>Wage</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player: Player) => (
                    <tr key={player.id} className="text-slate-200">
                      <td className="font-semibold text-white">
                        {player.first_name} {player.last_name}
                      </td>
                      <td>{player.position}</td>
                      <td>{player.age}</td>
                      <td>
                        <span className="rating-badge">{player.overall}</span>
                      </td>
                      <td>{formatMoney(Number(player.value))}</td>
                      <td>{formatMoney(Number(player.wage))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="game-panel p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-black">Matches</h2>
            <span className="status-pill">{matches.length}</span>
          </div>
          {matchesResult.error ? (
            <DataWarning message={matchesResult.error} />
          ) : (
            <div className="grid gap-3">
              {matches.map((match) => (
                <article key={match.id} className="game-panel-soft px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold">{getMatchTitle(match, clubsById)}</p>
                    <span className="status-pill text-teal-200">
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
    </GameShell>
  );
}
