"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type TransferActionState = {
  error: string | null;
  success: string | null;
};

export const initialTransferState: TransferActionState = {
  error: null,
  success: null,
};

export async function buyFreeAgentAction(
  _previousState: TransferActionState,
  formData: FormData,
): Promise<TransferActionState> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { error: "Supabase is not configured.", success: null };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return { error: userError.message, success: null };
  }

  if (!user) {
    redirect("/login?next=/transfers");
  }

  const playerId = String(formData.get("playerId") ?? "");

  const { data: club, error: clubError } = await supabase
    .from("clubs")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (clubError) {
    return { error: clubError.message, success: null };
  }

  if (!club) {
    redirect("/create-club");
  }

  const { data: player, error: playerError } = await supabase
    .from("players")
    .select("*")
    .eq("id", playerId)
    .is("club_id", null)
    .maybeSingle();

  if (playerError) {
    return { error: playerError.message, success: null };
  }

  if (!player) {
    return { error: "Player is no longer available.", success: null };
  }

  const price = Number(player.price || player.value);
  const budget = Number(club.budget);

  if (budget < price) {
    return { error: "Not enough budget.", success: null };
  }

  const { error: budgetError } = await supabase
    .from("clubs")
    .update({ budget: budget - price })
    .eq("id", club.id)
    .eq("owner_id", user.id);

  if (budgetError) {
    return { error: budgetError.message, success: null };
  }

  const { error: playerUpdateError } = await supabase
    .from("players")
    .update({ club_id: club.id })
    .eq("id", player.id)
    .is("club_id", null);

  if (playerUpdateError) {
    await supabase
      .from("clubs")
      .update({ budget })
      .eq("id", club.id)
      .eq("owner_id", user.id);

    return { error: playerUpdateError.message, success: null };
  }

  await supabase.from("transfers").insert({
    player_id: player.id,
    from_club_id: null,
    to_club_id: club.id,
    fee: price,
    status: "completed",
  });

  revalidatePath("/transfers");
  revalidatePath("/my-club");
  revalidatePath("/dashboard");

  return {
    error: null,
    success: `${player.first_name} ${player.last_name} signed for your club.`,
  };
}
