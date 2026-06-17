import { supabase } from "@/lib/supabase";
import type { Match } from "@/types/database";

export async function getMatches(): Promise<{
  data: Match[];
  error: string | null;
}> {
  if (!supabase) {
    return { data: [], error: "Supabase environment variables are not set." };
  }

  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .order("scheduled_at", { ascending: true });

  return {
    data: (data ?? []) as Match[],
    error: error?.message ?? null,
  };
}
