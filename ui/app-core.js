const SCORE_STORAGE_KEY = "kingwoosoo:scores:v1";
const KNOCKOUT_WINNER_STORAGE_KEY = "kingwoosoo:knockout-winners:v1";

function normalizeKey(value) {
    return String(value)
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9가-힣]+/g, " ")
        .trim()
        .replace(/\s+/g, "_");
}

function parseScore(value) {
    if (value === "" || value === null || value === undefined) return null;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 0) return null;
    return parsed;
}

function buildTeamIndex(teams) {
    const index = new Map();
    Object.entries(teams).forEach(([teamId, team]) => {
        index.set(normalizeKey(teamId), teamId);
        index.set(normalizeKey(team.en), teamId);
        index.set(normalizeKey(team.ko), teamId);
    });
    return index;
}

function resolveTeamId(teamName, teamIndex) {
    const key = normalizeKey(teamName);
    if (teamIndex.has(key)) return teamIndex.get(key);

    if (key.startsWith("uefa_playoff_")) {
        const alias = key.replace("uefa_playoff_", "european_playoff_");
        if (teamIndex.has(alias)) return teamIndex.get(alias);
    }

    return null;
}

function createEmptyStats(teamId, teams) {
    const team = teams[teamId];
    return {
        teamId,
        played: 0,
        win: 0,
        draw: 0,
        loss: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        pts: 0,
        fifaRanking: team?.fifaRanking ?? 999,
        headToHead: {}
    };
}

function ensureHeadToHead(stats, opponentId) {
    if (!stats.headToHead[opponentId]) {
        stats.headToHead[opponentId] = { pts: 0, gd: 0, gf: 0 };
    }
    return stats.headToHead[opponentId];
}

function applyResult(homeStats, awayStats, homeScore, awayScore) {
    homeStats.played += 1;
    awayStats.played += 1;

    homeStats.gf += homeScore;
    homeStats.ga += awayScore;
    homeStats.gd += homeScore - awayScore;

    awayStats.gf += awayScore;
    awayStats.ga += homeScore;
    awayStats.gd += awayScore - homeScore;

    const homeH2h = ensureHeadToHead(homeStats, awayStats.teamId);
    const awayH2h = ensureHeadToHead(awayStats, homeStats.teamId);
    homeH2h.gf += homeScore;
    homeH2h.gd += homeScore - awayScore;
    awayH2h.gf += awayScore;
    awayH2h.gd += awayScore - homeScore;

    if (homeScore > awayScore) {
        homeStats.win += 1;
        awayStats.loss += 1;
        homeStats.pts += 3;
        homeH2h.pts += 3;
        return;
    }
    if (homeScore < awayScore) {
        awayStats.win += 1;
        homeStats.loss += 1;
        awayStats.pts += 3;
        awayH2h.pts += 3;
        return;
    }

    homeStats.draw += 1;
    awayStats.draw += 1;
    homeStats.pts += 1;
    awayStats.pts += 1;
    homeH2h.pts += 1;
    awayH2h.pts += 1;
}

function compareHeadToHead(a, b) {
    const aH2h = a.headToHead[b.teamId] || { pts: 0, gd: 0, gf: 0 };
    const bH2h = b.headToHead[a.teamId] || { pts: 0, gd: 0, gf: 0 };
    if (aH2h.pts !== bH2h.pts) return bH2h.pts - aH2h.pts;
    if (aH2h.gd !== bH2h.gd) return bH2h.gd - aH2h.gd;
    if (aH2h.gf !== bH2h.gf) return bH2h.gf - aH2h.gf;
    return null;
}

function compareStats(a, b) {
    if (a.pts !== b.pts) return b.pts - a.pts;
    const h2h = compareHeadToHead(a, b);
    if (h2h !== null) return h2h;
    if (a.gd !== b.gd) return b.gd - a.gd;
    if (a.gf !== b.gf) return b.gf - a.gf;
    return a.fifaRanking - b.fifaRanking;
}

export async function loadTournamentData() {
    async function fetchJsonWithFallback(fileName) {
        const candidates = [`../data/${fileName}`, `/data/${fileName}`, `./data/${fileName}`];
        const errors = [];

        for (const url of candidates) {
            try {
                const resp = await fetch(url);
                if (!resp.ok) {
                    errors.push(`${url} (${resp.status})`);
                    continue;
                }
                return await resp.json();
            } catch (error) {
                errors.push(`${url} (${error?.message || "fetch error"})`);
            }
        }

        throw new Error(`데이터 파일을 불러오지 못했습니다: ${fileName}`);
    }

    const [teams, groupData, scheduleData] = await Promise.all([
        fetchJsonWithFallback("team.json"),
        fetchJsonWithFallback("group.json"),
        fetchJsonWithFallback("schedule.json")
    ]);

    const teamIndex = buildTeamIndex(teams);
    const groupWarnings = [];
    const groups = groupData.groupStage.groups
        .map((group) => ({
            groupId: group.groupId,
            teamIds: group.teams
                .map((name) => {
                    const teamId = resolveTeamId(name, teamIndex);
                    if (!teamId) {
                        groupWarnings.push(`${group.groupId}: ${name}`);
                        return null;
                    }
                    return teamId;
                })
                .filter(Boolean)
        }))
        .filter((group) => group.teamIds.length > 0);

    if (groupWarnings.length > 0) {
        console.warn("[app-core] 일부 조 편성 데이터가 무시되었습니다.", groupWarnings);
    }

    const fixtureWarnings = [];
    const fixtures = [];
    scheduleData.fixtures.forEach((fixture) => {
        const homeTeamId = resolveTeamId(fixture.homeTeam, teamIndex);
        const awayTeamId = resolveTeamId(fixture.awayTeam, teamIndex);
        if (!homeTeamId || !awayTeamId) {
            fixtureWarnings.push(
                `${fixture.matchId}: ${fixture.homeTeam} vs ${fixture.awayTeam}`
            );
            return;
        }
        fixtures.push({
            matchId: fixture.matchId,
            groupId: fixture.groupId,
            homeTeamId,
            awayTeamId,
            date: fixture.date,
            kickoffUtc: fixture.kickoffUtc,
            homeScore: fixture.homeScore,
            awayScore: fixture.awayScore
        });
    });

    if (fixtureWarnings.length > 0) {
        console.warn("[app-core] 일부 경기 데이터가 무시되었습니다.", fixtureWarnings);
    }

    return {
        teams,
        groups,
        fixtures
    };
}

export function readScores() {
    try {
        const raw = localStorage.getItem(SCORE_STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return {};

        const next = {};
        Object.entries(parsed).forEach(([matchId, score]) => {
            const home = parseScore(score?.home);
            const away = parseScore(score?.away);
            if (home !== null && away !== null) {
                next[matchId] = { home, away };
            }
        });
        return next;
    } catch {
        return {};
    }
}

export function readOfficialScores(data) {
    const official = {};
    if (!data?.fixtures) return official;

    data.fixtures.forEach((fixture) => {
        const home = parseScore(fixture.homeScore);
        const away = parseScore(fixture.awayScore);
        if (home === null || away === null) return;
        official[fixture.matchId] = { home, away };
    });

    return official;
}

export function writeScores(scores) {
    localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(scores));
}

export function buildScoresWithDefaultDraw(data, scores) {
    const merged = {};
    if (!data?.fixtures) return merged;

    data.fixtures.forEach((fixture) => {
        const existing = scores?.[fixture.matchId];
        const home = parseScore(existing?.home);
        const away = parseScore(existing?.away);
        if (home !== null && away !== null) {
            merged[fixture.matchId] = { home, away };
            return;
        }
        merged[fixture.matchId] = { home: 0, away: 0 };
    });

    return merged;
}

export function getGroupFixtures(data, groupId) {
    return data.fixtures.filter((fixture) => fixture.groupId === groupId);
}

export function getTeamLabel(teamId, teams) {
    return teams[teamId]?.ko || teams[teamId]?.en || teamId;
}

export function getTeamFlag(teamId, teams) {
    const flag = teams[teamId]?.flag;
    if (!flag) return "";
    return `../${flag}`;
}

export function computeGroupStandings(data, groupId, scores) {
    const group = data.groups.find((entry) => entry.groupId === groupId);
    if (!group) return [];

    const statsMap = {};
    group.teamIds.forEach((teamId) => {
        statsMap[teamId] = createEmptyStats(teamId, data.teams);
    });

    const fixtures = getGroupFixtures(data, groupId);
    fixtures.forEach((fixture) => {
        const score = scores[fixture.matchId];
        if (!score) return;
        const homeStats = statsMap[fixture.homeTeamId];
        const awayStats = statsMap[fixture.awayTeamId];
        if (!homeStats || !awayStats) return;
        applyResult(homeStats, awayStats, score.home, score.away);
    });

    return Object.values(statsMap).sort(compareStats);
}

export function parseInputToScore(value) {
    return parseScore(value);
}

export function computeAllGroupStandings(data, scores) {
    return data.groups.map((group) => ({
        groupId: group.groupId,
        teams: computeGroupStandings(data, group.groupId, scores)
    }));
}

function compareThirdPlace(a, b) {
    if (a.pts !== b.pts) return b.pts - a.pts;
    if (a.gd !== b.gd) return b.gd - a.gd;
    if (a.gf !== b.gf) return b.gf - a.gf;
    return a.fifaRanking - b.fifaRanking;
}

export function rankThirdPlaceTeams(groupRankings) {
    return groupRankings
        .map((group) => {
            const third = group.teams[2];
            if (!third) return null;
            return {
                groupId: group.groupId,
                teamId: third.teamId,
                played: third.played,
                win: third.win,
                draw: third.draw,
                loss: third.loss,
                gf: third.gf,
                ga: third.ga,
                gd: third.gd,
                pts: third.pts,
                fifaRanking: third.fifaRanking
            };
        })
        .filter((entry) => entry !== null)
        .sort(compareThirdPlace);
}

export function pickTopEightThirdPlace(groupRankings) {
    return rankThirdPlaceTeams(groupRankings).slice(0, 8);
}

const ROUND_OF_32_CONFIG = [
    {
        slotId: "M73",
        home: { type: "runnerUp", groupId: "A" },
        away: { type: "runnerUp", groupId: "B" }
    },
    {
        slotId: "M74",
        home: { type: "winner", groupId: "C" },
        away: { type: "runnerUp", groupId: "F" }
    },
    {
        slotId: "M75",
        home: { type: "winner", groupId: "E" },
        away: { type: "thirdBest", groupsAllowed: ["A", "B", "C", "D", "F"] }
    },
    {
        slotId: "M76",
        home: { type: "winner", groupId: "H" },
        away: { type: "runnerUp", groupId: "I" }
    },
    {
        slotId: "M77",
        home: { type: "winner", groupId: "B" },
        away: { type: "thirdBest", groupsAllowed: ["C", "D", "E", "F", "G"] }
    },
    {
        slotId: "M78",
        home: { type: "runnerUp", groupId: "D" },
        away: { type: "winner", groupId: "G" }
    },
    {
        slotId: "M79",
        home: { type: "winner", groupId: "I" },
        away: { type: "thirdBest", groupsAllowed: ["A", "B", "H", "J", "K"] }
    },
    {
        slotId: "M80",
        home: { type: "runnerUp", groupId: "C" },
        away: { type: "winner", groupId: "D" }
    },
    {
        slotId: "M81",
        home: { type: "winner", groupId: "A" },
        away: { type: "thirdBest", groupsAllowed: ["D", "E", "F", "I", "J"] }
    },
    {
        slotId: "M82",
        home: { type: "runnerUp", groupId: "E" },
        away: { type: "winner", groupId: "J" }
    },
    {
        slotId: "M83",
        home: { type: "winner", groupId: "F" },
        away: { type: "runnerUp", groupId: "K" }
    },
    {
        slotId: "M84",
        home: { type: "winner", groupId: "L" },
        away: { type: "thirdBest", groupsAllowed: ["A", "G", "H", "I", "K"] }
    },
    {
        slotId: "M85",
        home: { type: "winner", groupId: "K" },
        away: { type: "runnerUp", groupId: "H" }
    },
    {
        slotId: "M86",
        home: { type: "winner", groupId: "G" },
        away: { type: "thirdBest", groupsAllowed: ["B", "E", "I", "J", "L"] }
    },
    {
        slotId: "M87",
        home: { type: "runnerUp", groupId: "G" },
        away: { type: "winner", groupId: "B" }
    },
    {
        slotId: "M88",
        home: { type: "winner", groupId: "D" },
        away: { type: "thirdBest", groupsAllowed: ["C", "F", "I", "K", "L"] }
    }
];

function resolveGroupParticipant(participant, rankingMap) {
    if (participant.type !== "winner" && participant.type !== "runnerUp") return null;
    const groupRanking = rankingMap.get(participant.groupId);
    if (!groupRanking) return null;

    const index = participant.type === "winner" ? 0 : 1;
    const team = groupRanking.teams[index];
    if (!team) return null;

    return {
        teamId: team.teamId,
        source: `${participant.type === "winner" ? "1" : "2"}${participant.groupId}`
    };
}

function resolveThirdParticipant(participant, topThirds, usedThirdIds) {
    if (participant.type !== "thirdBest") return null;
    let picked = topThirds.find(
        (entry) => participant.groupsAllowed.includes(entry.groupId) && !usedThirdIds.has(entry.teamId)
    );
    if (!picked) {
        picked = topThirds.find((entry) => !usedThirdIds.has(entry.teamId));
    }
    if (!picked) return null;
    usedThirdIds.add(picked.teamId);
    return {
        teamId: picked.teamId,
        source: `3${picked.groupId}`
    };
}

function resolveRound32Participant(participant, rankingMap, topThirds, usedThirdIds) {
    const fromGroup = resolveGroupParticipant(participant, rankingMap);
    if (fromGroup) return fromGroup;
    return resolveThirdParticipant(participant, topThirds, usedThirdIds);
}

export function generateRoundOf32(groupRankings) {
    const rankingMap = new Map(groupRankings.map((entry) => [entry.groupId, entry]));
    const topThirds = pickTopEightThirdPlace(groupRankings);
    const usedThirdIds = new Set();

    return ROUND_OF_32_CONFIG.map((slot) => {
        const home = resolveRound32Participant(slot.home, rankingMap, topThirds, usedThirdIds);
        const away = resolveRound32Participant(slot.away, rankingMap, topThirds, usedThirdIds);
        return {
            slotId: slot.slotId,
            home,
            away,
            resolved: Boolean(home && away)
        };
    });
}

const KNOCKOUT_RULES = [
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
    { slotId: "M104", round: "F", homeFrom: "M101", awayFrom: "M102" }
];

export function getKnockoutRules() {
    return KNOCKOUT_RULES;
}

export function generateKnockoutProgression(winnerByMatchId) {
    return KNOCKOUT_RULES.map((rule) => ({
        slotId: rule.slotId,
        round: rule.round,
        homeFrom: rule.homeFrom,
        awayFrom: rule.awayFrom,
        homeTeamId: winnerByMatchId[rule.homeFrom] || null,
        awayTeamId: winnerByMatchId[rule.awayFrom] || null
    }));
}

export function readKnockoutWinners() {
    try {
        const raw = localStorage.getItem(KNOCKOUT_WINNER_STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return {};

        const next = {};
        Object.entries(parsed).forEach(([matchId, winnerTeamId]) => {
            if (typeof winnerTeamId === "string" && winnerTeamId) {
                next[matchId] = winnerTeamId;
            }
        });
        return next;
    } catch {
        return {};
    }
}

export function writeKnockoutWinners(winnerByMatchId) {
    localStorage.setItem(KNOCKOUT_WINNER_STORAGE_KEY, JSON.stringify(winnerByMatchId));
}
