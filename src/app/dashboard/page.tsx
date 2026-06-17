import Link from "next/link";
import { redirect } from "next/navigation";
import { DataWarning, GameShell } from "@/components/GameShell";
import { getCurrentUser } from "@/services/auth";
import { getClubByOwnerId, getClubs } from "@/services/clubs";
import { getMatches } from "@/services/matches";
import { getNewsFeed } from "@/services/news";
import { getPlayers } from "@/services/players";
import { getProfilesByIds } from "@/services/profiles";
import type { Club, Match, NewsFeedItem, Player, Profile } from "@/types/database";

export const dynamic = "force-dynamic";

function getClubName(clubsById: Map<string, Club>, clubId: string | null) {
  return clubId ? clubsById.get(clubId)?.short_name ?? "Free" : "Free";
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

function played(match: Match) {
  return match.home_score !== null && match.away_score !== null;
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
  const leagueTable = [...clubs].sort((a, b) => {
    const points = b.league_points - a.league_points;
    const goalDifference =
      b.goals_for -
      b.goals_against -
      (a.goals_for - a.goals_against);

    return points || goalDifference || b.goals_for - a.goals_for;
  });
  const topPlayers = players.slice(0, 6);
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
  const upcomingMatches = matches
    .filter((match) => match.status !== "played")
    .slice(0, 3);

  return (
    <GameShell
      eyebrow="Manager panel"
      title="Dashboard"
      description={`${managerClub.name} command feed, live status and league snapshot.`}
      actions={
        <>
          <Link href="/my-club" className="game-button-primary">
            My club
          </Link>
          <Link href="/squad" className="game-button-secondary">
            Squad
          </Link>
        </>
      }
    >
      <section className="game-panel border-teal-300/20 p-4">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <p className="game-kicker">League feed</p>
            <h2 className="mt-1 text-xl font-black">Overr Live</h2>
          </div>
          <span className="status-pill">@OverrSuperLeague</span>
        </div>
        {newsResult.error ? (
          <DataWarning message={newsResult.error} />
        ) : news.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {news.map((item: NewsFeedItem) => (
              <article
                key={item.id}
                className="min-w-[280px] max-w-sm rounded-md border border-white/10 bg-slate-950/70 p-4"
              >
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded bg-teal-300 text-xs font-black text-slate-950">
                    OSL
                  </span>
                  <div>
                    <p className="text-sm font-black text-white">League HQ</p>
                    <p className="text-xs text-slate-500">
                      {formatMatchDate(item.created_at)}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-5 text-slate-200">
                  {item.message}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            No league messages yet. Transfers and match reports will appear here.
          </p>
        )}
      </section>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <Link
          href="/my-club"
          className="rounded-md border border-teal-300/35 bg-teal-300/10 p-4 transition hover:border-teal-200"
        >
          <p className="game-kicker">My club</p>
          <p className="mt-2 text-2xl font-black text-white">
            {managerClub.short_name}
          </p>
          <p className="mt-1 text-sm text-slate-300">{managerClub.name}</p>
        </Link>

        <section className="rounded-md border border-teal-300/25 bg-teal-300/10 p-4">
          <p className="game-kicker">Live status</p>
          <h2 className="mt-2 text-2xl font-black">
            {nextOwnMatch
              ? formatCountdown(nextOwnMatch.scheduled_at)
              : "No match"}
          </h2>
          {nextOwnMatch ? (
            <p className="mt-1 text-sm text-slate-300">
              {getMatchLabel(nextOwnMatch, clubsById)}
            </p>
          ) : null}
        </section>

        <section className="rounded-md border border-teal-300/25 bg-teal-300/10 p-4">
          <p className="game-kicker">Rival</p>
          {opponent ? (
            <>
              <Link
                href={`/clubs/${opponent.id}`}
                className="mt-2 block text-2xl font-black hover:text-teal-200"
              >
                {opponent.short_name}
              </Link>
              <p className="mt-1 text-sm text-slate-300">
                {opponentManager?.display_name ?? "Unknown manager"}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-300">No rival scheduled</p>
          )}
        </section>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="game-panel p-4">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 className="text-lg font-black">League</h2>
            <Link href="/league" className="status-pill hover:text-teal-200">
              Full table
            </Link>
          </div>
          {clubsResult.error ? (
            <DataWarning message={clubsResult.error} />
          ) : (
            <div className="grid gap-2">
              {leagueTable.map((club, index) => (
                <Link
                  key={club.id}
                  href={`/clubs/${club.id}`}
                  className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm transition hover:border-teal-300/50 ${
                    club.id === managerClub.id
                      ? "border-teal-300/40 bg-teal-300/10"
                      : "border-white/10 bg-slate-950/55"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 text-center text-xs font-black text-slate-500">
                      #{index + 1}
                    </span>
                    <span className="font-black text-white">{club.short_name}</span>
                    <span className="text-slate-400">{club.name}</span>
                  </div>
                  <span className="text-lg font-black text-teal-200">
                    {club.league_points}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="game-panel p-4">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 className="text-lg font-black">Matchday</h2>
            <Link href="/schedule" className="status-pill hover:text-teal-200">
              Fixtures
            </Link>
          </div>
          {matchesResult.error ? (
            <DataWarning message={matchesResult.error} />
          ) : (
            <div className="grid gap-2">
              {upcomingMatches.length > 0 ? (
                upcomingMatches.map((match) => (
                  <article key={match.id} className="game-panel-soft px-3 py-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-black">
                        {getMatchLabel(match, clubsById)}
                      </p>
                      <span className="status-pill">{match.status}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatMatchDate(match.scheduled_at)}
                    </p>
                  </article>
                ))
              ) : (
                <p className="text-sm text-slate-400">No scheduled matches.</p>
              )}
              {opponentRecentMatches.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {opponentRecentMatches.map((match) => (
                    <span key={match.id} className="status-pill">
                      Rival form {played(match) ? `${match.home_score}-${match.away_score}` : match.status}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </section>
      </div>

      <section className="game-panel mt-4 p-4">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="text-lg font-black">Top players</h2>
          <span className="status-pill">OVR</span>
        </div>
        {playersResult.error ? (
          <DataWarning message={playersResult.error} />
        ) : (
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {topPlayers.map((player: Player, index) => (
              <div
                key={player.id}
                className="flex items-center justify-between rounded-md border border-white/10 bg-slate-950/55 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-slate-500">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-black text-white">
                      {player.first_name} {player.last_name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {getClubName(clubsById, player.club_id)} - {player.position}
                    </p>
                  </div>
                </div>
                <span className="rating-badge">{player.overall}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </GameShell>
  );
}
