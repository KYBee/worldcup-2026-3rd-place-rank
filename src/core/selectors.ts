import type { AppState } from "@core/app-state";

type Selector<T> = (state: AppState) => T;

function createMemoSelector<Input, Output>(
  inputSelector: Selector<Input>,
  compute: (input: Input) => Output
): Selector<Output> {
  let initialized = false;
  let prevInput: Input;
  let prevOutput: Output;

  return (state) => {
    const nextInput = inputSelector(state);
    if (!initialized || prevInput !== nextInput) {
      prevInput = nextInput;
      prevOutput = compute(nextInput);
      initialized = true;
    }
    return prevOutput;
  };
}

export const selectCurrentPath: Selector<string> = (state) => state.navigation.currentPath;
export const selectUiState: Selector<AppState["ui"]> = (state) => state.ui;
export const selectSimulationResults: Selector<AppState["simulation"]["results"]> = (state) =>
  state.simulation.results;
export const selectSimulationDrafts: Selector<AppState["simulation"]["drafts"]> = (state) =>
  state.simulation.drafts;

export const selectSimulationResultCount = createMemoSelector(
  selectSimulationResults,
  (results) => Object.keys(results).length
);

export const selectSimulationDraftCount = createMemoSelector(
  selectSimulationDrafts,
  (drafts) => Object.keys(drafts).length
);
