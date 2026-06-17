"use client";

import { useActionState } from "react";
import { buyFreeAgentAction } from "./actions";
import type { TransferActionState } from "./actions";

const initialTransferState: TransferActionState = {
  error: null,
  success: null,
};

export function BuyButton({ playerId }: { playerId: string }) {
  const [state, formAction, pending] = useActionState(
    buyFreeAgentAction,
    initialTransferState,
  );

  return (
    <form action={formAction} className="grid gap-2">
      <input type="hidden" name="playerId" value={playerId} />
      <button
        type="submit"
        disabled={pending}
        className="game-button-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Buying..." : "Buy now"}
      </button>
      {state.error ? (
        <p className="text-xs text-amber-200">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-xs text-teal-200">{state.success}</p>
      ) : null}
    </form>
  );
}
