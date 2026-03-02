export function normalizePathname(pathname: string): string {
  return pathname.replace(/\/+$/, "") || "/";
}
