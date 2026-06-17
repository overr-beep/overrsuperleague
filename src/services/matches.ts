import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Match } from "@/types/database";

export async function getMatches(): Promise<{
  data: Match[];
  error: string | null;
}> {
  const supabase = await createServerSupabaseClient();

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

export async function getMatchesByClubId(clubId: string): Promise<{
  data: Match[];
  error: string | null;
}> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { data: [], error: "Supabase environment variables are not set." };
  }

  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .or(`home_club_id.eq.${clubId},away_club_id.eq.${clubId}`)
    .order("scheduled_at", { ascending: true });

  return {
    data: (data ?? []) as Match[],
    error: error?.message ?? null,
  };
}

export async function getNextMatchByClubId(clubId: string): Promise<{
  data: Match | null;
  error: string | null;
}> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { data: null, error: "Supabase environment variables are not set." };
  }

  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .or(`home_club_id.eq.${clubId},away_club_id.eq.${clubId}`)
    .eq("status", "scheduled")
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return {
    data: (data ?? null) as Match | null,
    error: error?.message ?? null,
  };
}

export async function getMatchesByRound(roundNumber: number): Promise<{
  data: Match[];
  error: string | null;
}> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { data: [], error: "Supabase environment variables are not set." };
  }

  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("round_number", roundNumber)
    .order("scheduled_at", { ascending: true });

  return {
    data: (data ?? []) as Match[],
    error: error?.message ?? null,
  };
}

export async function getLeagueState(): Promise<{
  currentRound: number;
  error: string | null;
}> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { currentRound: 1, error: "Supabase environment variables are not set." };
  }

  const { data, error } = await supabase
    .from("league_state")
    .select("current_round")
    .eq("id", 1)
    .maybeSingle();

  return {
    currentRound: data?.current_round ?? 1,
    error: error?.message ?? null,
  };
}
