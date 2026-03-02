import type { NormalizedDataPack } from "@core/types";

export type DataPackValidationResult = {
  ok: boolean;
  errors: string[];
};

export function validateNormalizedDataPack(dataPack: NormalizedDataPack): DataPackValidationResult {
  const errors: string[] = [];
  const { teams, groups, fixtures } = dataPack;

  if (groups.length !== 12) {
    errors.push(`Expected 12 groups, received ${groups.length}`);
  }

  if (fixtures.length !== 72) {
    errors.push(`Expected 72 fixtures, received ${fixtures.length}`);
  }

  const teamIds = new Set(Object.keys(teams));
  const seenMatchIds = new Set<string>();
  const groupIdSet = new Set(groups.map((group) => group.groupId));

  for (const group of groups) {
    if (group.teams.length !== 4) {
      errors.push(`Group ${group.groupId} must have 4 teams, received ${group.teams.length}`);
    }

    if (new Set(group.teams).size !== group.teams.length) {
      errors.push(`Group ${group.groupId} contains duplicated team IDs`);
    }

    for (const teamId of group.teams) {
      if (!teamIds.has(teamId)) {
        errors.push(`Group ${group.groupId} references unknown team "${teamId}"`);
      }
    }
  }

  const fixtureCountByGroup = new Map<string, number>();
  for (const fixture of fixtures) {
    if (seenMatchIds.has(fixture.matchId)) {
      errors.push(`Duplicate matchId detected: ${fixture.matchId}`);
    } else {
      seenMatchIds.add(fixture.matchId);
    }

    if (!groupIdSet.has(fixture.groupId)) {
      errors.push(`Fixture ${fixture.matchId} references unknown group "${fixture.groupId}"`);
      continue;
    }

    const group = groups.find((entry) => entry.groupId === fixture.groupId);
    if (!group) continue;

    if (!group.teams.includes(fixture.homeTeamId)) {
      errors.push(
        `Fixture ${fixture.matchId} home team "${fixture.homeTeamId}" is not in group ${fixture.groupId}`
      );
    }

    if (!group.teams.includes(fixture.awayTeamId)) {
      errors.push(
        `Fixture ${fixture.matchId} away team "${fixture.awayTeamId}" is not in group ${fixture.groupId}`
      );
    }

    fixtureCountByGroup.set(fixture.groupId, (fixtureCountByGroup.get(fixture.groupId) ?? 0) + 1);
  }

  for (const group of groups) {
    const count = fixtureCountByGroup.get(group.groupId) ?? 0;
    if (count !== 6) {
      errors.push(`Group ${group.groupId} must have 6 fixtures, received ${count}`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}
