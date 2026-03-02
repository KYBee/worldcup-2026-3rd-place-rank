import type { Route } from "@pages/routes";

type RouteCardState = {
  selectedGroupId: string | null;
  searchKeyword: string;
  draftCount: number;
  simulationCount: number;
  demoDraftSerialized: string;
  computedSummary: {
    groups: number;
    thirdPlaceTeams: number;
    roundOf32Resolved: number;
  } | null;
};

export function renderRouteCard(route: Route, state: RouteCardState): string {
  const selectedGroup = state.selectedGroupId ?? "";

  return `
    <section class="card">
      <h2>${route.title}</h2>
      <p>${route.description}</p>
      <p class="muted">Current path: ${route.path}</p>

      <div class="state-panel">
        <h3>State Snapshot</h3>
        <label class="field">
          <span>Search Keyword</span>
          <input data-role="search-keyword" value="${state.searchKeyword}" placeholder="Type keyword..." />
        </label>
        <label class="field">
          <span>Selected Group</span>
          <select data-role="selected-group">
            ${["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"]
              .map((groupId) =>
                groupId === selectedGroup
                  ? `<option value="${groupId}" selected>${groupId}</option>`
                  : `<option value="${groupId}">${groupId}</option>`
              )
              .join("")}
          </select>
        </label>
        <div class="state-row">
          <span>Draft Inputs: <strong>${state.draftCount}</strong></span>
          <span>Confirmed Inputs: <strong>${state.simulationCount}</strong></span>
        </div>
        <label class="field">
          <span>Demo Match Draft (home:away)</span>
          <input
            data-role="demo-draft"
            value="${state.demoDraftSerialized}"
            placeholder="e.g. 0:0 or 2:1"
          />
        </label>
        <div class="state-row">
          <span class="muted">null은 비입력 상태, 0:0은 확정 무승부</span>
          <button class="nav-link" data-role="confirm-draft">Confirm Draft</button>
        </div>
        <div class="state-row">
          <button class="nav-link" data-role="add-sample-result">Add Sample Input</button>
        </div>
        <div class="state-row">
          ${
            state.computedSummary
              ? `<span class="muted">Computed: groups=${state.computedSummary.groups}, third=${state.computedSummary.thirdPlaceTeams}, r32 resolved=${state.computedSummary.roundOf32Resolved}</span>`
              : `<span class="muted">Computed: loading data pack...</span>`
          }
        </div>
      </div>
    </section>
  `;
}
