import Link from "next/link";
import { getCurrentUser } from "@/services/auth";

export async function AuthNav() {
  const { user } = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Link
          href="/login"
          className="game-button-primary"
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
        className="game-button-secondary max-w-[220px] truncate"
      >
        {user.email}
      </Link>
      <Link
        href="/logout"
        className="game-button-secondary"
      >
        Logout
      </Link>
    </div>
  );
}
