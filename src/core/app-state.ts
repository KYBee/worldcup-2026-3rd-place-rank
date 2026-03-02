export type SimulatorResult = {
  home: number;
  away: number;
};

export type SimulatorDraft = {
  home: number | null;
  away: number | null;
};

export type AppState = {
  navigation: {
    currentPath: string;
  };
  ui: {
    selectedGroupId: string | null;
    searchKeyword: string;
  };
  simulation: {
    drafts: Record<string, SimulatorDraft>;
    results: Record<string, SimulatorResult>;
  };
};

export function createInitialAppState(pathname: string): AppState {
  return {
    navigation: {
      currentPath: pathname,
    },
    ui: {
      selectedGroupId: "A",
      searchKeyword: "",
    },
    simulation: {
      drafts: {},
      results: {},
    },
  };
}
