import type { MatchResultMap, NormalizedDataPack } from "@core/types";

export type ScoreResultMap = Record<string, { home: number; away: number }>;

export function getOfficialMatchResults(dataPack: NormalizedDataPack): ScoreResultMap {
  const officialResults: ScoreResultMap = {};

  for (const fixture of dataPack.fixtures) {
    const { homeScore, awayScore } = fixture;
    if (typeof homeScore !== "number" || typeof awayScore !== "number") continue;
    officialResults[fixture.matchId] = {
      home: homeScore,
      away: awayScore,
    };
  }

  return officialResults;
}

export function getLockedMatchIds(dataPack: NormalizedDataPack): Set<string> {
  return new Set(Object.keys(getOfficialMatchResults(dataPack)));
}

export function mergeOfficialMatchResults(
  dataPack: NormalizedDataPack,
  simulatedResults: ScoreResultMap
): ScoreResultMap {
  return {
    ...simulatedResults,
    ...getOfficialMatchResults(dataPack),
  };
}

export function getOfficialResultMap(dataPack: NormalizedDataPack): MatchResultMap {
  const officialResults: MatchResultMap = {};
  for (const [matchId, score] of Object.entries(getOfficialMatchResults(dataPack))) {
    officialResults[matchId] = { score, status: "final" };
  }
  return officialResults;
}
