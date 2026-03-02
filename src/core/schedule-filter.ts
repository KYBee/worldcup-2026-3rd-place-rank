import { searchFixtureIndex, type FixtureSearchEntry } from "@core/search";

type FilterInput = {
  keyword?: string;
  groupId?: string | null;
  date?: string | null;
};

export function filterScheduleEntries(
  entries: FixtureSearchEntry[],
  filter: FilterInput
): FixtureSearchEntry[] {
  let filtered = searchFixtureIndex(entries, filter.keyword ?? "");

  if (filter.groupId) {
    filtered = filtered.filter((entry) => entry.fixture.groupId === filter.groupId);
  }

  if (filter.date) {
    filtered = filtered.filter((entry) => entry.fixture.date === filter.date);
  }

  return filtered;
}
