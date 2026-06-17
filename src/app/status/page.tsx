import { DataWarning, GameShell } from "@/components/GameShell";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getClubs } from "@/services/clubs";

export const dynamic = "force-dynamic";

export default async function StatusPage() {
  const result = await getClubs();
  const isConnected = isSupabaseConfigured && !result.error;

  return (
    <GameShell
      eyebrow="Supabase"
      title="Database status"
      description="Connection check for the public league tables used by the game UI."
    >
      <section className="game-panel p-6">
        <div className="flex items-center gap-3">
          <span
            className={`h-3 w-3 rounded-full ${
              isConnected ? "bg-teal-300" : "bg-amber-300"
            }`}
          />
          <p className="font-semibold">
            {isConnected
              ? "Connection works and the clubs table responds."
              : "The app works, but Supabase or the clubs table is not ready."}
          </p>
        </div>

        {result.error ? (
          <div className="mt-5">
            <DataWarning message={result.error} />
          </div>
        ) : (
          <div className="mt-5">
            <p className="text-sm text-slate-400">
              Clubs fetched: {result.data.length}
            </p>
            <ul className="mt-4 grid gap-2 md:grid-cols-2">
              {result.data.map((club) => (
                <li key={club.id} className="game-panel-soft px-4 py-3">
                  <span className="font-semibold text-white">{club.name}</span>
                  <span className="ml-2 text-xs font-black text-teal-200">
                    {club.short_name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </GameShell>
  );
}
