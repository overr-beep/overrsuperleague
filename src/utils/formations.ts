import type { Player, PlayerPosition } from "@/types/database";
import { normalizePosition } from "@/utils/positions";

export const FORMATIONS = {
  "4-4-2": { OBR: 4, POM: 4, NAP: 2 },
  "4-3-3": { OBR: 4, POM: 3, NAP: 3 },
  "3-5-2": { OBR: 3, POM: 5, NAP: 2 },
} as const;

export type FormationName = keyof typeof FORMATIONS;

export function isFormationName(value: string): value is FormationName {
  return value in FORMATIONS;
}

export function getFormationSlots(formation: string): PlayerPosition[] {
  const shape = isFormationName(formation) ? FORMATIONS[formation] : FORMATIONS["4-4-2"];

  return [
    "BR",
    ...Array.from({ length: shape.OBR }, () => "OBR" as const),
    ...Array.from({ length: shape.POM }, () => "POM" as const),
    ...Array.from({ length: shape.NAP }, () => "NAP" as const),
  ];
}

export function isAvailableForMatch(player: Player, currentRound: number, now = new Date()) {
  const suspended = player.suspended_until_round !== null && player.suspended_until_round >= currentRound;
  const injured = player.injured_until !== null && new Date(player.injured_until) > now;

  return !suspended && !injured;
}

export function validateLineupShape(
  players: Player[],
  requiredSlots: PlayerPosition[],
  currentRound: number,
) {
  if (players.length !== 11) {
    return "Lineup must contain exactly 11 players.";
  }

  const now = new Date();

  for (const [index, player] of players.entries()) {
    if (!isAvailableForMatch(player, currentRound, now)) {
      return `${player.first_name} ${player.last_name} is suspended or injured.`;
    }

    const expected = requiredSlots[index];
    const actual = normalizePosition(player.position);

    if (actual !== expected) {
      return `${player.first_name} ${player.last_name} cannot play as ${expected}.`;
    }
  }

  return null;
}
