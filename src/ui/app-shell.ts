import { appMeta } from "@data/app-meta";
import type { Route } from "@pages/routes";

type RenderAppShellInput = {
  root: HTMLElement;
  routes: Route[];
  activeRoute: Route;
  routeContent: string;
  onNavigate: (path: string) => void;
};

function renderNavLink(route: Route, activePath: string) {
  const active = route.path === activePath ? "nav-link active" : "nav-link";
  return `<button class="${active}" data-path="${route.path}">${route.title}</button>`;
}

export function renderAppShell(input: RenderAppShellInput) {
  const { root, routes, activeRoute, routeContent, onNavigate } = input;
  const links = routes.map((route) => renderNavLink(route, activeRoute.path)).join("");

  root.innerHTML = `
    <main class="shell">
      <header class="header">
        <h1>${appMeta.name}</h1>
        <p>${appMeta.subtitle}</p>
      </header>
      <nav class="nav">${links}</nav>
      ${routeContent}
    </main>
  `;

  root.querySelectorAll<HTMLButtonElement>("button[data-path]").forEach((button) => {
    button.addEventListener("click", () => {
      const path = button.dataset.path;
      if (path) onNavigate(path);
    });
  });
}
