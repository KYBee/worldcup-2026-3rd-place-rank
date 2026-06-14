const DEFAULT_POLL_DELAY_MS = 2 * 60 * 60 * 1000;
const DEFAULT_RETRY_MINUTES = 180;

function hasScorePair(value) {
  return Number.isInteger(value?.homeScore) && Number.isInteger(value?.awayScore);
}

export function getDueFixtures(
  fixtures,
  storedResults,
  now = new Date(),
  { retryMinutes = DEFAULT_RETRY_MINUTES } = {}
) {
  const nowMs = now.getTime();

  return fixtures.filter((fixture) => {
    if (hasScorePair(fixture)) return false;
    if (hasScorePair(storedResults?.[fixture.matchId])) return false;

    const kickoffMs = new Date(fixture.kickoffUtc).getTime();
    if (!Number.isFinite(kickoffMs)) return false;

    const pollStartMs = kickoffMs + DEFAULT_POLL_DELAY_MS;
    const pollEndMs = pollStartMs + retryMinutes * 60 * 1000;
    return nowMs >= pollStartMs && nowMs <= pollEndMs;
  });
}

export function buildFixturePollingCrons(
  fixtures,
  { pollDelayMinutes = 120, retryMinutes = DEFAULT_RETRY_MINUTES } = {}
) {
  const daysByHourAndMonth = new Map();

  for (const fixture of fixtures) {
    if (hasScorePair(fixture)) continue;

    const kickoffMs = new Date(fixture.kickoffUtc).getTime();
    if (!Number.isFinite(kickoffMs)) continue;

    const firstPollMs = kickoffMs + pollDelayMinutes * 60 * 1000;
    for (let elapsedMinutes = 0; elapsedMinutes <= retryMinutes; elapsedMinutes += 10) {
      const pollAt = new Date(firstPollMs + elapsedMinutes * 60 * 1000);
      const key = `${pollAt.getUTCHours()} ${pollAt.getUTCMonth() + 1}`;
      const days = daysByHourAndMonth.get(key) ?? new Set();
      days.add(pollAt.getUTCDate());
      daysByHourAndMonth.set(key, days);
    }
  }

  return [...daysByHourAndMonth.entries()]
    .map(([key, days]) => {
      const [hour, month] = key.split(" ");
      const dayList = [...days].sort((a, b) => a - b).join(",");
      return `*/10 ${hour} ${dayList} ${month} *`;
    })
    .sort((a, b) => a.localeCompare(b));
}

export function mergeScheduleResults(scheduleData, storedResults) {
  return {
    ...scheduleData,
    fixtures: scheduleData.fixtures.map((fixture) => {
      const stored = storedResults?.[fixture.matchId];
      if (!hasScorePair(stored)) return fixture;
      return {
        ...fixture,
        homeScore: stored.homeScore,
        awayScore: stored.awayScore,
      };
    }),
  };
}

export function normalizeProviderResult(payload) {
  const result = Array.isArray(payload?.results) ? payload.results[0] : payload;
  if (!result || typeof result !== "object") return null;

  const status = String(result.status || result.matchStatus || "").toLowerCase();
  if (status !== "final" && status !== "finished" && status !== "full_time") return null;

  const homeScore = Number(result.homeScore ?? result.home?.score ?? result.score?.home);
  const awayScore = Number(result.awayScore ?? result.away?.score ?? result.score?.away);
  if (!Number.isInteger(homeScore) || !Number.isInteger(awayScore)) return null;

  return { homeScore, awayScore };
}

export function buildResultLookupUrl(sourceUrl, fixture) {
  const templated = sourceUrl
    .replaceAll("{matchId}", encodeURIComponent(fixture.matchId))
    .replaceAll("{homeTeam}", encodeURIComponent(fixture.homeTeam))
    .replaceAll("{awayTeam}", encodeURIComponent(fixture.awayTeam));
  const url = new URL(templated);

  if (templated === sourceUrl) {
    url.searchParams.set("matchId", fixture.matchId);
    url.searchParams.set("homeTeam", fixture.homeTeam);
    url.searchParams.set("awayTeam", fixture.awayTeam);
    url.searchParams.set("kickoffUtc", fixture.kickoffUtc);
  }

  return url;
}

export async function fetchProviderResult(sourceUrl, fixture, fetchImpl = fetch) {
  if (!sourceUrl) return null;

  const response = await fetchImpl(buildResultLookupUrl(sourceUrl, fixture));
  if (!response.ok) return null;

  const payload = await response.json();
  return normalizeProviderResult(payload);
}

export async function syncDueFixtureResults({
  scheduleData,
  storedResults,
  now = new Date(),
  sourceUrl,
  fetchImpl = fetch,
}) {
  const nextResults = { ...(storedResults || {}) };
  const dueFixtures = getDueFixtures(scheduleData.fixtures, storedResults, now);
  const synced = [];

  for (const fixture of dueFixtures) {
    const result = await fetchProviderResult(sourceUrl, fixture, fetchImpl);
    if (!result) continue;

    nextResults[fixture.matchId] = {
      ...result,
      updatedAt: now.toISOString(),
      source: sourceUrl,
    };
    synced.push(fixture.matchId);
  }

  return { results: nextResults, synced, checked: dueFixtures.map((fixture) => fixture.matchId) };
}
