import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export async function getProfilesByIds(ids: string[]): Promise<{
  data: Profile[];
  error: string | null;
}> {
  const supabase = await createServerSupabaseClient();

  if (!supabase || ids.length === 0) {
    return { data: [], error: supabase ? null : "Supabase environment variables are not set." };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .in("id", ids);

  return {
    data: (data ?? []) as Profile[],
    error: error?.message ?? null,
  };
}
