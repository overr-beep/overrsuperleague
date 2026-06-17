import Link from "next/link";
import { redirect } from "next/navigation";
import { DataWarning, GameShell, MetricTile } from "@/components/GameShell";
import { getCurrentUser } from "@/services/auth";
import { getClubByOwnerId, getClubs } from "@/services/clubs";
import { getMatches } from "@/services/matches";
import { getNewsFeed } from "@/services/news";
import { getPlayers } from "@/services/players";
import { getProfilesByIds } from "@/services/profiles";
import type { Club, Match, NewsFeedItem, Player, Profile } from "@/types/database";
import { formatMoney } from "@/utils/formatMoney";

export const dynamic = "force-dynamic";

function getClubName(clubsById: Map<string, Club>, clubId: string | null) {
  return clubId ? clubsById.get(clubId)?.short_name ?? "Unknown" : "Free agent";
}

function getMatchLabel(match: Match, clubsById: Map<string, Club>) {
  const home = clubsById.get(match.home_club_id)?.short_name ?? "TBD";
  const away = clubsById.get(match.away_club_id)?.short_name ?? "TBD";

  return `${home} vs ${away}`;
}

function formatMatchDate(value: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatCountdown(value: string) {
  const diffMs = new Date(value).getTime() - Date.now();

  if (diffMs <= 0) {
    return "kickoff soon";
  }

  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

export default async function DashboardPage() {
  const { user } = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const { data: managerClub } = await getClubByOwnerId(user.id);

  if (!managerClub) {
    redirect("/create-club");
  }

  const [clubsResult, playersResult, matchesResult, newsResult] =
    await Promise.all([getClubs(), getPlayers(), getMatches(), getNewsFeed(8)]);

  const clubs = clubsResult.data;
  const players = playersResult.data;
  const matches = matchesResult.data;
  const news = newsResult.data;
  const profilesResult = await getProfilesByIds(
    clubs
      .map((club) => club.owner_id)
      .filter((ownerId): ownerId is string => ownerId !== null),
  );
  const clubsById = new Map(clubs.map((club) => [club.id, club]));
  const profilesById = new Map(
    profilesResult.data.map((profile: Profile) => [profile.id, profile]),
  );
  const sortedClubs = [...clubs].sort((a, b) => b.reputation - a.reputation);
  const topPlayers = players.slice(0, 8);
  const upcomingMatches = matches
    .filter((match) => match.status !== "played")
    .slice(0, 6);
  const totalBudget = clubs.reduce((sum, club) => sum + Number(club.budget), 0);
  const totalSquadValue = players.reduce(
    (sum, player) => sum + Number(player.value),
    0,
  );
  const nextOwnMatch =
    matches.find(
      (match) =>
        match.status === "scheduled" &&
        (match.home_club_id === managerClub.id ||
          match.away_club_id === managerClub.id) &&
        new Date(match.scheduled_at).getTime() >= Date.now(),
    ) ?? null;
  const opponentId =
    nextOwnMatch?.home_club_id === managerClub.id
      ? nextOwnMatch.away_club_id
      : nextOwnMatch?.home_club_id;
  const opponent = opponentId ? clubsById.get(opponentId) ?? null : null;
  const opponentManager = opponent?.owner_id
    ? profilesById.get(opponent.owner_id)
    : null;
  const opponentRecentMatches = opponent
    ? matches
        .filter(
          (match) =>
            match.status === "played" &&
            (match.home_club_id === opponent.id ||
              match.away_club_id === opponent.id),
        )
        .slice(-3)
    : [];

  return (
    <GameShell
      eyebrow="Manager panel"
      title="Dashboard"
      description={`Your club: ${managerClub.name}. Track live status, rival form, league data and transfer movement from one command screen.`}
      actions={
        <>
          <Link href="/my-club" className="game-button-primary">
            My club
          </Link>
          <Link href="/transfers" className="game-button-secondary">
            Transfers
          </Link>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Link
          href="/my-club"
          className="game-panel border-teal-300/30 bg-teal-300/10 p-5 transition hover:border-teal-200"
        >
          <p className="game-kicker">My club</p>
          <p className="mt-3 text-3xl font-black text-white">
            {managerClub.short_name}
          </p>
          <p className="mt-2 text-sm text-slate-300">{managerClub.name}</p>
        </Link>
        <MetricTile label="Clubs" value={String(clubs.length)} detail="League teams" />
        <MetricTile
          label="Players"
          value={playersResult.error ? "-" : String(players.length)}
          detail="Database pool"
        />
        <MetricTile
          label="League budget"
          value={formatMoney(totalBudget)}
          detail="Combined club budgets"
          tone="amber"
        />
        <MetricTile
          label="Squad value"
          value={playersResult.error ? "-" : formatMoney(totalSquadValue)}
          detail="Total player value"
          tone="teal"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="game-panel border-teal-300/25 bg-teal-300/10 p-5">
          <p className="game-kicker">Live status</p>
          <h2 className="mt-3 text-3xl font-black">
            {nextOwnMatch
              ? `Next match in ${formatCountdown(nextOwnMatch.scheduled_at)}`
              : "No upcoming match"}
          </h2>
          {nextOwnMatch ? (
            <p className="mt-2 text-sm text-slate-300">
              {getMatchLabel(nextOwnMatch, clubsById)} -{" "}
              {formatMatchDate(nextOwnMatch.scheduled_at)}
            </p>
          ) : null}
        </section>

        <section className="game-panel p-5">
          <p className="game-kicker text-slate-400">Rival preview</p>
          {opponent ? (
            <div className="mt-3">
              <Link
                href={`/clubs/${opponent.id}`}
                className="text-2xl font-black transition hover:text-teal-200"
              >
                {opponent.name}
              </Link>
              <p className="mt-2 text-sm text-slate-400">
                Manager: {opponentManager?.display_name ?? "Unknown"} - Form:{" "}
                {opponent.wins}W {opponent.draws}D {opponent.losses}L
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {opponentRecentMatches.length > 0 ? (
                  opponentRecentMatches.map((match) => (
                    <span key={match.id} className="status-pill">
                      {match.home_score}-{match.away_score}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-400">
                    No played matches yet.
                  </span>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-400">
              Schedule a match to see rival details.
            </p>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="game-panel p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-black">Club table</h2>
            <span className="status-pill">Sorted by reputation</span>
          </div>
          {clubsResult.error ? (
            <DataWarning message={clubsResult.error} />
          ) : (
            <div className="overflow-x-auto">
              <table className="game-table min-w-[620px]">
                <thead>
                  <tr>
                    <th>Club</th>
                    <th>City</th>
                    <th>Budget</th>
                    <th>Rep.</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedClubs.map((club) => (
                    <tr
                      key={club.id}
                      className={
                        club.id === managerClub.id
                          ? "bg-teal-300/5 text-teal-100"
                          : "text-slate-200"
                      }
                    >
                      <td className="font-semibold text-white">
                        <Link
                          href={`/clubs/${club.id}`}
                          className="transition hover:text-teal-200"
                        >
                          {club.name}
                          <span className="ml-2 text-xs text-teal-200">
                            {club.short_name}
                          </span>
                        </Link>
                      </td>
                      <td>{club.city ?? "-"}</td>
                      <td>{formatMoney(Number(club.budget))}</td>
                      <td className="font-black">{club.reputation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="game-panel p-5">
          <h2 className="text-xl font-black">Upcoming matches</h2>
          <div className="mt-4 grid gap-3">
            {matchesResult.error ? (
              <DataWarning message={matchesResult.error} />
            ) : upcomingMatches.length > 0 ? (
              upcomingMatches.map((match) => (
                <div key={match.id} className="game-panel-soft px-4 py-3">
                  <p className="font-semibold">{getMatchLabel(match, clubsById)}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {formatMatchDate(match.scheduled_at)} - {match.status}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No scheduled matches.</p>
            )}
          </div>
        </section>
      </div>

      <section className="game-panel mt-6 p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-black">Top players</h2>
          <span className="status-pill">Overall rating</span>
        </div>
        {playersResult.error ? (
          <DataWarning message={playersResult.error} />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {topPlayers.map((player: Player) => (
              <article key={player.id} className="game-panel-soft p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black text-white">
                      {player.first_name} {player.last_name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {getClubName(clubsById, player.club_id)} - {player.position}
                    </p>
                  </div>
                  <span className="rating-badge">{player.overall}</span>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
                  <span>{player.age} yrs</span>
                  <span>{formatMoney(Number(player.value))}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="game-panel mt-6 p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-black">League feed</h2>
          <span className="status-pill">Latest events</span>
        </div>
        {newsResult.error ? (
          <DataWarning message={newsResult.error} />
        ) : news.length > 0 ? (
          <div className="grid gap-3">
            {news.map((item: NewsFeedItem) => (
              <article key={item.id} className="game-panel-soft px-4 py-3">
                <p className="text-sm text-slate-100">{item.message}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatMatchDate(item.created_at)}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            No league messages yet. Transfers and simulated matches will appear here.
          </p>
        )}
      </section>
    </GameShell>
  );
}
