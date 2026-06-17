import { supabase } from "@/lib/supabase";
import type { Player } from "@/types/database";

export async function getPlayers(): Promise<{
  data: Player[];
  error: string | null;
}> {
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
