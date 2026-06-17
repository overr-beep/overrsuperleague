import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-6 text-white">
      <section className="text-center">
        <h1 className="text-4xl font-black">404</h1>
        <p className="mt-3 text-slate-300">Nie znaleziono strony.</p>
        <Link
          href="/"
          className="mt-5 inline-flex rounded-md bg-emerald-300 px-4 py-2 text-sm font-bold text-slate-950"
        >
          Strona główna
        </Link>
      </section>
    </main>
  );
}
