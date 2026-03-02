import type {
  Fixture,
  GroupData,
  GroupEntry,
  MatchResult,
  MatchResultMap,
  ScheduleData,
  TeamInfo,
  TeamMap,
} from "@core/types";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isTeamInfo(value: unknown): value is TeamInfo {
  if (!isObject(value)) return false;
  if (!isString(value.en) || !isString(value.ko) || !isNumber(value.fifaRanking)) return false;
  if (value.flag !== undefined && !isString(value.flag)) return false;
  return true;
}

function isGroupEntry(value: unknown): value is GroupEntry {
  if (!isObject(value)) return false;
  if (!isString(value.groupId) || !Array.isArray(value.teams)) return false;
  return value.teams.every((team) => isString(team));
}

function isFixture(value: unknown): value is Fixture {
  if (!isObject(value)) return false;
  return (
    isString(value.matchId) &&
    isString(value.groupId) &&
    isString(value.homeTeam) &&
    isString(value.awayTeam) &&
    isString(value.date) &&
    isString(value.kickoffUtc)
  );
}

function isMatchResult(value: unknown): value is MatchResult {
  if (!isObject(value) || !isObject(value.score)) return false;
  const status = value.status;
  return (
    (status === "final" || status === "simulated") &&
    isNumber(value.score.home) &&
    isNumber(value.score.away)
  );
}

export function isTeamMap(value: unknown): value is TeamMap {
  if (!isObject(value)) return false;
  return Object.values(value).every((team) => isTeamInfo(team));
}

export function isGroupData(value: unknown): value is GroupData {
  if (!isObject(value)) return false;
  if (!isString(value.tournament) || !isObject(value.groupStage)) return false;
  if (!Array.isArray(value.groupStage.groups)) return false;
  return value.groupStage.groups.every((group) => isGroupEntry(group));
}

export function isScheduleData(value: unknown): value is ScheduleData {
  if (!isObject(value)) return false;
  if (!isString(value.tournament) || !isString(value.stage)) return false;
  if (!Array.isArray(value.fixtures)) return false;
  return value.fixtures.every((fixture) => isFixture(fixture));
}

export function isMatchResultMap(value: unknown): value is MatchResultMap {
  if (!isObject(value)) return false;
  return Object.values(value).every((result) => isMatchResult(result));
}
