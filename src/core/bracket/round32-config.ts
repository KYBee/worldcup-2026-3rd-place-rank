export type RoundOf32Participant =
  | {
      type: "winner";
      groupId: string;
    }
  | {
      type: "runnerUp";
      groupId: string;
    }
  | {
      type: "thirdBest";
      groupsAllowed: string[];
    };

export type RoundOf32MatchConfig = {
  slotId: string;
  home: RoundOf32Participant;
  away: RoundOf32Participant;
};

export const roundOf32Config: RoundOf32MatchConfig[] = [
  {
    slotId: "M73",
    home: { type: "runnerUp", groupId: "A" },
    away: { type: "runnerUp", groupId: "B" },
  },
  {
    slotId: "M74",
    home: { type: "winner", groupId: "C" },
    away: { type: "runnerUp", groupId: "F" },
  },
  {
    slotId: "M75",
    home: { type: "winner", groupId: "E" },
    away: { type: "thirdBest", groupsAllowed: ["A", "B", "C", "D", "F"] },
  },
  {
    slotId: "M76",
    home: { type: "winner", groupId: "H" },
    away: { type: "runnerUp", groupId: "I" },
  },
  {
    slotId: "M77",
    home: { type: "winner", groupId: "B" },
    away: { type: "thirdBest", groupsAllowed: ["C", "D", "E", "F", "G"] },
  },
  {
    slotId: "M78",
    home: { type: "runnerUp", groupId: "D" },
    away: { type: "winner", groupId: "G" },
  },
  {
    slotId: "M79",
    home: { type: "winner", groupId: "I" },
    away: { type: "thirdBest", groupsAllowed: ["A", "B", "H", "J", "K"] },
  },
  {
    slotId: "M80",
    home: { type: "runnerUp", groupId: "C" },
    away: { type: "winner", groupId: "D" },
  },
  {
    slotId: "M81",
    home: { type: "winner", groupId: "A" },
    away: { type: "thirdBest", groupsAllowed: ["D", "E", "F", "I", "J"] },
  },
  {
    slotId: "M82",
    home: { type: "runnerUp", groupId: "E" },
    away: { type: "winner", groupId: "J" },
  },
  {
    slotId: "M83",
    home: { type: "winner", groupId: "F" },
    away: { type: "runnerUp", groupId: "K" },
  },
  {
    slotId: "M84",
    home: { type: "winner", groupId: "L" },
    away: { type: "thirdBest", groupsAllowed: ["A", "G", "H", "I", "K"] },
  },
  {
    slotId: "M85",
    home: { type: "winner", groupId: "K" },
    away: { type: "runnerUp", groupId: "H" },
  },
  {
    slotId: "M86",
    home: { type: "winner", groupId: "G" },
    away: { type: "thirdBest", groupsAllowed: ["B", "E", "I", "J", "L"] },
  },
  {
    slotId: "M87",
    home: { type: "runnerUp", groupId: "G" },
    away: { type: "winner", groupId: "B" },
  },
  {
    slotId: "M88",
    home: { type: "winner", groupId: "D" },
    away: { type: "thirdBest", groupsAllowed: ["C", "F", "I", "K", "L"] },
  },
];

export function loadRoundOf32Config(): RoundOf32MatchConfig[] {
  return roundOf32Config;
}
