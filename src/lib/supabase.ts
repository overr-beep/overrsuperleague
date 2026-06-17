import { createBrowserSupabaseClient } from "./supabase/browser";
export { isSupabaseConfigured } from "./supabase/config";

export const supabase = createBrowserSupabaseClient();
