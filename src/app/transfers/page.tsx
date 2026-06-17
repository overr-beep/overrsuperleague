import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthNav } from "@/components/AuthNav";
import { getCurrentUser } from "@/services/auth";
import { getClubByOwnerId } from "@/services/clubs";
import { getFreeAgents } from "@/services/players";
import { formatMoney } from "@/utils/formatMoney";
import { normalizePosition } from "@/utils/positions";
import { BuyButton } from "./BuyButton";

export const dynamic = "force-dynamic";

export default async function TransfersPage() {
  const { user } = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/transfers");
  }

  const { data: club } = await getClubByOwnerId(user.id);

  if (!club) {
    redirect("/create-club");
  }

  const freeAgentsResult = await getFreeAgents();
  const freeAgents = freeAgentsResult.data;

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
              Transfer market
            </p>
            <h1 className="mt-2 text-4xl font-black">Free agents</h1>
            <p className="mt-2 text-sm text-slate-400">
              Budget: {formatMoney(Number(club.budget))}
            </p>
          </div>
          <Link
            href="/my-club"
            className="rounded-md bg-emerald-300 px-4 py-2 text-sm font-bold text-slate-950"
          >
            My club
          </Link>
        </div>

        {freeAgentsResult.error ? (
          <p className="rounded-md border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            {freeAgentsResult.error}
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {freeAgents.map((player) => (
              <article
                key={player.id}
                className="rounded-lg border border-white/10 bg-white/[0.04] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-bold">
                      {player.first_name} {player.last_name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      {normalizePosition(player.position)} · OVR {player.overall}
                    </p>
                  </div>
                  <p className="text-right text-sm font-bold text-emerald-200">
                    {formatMoney(Number(player.price || player.value))}
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-md bg-slate-950/55 p-3">
                    <p className="text-slate-500">Attack</p>
                    <p className="mt-1 font-bold">{player.attack_rating}</p>
                  </div>
                  <div className="rounded-md bg-slate-950/55 p-3">
                    <p className="text-slate-500">Defense</p>
                    <p className="mt-1 font-bold">{player.defense_rating}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <BuyButton playerId={player.id} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
