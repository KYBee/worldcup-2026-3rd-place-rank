import { recomputeTournamentState, type TournamentComputedState } from "@core/pipeline";
import type { NormalizedDataPack } from "@core/types";

export function createTournamentPipelineSelector(dataPack: NormalizedDataPack) {
  let initialized = false;
  let prevResults: Record<string, { home: number; away: number }> = {};
  let prevComputed: TournamentComputedState | null = null;

  return (results: Record<string, { home: number; away: number }>): TournamentComputedState => {
    if (!initialized || prevResults !== results || !prevComputed) {
      prevComputed = recomputeTournamentState(dataPack, results);
      prevResults = results;
      initialized = true;
    }

    return prevComputed;
  };
}
