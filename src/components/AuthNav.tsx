import Link from "next/link";
import { getCurrentUser } from "@/services/auth";

export async function AuthNav() {
  const { user } = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Link
          href="/login"
          className="rounded-md bg-emerald-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-emerald-200"
        >
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Link
        href="/account"
        className="rounded-md border border-white/15 px-4 py-2 text-sm font-bold text-white transition hover:border-emerald-300/70"
      >
        {user.email}
      </Link>
      <Link
        href="/logout"
        className="rounded-md bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/15"
      >
        Logout
      </Link>
    </div>
  );
}
