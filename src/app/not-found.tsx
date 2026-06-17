import Link from "next/link";

export default function NotFound() {
  return (
    <main className="game-bg grid min-h-screen place-items-center px-6 text-white">
      <section className="game-panel max-w-md p-8 text-center">
        <p className="game-kicker">404</p>
        <h1 className="mt-2 text-4xl font-black">Page not found</h1>
        <p className="mt-3 text-sm text-slate-400">
          This screen is outside the current league route map.
        </p>
        <Link href="/" className="game-button-primary mt-6">
          Home
        </Link>
      </section>
    </main>
  );
}
