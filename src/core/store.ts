import { createEmptyDraft, isDraftComplete } from "@core/score-input";
import type { AppState, SimulatorResult } from "@core/app-state";

type Listener = () => void;

export type AppStore = {
  getState: () => AppState;
  subscribe: (listener: Listener) => () => void;
  actions: {
    setCurrentPath: (path: string) => void;
    setSelectedGroupId: (groupId: string | null) => void;
    setSearchKeyword: (keyword: string) => void;
    setDraftScore: (matchId: string, side: "home" | "away", value: number | null) => void;
    confirmDraftScore: (matchId: string) => void;
    upsertSimulationResult: (matchId: string, result: SimulatorResult) => void;
  };
};

export function createStore(initialState: AppState): AppStore {
  let state = initialState;
  const listeners = new Set<Listener>();

  function notify() {
    listeners.forEach((listener) => listener());
  }

  function update(producer: (prev: AppState) => AppState) {
    state = producer(state);
    notify();
  }

  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    actions: {
      setCurrentPath(path) {
        update((prev) => ({
          ...prev,
          navigation: {
            ...prev.navigation,
            currentPath: path,
          },
        }));
      },
      setSelectedGroupId(groupId) {
        update((prev) => ({
          ...prev,
          ui: {
            ...prev.ui,
            selectedGroupId: groupId,
          },
        }));
      },
      setSearchKeyword(keyword) {
        update((prev) => ({
          ...prev,
          ui: {
            ...prev.ui,
            searchKeyword: keyword,
          },
        }));
      },
      setDraftScore(matchId, side, value) {
        update((prev) => {
          const prevDraft = prev.simulation.drafts[matchId] ?? createEmptyDraft();
          return {
            ...prev,
            simulation: {
              ...prev.simulation,
              drafts: {
                ...prev.simulation.drafts,
                [matchId]: {
                  ...prevDraft,
                  [side]: value,
                },
              },
            },
          };
        });
      },
      confirmDraftScore(matchId) {
        update((prev) => {
          const draft = prev.simulation.drafts[matchId] ?? createEmptyDraft();
          if (!isDraftComplete(draft)) return prev;

          return {
            ...prev,
            simulation: {
              ...prev.simulation,
              results: {
                ...prev.simulation.results,
                [matchId]: {
                  home: draft.home,
                  away: draft.away,
                },
              },
            },
          };
        });
      },
      upsertSimulationResult(matchId, result) {
        update((prev) => ({
          ...prev,
          simulation: {
            ...prev.simulation,
            results: {
              ...prev.simulation.results,
              [matchId]: result,
            },
          },
        }));
      },
    },
  };
}
