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
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <section className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="text-sm font-bold uppercase tracking-wider text-emerald-200"
        >
          Overr Super League
        </Link>
        <p className="mt-10 text-sm font-semibold uppercase tracking-wider text-emerald-200">
          First setup
        </p>
        <h1 className="mt-2 text-4xl font-black">Create your club</h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">
          Every manager needs one club before entering the league dashboard.
          Choose a name now. You can tune details later.
        </p>
        <CreateClubForm />
      </section>
    </main>
  );
}
