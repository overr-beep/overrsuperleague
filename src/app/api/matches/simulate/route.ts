import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Club, Match, Player } from "@/types/database";
import { normalizePosition } from "@/utils/positions";

type SimulationTeam = {
  club: Club;
  players: Player[];
};

function attackingPlayers(players: Player[]) {
  return players.filter((player) =>
    ["POM", "NAP"].includes(normalizePosition(player.position)),
  );
}

function defensivePlayers(players: Player[]) {
  return players.filter((player) =>
    ["BR", "OBR"].includes(normalizePosition(player.position)),
  );
}

function sumAttack(players: Player[]) {
  return attackingPlayers(players).reduce(
    (sum, player) => sum + player.attack_rating,
    0,
  );
}

function sumDefense(players: Player[]) {
  return defensivePlayers(players).reduce(
    (sum, player) => sum + player.defense_rating,
    0,
  );
}

function pickScorer(players: Player[]) {
  const pool = attackingPlayers(players);
  const candidates = pool.length > 0 ? pool : players;
  const index = Math.floor(Math.random() * candidates.length);

  return candidates[index];
}

function simulateMatch(home: SimulationTeam, away: SimulationTeam) {
  const homeAttack = sumAttack(home.players) + 8;
  const homeDefense = sumDefense(home.players) + 4;
  const awayAttack = sumAttack(away.players);
  const awayDefense = sumDefense(away.players);
  let homeScore = 0;
  let awayScore = 0;
  const events: string[] = [];

  for (let minute = 12; minute <= 87; minute += 15) {
    const homeChancePower = homeAttack / Math.max(homeAttack + awayDefense, 1);
    const awayChancePower = awayAttack / Math.max(awayAttack + homeDefense, 1);
    const homeGetsChance = Math.random() < 0.52;

    if (homeGetsChance) {
      const goalChance = 0.12 + homeChancePower * 0.24;

      if (Math.random() < goalChance) {
        homeScore += 1;
        const scorer = pickScorer(home.players);
        events.push(`${minute}' ${home.club.short_name}: ${scorer.first_name} ${scorer.last_name}`);
      }
    } else {
      const goalChance = 0.10 + awayChancePower * 0.24;

      if (Math.random() < goalChance) {
        awayScore += 1;
        const scorer = pickScorer(away.players);
        events.push(`${minute}' ${away.club.short_name}: ${scorer.first_name} ${scorer.last_name}`);
      }
    }
  }

  const report =
    events.length > 0
      ? events.join("\n")
      : "A tight tactical match with no goals from the six best chances.";

  return {
    homeScore,
    awayScore,
    homeAttack,
    homeDefense,
    awayAttack,
    awayDefense,
    report,
  };
}

function leagueDelta(goalsFor: number, goalsAgainst: number) {
  if (goalsFor > goalsAgainst) {
    return { points: 3, wins: 1, draws: 0, losses: 0 };
  }

  if (goalsFor === goalsAgainst) {
    return { points: 1, wins: 0, draws: 1, losses: 0 };
  }

  return { points: 0, wins: 0, draws: 0, losses: 1 };
}

async function getLineupPlayers(
  supabase: SupabaseClient,
  clubId: string,
) {
  const { data: lineupRows } = await supabase
    .from("lineups")
    .select("player_id")
    .eq("club_id", clubId)
    .order("slot", { ascending: true });
  const lineupIds = (lineupRows ?? []).map((row) => row.player_id);

  if (lineupIds.length === 11) {
    const { data } = await supabase
      .from("players")
      .select("*")
      .in("id", lineupIds);

    return (data ?? []) as Player[];
  }

  const { data } = await supabase
    .from("players")
    .select("*")
    .eq("club_id", clubId)
    .order("overall", { ascending: false })
    .limit(11);

  return (data ?? []) as Player[];
}

async function updateClubAfterMatch(
  supabase: SupabaseClient,
  club: Club,
  goalsFor: number,
  goalsAgainst: number,
  attack: number,
  defense: number,
) {
  const delta = leagueDelta(goalsFor, goalsAgainst);

  await supabase
    .from("clubs")
    .update({
      league_points: club.league_points + delta.points,
      wins: club.wins + delta.wins,
      draws: club.draws + delta.draws,
      losses: club.losses + delta.losses,
      goals_for: club.goals_for + goalsFor,
      goals_against: club.goals_against + goalsAgainst,
      formation_attack: attack,
      formation_defense: defense,
    })
    .eq("id", club.id);
}

async function getSimulationClient(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (
    cronSecret &&
    authHeader === `Bearer ${cronSecret}` &&
    createAdminSupabaseClient()
  ) {
    return createAdminSupabaseClient();
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return null;
  }

  return supabase;
}

async function simulateNextMatch(request: NextRequest) {
  const supabase = await getSimulationClient(request);

  if (!supabase) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { data: state } = await supabase
    .from("league_state")
    .select("current_round")
    .eq("id", 1)
    .maybeSingle();
  const currentRound = state?.current_round ?? 1;

  const { data: matchData, error: matchError } = await supabase
    .from("matches")
    .select("*")
    .eq("round_number", currentRound)
    .eq("status", "scheduled")
    .order("scheduled_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (matchError) {
    return NextResponse.json({ error: matchError.message }, { status: 500 });
  }

  if (!matchData) {
    await supabase
      .from("league_state")
      .update({
        current_round: currentRound + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    return NextResponse.json({ message: "No scheduled match in current round. Round advanced." });
  }

  const match = matchData as Match;
  const { data: clubs } = await supabase
    .from("clubs")
    .select("*")
    .in("id", [match.home_club_id, match.away_club_id]);
  const homeClub = (clubs ?? []).find((club) => club.id === match.home_club_id) as
    | Club
    | undefined;
  const awayClub = (clubs ?? []).find((club) => club.id === match.away_club_id) as
    | Club
    | undefined;

  if (!homeClub || !awayClub) {
    return NextResponse.json({ error: "Match clubs not found." }, { status: 500 });
  }

  const [homePlayers, awayPlayers] = await Promise.all([
    getLineupPlayers(supabase, homeClub.id),
    getLineupPlayers(supabase, awayClub.id),
  ]);

  if (homePlayers.length < 11 || awayPlayers.length < 11) {
    return NextResponse.json(
      { error: "Both clubs need at least 11 players or a saved lineup." },
      { status: 400 },
    );
  }

  const result = simulateMatch(
    { club: homeClub, players: homePlayers },
    { club: awayClub, players: awayPlayers },
  );

  await supabase
    .from("matches")
    .update({
      status: "played",
      home_score: result.homeScore,
      away_score: result.awayScore,
      report: result.report,
    })
    .eq("id", match.id);

  await Promise.all([
    updateClubAfterMatch(
      supabase,
      homeClub,
      result.homeScore,
      result.awayScore,
      result.homeAttack,
      result.homeDefense,
    ),
    updateClubAfterMatch(
      supabase,
      awayClub,
      result.awayScore,
      result.homeScore,
      result.awayAttack,
      result.awayDefense,
    ),
  ]);

  const { count } = await supabase
    .from("matches")
    .select("id", { count: "exact", head: true })
    .eq("round_number", currentRound)
    .eq("status", "scheduled");

  if ((count ?? 0) === 0) {
    await supabase
      .from("league_state")
      .update({
        current_round: currentRound + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
  }

  return NextResponse.json({
    match_id: match.id,
    home: homeClub.short_name,
    away: awayClub.short_name,
    home_score: result.homeScore,
    away_score: result.awayScore,
    report: result.report,
  });
}

export async function GET(request: NextRequest) {
  return simulateNextMatch(request);
}

export async function POST(request: NextRequest) {
  return simulateNextMatch(request);
}
