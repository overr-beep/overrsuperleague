import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Club } from "@/types/database";

export async function getClubs(): Promise<{
  data: Club[];
  error: string | null;
}> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { data: [], error: "Supabase environment variables are not set." };
  }

  const { data, error } = await supabase
    .from("clubs")
    .select("*")
    .order("name", { ascending: true });

  return {
    data: (data ?? []) as Club[],
    error: error?.message ?? null,
  };
}
