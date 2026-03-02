import type { TeamStats } from "@core/types";

export function compareHeadToHead(a: TeamStats, b: TeamStats): number | null {
  const h2hA = a.headToHead[b.id] ?? { points: 0, goalDiff: 0, goalsFor: 0 };
  const h2hB = b.headToHead[a.id] ?? { points: 0, goalDiff: 0, goalsFor: 0 };

  if (h2hA.points !== h2hB.points) return h2hB.points - h2hA.points;
  if (h2hA.goalDiff !== h2hB.goalDiff) return h2hB.goalDiff - h2hA.goalDiff;
  if (h2hA.goalsFor !== h2hB.goalsFor) return h2hB.goalsFor - h2hA.goalsFor;

  return null;
}
