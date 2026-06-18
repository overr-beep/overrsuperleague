import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Club, Lineup, Match, Player } from "@/types/database";
import {
  calculateChemistry,
  getFormationSlots,
  isAvailableForMatch,
  validateLineupShape,
} from "@/utils/formations";

type SimulationTeam = {
  club: Club;
  players: Player[];
  slots: string[];
};

type DisciplineEvent = {
  player: Player;
  type: "red_card" | "injury";
};

function attackingPlayers(team: SimulationTeam) {
  return team.players.filter((_, index) =>
    ["LM", "RM", "LW", "RW", "CAM", "ST"].includes(team.slots[index]),
  );
}

function defensivePlayers(team: SimulationTeam) {
  return team.players.filter((_, index) =>
    ["BR", "LB", "RB", "CB", "CDM"].includes(team.slots[index]),
  );
}

function effectiveValues(team: SimulationTeam) {
  const chemistry = calculateChemistry(team.players, team.slots);

  return new Map(
    chemistry.map((item) => [
      item.playerId,
      Math.round((item.fit.effectiveOverall + item.chemistry) *  Math.max(
        team.players.find((player) => player.id === item.playerId)?.fitness ?? 100,
        30,
      ) / 100),
    ]),
  );
}

function sumAttack(team: SimulationTeam) {
  const values = effectiveValues(team);

  return attackingPlayers(team).reduce(
    (sum, player) => sum + (values.get(player.id) ?? player.overall),
    0,
  );
}

function sumDefense(team: SimulationTeam) {
  const values = effectiveValues(team);

  return defensivePlayers(team).reduce(
    (sum, player) => sum + (values.get(player.id) ?? player.overall),
    0,
  );
}

function pickScorer(team: SimulationTeam) {
  const pool = attackingPlayers(team);
  const candidates = pool.length > 0 ? pool : team.players;
  const index = Math.floor(Math.random() * candidates.length);

  return candidates[index];
}

function randomDisciplineEvent(players: Player[]): DisciplineEvent | null {
  const roll = Math.random();

  if (roll > 0.16) {
    return null;
  }

  const player = players[Math.floor(Math.random() * players.length)];

  return {
    player,
    type: roll < 0.06 ? "red_card" : "injury",
  };
}

function simulateMatch(home: SimulationTeam, away: SimulationTeam) {
  const homeAttack = sumAttack(home) + 8;
  const homeDefense = sumDefense(home) + 4;
  const awayAttack = sumAttack(away);
  const awayDefense = sumDefense(away);
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
        const scorer = pickScorer(home);
        events.push(`${minute}' ${home.club.short_name}: ${scorer.first_name} ${scorer.last_name}`);
      }
    } else {
      const goalChance = 0.10 + awayChancePower * 0.24;

      if (Math.random() < goalChance) {
        awayScore += 1;
        const scorer = pickScorer(away);
        events.push(`${minute}' ${away.club.short_name}: ${scorer.first_name} ${scorer.last_name}`);
      }
    }
  }

  const report =
    events.length > 0
      ? events.join("\n")
      : "A tight tactical match with no goals from the six best chances.";
  const disciplineEvents = [
    randomDisciplineEvent(home.players),
    randomDisciplineEvent(away.players),
  ].filter((event): event is DisciplineEvent => event !== null);

  return {
    homeScore,
    awayScore,
    homeAttack,
    homeDefense,
    awayAttack,
    awayDefense,
    report,
    disciplineEvents,
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
  formation: string,
  currentRound: number,
) {
  const { data: lineupRows } = await supabase
    .from("lineups")
    .select("*")
    .eq("club_id", clubId)
    .eq("role", "starter")
    .order("slot", { ascending: true });
  const lineupIds = ((lineupRows ?? []) as Lineup[]).map((row) => row.player_id);

  if (lineupIds.length === 11) {
    const { data } = await supabase
      .from("players")
      .select("*")
      .in("id", lineupIds);

    const playersById = new Map(
      ((data ?? []) as Player[]).map((player) => [player.id, player]),
    );
    const orderedPlayers = lineupIds
      .map((playerId) => playersById.get(playerId))
      .filter((player): player is Player => player !== undefined);
    const shapeError = validateLineupShape(
      orderedPlayers,
      getFormationSlots(formation),
      currentRound,
    );

    if (!shapeError) {
    return orderedPlayers;
    }
  }

  const { data } = await supabase
    .from("players")
    .select("*")
    .eq("club_id", clubId)
    .order("overall", { ascending: false });
  const availablePlayers = ((data ?? []) as Player[]).filter((player) =>
    isAvailableForMatch(player, currentRound),
  );
  const fallback: Player[] = [];
  const usedIds = new Set<string>();

  for (let index = 0; index < getFormationSlots(formation).length; index += 1) {
    const player = availablePlayers.find(
      (item) => !usedIds.has(item.id),
    );

    if (player) {
      fallback.push(player);
      usedIds.add(player.id);
    }
  }

  return fallback;
}

async function updateFitnessAndEvents(
  supabase: SupabaseClient,
  clubId: string,
  starters: Player[],
  currentRound: number,
  events: DisciplineEvent[],
) {
  const starterIds = new Set(starters.map((player) => player.id));
  const { data } = await supabase.from("players").select("*").eq("club_id", clubId);
  const squad = (data ?? []) as Player[];

  await Promise.all(
    squad.map((player) => {
      const nextFitness = starterIds.has(player.id)
        ? Math.max(player.fitness - 15, 20)
        : Math.min(player.fitness + 10, 100);

      return supabase
        .from("players")
        .update({ fitness: nextFitness })
        .eq("id", player.id);
    }),
  );

  await Promise.all(
    events.map((event) => {
      const update =
        event.type === "red_card"
          ? { suspended_until_round: currentRound + 1 }
          : {
              injured_until: new Date(
                Date.now() + 3 * 24 * 60 * 60 * 1000,
              ).toISOString(),
            };

      return supabase.from("players").update(update).eq("id", event.player.id);
    }),
  );
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
    getLineupPlayers(supabase, homeClub.id, homeClub.formation, currentRound),
    getLineupPlayers(supabase, awayClub.id, awayClub.formation, currentRound),
  ]);

  if (homePlayers.length < 11 || awayPlayers.length < 11) {
    return NextResponse.json(
      { error: "Both clubs need at least 11 players or a saved lineup." },
      { status: 400 },
    );
  }

  const result = simulateMatch(
    { club: homeClub, players: homePlayers, slots: getFormationSlots(homeClub.formation) },
    { club: awayClub, players: awayPlayers, slots: getFormationSlots(awayClub.formation) },
  );
  const eventReport = result.disciplineEvents
    .map((event) =>
      event.type === "red_card"
        ? `${event.player.first_name} ${event.player.last_name} received a red card and is suspended for the next round.`
        : `${event.player.first_name} ${event.player.last_name} picked up an injury and is out for 3 days.`,
    )
    .join("\n");
  const fullReport = eventReport
    ? `${result.report}\n${eventReport}`
    : result.report;

  await supabase
    .from("matches")
    .update({
      status: "played",
      home_score: result.homeScore,
      away_score: result.awayScore,
      report: fullReport,
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
    updateFitnessAndEvents(
      supabase,
      homeClub.id,
      homePlayers,
      currentRound,
      result.disciplineEvents.filter((event) =>
        homePlayers.some((player) => player.id === event.player.id),
      ),
    ),
    updateFitnessAndEvents(
      supabase,
      awayClub.id,
      awayPlayers,
      currentRound,
      result.disciplineEvents.filter((event) =>
        awayPlayers.some((player) => player.id === event.player.id),
      ),
    ),
  ]);

  await supabase.from("news_feed").insert({
    match_id: match.id,
    message: `${homeClub.short_name} ${result.homeScore}-${result.awayScore} ${awayClub.short_name}. Match report generated.`,
  });

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
    report: fullReport,
  });
}

export async function GET(request: NextRequest) {
  return simulateNextMatch(request);
}

export async function POST(request: NextRequest) {
  return simulateNextMatch(request);
}
