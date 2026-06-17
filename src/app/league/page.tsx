import Link from "next/link";
import { DataWarning, GameShell } from "@/components/GameShell";
import { getLeagueTable } from "@/services/clubs";

export const dynamic = "force-dynamic";

export default async function LeaguePage() {
  const tableResult = await getLeagueTable();
  const clubs = tableResult.data;

  return (
    <GameShell
      eyebrow="League office"
      title="Standings"
      description="Current table, form and goal difference for every club in the private league."
      actions={
        <Link href="/schedule" className="game-button-secondary">
          Schedule
        </Link>
      }
    >
      {tableResult.error ? (
        <DataWarning message={tableResult.error} />
      ) : (
        <section className="game-panel p-5">
          <div className="overflow-x-auto">
            <table className="game-table min-w-[860px]">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Club</th>
                  <th>P</th>
                  <th>W</th>
                  <th>D</th>
                  <th>L</th>
                  <th>GF</th>
                  <th>GA</th>
                  <th>GD</th>
                  <th>Pts</th>
                </tr>
              </thead>
              <tbody>
                {clubs.map((club, index) => (
                  <tr key={club.id} className="text-slate-200">
                    <td className="font-black text-slate-500">{index + 1}</td>
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
                    <td>{club.wins + club.draws + club.losses}</td>
                    <td>{club.wins}</td>
                    <td>{club.draws}</td>
                    <td>{club.losses}</td>
                    <td>{club.goals_for}</td>
                    <td>{club.goals_against}</td>
                    <td>{club.goals_for - club.goals_against}</td>
                    <td className="text-lg font-black text-teal-200">
                      {club.league_points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </GameShell>
  );
}
