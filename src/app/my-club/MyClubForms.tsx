"use client";

import { useActionState, useMemo, useState } from "react";
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

const pitchLines = ["NAP", "POM", "OBR", "BR"] as const;

function sortByOverall(players: Player[]) {
  return [...players].sort((a, b) => b.overall - a.overall);
}

function buildStarterIds(
  players: Player[],
  slots: string[],
  preferredIds: string[],
  currentRound: number,
) {
  const usedIds = new Set<string>();

  return slots.map((slot, index) => {
    const preferred = players.find(
      (player) =>
        player.id === preferredIds[index] &&
        normalizePosition(player.position) === slot &&
        isAvailableForMatch(player, currentRound) &&
        !usedIds.has(player.id),
    );

    if (preferred) {
      usedIds.add(preferred.id);
      return preferred.id;
    }

    const fallback = sortByOverall(players).find(
      (player) =>
        normalizePosition(player.position) === slot &&
        isAvailableForMatch(player, currentRound) &&
        !usedIds.has(player.id),
    );

    if (!fallback) {
      return "";
    }

    usedIds.add(fallback.id);
    return fallback.id;
  });
}

function playerCardName(player: Player | undefined) {
  if (!player) {
    return "Empty slot";
  }

  return `${player.first_name[0]}. ${player.last_name}`;
}

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
          className="game-input mt-2"
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
          className="game-input mt-2"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="game-button-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save club"}
      </button>
      {state.error ? (
        <p className="rounded-md border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-md border border-teal-300/20 bg-teal-300/10 px-4 py-3 text-sm text-teal-100">
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
        className="game-button-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Generating..." : "Generate starter squad"}
      </button>
      {state.error ? (
        <p className="mt-4 rounded-md border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="mt-4 rounded-md border border-teal-300/20 bg-teal-300/10 px-4 py-3 text-sm text-teal-100">
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
  const initialStarterIds = savedStarters.map((item) => item.player_id);
  const initialBenchIds = lineup
    .filter((item) => item.role === "bench")
    .map((item) => item.player_id);
  const initialFormationSlots = getFormationSlots(formation);
  const [starterIds, setStarterIds] = useState(() =>
    buildStarterIds(players, initialFormationSlots, initialStarterIds, currentRound),
  );
  const [benchIds, setBenchIds] = useState(() =>
    initialBenchIds
      .filter((playerId) => !starterIds.includes(playerId))
      .slice(0, 5),
  );
  const formationSlots = getFormationSlots(selectedFormation);
  const playersById = useMemo(
    () => new Map(players.map((player) => [player.id, player])),
    [players],
  );
  const playersByPosition = useMemo(() => {
    const grouped = new Map<string, Player[]>();

    for (const player of sortByOverall(players)) {
      const key = normalizePosition(player.position);
      const group = grouped.get(key) ?? [];
      group.push(player);
      grouped.set(key, group);
    }

    return grouped;
  }, [players]);
  const selectedStarterSet = new Set(starterIds.filter(Boolean));
  const selectedStarters = starterIds
    .map((playerId) => playersById.get(playerId))
    .filter((player): player is Player => player !== undefined);
  const selectedBench = benchIds
    .map((playerId) => playersById.get(playerId))
    .filter((player): player is Player => player !== undefined);
  const selectedAverage =
    selectedStarters.length > 0
      ? Math.round(
          selectedStarters.reduce((sum, player) => sum + player.overall, 0) /
            selectedStarters.length,
        )
      : 0;

  function handleFormationChange(value: string) {
    const nextSlots = getFormationSlots(value);
    const nextStarterIds = buildStarterIds(
      players,
      nextSlots,
      starterIds,
      currentRound,
    );

    setSelectedFormation(value);
    setStarterIds(nextStarterIds);
    setBenchIds((currentBenchIds) =>
      currentBenchIds
        .filter((playerId) => !nextStarterIds.includes(playerId))
        .slice(0, 5),
    );
  }

  function handleStarterChange(index: number, playerId: string) {
    setStarterIds((currentStarterIds) => {
      const nextStarterIds = [...currentStarterIds];
      nextStarterIds[index] = playerId;
      return nextStarterIds;
    });

    if (playerId) {
      setBenchIds((currentBenchIds) =>
        currentBenchIds.filter((benchId) => benchId !== playerId),
      );
    }
  }

  function handleBenchChange(playerId: string, checked: boolean) {
    setBenchIds((currentBenchIds) => {
      if (checked) {
        if (
          currentBenchIds.includes(playerId) ||
          currentBenchIds.length >= 5 ||
          selectedStarterSet.has(playerId)
        ) {
          return currentBenchIds;
        }

        return [...currentBenchIds, playerId];
      }

      return currentBenchIds.filter((benchId) => benchId !== playerId);
    });
  }

  return (
    <form action={formAction} className="grid gap-5">
      <fieldset disabled={pending || isLocked} className="grid gap-5">
        <div className="grid min-w-0 gap-4 xl:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="game-panel-soft p-5">
            <p className="game-kicker">Team sheet</p>
            <h2 className="mt-2 text-2xl font-black text-white">
              {selectedFormation}
            </h2>
            <label
              htmlFor="formation"
              className="mt-5 block text-sm font-semibold text-slate-200"
            >
              Formation
            </label>
            <select
              id="formation"
              name="formation"
              value={selectedFormation}
              onChange={(event) => handleFormationChange(event.target.value)}
              className="game-input mt-2"
            >
              {Object.keys(FORMATIONS).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <div className="mt-5 grid gap-2 text-sm">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">Starters</span>
                <span className="font-black text-teal-200">
                  {selectedStarters.length}/11
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">Bench</span>
                <span className="font-black text-teal-200">
                  {selectedBench.length}/5
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">Rating</span>
                <span className="font-black text-amber-200">
                  {selectedAverage || "-"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Lock</span>
                <span className="font-black text-amber-200">30 min</span>
              </div>
            </div>
          </aside>

          <div className="relative min-h-[620px] min-w-0 overflow-hidden rounded-md border border-teal-300/25 bg-[#123f34] shadow-2xl shadow-black/30">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.04)_0_92px,rgba(0,0,0,0.06)_92px_184px)]" />
            <div className="absolute inset-8 rounded-md border-2 border-white/45" />
            <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/35" />
            <div className="absolute left-1/2 top-8 h-20 w-44 -translate-x-1/2 rounded-b-md border-x-2 border-b-2 border-white/35" />
            <div className="absolute bottom-8 left-1/2 h-20 w-44 -translate-x-1/2 rounded-t-md border-x-2 border-t-2 border-white/35" />

            <div className="relative z-10 grid min-h-[620px] grid-rows-[1fr_1fr_1fr_1fr] gap-4 p-6">
              {pitchLines.map((line) => {
                const indexedSlots = formationSlots
                  .map((slot, index) => ({ slot, index }))
                  .filter((item) => item.slot === line);

                return (
                  <div
                    key={line}
                    className="flex min-w-0 flex-wrap items-center justify-center gap-3"
                  >
                    {indexedSlots.map(({ slot, index }) => {
                      const candidates = playersByPosition.get(slot) ?? [];
                      const selectedPlayerId = starterIds[index] ?? "";
                      const selectedPlayer = playersById.get(selectedPlayerId);

                      return (
                        <label
                          key={`${slot}-${index}`}
                          className="w-[128px] rounded-md border border-amber-200/75 bg-gradient-to-b from-amber-100 via-amber-300 to-yellow-600 p-2 text-slate-950 shadow-xl shadow-black/35 transition hover:-translate-y-1 hover:shadow-black/50"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-2xl font-black leading-none">
                              {selectedPlayer?.overall ?? "--"}
                            </span>
                            <span className="rounded bg-slate-950/85 px-1.5 py-0.5 text-[0.65rem] font-black text-teal-200">
                              {slot}
                            </span>
                          </div>
                          <div className="mt-2 grid h-14 place-items-center rounded bg-slate-950/15 text-center text-[0.7rem] font-black uppercase leading-tight">
                            {playerCardName(selectedPlayer)}
                            {selectedPlayer ? (
                              <span className="text-[0.62rem] font-black text-slate-700">
                                FIT {selectedPlayer.fitness}%
                              </span>
                            ) : null}
                          </div>
                          <select
                            name={`starter_${index + 1}`}
                            required
                            value={selectedPlayerId}
                            onChange={(event) =>
                              handleStarterChange(index, event.target.value)
                            }
                            className="mt-2 w-full rounded border border-slate-950/20 bg-white/85 px-1.5 py-1 text-[0.7rem] font-bold text-slate-950 outline-none"
                          >
                            <option value="">Select</option>
                            {candidates.map((player) => {
                              const available = isAvailableForMatch(
                                player,
                                currentRound,
                              );

                              return (
                                <option
                                  key={player.id}
                                  value={player.id}
                                  disabled={
                                    !available ||
                                    (selectedStarterSet.has(player.id) &&
                                      player.id !== selectedPlayerId)
                                  }
                                >
                                  {player.first_name} {player.last_name} |{" "}
                                  {player.overall} | {player.fitness}%
                                </option>
                              );
                            })}
                          </select>
                        </label>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-md border border-white/10 bg-slate-950/70 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black">Bench</h3>
              <p className="mt-1 text-xs text-slate-500">
                Pick up to five substitutes.
              </p>
            </div>
            <span className="status-pill">Reserve cards</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {players.map((player) => (
              <label
                key={player.id}
                className={`min-w-[150px] rounded-md border p-2 text-slate-950 transition ${
                  selectedStarterSet.has(player.id)
                    ? "border-slate-500/40 bg-slate-600 opacity-45"
                    : "border-slate-300/50 bg-gradient-to-b from-slate-100 to-slate-400"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xl font-black leading-none">
                    {player.overall}
                  </span>
                  <span className="rounded bg-slate-950/85 px-1.5 py-0.5 text-[0.65rem] font-black text-teal-200">
                    {normalizePosition(player.position)}
                  </span>
                </div>
                <p className="mt-3 truncate text-xs font-black uppercase">
                  {player.first_name[0]}. {player.last_name}
                </p>
                <p className="mt-1 text-[0.68rem] font-bold text-slate-700">
                  FIT {player.fitness}%
                </p>
                <div className="mt-2 flex items-center justify-between border-t border-slate-900/20 pt-2">
                  <span className="text-[0.68rem] font-black">SUB</span>
                  <input
                    name="benchIds"
                    type="checkbox"
                    value={player.id}
                    checked={benchIds.includes(player.id)}
                    disabled={
                      selectedStarterSet.has(player.id) ||
                      !isAvailableForMatch(player, currentRound) ||
                      (!benchIds.includes(player.id) && benchIds.length >= 5)
                    }
                    onChange={(event) =>
                      handleBenchChange(player.id, event.target.checked)
                    }
                    className="h-4 w-4 accent-teal-500"
                  />
                </div>
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
          className="game-button-primary disabled:cursor-not-allowed disabled:opacity-60"
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
        <p className="rounded-md border border-teal-300/20 bg-teal-300/10 px-4 py-3 text-sm text-teal-100">
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
