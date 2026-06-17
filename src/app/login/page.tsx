import Link from "next/link";
import { LoginForm } from "./LoginForm";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = params.next?.startsWith("/") ? params.next : "/dashboard";

  return (
    <main className="game-bg grid min-h-screen place-items-center px-6 py-8 text-white">
      <section className="w-full max-w-lg">
        <Link href="/" className="game-kicker">
          Overr Super League
        </Link>
        <div className="game-panel mt-6 p-7">
          <p className="game-kicker">Supabase Auth</p>
          <h1 className="mt-2 text-4xl font-black">Login</h1>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            Enter your email. Supabase will send you a private magic link for
            this league.
          </p>
          <LoginForm nextPath={nextPath} callbackError={params.error} />
        </div>
      </section>
    </main>
  );
}
