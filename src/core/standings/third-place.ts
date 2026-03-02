import type { TeamStats } from "@core/types";
import type { GroupRanking } from "@core/standings/group-ranking";

export type ThirdPlaceEntry = {
  groupId: string;
  teamId: string;
  points: number;
  goalDiff: number;
  goalsFor: number;
  fifaRanking: number;
};

function compareThirdPlace(a: ThirdPlaceEntry, b: ThirdPlaceEntry): number {
  if (a.points !== b.points) return b.points - a.points;
  if (a.goalDiff !== b.goalDiff) return b.goalDiff - a.goalDiff;
  if (a.goalsFor !== b.goalsFor) return b.goalsFor - a.goalsFor;
  return a.fifaRanking - b.fifaRanking;
}

function toThirdPlaceEntry(groupId: string, team: TeamStats): ThirdPlaceEntry {
  return {
    groupId,
    teamId: team.id,
    points: team.points,
    goalDiff: team.goalDiff,
    goalsFor: team.goalsFor,
    fifaRanking: team.fifaRanking,
  };
}

export function rankThirdPlaceTeams(groupRankings: GroupRanking[]): ThirdPlaceEntry[] {
  const thirdPlaceEntries = groupRankings
    .map((group) => {
      const team = group.teams[2];
      return team ? toThirdPlaceEntry(group.groupId, team) : null;
    })
    .filter((entry): entry is ThirdPlaceEntry => entry !== null);

  return thirdPlaceEntries.sort(compareThirdPlace);
}

export function pickTopEightThirdPlace(groupRankings: GroupRanking[]): ThirdPlaceEntry[] {
  return rankThirdPlaceTeams(groupRankings).slice(0, 8);
}
