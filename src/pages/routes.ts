export type Route = {
  path: string;
  title: string;
  description: string;
};

export const allRoutes: Route[] = [
  { path: "/simulator", title: "시뮬레이터", description: "스코어 입력 시뮬레이터 화면 골격" },
  { path: "/groups", title: "조별순위", description: "조별 구성/순위 화면 골격" },
  { path: "/schedule", title: "스케줄", description: "경기 일정 화면 골격" },
  { path: "/bracket", title: "브래킷", description: "32강 브래킷 화면 골격" },
];

export function resolveRoute(pathname: string): Route {
  if (pathname === "/" || pathname === "") return allRoutes[0];
  return allRoutes.find((route) => route.path === pathname) ?? allRoutes[0];
}
