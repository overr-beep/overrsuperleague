"use client";

import { useActionState } from "react";
import {
  generateStarterSquadAction,
  initialActionState,
  saveLineupAction,
  updateMyClubAction,
} from "./actions";
import type { Lineup, Player } from "@/types/database";
import { normalizePosition } from "@/utils/positions";

export function ManageClubForm({
  name,
  city,
}: {
  name: string;
  city: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    updateMyClubAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="grid gap-4">
      <div>
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
          defaultValue={name}
          className="mt-2 w-full rounded-md border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-300"
        />
      </div>
      <div>
        <label htmlFor="city" className="text-sm font-semibold text-slate-200">
          City
        </label>
        <input
          id="city"
          name="city"
          type="text"
          maxLength={30}
          defaultValue={city ?? ""}
          className="mt-2 w-full rounded-md border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-300"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-emerald-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save club"}
      </button>
      {state.error ? (
        <p className="rounded-md border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-md border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">
          {state.success}
        </p>
      ) : null}
    </form>
  );
}

export function GenerateStarterSquadForm() {
  const [state, formAction, pending] = useActionState(
    generateStarterSquadAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="mt-5">
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-emerald-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Generating..." : "Generate starter squad"}
      </button>
      {state.error ? (
        <p className="mt-4 rounded-md border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="mt-4 rounded-md border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">
          {state.success}
        </p>
      ) : null}
    </form>
  );
}

export function LineupForm({
  players,
  lineup,
}: {
  players: Player[];
  lineup: Lineup[];
}) {
  const [state, formAction, pending] = useActionState(
    saveLineupAction,
    initialActionState,
  );
  const selectedIds = new Set(lineup.map((item) => item.player_id));

  return (
    <form action={formAction} className="grid gap-3">
      <div className="grid gap-2 md:grid-cols-2">
        {players.map((player) => (
          <label
            key={player.id}
            className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-slate-950/55 px-4 py-3 text-sm"
          >
            <span>
              <span className="font-semibold text-white">
                {player.first_name} {player.last_name}
              </span>
              <span className="ml-2 text-slate-400">
                {normalizePosition(player.position)} · {player.overall}
              </span>
            </span>
            <input
              name="playerIds"
              type="checkbox"
              value={player.id}
              defaultChecked={selectedIds.has(player.id)}
              className="h-4 w-4 accent-emerald-300"
            />
          </label>
        ))}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-emerald-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving lineup..." : "Save starting XI"}
      </button>
      {state.error ? (
        <p className="rounded-md border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-md border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
