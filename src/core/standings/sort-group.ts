import { compareHeadToHead } from "@core/standings/head-to-head";
import type { TeamStats } from "@core/types";

export function compareGroupTeams(a: TeamStats, b: TeamStats): number {
  if (a.points !== b.points) return b.points - a.points;

  const h2h = compareHeadToHead(a, b);
  if (h2h !== null) return h2h;

  if (a.goalDiff !== b.goalDiff) return b.goalDiff - a.goalDiff;
  if (a.goalsFor !== b.goalsFor) return b.goalsFor - a.goalsFor;

  return a.fifaRanking - b.fifaRanking;
}

export function sortGroupTeams(teams: TeamStats[]): TeamStats[] {
  return [...teams].sort(compareGroupTeams);
}
