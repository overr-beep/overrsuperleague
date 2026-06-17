"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { buildStarterSquadRows } from "@/utils/starterSquad";
import { normalizePosition } from "@/utils/positions";

export type MyClubActionState = {
  error: string | null;
  success: string | null;
};

const initialActionState: MyClubActionState = {
  error: null,
  success: null,
};

export { initialActionState };

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

async function getOwnedClub() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      supabase,
      user: null,
      club: null,
      error: "Supabase is not configured.",
    };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return { supabase, user: null, club: null, error: userError.message };
  }

  if (!user) {
    redirect("/login?next=/my-club");
  }

  const { data: club, error } = await supabase
    .from("clubs")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error) {
    return { supabase, user, club: null, error: error.message };
  }

  if (!club) {
    redirect("/create-club");
  }

  return { supabase, user, club, error: null };
}

export async function updateMyClubAction(
  previousState: MyClubActionState,
  formData: FormData,
): Promise<MyClubActionState> {
  void previousState;

  const { supabase, user, club, error: setupError } = await getOwnedClub();

  if (setupError || !supabase || !user || !club) {
    return { error: setupError ?? "Club not found.", success: null };
  }

  const name = String(formData.get("name") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();

  if (name.length < 3) {
    return { error: "Club name must have at least 3 characters.", success: null };
  }

  if (name.length > 25) {
    return { error: "Club name can have at most 25 characters.", success: null };
  }

  if (city.length > 30) {
    return { error: "City can have at most 30 characters.", success: null };
  }

  const { error } = await supabase
    .from("clubs")
    .update({
      name,
      city: city || null,
      short_name: makeShortName(name, user.id),
    })
    .eq("id", club.id)
    .eq("owner_id", user.id);

  if (error) {
    if (error.code === "23505") {
      return {
        error: "Ta nazwa jest juz zajeta, wybierz inna!",
        success: null,
      };
    }

    return { error: error.message, success: null };
  }

  revalidatePath("/my-club");
  revalidatePath("/dashboard");

  return { error: null, success: "Club updated." };
}

export async function generateStarterSquadAction(
  previousState: MyClubActionState,
): Promise<MyClubActionState> {
  void previousState;

  const { supabase, user, club, error: setupError } = await getOwnedClub();

  if (setupError || !supabase || !user || !club) {
    return { error: setupError ?? "Club not found.", success: null };
  }

  const { count, error: countError } = await supabase
    .from("players")
    .select("id", { count: "exact", head: true })
    .eq("club_id", club.id);

  if (countError) {
    return { error: countError.message, success: null };
  }

  if ((count ?? 0) > 0) {
    return {
      error: "This club already has players.",
      success: null,
    };
  }

  const { error } = await supabase
    .from("players")
    .insert(buildStarterSquadRows(club.id));

  if (error) {
    return { error: error.message, success: null };
  }

  revalidatePath("/my-club");
  revalidatePath("/dashboard");

  return { error: null, success: "Starter squad generated." };
}

export async function saveLineupAction(
  _previousState: MyClubActionState,
  formData: FormData,
): Promise<MyClubActionState> {
  const { supabase, club, error: setupError } = await getOwnedClub();

  if (setupError || !supabase || !club) {
    return { error: setupError ?? "Club not found.", success: null };
  }

  const playerIds = formData
    .getAll("playerIds")
    .map((value) => String(value))
    .filter(Boolean);
  const uniquePlayerIds = [...new Set(playerIds)];

  if (uniquePlayerIds.length !== 11) {
    return { error: "Lineup must contain exactly 11 players.", success: null };
  }

  const { data: players, error: playersError } = await supabase
    .from("players")
    .select("*")
    .in("id", uniquePlayerIds)
    .eq("club_id", club.id);

  if (playersError) {
    return { error: playersError.message, success: null };
  }

  if ((players ?? []).length !== 11) {
    return {
      error: "Every lineup player must belong to your club.",
      success: null,
    };
  }

  const hasGoalkeeper = (players ?? []).some(
    (player) => normalizePosition(player.position) === "BR",
  );

  if (!hasGoalkeeper) {
    return { error: "Lineup must include one goalkeeper.", success: null };
  }

  const { error: deleteError } = await supabase
    .from("lineups")
    .delete()
    .eq("club_id", club.id);

  if (deleteError) {
    return { error: deleteError.message, success: null };
  }

  const rows = uniquePlayerIds.map((playerId, index) => ({
    club_id: club.id,
    player_id: playerId,
    slot: index + 1,
  }));

  const { error } = await supabase.from("lineups").insert(rows);

  if (error) {
    return { error: error.message, success: null };
  }

  revalidatePath("/my-club");

  return { error: null, success: "Lineup saved." };
}
