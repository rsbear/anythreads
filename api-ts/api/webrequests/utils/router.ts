import type { Route } from "../types";

export function matchRoute(
  routes: Route[],
  method: string,
  path: string,
): { handler: Route["handler"]; params: Record<string, string> } | null {
  for (const route of routes) {
    if (route.method !== method) continue;

    const params = matchPattern(route.pattern, path);
    if (params !== null) {
      return { handler: route.handler, params };
    }
  }

  return null;
}

function matchPattern(pattern: string, path: string): Record<string, string> | null {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = path.split("/").filter(Boolean);

  if (patternParts.length !== pathParts.length) {
    return null;
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];

    if (patternPart?.startsWith(":")) {
      const paramName = patternPart.slice(1);
      if (pathPart) {
        params[paramName] = pathPart;
      }
    } else if (patternPart !== pathPart) {
      return null;
    }
  }

  return params;
}
