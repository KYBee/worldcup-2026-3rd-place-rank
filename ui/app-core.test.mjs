import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { buildEffectiveScores, getLockedMatchIds, readOfficialScores } from "./app-core.js";

const sampleData = {
  fixtures: [
    {
      matchId: "A-M1",
      homeScore: 2,
      awayScore: 1,
    },
    {
      matchId: "A-M2",
    },
  ],
};

test("official scores override saved user scores in effective standings input", () => {
  const savedScores = {
    "A-M1": { home: 0, away: 0 },
    "A-M2": { home: 3, away: 2 },
  };

  assert.deepEqual(buildEffectiveScores(sampleData, savedScores), {
    "A-M1": { home: 2, away: 1 },
    "A-M2": { home: 3, away: 2 },
  });
});

test("fixtures with official scores are marked as locked", () => {
  assert.deepEqual(readOfficialScores(sampleData), {
    "A-M1": { home: 2, away: 1 },
  });
  assert.deepEqual(getLockedMatchIds(sampleData), new Set(["A-M1"]));
});

test("current public schedule official results are reflected and locked", () => {
  const scheduleData = JSON.parse(fs.readFileSync("public/data/schedule.json", "utf8"));

  assert.deepEqual(readOfficialScores(scheduleData), {
    "A-M1": { home: 2, away: 0 },
    "A-M2": { home: 2, away: 1 },
    "B-M1": { home: 1, away: 1 },
    "B-M2": { home: 1, away: 1 },
    "C-M1": { home: 1, away: 1 },
    "C-M2": { home: 0, away: 1 },
    "D-M1": { home: 4, away: 1 },
    "D-M2": { home: 2, away: 0 },
  });
  assert.deepEqual(
    getLockedMatchIds(scheduleData),
    new Set(["A-M1", "A-M2", "B-M1", "B-M2", "C-M1", "C-M2", "D-M1", "D-M2"])
  );
});
