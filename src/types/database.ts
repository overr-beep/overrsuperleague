export type ProfileRole = "admin" | "manager";
export type MatchStatus = "scheduled" | "played" | "postponed";
export type TransferStatus = "rumor" | "pending" | "completed" | "cancelled";
export type PlayerPosition = "BR" | "OBR" | "POM" | "NAP" | string;

export type Profile = {
  id: string;
  display_name: string | null;
  role: ProfileRole;
  created_at: string;
};

export type Club = {
  id: string;
  owner_id: string | null;
  name: string;
  short_name: string;
  city: string | null;
  budget: number;
  reputation: number;
  league_points: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  formation_attack: number;
  formation_defense: number;
  created_at: string;
};

export type Player = {
  id: string;
  club_id: string | null;
  first_name: string;
  last_name: string;
  position: PlayerPosition;
  age: number;
  overall: number;
  attack_rating: number;
  defense_rating: number;
  value: number;
  price: number;
  wage: number;
  created_at: string;
};

export type Match = {
  id: string;
  home_club_id: string;
  away_club_id: string;
  scheduled_at: string;
  home_score: number | null;
  away_score: number | null;
  status: MatchStatus;
  round_number: number;
  report: string | null;
  created_at: string;
};

export type Transfer = {
  id: string;
  player_id: string;
  from_club_id: string | null;
  to_club_id: string | null;
  fee: number;
  status: TransferStatus;
  created_at: string;
};

export type Lineup = {
  id: string;
  club_id: string;
  player_id: string;
  slot: number;
  created_at: string;
};

export type LeagueState = {
  id: number;
  current_round: number;
  updated_at: string;
};
