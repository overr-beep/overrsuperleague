import Link from "next/link";
import { AuthNav } from "@/components/AuthNav";
import { getCurrentProfile, getCurrentUser } from "@/services/auth";

export const dynamic = "force-dynamic";

function Field({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-md border border-white/10 bg-slate-950/55 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-semibold text-white">
        {value ?? "-"}
      </p>
    </div>
  );
}

export default async function AccountPage() {
  const [{ user, error: userError }, { profile, error: profileError }] =
    await Promise.all([getCurrentUser(), getCurrentProfile()]);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <section className="mx-auto max-w-5xl">
        <nav className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="text-sm font-bold uppercase tracking-wider text-emerald-200"
          >
            Overr Super League
          </Link>
          <AuthNav />
        </nav>

        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-200">
          Manager account
        </p>
        <h1 className="mt-2 text-4xl font-black">Account</h1>

        {!user ? (
          <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-xl font-bold">You are not logged in</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Sign in with your email magic link to manage your club.
            </p>
            {userError ? (
              <p className="mt-4 rounded-md border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
                {userError}
              </p>
            ) : null}
            <Link
              href="/login?next=/account"
              className="mt-5 inline-flex rounded-md bg-emerald-300 px-4 py-2 text-sm font-bold text-slate-950"
            >
              Login
            </Link>
          </section>
        ) : (
          <section className="mt-8 rounded-lg border border-white/10 bg-white/[0.04] p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Email" value={user.email} />
              <Field label="User id" value={user.id} />
              <Field label="Display name" value={profile?.display_name} />
              <Field label="Role" value={profile?.role} />
            </div>
            {profileError ? (
              <p className="mt-5 rounded-md border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
                {profileError}
              </p>
            ) : null}
            {!profile && !profileError ? (
              <p className="mt-5 rounded-md border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
                Profile row was not found. Run the latest schema.sql in Supabase
                if this account was created before the profile trigger existed.
              </p>
            ) : null}
          </section>
        )}
      </section>
    </main>
  );
}
