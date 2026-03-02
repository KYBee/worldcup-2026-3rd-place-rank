import type { SimulatorDraft, SimulatorResult } from "@core/app-state";

export function createEmptyDraft(): SimulatorDraft {
  return { home: null, away: null };
}

export function parseScoreInput(rawValue: string): number | null {
  const trimmed = rawValue.trim();
  if (trimmed === "") return null;

  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed < 0) return null;
  return parsed;
}

export function isDraftComplete(draft: SimulatorDraft): draft is SimulatorResult {
  return draft.home !== null && draft.away !== null;
}

export function serializeDraft(draft: SimulatorDraft): string {
  const home = draft.home === null ? "" : String(draft.home);
  const away = draft.away === null ? "" : String(draft.away);
  return `${home}:${away}`;
}

export function deserializeDraft(serialized: string): SimulatorDraft {
  const [homeRaw = "", awayRaw = ""] = serialized.split(":");
  return {
    home: parseScoreInput(homeRaw),
    away: parseScoreInput(awayRaw),
  };
}
