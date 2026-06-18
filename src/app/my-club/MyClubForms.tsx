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
  calculateChemistry,
  FORMATIONS,
  getFormationSlots,
  getPositionFit,
  isAvailableForMatch,
} from "@/utils/formations";
import { normalizePosition } from "@/utils/positions";

const initialActionState: MyClubActionState = {
  error: null,
  success: null,
};

const pitchLines = [
  ["ST", "LW", "RW"],
  ["LM", "RM", "CM", "CDM", "CAM"],
  ["LB", "RB", "CB"],
  ["BR"],
] as const;
type DragPayload = { source: "slot"; index: number } | { source: "player"; id: string };

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
        isAvailableForMatch(player, currentRound) &&
        !usedIds.has(player.id),
    );

    if (preferred) {
      usedIds.add(preferred.id);
      return preferred.id;
    }

    const fallback = sortByOverall(players)
      .filter(
        (player) =>
          isAvailableForMatch(player, currentRound) && !usedIds.has(player.id),
      )
      .sort((a, b) => {
        const fitA = getPositionFit(a, slot);
        const fitB = getPositionFit(b, slot);
        return fitA.penaltyPercent - fitB.penaltyPercent || b.overall - a.overall;
      })[0];

    if (!fallback) {
      return "";
    }

    usedIds.add(fallback.id);
    return fallback.id;
  });
}

function cardName(player: Player | undefined) {
  if (!player) {
    return "EMPTY";
  }

  return `${player.first_name[0]}. ${player.last_name}`;
}

function canPlaySlot(player: Player | undefined, slot: string, currentRound: number) {
  void slot;
  return !!player && isAvailableForMatch(player, currentRound);
}

function readDragPayload(value: string): DragPayload | null {
  try {
    return JSON.parse(value) as DragPayload;
  } catch {
    return null;
  }
}

export function ManageClubForm({
  name,
  shortName,
  city,
}: {
  name: string;
  shortName: string;
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
      <div className="grid gap-4 sm:grid-cols-[0.55fr_1fr]">
        <div>
          <label
            htmlFor="shortName"
            className="text-sm font-semibold text-slate-200"
          >
            Short name
          </label>
          <input
            id="shortName"
            name="shortName"
            type="text"
            minLength={2}
            maxLength={5}
            required
            defaultValue={shortName}
            className="game-input mt-2 uppercase"
            placeholder="OFC"
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
  const selectedStarterSet = new Set(starterIds.filter(Boolean));
  const selectedStarters = starterIds
    .map((playerId) => playersById.get(playerId))
    .filter((player): player is Player => player !== undefined);
  const selectedBench = benchIds
    .map((playerId) => playersById.get(playerId))
    .filter((player): player is Player => player !== undefined);
  const reservePlayers = sortByOverall(players).filter(
    (player) => !selectedStarterSet.has(player.id),
  );
  const chemistry = calculateChemistry(selectedStarters, formationSlots);
  const chemistryById = new Map(chemistry.map((item) => [item.playerId, item]));
  const effectiveTeamOverall =
    chemistry.length > 0
      ? Math.round(
          chemistry.reduce(
            (sum, item) => sum + item.fit.effectiveOverall + item.chemistry,
            0,
          ) / chemistry.length,
        )
      : 0;
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

  function applyPlayerToSlot(playerId: string, index: number) {
    const player = playersById.get(playerId);
    const requiredSlot = formationSlots[index];

    if (!canPlaySlot(player, requiredSlot, currentRound)) {
      return;
    }

    setStarterIds((currentStarterIds) => {
      const nextStarterIds = [...currentStarterIds];
      const oldPlayerId = nextStarterIds[index];
      const previousIndex = nextStarterIds.indexOf(playerId);

      if (previousIndex >= 0) {
        nextStarterIds[previousIndex] = oldPlayerId;
      }

      nextStarterIds[index] = playerId;
      return nextStarterIds;
    });
    setBenchIds((currentBenchIds) =>
      currentBenchIds.filter((benchId) => benchId !== playerId),
    );
  }

  function moveStarterToBench(index: number) {
    const playerId = starterIds[index];

    if (!playerId) {
      return;
    }

    setBenchIds((currentBenchIds) => {
      if (currentBenchIds.includes(playerId) || currentBenchIds.length >= 5) {
        return currentBenchIds;
      }

      return [...currentBenchIds, playerId];
    });
    setStarterIds((currentStarterIds) => {
      const nextStarterIds = [...currentStarterIds];
      nextStarterIds[index] = "";
      return nextStarterIds;
    });
  }

  function handleDropOnSlot(index: number, rawPayload: string) {
    const payload = readDragPayload(rawPayload);

    if (!payload) {
      return;
    }

    if (payload.source === "player") {
      applyPlayerToSlot(payload.id, index);
      return;
    }

    const draggedPlayerId = starterIds[payload.index];
    const targetPlayerId = starterIds[index];
    const draggedPlayer = playersById.get(draggedPlayerId);
    const targetPlayer = playersById.get(targetPlayerId);
    const draggedFitsTarget = canPlaySlot(
      draggedPlayer,
      formationSlots[index],
      currentRound,
    );
    const targetFitsSource =
      !targetPlayer ||
      canPlaySlot(targetPlayer, formationSlots[payload.index], currentRound);

    if (!draggedFitsTarget || !targetFitsSource) {
      return;
    }

    setStarterIds((currentStarterIds) => {
      const nextStarterIds = [...currentStarterIds];
      nextStarterIds[index] = draggedPlayerId;
      nextStarterIds[payload.index] = targetPlayerId;
      return nextStarterIds;
    });
  }

  function handleDropOnBench(rawPayload: string) {
    const payload = readDragPayload(rawPayload);

    if (!payload) {
      return;
    }

    if (payload.source === "slot") {
      moveStarterToBench(payload.index);
      return;
    }

    setBenchIds((currentBenchIds) => {
      if (
        selectedStarterSet.has(payload.id) ||
        currentBenchIds.includes(payload.id) ||
        currentBenchIds.length >= 5
      ) {
        return currentBenchIds;
      }

      return [...currentBenchIds, payload.id];
    });
  }

  function removeFromBench(playerId: string) {
    setBenchIds((currentBenchIds) =>
      currentBenchIds.filter((benchId) => benchId !== playerId),
    );
  }

  return (
    <form action={formAction} className="grid gap-4">
      <fieldset disabled={pending || isLocked} className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <select
              name="formation"
              value={selectedFormation}
              onChange={(event) => handleFormationChange(event.target.value)}
              className="game-input w-[150px]"
            >
              {Object.keys(FORMATIONS).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <span className="status-pill">{selectedStarters.length}/11</span>
            <span className="status-pill">Bench {selectedBench.length}/5</span>
                <span className="status-pill">OVR {selectedAverage || "-"}</span>
                <span className="status-pill">EFF {effectiveTeamOverall || "-"}</span>
          </div>
          <button
            type="submit"
            disabled={pending || isLocked || selectedStarters.length !== 11 || !starterIds[0]}
            className="game-button-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Saving..." : "Save"}
          </button>
        </div>

        {formationSlots.map((_, index) => (
          <input
            key={`starter-hidden-${index}`}
            type="hidden"
            name={`starter_${index + 1}`}
            value={starterIds[index] ?? ""}
          />
        ))}
        {benchIds.map((playerId) => (
          <input key={`bench-hidden-${playerId}`} type="hidden" name="benchIds" value={playerId} />
        ))}

        <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-md border border-teal-300/25 bg-[#123f34] shadow-2xl shadow-black/30">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.04)_0_86px,rgba(0,0,0,0.06)_86px_172px)]" />
          <div className="absolute inset-6 rounded-md border-2 border-white/45" />
          <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/35" />
          <div className="absolute left-1/2 top-6 h-16 w-40 -translate-x-1/2 rounded-b-md border-x-2 border-b-2 border-white/35" />
          <div className="absolute bottom-6 left-1/2 h-16 w-40 -translate-x-1/2 rounded-t-md border-x-2 border-t-2 border-white/35" />

          <div className="relative z-10 grid min-h-[560px] grid-rows-[1fr_1fr_1fr_1fr] gap-2 p-6">
              {pitchLines.map((linePositions) => {
                const indexedSlots = formationSlots
                  .map((slot, index) => ({ slot, index }))
                  .filter((item) => (linePositions as readonly string[]).includes(item.slot));

                return (
                  <div
                    key={linePositions.join("-")}
                  className="flex min-w-0 flex-wrap items-center justify-center gap-3"
                >
                  {indexedSlots.map(({ slot, index }) => {
                    const selectedPlayer = playersById.get(starterIds[index] ?? "");
                    const chemistryItem = selectedPlayer
                      ? chemistryById.get(selectedPlayer.id)
                      : null;
                    const fit = selectedPlayer
                      ? getPositionFit(selectedPlayer, slot)
                      : null;
                    const hasPenalty = !!fit && fit.penaltyPercent > 0;

                    return (
                      <button
                        key={`${slot}-${index}`}
                        type="button"
                        draggable={!!selectedPlayer}
                        onDragStart={(event) => {
                          event.dataTransfer.setData(
                            "application/json",
                            JSON.stringify({ source: "slot", index }),
                          );
                        }}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault();
                          handleDropOnSlot(
                            index,
                            event.dataTransfer.getData("application/json"),
                          );
                        }}
                        className={`w-[112px] rounded-md border p-2 text-left shadow-xl shadow-black/35 transition hover:-translate-y-1 ${
                          selectedPlayer
                            ? "border-amber-200/80 bg-gradient-to-b from-amber-100 via-amber-300 to-yellow-600 text-slate-950"
                            : "border-white/25 bg-slate-950/55 text-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xl font-black leading-none">
                            {fit?.effectiveOverall ?? "--"}
                          </span>
                          <span className="rounded bg-slate-950/85 px-1.5 py-0.5 text-[0.62rem] font-black text-teal-200">
                            {slot}
                          </span>
                        </div>
                        {hasPenalty ? (
                          <p className="mt-1 text-[0.62rem] font-black text-rose-700">
                            v -{fit.penaltyPercent}%
                          </p>
                        ) : null}
                        <div className="mt-2 grid h-12 place-items-center rounded bg-slate-950/15 text-center text-[0.68rem] font-black uppercase leading-tight">
                          {cardName(selectedPlayer)}
                        </div>
                        {selectedPlayer ? (
                          <div className="mt-1 flex items-center justify-center gap-1">
                            {[0, 1, 2].map((dot) => (
                              <span
                                key={dot}
                                className={`h-1.5 w-1.5 rounded-full ${
                                  dot < (chemistryItem?.chemistry ?? 0)
                                    ? "bg-teal-700"
                                    : "bg-slate-950/30"
                                }`}
                              />
                            ))}
                          </div>
                        ) : (
                          <p className="mt-1 text-center text-[0.62rem] font-black text-teal-200">
                            DROP
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        <div
          className="rounded-md border border-white/10 bg-slate-950/70 p-4"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            handleDropOnBench(event.dataTransfer.getData("application/json"));
          }}
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-black">Bench / reserves</h3>
            <span className="status-pill">Drag to pitch</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {reservePlayers.map((player) => {
              const selected = benchIds.includes(player.id);
              const available = isAvailableForMatch(player, currentRound);

              return (
                <button
                  key={player.id}
                  type="button"
                  draggable={available}
                  onDragStart={(event) => {
                    event.dataTransfer.setData(
                      "application/json",
                      JSON.stringify({ source: "player", id: player.id }),
                    );
                  }}
                  onClick={() => {
                    if (selected) {
                      removeFromBench(player.id);
                    } else {
                      handleDropOnBench(JSON.stringify({ source: "player", id: player.id }));
                    }
                  }}
                  className={`min-w-[132px] rounded-md border p-2 text-left text-slate-950 transition ${
                    selected
                      ? "border-teal-200 bg-gradient-to-b from-slate-50 to-teal-200"
                      : "border-slate-300/50 bg-gradient-to-b from-slate-100 to-slate-400"
                  } ${available ? "" : "opacity-45"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xl font-black leading-none">
                      {player.overall}
                    </span>
                    <span className="rounded bg-slate-950/85 px-1.5 py-0.5 text-[0.62rem] font-black text-teal-200">
                      {normalizePosition(player.position)}
                    </span>
                  </div>
                  <p className="mt-3 truncate text-xs font-black uppercase">
                    {cardName(player)}
                  </p>
                  <p className="mt-1 text-[0.68rem] font-bold text-slate-700">
                    {selected ? "BENCH" : "RESERVE"} - FIT {player.fitness}%
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </fieldset>

      {isLocked ? (
        <p className="rounded-md border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
          Lineup changes are locked 30 minutes before kickoff.
        </p>
      ) : null}
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
