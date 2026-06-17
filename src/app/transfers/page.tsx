import Link from "next/link";
import { redirect } from "next/navigation";
import { DataWarning, GameShell, MetricTile } from "@/components/GameShell";
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
    <GameShell
      eyebrow="Transfer market"
      title="Free agents"
      description="Scout unsigned players, compare attributes and buy instantly if your budget allows it."
      actions={
        <Link href="/my-club" className="game-button-primary">
          My club
        </Link>
      }
    >
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <MetricTile
          label="Budget"
          value={formatMoney(Number(club.budget))}
          detail={club.name}
          tone="teal"
        />
        <MetricTile
          label="Free agents"
          value={String(freeAgents.length)}
          detail="Available now"
        />
        <MetricTile
          label="Market mode"
          value="Buy now"
          detail="No bidding in current MVP"
          tone="amber"
        />
      </div>

      {freeAgentsResult.error ? (
        <DataWarning message={freeAgentsResult.error} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {freeAgents.map((player) => (
            <article key={player.id} className="game-panel p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="game-kicker text-slate-500">
                    {normalizePosition(player.position)}
                  </p>
                  <h2 className="mt-2 text-xl font-black">
                    {player.first_name} {player.last_name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {player.age} yrs - fitness {player.fitness}%
                  </p>
                </div>
                <span className="rating-badge">{player.overall}</span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
                <div className="game-panel-soft p-3">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Attack
                  </p>
                  <p className="mt-1 text-lg font-black">{player.attack_rating}</p>
                </div>
                <div className="game-panel-soft p-3">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Defense
                  </p>
                  <p className="mt-1 text-lg font-black">{player.defense_rating}</p>
                </div>
                <div className="game-panel-soft p-3">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Price
                  </p>
                  <p className="mt-1 text-sm font-black text-teal-200">
                    {formatMoney(Number(player.price || player.value))}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <BuyButton playerId={player.id} />
              </div>
            </article>
          ))}
        </div>
      )}
    </GameShell>
  );
}
