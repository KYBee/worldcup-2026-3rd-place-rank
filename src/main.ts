import "./styles.css";

import { createInitialAppState } from "@core/app-state";
import { normalizePathname } from "@core/navigation";
import { createTournamentPipelineSelector } from "@core/pipeline-selector";
import {
  selectCurrentPath,
  selectSimulationDraftCount,
  selectSimulationDrafts,
  selectSimulationResultCount,
  selectUiState,
} from "@core/selectors";
import { createEmptyDraft, deserializeDraft, serializeDraft } from "@core/score-input";
import { createStore } from "@core/store";
import { loadDataPackFromPublic } from "@data/loader";
import { allRoutes, resolveRoute } from "@pages/routes";
import { renderRouteCard } from "@pages/route-card";
import { renderAppShell } from "@ui/app-shell";

const appStore = createStore(createInitialAppState(normalizePathname(window.location.pathname)));
let pipelineSelector: ReturnType<typeof createTournamentPipelineSelector> | null = null;
let dataPackLoadError: string | null = null;

function navigate(path: string) {
  if (window.location.pathname !== path) {
    history.pushState({}, "", path);
  }
  appStore.actions.setCurrentPath(path);
}

function bindRouteInteractions(root: HTMLElement) {
  const keywordInput = root.querySelector<HTMLInputElement>("input[data-role='search-keyword']");
  const groupSelect = root.querySelector<HTMLSelectElement>("select[data-role='selected-group']");
  const demoDraftInput = root.querySelector<HTMLInputElement>("input[data-role='demo-draft']");
  const confirmDraftButton = root.querySelector<HTMLButtonElement>(
    "button[data-role='confirm-draft']"
  );
  const sampleButton = root.querySelector<HTMLButtonElement>(
    "button[data-role='add-sample-result']"
  );

  keywordInput?.addEventListener("input", (event) => {
    const target = event.target as HTMLInputElement;
    appStore.actions.setSearchKeyword(target.value);
  });

  groupSelect?.addEventListener("change", (event) => {
    const target = event.target as HTMLSelectElement;
    appStore.actions.setSelectedGroupId(target.value || null);
  });

  demoDraftInput?.addEventListener("input", (event) => {
    const target = event.target as HTMLInputElement;
    const draft = deserializeDraft(target.value);
    appStore.actions.setDraftScore("demo-match", "home", draft.home);
    appStore.actions.setDraftScore("demo-match", "away", draft.away);
  });

  confirmDraftButton?.addEventListener("click", () => {
    appStore.actions.confirmDraftScore("demo-match");
  });

  sampleButton?.addEventListener("click", () => {
    const currentCount = selectSimulationResultCount(appStore.getState());
    appStore.actions.upsertSimulationResult("A-M1", {
      home: currentCount % 3,
      away: (currentCount + 1) % 3,
    });
  });
}

function render() {
  const app = document.getElementById("app");
  if (!app) return;

  const state = appStore.getState();
  const currentPath = selectCurrentPath(state);
  const activeRoute = resolveRoute(currentPath);
  const uiState = selectUiState(state);
  const draftCount = selectSimulationDraftCount(state);
  const simulationCount = selectSimulationResultCount(state);
  const drafts = selectSimulationDrafts(state);
  const demoDraft = drafts["demo-match"] ?? createEmptyDraft();
  const computed = pipelineSelector ? pipelineSelector(state.simulation.results) : null;
  const computedSummary = computed
    ? {
        groups: computed.groupRankings.length,
        thirdPlaceTeams: computed.thirdPlaceRanking.length,
        roundOf32Resolved: computed.roundOf32.filter((match) => match.home && match.away).length,
      }
    : null;

  renderAppShell({
    root: app,
    routes: allRoutes,
    activeRoute,
    routeContent: renderRouteCard(activeRoute, {
      selectedGroupId: uiState.selectedGroupId,
      searchKeyword: uiState.searchKeyword,
      draftCount,
      simulationCount,
      demoDraftSerialized: serializeDraft(demoDraft),
      computedSummary,
    }),
    onNavigate: navigate,
  });

  if (dataPackLoadError) {
    console.error(dataPackLoadError);
  }
  bindRouteInteractions(app);
}

window.addEventListener("popstate", () => {
  appStore.actions.setCurrentPath(normalizePathname(window.location.pathname));
});

appStore.subscribe(render);
render();

loadDataPackFromPublic()
  .then((dataPack) => {
    pipelineSelector = createTournamentPipelineSelector(dataPack);
    render();
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    dataPackLoadError = `Failed to load data pack: ${message}`;
    render();
  });
