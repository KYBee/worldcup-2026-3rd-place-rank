export type TeamId = string;
export type GroupId = string;
export type MatchId = string;

export type TeamInfo = {
  en: string;
  ko: string;
  flag?: string;
  fifaRanking: number;
};

export type TeamMap = Record<TeamId, TeamInfo>;

export type GroupEntry = {
  groupId: GroupId;
  teams: string[];
};

export type GroupData = {
  tournament: string;
  groupStage: {
    groups: GroupEntry[];
  };
};

export type Fixture = {
  matchId: MatchId;
  groupId: GroupId;
  homeTeam: string;
  awayTeam: string;
  date: string;
  kickoffUtc: string;
};

export type ScheduleData = {
  tournament: string;
  stage: string;
  fixtures: Fixture[];
};

export type MatchScore = {
  home: number;
  away: number;
};

export type MatchResult = {
  score: MatchScore;
  status: "final" | "simulated";
};

export type MatchResultMap = Record<MatchId, MatchResult>;

export type TeamStats = {
  id: TeamId;
  points: number;
  goalDiff: number;
  goalsFor: number;
  goalsAgainst: number;
  wins: number;
  draws: number;
  losses: number;
  fifaRanking: number;
  headToHead: Record<TeamId, { points: number; goalDiff: number; goalsFor: number }>;
};

export type NormalizedGroupEntry = {
  groupId: GroupId;
  teams: TeamId[];
};

export type NormalizedFixture = {
  matchId: MatchId;
  groupId: GroupId;
  homeTeamId: TeamId;
  awayTeamId: TeamId;
  date: string;
  kickoffUtc: string;
};

export type NormalizedDataPack = {
  tournament: string;
  teams: TeamMap;
  groups: NormalizedGroupEntry[];
  fixtures: NormalizedFixture[];
};
