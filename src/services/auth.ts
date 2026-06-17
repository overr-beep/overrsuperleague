import type { User } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export async function getCurrentUser(): Promise<{
  user: User | null;
  error: string | null;
}> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { user: null, error: "Supabase environment variables are not set." };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return {
    user,
    error: error?.message ?? null,
  };
}

export async function getCurrentProfile(): Promise<{
  profile: Profile | null;
  error: string | null;
}> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { profile: null, error: "Supabase environment variables are not set." };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return { profile: null, error: userError.message };
  }

  if (!user) {
    return { profile: null, error: null };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return {
    profile: (data ?? null) as Profile | null,
    error: error?.message ?? null,
  };
}
