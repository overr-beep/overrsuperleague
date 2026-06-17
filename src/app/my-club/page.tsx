import Link from "next/link";
import { redirect } from "next/navigation";
import { DataWarning, GameShell, MetricTile } from "@/components/GameShell";
import { getCurrentUser } from "@/services/auth";
import { getClubByOwnerId } from "@/services/clubs";
import { getLineupByClubId } from "@/services/lineups";
import {
  getLeagueState,
  getMatchesByClubId,
  getNextMatchByClubId,
} from "@/services/matches";
import { getPlayersByClubId } from "@/services/players";
import type { Club, Match } from "@/types/database";
import { formatMoney } from "@/utils/formatMoney";
import {
  GenerateStarterSquadForm,
  LineupForm,
  ManageClubForm,
} from "./MyClubForms";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function matchLabel(match: Match, club: Club) {
  const home = match.home_club_id === club.id ? club.short_name : "Opponent";
  const away = match.away_club_id === club.id ? club.short_name : "Opponent";

  return `${home} vs ${away}`;
}

export default async function MyClubPage() {
  const { user } = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/my-club");
  }

  const { data: club, error: clubError } = await getClubByOwnerId(user.id);

  if (!club && !clubError) {
    redirect("/create-club");
  }

  if (!club) {
    return (
      <GameShell eyebrow="My club" title="Club unavailable">
        <DataWarning message={clubError ?? "Club not found."} />
      </GameShell>
    );
  }

  const [
    playersResult,
    matchesResult,
    lineupResult,
    leagueStateResult,
    nextMatchResult,
  ] = await Promise.all([
    getPlayersByClubId(club.id),
    getMatchesByClubId(club.id),
    getLineupByClubId(club.id),
    getLeagueState(),
    getNextMatchByClubId(club.id),
  ]);

  const players = playersResult.data;
  const matches = matchesResult.data;
  const nextMatch = nextMatchResult.data;
  const minutesToKickoff = nextMatch
    ? (new Date(nextMatch.scheduled_at).getTime() - Date.now()) / 60000
    : null;
  const isLineupLocked =
    minutesToKickoff !== null && minutesToKickoff > 0 && minutesToKickoff <= 30;
  const squadValue = players.reduce(
    (sum, player) => sum + Number(player.value),
    0,
  );
  const wageBill = players.reduce((sum, player) => sum + Number(player.wage), 0);

  return (
    <GameShell
      eyebrow="My club"
      title={club.name}
      description={`${club.short_name} - ${club.city ?? "No city set"} - Formation ${club.formation}`}
      actions={
        <Link href={`/clubs/${club.id}`} className="game-button-secondary">
          Public club page
        </Link>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="Budget"
          value={formatMoney(Number(club.budget))}
          detail="Available money"
          tone="teal"
        />
        <MetricTile label="Squad" value={String(players.length)} detail="Players" />
        <MetricTile
          label="Squad value"
          value={formatMoney(squadValue)}
          detail="Total market value"
          tone="amber"
        />
        <MetricTile
          label="Wages"
          value={formatMoney(wageBill)}
          detail="Weekly wage bill"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <section className="game-panel p-5">
          <h2 className="text-xl font-black">Club identity</h2>
          <p className="mt-2 text-sm text-slate-400">
            Manager-facing identity and public club metadata.
          </p>
          <div className="mt-5">
            <ManageClubForm name={club.name} city={club.city} />
          </div>
        </section>

        <section className="game-panel p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-black">Squad hub</h2>
            <span className="status-pill">{players.length} players</span>
          </div>

          {playersResult.error ? (
            <DataWarning message={playersResult.error} />
          ) : players.length === 0 ? (
            <div className="game-panel-soft p-5">
              <h3 className="text-lg font-black">Your club has no players</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Generate a balanced starter squad so the club is playable.
              </p>
              <GenerateStarterSquadForm />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="game-table min-w-[780px]">
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Pos.</th>
                    <th>OVR</th>
                    <th>ATK</th>
                    <th>DEF</th>
                    <th>Fitness</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player) => (
                    <tr key={player.id} className="text-slate-200">
                      <td className="font-semibold text-white">
                        {player.first_name} {player.last_name}
                      </td>
                      <td>{player.position}</td>
                      <td>
                        <span className="rating-badge">{player.overall}</span>
                      </td>
                      <td>{player.attack_rating}</td>
                      <td>{player.defense_rating}</td>
                      <td>{player.fitness}%</td>
                      <td>{formatMoney(Number(player.value))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <section className="game-panel mt-6 p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black">Tactics board</h2>
            <p className="mt-1 text-sm text-slate-400">
              Save exact formation slots and up to five substitutes.
            </p>
          </div>
          <span className="status-pill">
            {lineupResult.data.filter((item) => item.role === "starter").length}
            /11 selected
          </span>
        </div>
        {lineupResult.error ? (
          <DataWarning message={lineupResult.error} />
        ) : players.length < 11 ? (
          <DataWarning message="Your squad needs at least 11 players before saving a lineup." />
        ) : (
          <LineupForm
            players={players}
            lineup={lineupResult.data}
            formation={club.formation}
            currentRound={leagueStateResult.currentRound}
            isLocked={isLineupLocked}
          />
        )}
      </section>

      <section className="game-panel mt-6 p-5">
        <h2 className="text-xl font-black">Club matches</h2>
        {matchesResult.error ? (
          <div className="mt-4">
            <DataWarning message={matchesResult.error} />
          </div>
        ) : matches.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">
            No matches scheduled for your club yet.
          </p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {matches.map((match) => (
              <article key={match.id} className="game-panel-soft px-4 py-3">
                <p className="font-semibold">{matchLabel(match, club)}</p>
                <p className="mt-1 text-sm text-slate-400">
                  {formatDate(match.scheduled_at)} - {match.status}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </GameShell>
  );
}
