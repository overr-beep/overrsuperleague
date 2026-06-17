import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { NewsFeedItem } from "@/types/database";

export async function getNewsFeed(limit = 8): Promise<{
  data: NewsFeedItem[];
  error: string | null;
}> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { data: [], error: "Supabase environment variables are not set." };
  }

  const { data, error } = await supabase
    .from("news_feed")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  return {
    data: (data ?? []) as NewsFeedItem[],
    error: error?.message ?? null,
  };
}
