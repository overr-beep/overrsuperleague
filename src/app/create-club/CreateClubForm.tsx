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
      className="mt-8 max-w-lg rounded-lg border border-white/10 bg-white/[0.04] p-6"
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
        className="mt-2 w-full rounded-md border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-300"
        placeholder="Example: Overr City"
      />
      <p className="mt-2 text-xs text-slate-500">3-25 characters.</p>

      <button
        type="submit"
        disabled={pending}
        className="mt-5 w-full rounded-md bg-emerald-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
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
