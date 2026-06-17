const modules = ["Mój klub", "Liga", "Transfery", "Mecze", "Finanse"];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-200">
              Manager panel
            </p>
            <h1 className="mt-2 text-4xl font-black">Dashboard</h1>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <section
              key={module}
              className="min-h-40 rounded-lg border border-white/10 bg-white/[0.04] p-5"
            >
              <h2 className="text-xl font-bold">{module}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Placeholder modułu gry gotowy do podpięcia logiki i widoków.
              </p>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
