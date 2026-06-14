import test from "node:test";
import assert from "node:assert/strict";

import {
  buildFixturePollingCrons,
  buildResultLookupUrl,
  getDueFixtures,
  mergeScheduleResults,
  normalizeProviderResult,
} from "./result-sync.js";

const fixtures = [
  {
    matchId: "A-M1",
    homeTeam: "Mexico",
    awayTeam: "South Africa",
    kickoffUtc: "2026-06-12T04:00:00+09:00",
  },
  {
    matchId: "A-M2",
    homeTeam: "South Korea",
    awayTeam: "Czechia",
    kickoffUtc: "2026-06-12T11:00:00+09:00",
  },
  {
    matchId: "A-M3",
    homeTeam: "Czechia",
    awayTeam: "South Africa",
    kickoffUtc: "2026-06-19T01:00:00+09:00",
    homeScore: 2,
    awayScore: 0,
  },
];

test("fixtures become due two hours after kickoff when no official result exists", () => {
  const now = new Date("2026-06-12T06:01:00+09:00");
  const due = getDueFixtures(fixtures, {}, now);

  assert.deepEqual(
    due.map((fixture) => fixture.matchId),
    ["A-M1"]
  );
});

test("fixtures already stored in synced results are not polled again", () => {
  const now = new Date("2026-06-12T06:01:00+09:00");
  const due = getDueFixtures(fixtures, { "A-M1": { homeScore: 1, awayScore: 0 } }, now);

  assert.deepEqual(due, []);
});

test("fixtures stop being due after the retry window", () => {
  const now = new Date("2026-06-12T09:01:00+09:00");
  const due = getDueFixtures(fixtures, {}, now);

  assert.deepEqual(due, []);
});

test("stored results are merged into schedule fixtures", () => {
  const schedule = { tournament: "FIFA World Cup 2026", fixtures };
  const merged = mergeScheduleResults(schedule, {
    "A-M1": { homeScore: 1, awayScore: 0, source: "provider" },
  });

  assert.equal(merged.fixtures[0].homeScore, 1);
  assert.equal(merged.fixtures[0].awayScore, 0);
  assert.equal(merged.fixtures[1].homeScore, undefined);
});

test("provider result is accepted only when final and numeric", () => {
  assert.deepEqual(
    normalizeProviderResult({
      matchId: "A-M1",
      status: "final",
      homeScore: 3,
      awayScore: 2,
    }),
    { homeScore: 3, awayScore: 2 }
  );

  assert.equal(normalizeProviderResult({ status: "live", homeScore: 3, awayScore: 2 }), null);
});

test("result lookup URL supports templates and query fallback", () => {
  assert.equal(
    buildResultLookupUrl("https://example.test/result/{matchId}", fixtures[0]).href,
    "https://example.test/result/A-M1"
  );

  const fallback = buildResultLookupUrl("https://example.test/result", fixtures[0]);
  assert.equal(fallback.searchParams.get("matchId"), "A-M1");
  assert.equal(fallback.searchParams.get("homeTeam"), "Mexico");
  assert.equal(fallback.searchParams.get("awayTeam"), "South Africa");
});

test("fixture polling crons are compressed to scheduled match result windows", () => {
  const crons = buildFixturePollingCrons(fixtures, { retryMinutes: 60 });

  assert.deepEqual(crons, ["*/10 21 11 6 *", "*/10 22 11 6 *", "*/10 4 12 6 *", "*/10 5 12 6 *"]);
});
