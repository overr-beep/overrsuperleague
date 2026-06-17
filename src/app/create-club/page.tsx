import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import { getClubByOwnerId } from "@/services/clubs";
import { CreateClubForm } from "./CreateClubForm";

export const dynamic = "force-dynamic";

export default async function CreateClubPage() {
  const { user } = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/create-club");
  }

  const { data: club } = await getClubByOwnerId(user.id);

  if (club) {
    redirect("/dashboard");
  }

  return (
    <main className="game-bg grid min-h-screen place-items-center px-6 py-8 text-white">
      <section className="w-full max-w-3xl">
        <Link href="/" className="game-kicker">
          Overr Super League
        </Link>
        <div className="game-panel mt-6 grid gap-6 p-7 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="game-kicker">First setup</p>
            <h1 className="mt-2 text-4xl font-black">Create your club</h1>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              Every manager needs one club before entering the league dashboard.
              Choose a name now. You can tune details later.
            </p>
          </div>
          <CreateClubForm />
        </div>
      </section>
    </main>
  );
}
