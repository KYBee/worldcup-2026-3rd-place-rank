export type KnockoutRule = {
  slotId: string;
  round: "R16" | "QF" | "SF" | "F";
  homeFrom: string;
  awayFrom: string;
};

export type KnockoutMatch = {
  slotId: string;
  round: KnockoutRule["round"];
  homeTeamId: string | null;
  awayTeamId: string | null;
};

export const knockoutRules: KnockoutRule[] = [
  { slotId: "M89", round: "R16", homeFrom: "M73", awayFrom: "M75" },
  { slotId: "M90", round: "R16", homeFrom: "M74", awayFrom: "M77" },
  { slotId: "M91", round: "R16", homeFrom: "M76", awayFrom: "M78" },
  { slotId: "M92", round: "R16", homeFrom: "M79", awayFrom: "M80" },
  { slotId: "M93", round: "R16", homeFrom: "M81", awayFrom: "M83" },
  { slotId: "M94", round: "R16", homeFrom: "M82", awayFrom: "M84" },
  { slotId: "M95", round: "R16", homeFrom: "M85", awayFrom: "M87" },
  { slotId: "M96", round: "R16", homeFrom: "M86", awayFrom: "M88" },
  { slotId: "M97", round: "QF", homeFrom: "M89", awayFrom: "M90" },
  { slotId: "M98", round: "QF", homeFrom: "M91", awayFrom: "M92" },
  { slotId: "M99", round: "QF", homeFrom: "M93", awayFrom: "M94" },
  { slotId: "M100", round: "QF", homeFrom: "M95", awayFrom: "M96" },
  { slotId: "M101", round: "SF", homeFrom: "M97", awayFrom: "M98" },
  { slotId: "M102", round: "SF", homeFrom: "M99", awayFrom: "M100" },
  { slotId: "M104", round: "F", homeFrom: "M101", awayFrom: "M102" },
];

export function generateKnockoutProgression(
  winnerByMatchId: Record<string, string>
): KnockoutMatch[] {
  return knockoutRules.map((rule) => ({
    slotId: rule.slotId,
    round: rule.round,
    homeTeamId: winnerByMatchId[rule.homeFrom] ?? null,
    awayTeamId: winnerByMatchId[rule.awayFrom] ?? null,
  }));
}
