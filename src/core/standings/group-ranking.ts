import { computeGroupBaseStats } from "@core/standings/base-stats";
import { sortGroupTeams } from "@core/standings/sort-group";
import type { NormalizedDataPack, TeamStats } from "@core/types";

export type GroupRanking = {
  groupId: string;
  teams: TeamStats[];
};

export function computeGroupRanking(
  dataPack: NormalizedDataPack,
  groupId: string,
  confirmedResults: Record<string, { home: number; away: number }>
): GroupRanking {
  const baseStats = computeGroupBaseStats(dataPack, groupId, confirmedResults);
  return {
    groupId,
    teams: sortGroupTeams(baseStats),
  };
}

export function computeAllGroupRankings(
  dataPack: NormalizedDataPack,
  confirmedResults: Record<string, { home: number; away: number }>
): GroupRanking[] {
  return dataPack.groups.map((group) =>
    computeGroupRanking(dataPack, group.groupId, confirmedResults)
  );
}
