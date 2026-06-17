import Link from "next/link";
import { getClubs } from "@/services/clubs";
import { getMatches } from "@/services/matches";
import { getPlayers } from "@/services/players";
import type { Club, Match, Player } from "@/types/database";
import { formatMoney } from "@/utils/formatMoney";

export const dynamic = "force-dynamic";

function getClubName(clubsById: Map<string, Club>, clubId: string | null) {
  if (!clubId) {
    return "Free agent";
  }

  return clubsById.get(clubId)?.short_name ?? "Unknown";
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

function StatTile({
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
      <p className="mt-3 text-3xl font-black text-white">{value}</p>
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

export default async function DashboardPage() {
  const [clubsResult, playersResult, matchesResult] = await Promise.all([
    getClubs(),
    getPlayers(),
    getMatches(),
  ]);

  const clubs = clubsResult.data;
  const players = playersResult.data;
  const matches = matchesResult.data;
  const clubsById = new Map(clubs.map((club) => [club.id, club]));
  const topClubs = [...clubs]
    .sort((a, b) => b.reputation - a.reputation)
    .slice(0, 5);
  const topPlayers = players.slice(0, 8);
  const upcomingMatches = matches
    .filter((match) => match.status !== "played")
    .slice(0, 6);
  const totalBudget = clubs.reduce((sum, club) => sum + Number(club.budget), 0);
  const totalSquadValue = players.reduce(
    (sum, player) => sum + Number(player.value),
    0,
  );

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-200">
              Manager panel
            </p>
            <h1 className="mt-2 text-4xl font-black">Dashboard</h1>
          </div>
          <Link
            href="/status"
            className="rounded-md border border-white/15 px-4 py-2 text-sm font-bold text-white transition hover:border-emerald-300/70"
          >
            Status bazy
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label="Kluby"
            value={String(clubs.length)}
            detail="Aktywne zespoly w lidze"
          />
          <StatTile
            label="Zawodnicy"
            value={playersResult.error ? "-" : String(players.length)}
            detail="Pula zawodnikow z bazy"
          />
          <StatTile
            label="Budzet ligi"
            value={formatMoney(totalBudget)}
            detail="Suma budzetow klubow"
          />
          <StatTile
            label="Wartosc kadr"
            value={playersResult.error ? "-" : formatMoney(totalSquadValue)}
            detail="Suma wartosci zawodnikow"
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold">Tabela klubow</h2>
              <span className="text-sm text-slate-400">
                Sortowanie: reputacja
              </span>
            </div>
            {clubsResult.error ? (
              <DataWarning message={clubsResult.error} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] border-separate border-spacing-0 text-left text-sm">
                  <thead className="text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="border-b border-white/10 pb-3">Klub</th>
                      <th className="border-b border-white/10 pb-3">Miasto</th>
                      <th className="border-b border-white/10 pb-3">Budzet</th>
                      <th className="border-b border-white/10 pb-3">Rep.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topClubs.map((club) => (
                      <tr key={club.id} className="text-slate-200">
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
                          {club.city ?? "-"}
                        </td>
                        <td className="border-b border-white/5 py-3">
                          {formatMoney(Number(club.budget))}
                        </td>
                        <td className="border-b border-white/5 py-3">
                          {club.reputation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-xl font-bold">Najblizsze mecze</h2>
            <div className="mt-4 grid gap-3">
              {matchesResult.error ? (
                <DataWarning message={matchesResult.error} />
              ) : upcomingMatches.length > 0 ? (
                upcomingMatches.map((match) => (
                  <div
                    key={match.id}
                    className="rounded-md border border-white/10 bg-slate-950/55 px-4 py-3"
                  >
                    <p className="font-semibold">{getMatchLabel(match, clubsById)}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {formatMatchDate(match.scheduled_at)} · {match.status}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">Brak zaplanowanych meczow.</p>
              )}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold">Top zawodnicy</h2>
            <span className="text-sm text-slate-400">Sortowanie: overall</span>
          </div>
          {playersResult.error ? (
            <DataWarning message={playersResult.error} />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {topPlayers.map((player: Player) => (
                <article
                  key={player.id}
                  className="rounded-md border border-white/10 bg-slate-950/55 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-white">
                        {player.first_name} {player.last_name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {getClubName(clubsById, player.club_id)} · {player.position}
                      </p>
                    </div>
                    <span className="rounded-md bg-emerald-300 px-2 py-1 text-sm font-black text-slate-950">
                      {player.overall}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
                    <span>{player.age} lat</span>
                    <span>{formatMoney(Number(player.value))}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
