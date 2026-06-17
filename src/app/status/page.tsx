import { isSupabaseConfigured } from "@/lib/supabase";
import { getClubs } from "@/services/clubs";

export default async function StatusPage() {
  const result = await getClubs();
  const isConnected = isSupabaseConfigured && !result.error;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <section className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-200">
          Supabase
        </p>
        <h1 className="mt-2 text-4xl font-black">Status bazy</h1>

        <div className="mt-8 rounded-lg border border-white/10 bg-white/[0.04] p-6">
          <div className="flex items-center gap-3">
            <span
              className={`h-3 w-3 rounded-full ${
                isConnected ? "bg-emerald-300" : "bg-amber-300"
              }`}
            />
            <p className="font-semibold">
              {isConnected
                ? "Połączenie działa i tabela clubs odpowiada."
                : "Aplikacja działa, ale Supabase lub tabela clubs nie są jeszcze gotowe."}
            </p>
          </div>

          {result.error ? (
            <pre className="mt-5 overflow-auto rounded-md bg-slate-950 p-4 text-sm text-amber-100">
              {result.error}
            </pre>
          ) : (
            <div className="mt-5">
              <p className="text-sm text-slate-400">
                Pobrane kluby: {result.data.length}
              </p>
              <ul className="mt-4 grid gap-2">
                {result.data.map((club) => (
                  <li
                    key={club.id}
                    className="rounded-md border border-white/10 bg-slate-950/60 px-4 py-3"
                  >
                    {club.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
