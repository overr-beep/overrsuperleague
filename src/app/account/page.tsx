import Link from "next/link";
import { GameShell } from "@/components/GameShell";
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
    <div className="game-panel-soft p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
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
    <GameShell
      eyebrow="Manager account"
      title="Account"
      description="Supabase identity, manager role and profile metadata."
    >
      {!user ? (
        <section className="game-panel p-6">
          <h2 className="text-xl font-black">You are not logged in</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Sign in with your email magic link to manage your club.
          </p>
          {userError ? (
            <p className="mt-4 rounded-md border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
              {userError}
            </p>
          ) : null}
          <Link href="/login?next=/account" className="game-button-primary mt-5">
            Login
          </Link>
        </section>
      ) : (
        <section className="game-panel p-6">
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
    </GameShell>
  );
}
