import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Lineup } from "@/types/database";

export async function getLineupByClubId(clubId: string): Promise<{
  data: Lineup[];
  error: string | null;
}> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { data: [], error: "Supabase environment variables are not set." };
  }

  const { data, error } = await supabase
    .from("lineups")
    .select("*")
    .eq("club_id", clubId)
    .order("slot", { ascending: true });

  return {
    data: (data ?? []) as Lineup[],
    error: error?.message ?? null,
  };
}
