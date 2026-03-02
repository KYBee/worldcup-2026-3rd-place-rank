import { buildTeamNameIndex, resolveTeamId } from "@core/normalize";
import { isGroupData, isScheduleData, isTeamMap } from "@core/schemas";
import { validateNormalizedDataPack } from "@core/validate-data-pack";
import type {
  GroupData,
  NormalizedDataPack,
  NormalizedFixture,
  NormalizedGroupEntry,
  ScheduleData,
  TeamMap,
} from "@core/types";

type RawDataPack = {
  teamData: unknown;
  groupData: unknown;
  scheduleData: unknown;
};

function assertTeamMap(teamData: unknown): TeamMap {
  if (!isTeamMap(teamData)) throw new Error("Invalid team.json schema");
  return teamData;
}

function assertGroupData(groupData: unknown): GroupData {
  if (!isGroupData(groupData)) throw new Error("Invalid group.json schema");
  return groupData;
}

function assertScheduleData(scheduleData: unknown): ScheduleData {
  if (!isScheduleData(scheduleData)) throw new Error("Invalid schedule.json schema");
  return scheduleData;
}

function normalizeGroups(
  groupData: GroupData,
  nameIndex: Map<string, string>
): NormalizedGroupEntry[] {
  return groupData.groupStage.groups.map((group) => {
    const normalizedTeams = group.teams.map((rawName) => {
      const teamId = resolveTeamId(rawName, nameIndex);
      if (!teamId) {
        throw new Error(`Unknown group team reference: "${rawName}" in group ${group.groupId}`);
      }
      return teamId;
    });

    return {
      groupId: group.groupId,
      teams: normalizedTeams,
    };
  });
}

function normalizeFixtures(
  scheduleData: ScheduleData,
  nameIndex: Map<string, string>
): NormalizedFixture[] {
  return scheduleData.fixtures.map((fixture) => {
    const homeTeamId = resolveTeamId(fixture.homeTeam, nameIndex);
    const awayTeamId = resolveTeamId(fixture.awayTeam, nameIndex);

    if (!homeTeamId || !awayTeamId) {
      throw new Error(
        `Unknown fixture team reference: "${fixture.homeTeam}" vs "${fixture.awayTeam}" (${fixture.matchId})`
      );
    }

    return {
      matchId: fixture.matchId,
      groupId: fixture.groupId,
      homeTeamId,
      awayTeamId,
      date: fixture.date,
      kickoffUtc: fixture.kickoffUtc,
    };
  });
}

export function normalizeDataPack(raw: RawDataPack): NormalizedDataPack {
  const teams = assertTeamMap(raw.teamData);
  const groups = assertGroupData(raw.groupData);
  const schedule = assertScheduleData(raw.scheduleData);

  const nameIndex = buildTeamNameIndex(teams);

  const dataPack: NormalizedDataPack = {
    tournament: schedule.tournament,
    teams,
    groups: normalizeGroups(groups, nameIndex),
    fixtures: normalizeFixtures(schedule, nameIndex),
  };

  const validation = validateNormalizedDataPack(dataPack);
  if (!validation.ok) {
    throw new Error(`Data pack validation failed:\n- ${validation.errors.join("\n- ")}`);
  }

  return dataPack;
}

async function fetchJson(path: string): Promise<unknown> {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}: ${response.status}`);
  return response.json();
}

export async function loadDataPackFromPublic(): Promise<NormalizedDataPack> {
  const [teamData, groupData, scheduleData] = await Promise.all([
    fetchJson("/data/team.json"),
    fetchJson("/data/group.json"),
    fetchJson("/data/schedule.json"),
  ]);

  return normalizeDataPack({ teamData, groupData, scheduleData });
}
