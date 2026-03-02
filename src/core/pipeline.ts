import { generateKnockoutProgression } from "@core/bracket/knockout-progression";
import { generateRoundOf32 } from "@core/bracket/generate-round32";
import { computeAllGroupRankings } from "@core/standings/group-ranking";
import { pickTopEightThirdPlace, rankThirdPlaceTeams } from "@core/standings/third-place";
import type { NormalizedDataPack } from "@core/types";

export type TournamentComputedState = {
  groupRankings: ReturnType<typeof computeAllGroupRankings>;
  thirdPlaceRanking: ReturnType<typeof rankThirdPlaceTeams>;
  topEightThirdPlace: ReturnType<typeof pickTopEightThirdPlace>;
  roundOf32: ReturnType<typeof generateRoundOf32>;
  knockout: ReturnType<typeof generateKnockoutProgression>;
};

export function recomputeTournamentState(
  dataPack: NormalizedDataPack,
  confirmedResults: Record<string, { home: number; away: number }>,
  winnerByMatchId: Record<string, string> = {}
): TournamentComputedState {
  const groupRankings = computeAllGroupRankings(dataPack, confirmedResults);
  const thirdPlaceRanking = rankThirdPlaceTeams(groupRankings);
  const topEightThirdPlace = thirdPlaceRanking.slice(0, 8);
  const roundOf32 = generateRoundOf32(groupRankings);
  const knockout = generateKnockoutProgression(winnerByMatchId);

  return {
    groupRankings,
    thirdPlaceRanking,
    topEightThirdPlace,
    roundOf32,
    knockout,
  };
}
