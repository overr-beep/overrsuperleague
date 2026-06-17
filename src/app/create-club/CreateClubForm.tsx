"use client";

import { useActionState } from "react";
import { createClubAction, type CreateClubState } from "./actions";

const initialState: CreateClubState = {
  error: null,
};

export function CreateClubForm() {
  const [state, formAction, pending] = useActionState(
    createClubAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="game-panel-soft p-5"
    >
      <label htmlFor="name" className="text-sm font-semibold text-slate-200">
        Club name
      </label>
      <input
        id="name"
        name="name"
        type="text"
        minLength={3}
        maxLength={25}
        required
        className="game-input mt-2"
        placeholder="Example: Overr City"
      />
      <p className="mt-2 text-xs text-slate-500">3-25 characters.</p>

      <button
        type="submit"
        disabled={pending}
        className="game-button-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Creating club..." : "Create my club"}
      </button>

      {state.error ? (
        <p className="mt-4 rounded-md border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
