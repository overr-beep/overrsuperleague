import type { Player } from "@/types/database";

export type StarterPlayerInput = Omit<
  Player,
  | "id"
  | "club_id"
  | "created_at"
  | "attack_rating"
  | "defense_rating"
  | "fitness"
  | "injured_until"
  | "nominal_position"
  | "nationality"
  | "pac"
  | "sho"
  | "pas"
  | "dri"
  | "def"
  | "phy"
  | "div"
  | "han"
  | "kic"
  | "ref"
  | "spd"
  | "pos"
  | "price"
  | "suspended_until_round"
>;

export const starterSquad: StarterPlayerInput[] = [
  {
    first_name: "Marco",
    last_name: "Vega",
    position: "GK",
    age: 28,
    overall: 72,
    value: 8500000,
    wage: 38000,
  },
  {
    first_name: "Tariq",
    last_name: "Bennani",
    position: "RB",
    age: 24,
    overall: 70,
    value: 6500000,
    wage: 28000,
  },
  {
    first_name: "Jonas",
    last_name: "Keller",
    position: "CB",
    age: 29,
    overall: 73,
    value: 9000000,
    wage: 41000,
  },
  {
    first_name: "Diego",
    last_name: "Rojas",
    position: "CB",
    age: 25,
    overall: 71,
    value: 7200000,
    wage: 32000,
  },
  {
    first_name: "Niko",
    last_name: "Salonen",
    position: "LB",
    age: 22,
    overall: 69,
    value: 5800000,
    wage: 24000,
  },
  {
    first_name: "Emil",
    last_name: "Hansen",
    position: "CDM",
    age: 27,
    overall: 74,
    value: 11000000,
    wage: 46000,
  },
  {
    first_name: "Rafael",
    last_name: "Mendes",
    position: "CM",
    age: 23,
    overall: 73,
    value: 12500000,
    wage: 42000,
  },
  {
    first_name: "Yuki",
    last_name: "Tanaka",
    position: "CAM",
    age: 21,
    overall: 72,
    value: 13500000,
    wage: 39000,
  },
  {
    first_name: "Samuel",
    last_name: "Okafor",
    position: "RW",
    age: 24,
    overall: 75,
    value: 16000000,
    wage: 52000,
  },
  {
    first_name: "Lucas",
    last_name: "Moreau",
    position: "LW",
    age: 26,
    overall: 74,
    value: 14500000,
    wage: 50000,
  },
  {
    first_name: "Mateo",
    last_name: "Ilic",
    position: "ST",
    age: 25,
    overall: 76,
    value: 19000000,
    wage: 61000,
  },
  {
    first_name: "Oliver",
    last_name: "Reed",
    position: "GK",
    age: 20,
    overall: 64,
    value: 1900000,
    wage: 11000,
  },
  {
    first_name: "Aron",
    last_name: "Nagy",
    position: "CB",
    age: 19,
    overall: 66,
    value: 2800000,
    wage: 14000,
  },
  {
    first_name: "Milan",
    last_name: "Petrovic",
    position: "CM",
    age: 22,
    overall: 68,
    value: 4200000,
    wage: 19000,
  },
  {
    first_name: "Andre",
    last_name: "Bassey",
    position: "ST",
    age: 20,
    overall: 69,
    value: 6200000,
    wage: 22000,
  },
];

export function buildStarterSquadRows(clubId: string) {
  const nations = ["ES", "MA", "DE", "CO", "FI", "DK", "BR", "JP", "NG", "FR", "HR", "EN", "HU", "RS"];

  return starterSquad.map((player, index) => ({
    ...player,
    club_id: clubId,
    position: player.position === "GK" ? "BR" : player.position,
    nominal_position: player.position === "GK" ? "BR" : player.position,
    nationality: nations[index % nations.length],
    attack_rating:
      ["ST", "LW", "RW"].includes(player.position)
        ? player.overall
        : Math.max(player.overall - 12, 1),
    defense_rating:
      ["GK", "BR", "CB", "LB", "RB"].includes(player.position)
        ? player.overall
        : Math.max(player.overall - 14, 1),
    pac: Math.min(player.overall + (["LW", "RW", "ST"].includes(player.position) ? 7 : 0), 99),
    sho: Math.min(player.overall + (player.position === "ST" ? 6 : -4), 99),
    pas: Math.min(player.overall + (["CM", "CDM", "CAM"].includes(player.position) ? 5 : -2), 99),
    dri: Math.min(player.overall + (["LW", "RW", "CAM"].includes(player.position) ? 6 : -1), 99),
    def: Math.min(player.overall + (["CB", "LB", "RB", "CDM"].includes(player.position) ? 4 : -12), 99),
    phy: Math.min(player.overall + (["CB", "ST", "CDM"].includes(player.position) ? 4 : -2), 99),
    div: player.position === "GK" ? Math.min(player.overall + 3, 99) : 35,
    han: player.position === "GK" ? Math.min(player.overall + 1, 99) : 35,
    kic: player.position === "GK" ? Math.max(player.overall - 2, 1) : 35,
    ref: player.position === "GK" ? Math.min(player.overall + 4, 99) : 35,
    spd: player.position === "GK" ? Math.max(player.overall - 6, 1) : 35,
    pos: player.position === "GK" ? Math.min(player.overall + 2, 99) : 35,
    fitness: 100,
    injured_until: null,
    price: player.value,
    suspended_until_round: null,
  }));
}
