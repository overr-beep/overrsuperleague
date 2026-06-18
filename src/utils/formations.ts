import type { Player, PlayerPosition } from "@/types/database";

export const FORMATIONS = {
  "4-4-2": ["BR", "LB", "CB", "CB", "RB", "LM", "CM", "CM", "RM", "ST", "ST"],
  "4-3-3": ["BR", "LB", "CB", "CB", "RB", "CM", "CDM", "CM", "LW", "ST", "RW"],
  "3-5-2": ["BR", "CB", "CB", "CB", "LM", "CM", "CDM", "CM", "RM", "ST", "ST"],
} as const;

export type FormationName = keyof typeof FORMATIONS;
export type PositionPenaltyZone =
  | "ideal"
  | "close"
  | "formation"
  | "mismatch"
  | "absolute";

export type PositionFit = {
  effectiveOverall: number;
  penaltyPercent: number;
  zone: PositionPenaltyZone;
};

export type ChemistryResult = {
  playerId: string;
  chemistry: number;
  fit: PositionFit;
};

const defenders = new Set(["LB", "RB", "CB"]);
const wideMidAttack = new Set(["LM", "RM", "LW", "RW"]);
const attackers = new Set(["ST", "LW", "RW"]);
const centralMidfield = new Set(["CM", "CDM", "CAM"]);

export function isFormationName(value: string): value is FormationName {
  return value in FORMATIONS;
}

export function getFormationSlots(formation: string): PlayerPosition[] {
  return [...(isFormationName(formation) ? FORMATIONS[formation] : FORMATIONS["4-4-2"])];
}

export function getNominalPosition(player: Player): string {
  const nominal = player.nominal_position ?? player.position;

  if (nominal === "GK") return "BR";
  if (nominal === "OBR") return "CB";
  if (nominal === "POM") return "CM";
  if (nominal === "NAP") return "ST";

  return nominal;
}

export function getPositionFit(player: Player, slotPosition: string): PositionFit {
  const nominal = getNominalPosition(player);
  let penaltyPercent = 75;
  let zone: PositionPenaltyZone = "mismatch";

  if (nominal === slotPosition) {
    penaltyPercent = 0;
    zone = "ideal";
  } else if (
    (nominal === "LB" && slotPosition === "RB") ||
    (nominal === "RB" && slotPosition === "LB") ||
    (nominal === "LM" && slotPosition === "RM") ||
    (nominal === "RM" && slotPosition === "LM") ||
    (nominal === "LW" && slotPosition === "RW") ||
    (nominal === "RW" && slotPosition === "LW") ||
    (centralMidfield.has(nominal) && centralMidfield.has(slotPosition))
  ) {
    penaltyPercent = 15;
    zone = "close";
  } else if (
    (nominal === "CB" && ["LB", "RB"].includes(slotPosition)) ||
    (defenders.has(nominal) && defenders.has(slotPosition)) ||
    (wideMidAttack.has(nominal) && centralMidfield.has(slotPosition)) ||
    (wideMidAttack.has(nominal) && slotPosition === "ST")
  ) {
    penaltyPercent = 40;
    zone = "formation";
  } else if (
    (defenders.has(nominal) && attackers.has(slotPosition)) ||
    (nominal === "ST" && defenders.has(slotPosition))
  ) {
    penaltyPercent = 75;
    zone = "mismatch";
  }

  if (
    (nominal === "BR" && slotPosition !== "BR") ||
    (nominal !== "BR" && slotPosition === "BR")
  ) {
    penaltyPercent = 95;
    zone = "absolute";
  }

  return {
    effectiveOverall: Math.max(1, Math.round(player.overall * (1 - penaltyPercent / 100))),
    penaltyPercent,
    zone,
  };
}

export function isAvailableForMatch(player: Player, currentRound: number, now = new Date()) {
  const suspended =
    player.suspended_until_round !== null &&
    player.suspended_until_round >= currentRound;
  const injured = player.injured_until !== null && new Date(player.injured_until) > now;

  return !suspended && !injured;
}

export function calculateChemistry(
  players: Player[],
  slotPositions: string[],
): ChemistryResult[] {
  const countryCounts = new Map<string, number>();
  const fits = players.map((player, index) =>
    getPositionFit(player, slotPositions[index] ?? ""),
  );

  players.forEach((player, index) => {
    if (fits[index].penaltyPercent >= 75) return;
    countryCounts.set(player.nationality, (countryCounts.get(player.nationality) ?? 0) + 1);
  });

  return players.map((player, index) => {
    const fit = fits[index];

    if (fit.penaltyPercent >= 75) {
      return { playerId: player.id, chemistry: 0, fit };
    }

    const countryCount = countryCounts.get(player.nationality) ?? 0;
    const countryChemistry = countryCount >= 5 ? 2 : countryCount >= 2 ? 1 : 0;
    const positionChemistry = fit.penaltyPercent === 0 ? 1 : 0;

    return {
      playerId: player.id,
      chemistry: Math.min(3, countryChemistry + positionChemistry),
      fit,
    };
  });
}

export function validateLineupShape(
  players: Player[],
  requiredSlots: PlayerPosition[],
  currentRound: number,
) {
  if (players.length !== 11) {
    return "Lineup must contain exactly 11 players.";
  }

  for (const player of players) {
    if (!isAvailableForMatch(player, currentRound)) {
      return `${player.first_name} ${player.last_name} is suspended or injured.`;
    }
  }

  if (!players[0]) {
    return "Goalkeeper slot must be filled.";
  }

  if (requiredSlots[0] !== "BR") {
    return "Formation goalkeeper slot is invalid.";
  }

  return null;
}
