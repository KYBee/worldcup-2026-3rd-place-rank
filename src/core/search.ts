import type { NormalizedDataPack, NormalizedFixture } from "@core/types";

export type FixtureSearchEntry = {
  fixture: NormalizedFixture;
  searchableText: string;
};

export function normalizeSearchTerm(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function buildFixtureSearchIndex(dataPack: NormalizedDataPack): FixtureSearchEntry[] {
  return dataPack.fixtures.map((fixture) => {
    const homeTeam = dataPack.teams[fixture.homeTeamId];
    const awayTeam = dataPack.teams[fixture.awayTeamId];

    const joined = [
      fixture.groupId,
      fixture.homeTeamId,
      fixture.awayTeamId,
      homeTeam.en,
      homeTeam.ko,
      awayTeam.en,
      awayTeam.ko,
    ].join(" ");

    return {
      fixture,
      searchableText: normalizeSearchTerm(joined),
    };
  });
}

export function searchFixtureIndex(
  index: FixtureSearchEntry[],
  keyword: string
): FixtureSearchEntry[] {
  const normalizedKeyword = normalizeSearchTerm(keyword);
  if (!normalizedKeyword) return index;
  return index.filter((entry) => entry.searchableText.includes(normalizedKeyword));
}
