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
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <section className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-200">
          Supabase Auth
        </p>
        <h1 className="mt-2 text-4xl font-black">Login</h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">
          Enter your email. Supabase will send you a private magic link for this
          league.
        </p>
        <LoginForm nextPath={nextPath} callbackError={params.error} />
      </section>
    </main>
  );
}
