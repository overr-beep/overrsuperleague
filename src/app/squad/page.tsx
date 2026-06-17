import Link from "next/link";
import { redirect } from "next/navigation";
import { DataWarning, GameShell } from "@/components/GameShell";
import { getCurrentUser } from "@/services/auth";
import { getClubByOwnerId } from "@/services/clubs";
import { getLineupByClubId } from "@/services/lineups";
import { getLeagueState, getNextMatchByClubId } from "@/services/matches";
import { getPlayersByClubId } from "@/services/players";
import { GenerateStarterSquadForm, LineupForm } from "../my-club/MyClubForms";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function SquadPage() {
  const { user } = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/squad");
  }

  const { data: club, error: clubError } = await getClubByOwnerId(user.id);

  if (!club && !clubError) {
    redirect("/create-club");
  }

  if (!club) {
    return (
      <GameShell eyebrow="Squad" title="Squad unavailable">
        <DataWarning message={clubError ?? "Club not found."} />
      </GameShell>
    );
  }

  const [playersResult, lineupResult, leagueStateResult, nextMatchResult] =
    await Promise.all([
      getPlayersByClubId(club.id),
      getLineupByClubId(club.id),
      getLeagueState(),
      getNextMatchByClubId(club.id),
    ]);

  const players = playersResult.data;
  const nextMatch = nextMatchResult.data;
  const startersCount = lineupResult.data.filter(
    (item) => item.role === "starter",
  ).length;
  const benchCount = lineupResult.data.filter(
    (item) => item.role === "bench",
  ).length;
  const minutesToKickoff = nextMatch
    ? (new Date(nextMatch.scheduled_at).getTime() - Date.now()) / 60000
    : null;
  const isLineupLocked =
    minutesToKickoff !== null && minutesToKickoff > 0 && minutesToKickoff <= 30;
  const averageOverall =
    players.length > 0
      ? Math.round(
          players.reduce((sum, player) => sum + player.overall, 0) /
            players.length,
        )
      : 0;

  return (
    <GameShell
      eyebrow="Squad management"
      title={`${club.short_name} Squad`}
      description={`${club.formation} - ${startersCount}/11 starters - bench ${benchCount}/5 - squad OVR ${averageOverall || "-"}`}
      actions={
        <>
          <Link href="/my-club" className="game-button-secondary">
            My club
          </Link>
          <Link href="/transfers" className="game-button-secondary">
            Transfers
          </Link>
        </>
      }
    >
      {nextMatch ? (
        <section className="game-panel mb-4 flex flex-wrap items-center justify-between gap-4 p-4">
          <div>
            <p className="game-kicker">Next fixture</p>
            <h2 className="mt-1 text-xl font-black">
              {formatDate(nextMatch.scheduled_at)}
            </h2>
          </div>
          <span className={isLineupLocked ? "status-pill text-amber-200" : "status-pill"}>
            {isLineupLocked ? "Lineup locked" : "Lineup open"}
          </span>
        </section>
      ) : null}

      <section className="game-panel p-4">
        {playersResult.error ? (
          <DataWarning message={playersResult.error} />
        ) : players.length === 0 ? (
          <div className="game-panel-soft p-5">
            <h2 className="text-xl font-black">Your club has no players</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Generate a balanced starter squad so the club is playable.
            </p>
            <GenerateStarterSquadForm />
          </div>
        ) : lineupResult.error ? (
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
    </GameShell>
  );
}
