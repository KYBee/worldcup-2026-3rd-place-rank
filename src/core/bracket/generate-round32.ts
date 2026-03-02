import { pickTopEightThirdPlace, type ThirdPlaceEntry } from "@core/standings/third-place";
import type { GroupRanking } from "@core/standings/group-ranking";
import { loadRoundOf32Config, type RoundOf32Participant } from "@core/bracket/round32-config";

export type ResolvedTeam = {
  teamId: string;
  source: string;
};

export type RoundOf32Match = {
  slotId: string;
  home: ResolvedTeam | null;
  away: ResolvedTeam | null;
};

function buildGroupLookup(groupRankings: GroupRanking[]): Map<string, GroupRanking> {
  return new Map(groupRankings.map((group) => [group.groupId, group]));
}

function resolveFromGroup(
  participant: RoundOf32Participant,
  groups: Map<string, GroupRanking>
): ResolvedTeam | null {
  if (participant.type !== "winner" && participant.type !== "runnerUp") return null;

  const group = groups.get(participant.groupId);
  if (!group) return null;

  const index = participant.type === "winner" ? 0 : 1;
  const team = group.teams[index];
  if (!team) return null;

  return {
    teamId: team.id,
    source: `${participant.type === "winner" ? "W" : "R"}${participant.groupId}`,
  };
}

function resolveThirdBest(
  participant: RoundOf32Participant,
  thirdPlaces: ThirdPlaceEntry[],
  usedTeamIds: Set<string>
): ResolvedTeam | null {
  if (participant.type !== "thirdBest") return null;

  const picked = thirdPlaces.find(
    (entry) => participant.groupsAllowed.includes(entry.groupId) && !usedTeamIds.has(entry.teamId)
  );

  if (!picked) return null;
  usedTeamIds.add(picked.teamId);
  return {
    teamId: picked.teamId,
    source: `3${picked.groupId}`,
  };
}

function resolveParticipant(
  participant: RoundOf32Participant,
  groups: Map<string, GroupRanking>,
  thirdPlaces: ThirdPlaceEntry[],
  usedThirdIds: Set<string>
): ResolvedTeam | null {
  const groupTeam = resolveFromGroup(participant, groups);
  if (groupTeam) return groupTeam;
  return resolveThirdBest(participant, thirdPlaces, usedThirdIds);
}

export function generateRoundOf32(groupRankings: GroupRanking[]): RoundOf32Match[] {
  const groups = buildGroupLookup(groupRankings);
  const thirdPlaces = pickTopEightThirdPlace(groupRankings);
  const usedThirdIds = new Set<string>();

  return loadRoundOf32Config().map((slot) => ({
    slotId: slot.slotId,
    home: resolveParticipant(slot.home, groups, thirdPlaces, usedThirdIds),
    away: resolveParticipant(slot.away, groups, thirdPlaces, usedThirdIds),
  }));
}
