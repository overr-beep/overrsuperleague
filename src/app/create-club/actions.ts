"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { buildStarterSquadRows } from "@/utils/starterSquad";

export type CreateClubState = {
  error: string | null;
};

function makeShortName(name: string, userId: string) {
  const base = name
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, "X");
  const suffix = userId.replace(/-/g, "").slice(0, 3).toUpperCase();

  return `${base}${suffix}`;
}

export async function createClubAction(
  _previousState: CreateClubState,
  formData: FormData,
): Promise<CreateClubState> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return { error: userError.message };
  }

  if (!user) {
    redirect("/login?next=/create-club");
  }

  const name = String(formData.get("name") ?? "").trim();

  if (name.length < 3) {
    return { error: "Club name must have at least 3 characters." };
  }

  if (name.length > 25) {
    return { error: "Club name can have at most 25 characters." };
  }

  const existingClub = await supabase
    .from("clubs")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (existingClub.data) {
    redirect("/dashboard");
  }

  await supabase.from("profiles").upsert(
    {
      id: user.id,
      display_name: user.user_metadata.display_name ?? user.email ?? null,
      role: "manager",
    },
    {
      onConflict: "id",
      ignoreDuplicates: true,
    },
  );

  const { data: club, error } = await supabase
    .from("clubs")
    .insert({
      owner_id: user.id,
      name,
      short_name: makeShortName(name, user.id),
      city: null,
      budget: 50000000,
      reputation: 50,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "Ta nazwa jest juz zajeta, wybierz inna!" };
    }

    return { error: error.message };
  }

  if (club?.id) {
    const { error: playersError } = await supabase
      .from("players")
      .insert(buildStarterSquadRows(club.id));

    if (playersError) {
      return {
        error: `Club created, but starter squad failed: ${playersError.message}`,
      };
    }
  }

  redirect("/my-club");
}
