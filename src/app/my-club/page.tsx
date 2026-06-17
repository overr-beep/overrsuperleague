import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthNav } from "@/components/AuthNav";
import { getCurrentUser } from "@/services/auth";
import { getClubByOwnerId } from "@/services/clubs";
import { getMatchesByClubId } from "@/services/matches";
import { getPlayersByClubId } from "@/services/players";
import type { Club, Match } from "@/types/database";
import { formatMoney } from "@/utils/formatMoney";
import { GenerateStarterSquadForm, ManageClubForm } from "./MyClubForms";

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
      <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
        <section className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-black">My club</h1>
          <p className="mt-5 rounded-md border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            {clubError ?? "Club not found."}
          </p>
        </section>
      </main>
    );
  }

  const [playersResult, matchesResult] = await Promise.all([
    getPlayersByClubId(club.id),
    getMatchesByClubId(club.id),
  ]);

  const players = playersResult.data;
  const matches = matchesResult.data;
  const squadValue = players.reduce(
    (sum, player) => sum + Number(player.value),
    0,
  );
  const wageBill = players.reduce((sum, player) => sum + Number(player.wage), 0);

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
              My club
            </p>
            <h1 className="mt-2 text-5xl font-black">{club.name}</h1>
            <p className="mt-2 text-sm text-slate-400">
              {club.short_name} · {club.city ?? "No city set"}
            </p>
          </div>
          <Link
            href={`/clubs/${club.id}`}
            className="rounded-md border border-white/15 px-4 py-2 text-sm font-bold text-white transition hover:border-emerald-300/70"
          >
            Public club page
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Budget
            </p>
            <p className="mt-3 text-3xl font-black">
              {formatMoney(Number(club.budget))}
            </p>
          </section>
          <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Squad
            </p>
            <p className="mt-3 text-3xl font-black">{players.length}</p>
          </section>
          <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Squad value
            </p>
            <p className="mt-3 text-3xl font-black">
              {formatMoney(squadValue)}
            </p>
          </section>
          <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Wages
            </p>
            <p className="mt-3 text-3xl font-black">{formatMoney(wageBill)}</p>
          </section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-xl font-bold">Manage club</h2>
            <p className="mt-2 text-sm text-slate-400">
              MVP management: name and city. More controls will come with
              transfers and finances.
            </p>
            <div className="mt-5">
              <ManageClubForm name={club.name} city={club.city} />
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold">Squad</h2>
              <span className="text-sm text-slate-400">
                {players.length} players
              </span>
            </div>

            {playersResult.error ? (
              <p className="rounded-md border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
                {playersResult.error}
              </p>
            ) : players.length === 0 ? (
              <div className="rounded-md border border-white/10 bg-slate-950/55 p-5">
                <h3 className="text-lg font-bold">Your club has no players</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Generate a balanced starter squad so the club is playable.
                </p>
                <GenerateStarterSquadForm />
              </div>
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
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player) => (
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
                          {player.overall}
                        </td>
                        <td className="border-b border-white/5 py-3">
                          {formatMoney(Number(player.value))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <section className="mt-6 rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-xl font-bold">Matches</h2>
          {matchesResult.error ? (
            <p className="mt-4 rounded-md border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
              {matchesResult.error}
            </p>
          ) : matches.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">
              No matches scheduled for your club yet.
            </p>
          ) : (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {matches.map((match) => (
                <article
                  key={match.id}
                  className="rounded-md border border-white/10 bg-slate-950/55 px-4 py-3"
                >
                  <p className="font-semibold">{matchLabel(match, club)}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {formatDate(match.scheduled_at)} · {match.status}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
