import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <section className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-200">
          Supabase Auth
        </p>
        <h1 className="mt-2 text-4xl font-black">Logowanie</h1>
        <LoginForm />
      </section>
    </main>
  );
}
