import { mergeScheduleResults, syncDueFixtureResults } from "./result-sync.js";

const RESULTS_KEY = "group-stage-results";
const SCHEDULE_PATH = "/data/schedule.json";

function jsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body, null, 2), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init.headers || {}),
    },
  });
}

async function readStoredResults(env) {
  if (!env.MATCH_RESULTS) return {};
  const stored = await env.MATCH_RESULTS.get(RESULTS_KEY, "json");
  return stored && typeof stored === "object" ? stored : {};
}

async function writeStoredResults(env, results) {
  if (!env.MATCH_RESULTS) return;
  await env.MATCH_RESULTS.put(RESULTS_KEY, JSON.stringify(results));
}

async function loadStaticSchedule(env, requestUrl = "https://worker.local/data/schedule.json") {
  const url = new URL(requestUrl);
  url.pathname = SCHEDULE_PATH;
  url.search = "";

  const response = await env.ASSETS.fetch(new Request(url));
  if (!response.ok) {
    throw new Error(`Failed to load ${SCHEDULE_PATH}: ${response.status}`);
  }
  return response.json();
}

async function getMergedSchedule(env, request) {
  const [scheduleData, storedResults] = await Promise.all([
    loadStaticSchedule(env, request.url),
    readStoredResults(env),
  ]);

  return mergeScheduleResults(scheduleData, storedResults);
}

async function runResultSync(env, now = new Date()) {
  const scheduleData = await loadStaticSchedule(env);
  const storedResults = await readStoredResults(env);
  const syncResult = await syncDueFixtureResults({
    scheduleData,
    storedResults,
    now,
    sourceUrl: env.RESULT_SOURCE_URL,
  });

  if (syncResult.synced.length > 0) {
    await writeStoredResults(env, syncResult.results);
  }

  return syncResult;
}

async function handleRequest(request, env) {
  const url = new URL(request.url);

  if (url.pathname === SCHEDULE_PATH) {
    return jsonResponse(await getMergedSchedule(env, request), {
      headers: { "cache-control": "no-cache" },
    });
  }

  if (url.pathname === "/api/result-sync" && request.method === "POST") {
    return jsonResponse(await runResultSync(env));
  }

  if (url.pathname === "/api/result-sync" && request.method === "GET") {
    return jsonResponse({
      configured: Boolean(env.RESULT_SOURCE_URL && env.MATCH_RESULTS),
      hasResultSourceUrl: Boolean(env.RESULT_SOURCE_URL),
      hasKvBinding: Boolean(env.MATCH_RESULTS),
      pollDelayHours: 2,
      retryWindowHours: 3,
      cron: "fixture result windows from schedule",
    });
  }

  return env.ASSETS.fetch(request);
}

export default {
  fetch(request, env) {
    return handleRequest(request, env).catch((error) =>
      jsonResponse({ error: error.message }, { status: 500 })
    );
  },

  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(runResultSync(env));
  },
};
