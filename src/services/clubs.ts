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

export async function getClubById(id: string): Promise<{
  data: Club | null;
  error: string | null;
}> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { data: null, error: "Supabase environment variables are not set." };
  }

  const { data, error } = await supabase
    .from("clubs")
    .select("*")
    .eq("id", id)
    .single();

  return {
    data: (data ?? null) as Club | null,
    error: error?.message ?? null,
  };
}
