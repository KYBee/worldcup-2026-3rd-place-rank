import type { TeamId, TeamMap } from "@core/types";

function normalizeText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

export function buildTeamNameIndex(teamMap: TeamMap): Map<string, TeamId> {
  const index = new Map<string, TeamId>();

  for (const [teamId, team] of Object.entries(teamMap)) {
    const candidates = [teamId, team.en, team.ko];
    for (const candidate of candidates) {
      index.set(normalizeText(candidate), teamId);
    }
  }

  return index;
}

export function resolveTeamId(rawTeamName: string, index: Map<string, TeamId>): TeamId | null {
  return index.get(normalizeText(rawTeamName)) ?? null;
}
