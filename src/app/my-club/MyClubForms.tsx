"use client";

import { useActionState, useState } from "react";
import {
  generateStarterSquadAction,
  saveLineupAction,
  updateMyClubAction,
} from "./actions";
import type { MyClubActionState } from "./actions";
import type { Lineup, Player } from "@/types/database";
import {
  FORMATIONS,
  getFormationSlots,
  isAvailableForMatch,
} from "@/utils/formations";
import { normalizePosition } from "@/utils/positions";

const initialActionState: MyClubActionState = {
  error: null,
  success: null,
};

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
  formation,
  currentRound,
  isLocked,
}: {
  players: Player[];
  lineup: Lineup[];
  formation: string;
  currentRound: number;
  isLocked: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    saveLineupAction,
    initialActionState,
  );
  const [selectedFormation, setSelectedFormation] = useState(formation);
  const savedStarters = lineup
    .filter((item) => item.role === "starter")
    .sort((a, b) => a.slot - b.slot);
  const savedBenchIds = new Set(
    lineup.filter((item) => item.role === "bench").map((item) => item.player_id),
  );
  const formationSlots = getFormationSlots(selectedFormation);
  const playersByPosition = new Map<string, Player[]>();

  for (const player of players) {
    const key = normalizePosition(player.position);
    const group = playersByPosition.get(key) ?? [];
    group.push(player);
    playersByPosition.set(key, group);
  }

  return (
    <form action={formAction} className="grid gap-5">
      <fieldset disabled={pending || isLocked} className="grid gap-5">
        <div>
          <label
            htmlFor="formation"
            className="text-sm font-semibold text-slate-200"
          >
            Formation
          </label>
          <select
            id="formation"
            name="formation"
            value={selectedFormation}
            onChange={(event) => setSelectedFormation(event.target.value)}
            className="mt-2 w-full rounded-md border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-300"
          >
            {Object.keys(FORMATIONS).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {formationSlots.map((slotPosition, index) => {
            const candidates = playersByPosition.get(slotPosition) ?? [];
            const savedPlayerId = savedStarters[index]?.player_id ?? "";

            return (
              <label
                key={`${slotPosition}-${index}`}
                className="grid gap-2 rounded-md border border-white/10 bg-slate-950/55 px-4 py-3 text-sm"
              >
                <span className="font-semibold text-white">
                  {index + 1}. {slotPosition}
                </span>
                <select
                  name={`starter_${index + 1}`}
                  required
                  defaultValue={savedPlayerId}
                  className="rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300"
                >
                  <option value="">Select player</option>
                  {candidates.map((player) => {
                    const available = isAvailableForMatch(player, currentRound);

                    return (
                      <option
                        key={player.id}
                        value={player.id}
                        disabled={!available}
                      >
                        {player.first_name} {player.last_name} | OVR{" "}
                        {player.overall} | FIT {player.fitness}%
                      </option>
                    );
                  })}
                </select>
              </label>
            );
          })}
        </div>

        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-bold">Bench</h3>
            <span className="text-xs uppercase tracking-wider text-slate-500">
              Max 5 players
            </span>
          </div>
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
                    {normalizePosition(player.position)} - {player.overall} -
                    FIT {player.fitness}%
                  </span>
                </span>
                <input
                  name="benchIds"
                  type="checkbox"
                  value={player.id}
                  defaultChecked={savedBenchIds.has(player.id)}
                  className="h-4 w-4 accent-emerald-300"
                />
              </label>
            ))}
          </div>
        </div>
      </fieldset>

      {isLocked ? (
        <p className="rounded-md border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
          Lineup changes are locked 30 minutes before kickoff.
        </p>
      ) : null}

      <div>
        <button
          type="submit"
          disabled={pending || isLocked}
          className="rounded-md bg-emerald-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving lineup..." : "Save tactic"}
        </button>
      </div>

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
