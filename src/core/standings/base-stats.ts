import type { NormalizedDataPack, TeamStats } from "@core/types";

function createEmptyTeamStats(teamId: string, fifaRanking: number): TeamStats {
  return {
    id: teamId,
    points: 0,
    goalDiff: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    fifaRanking,
    headToHead: {},
  };
}

function ensureHeadToHead(stats: TeamStats, opponentTeamId: string) {
  if (!stats.headToHead[opponentTeamId]) {
    stats.headToHead[opponentTeamId] = { points: 0, goalDiff: 0, goalsFor: 0 };
  }
  return stats.headToHead[opponentTeamId];
}

function applyMatch(
  homeStats: TeamStats,
  awayStats: TeamStats,
  homeScore: number,
  awayScore: number
) {
  homeStats.goalsFor += homeScore;
  homeStats.goalsAgainst += awayScore;
  homeStats.goalDiff += homeScore - awayScore;

  awayStats.goalsFor += awayScore;
  awayStats.goalsAgainst += homeScore;
  awayStats.goalDiff += awayScore - homeScore;

  const homeH2H = ensureHeadToHead(homeStats, awayStats.id);
  const awayH2H = ensureHeadToHead(awayStats, homeStats.id);

  homeH2H.goalsFor += homeScore;
  homeH2H.goalDiff += homeScore - awayScore;
  awayH2H.goalsFor += awayScore;
  awayH2H.goalDiff += awayScore - homeScore;

  if (homeScore > awayScore) {
    homeStats.wins += 1;
    awayStats.losses += 1;
    homeStats.points += 3;
    homeH2H.points += 3;
    return;
  }

  if (homeScore < awayScore) {
    awayStats.wins += 1;
    homeStats.losses += 1;
    awayStats.points += 3;
    awayH2H.points += 3;
    return;
  }

  homeStats.draws += 1;
  awayStats.draws += 1;
  homeStats.points += 1;
  awayStats.points += 1;
  homeH2H.points += 1;
  awayH2H.points += 1;
}

export function computeGroupBaseStats(
  dataPack: NormalizedDataPack,
  groupId: string,
  confirmedResults: Record<string, { home: number; away: number }>
): TeamStats[] {
  const group = dataPack.groups.find((entry) => entry.groupId === groupId);
  if (!group) throw new Error(`Unknown group: ${groupId}`);

  const statsMap = new Map<string, TeamStats>();
  for (const teamId of group.teams) {
    const team = dataPack.teams[teamId];
    statsMap.set(teamId, createEmptyTeamStats(teamId, team.fifaRanking));
  }

  const fixtures = dataPack.fixtures.filter((fixture) => fixture.groupId === groupId);
  for (const fixture of fixtures) {
    const result = confirmedResults[fixture.matchId];
    if (!result) continue;

    const homeStats = statsMap.get(fixture.homeTeamId);
    const awayStats = statsMap.get(fixture.awayTeamId);
    if (!homeStats || !awayStats) continue;

    applyMatch(homeStats, awayStats, result.home, result.away);
  }

  return [...statsMap.values()];
}
