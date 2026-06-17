import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Player } from "@/types/database";

export async function getPlayers(): Promise<{
  data: Player[];
  error: string | null;
}> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { data: [], error: "Supabase environment variables are not set." };
  }

  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("overall", { ascending: false });

  return {
    data: (data ?? []) as Player[],
    error: error?.message ?? null,
  };
}

export async function getPlayersByClubId(clubId: string): Promise<{
  data: Player[];
  error: string | null;
}> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { data: [], error: "Supabase environment variables are not set." };
  }

  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("club_id", clubId)
    .order("overall", { ascending: false });

  return {
    data: (data ?? []) as Player[],
    error: error?.message ?? null,
  };
}
