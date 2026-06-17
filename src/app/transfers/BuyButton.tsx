"use client";

import { useActionState } from "react";
import { buyFreeAgentAction, initialTransferState } from "./actions";

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
        className="rounded-md bg-emerald-300 px-3 py-2 text-sm font-bold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Buying..." : "Buy now"}
      </button>
      {state.error ? (
        <p className="text-xs text-amber-200">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-xs text-emerald-200">{state.success}</p>
      ) : null}
    </form>
  );
}
