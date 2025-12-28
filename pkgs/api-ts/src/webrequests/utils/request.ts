export async function parseBody(request: Request): Promise<Record<string, any>> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      const data = await request.json();
      return data as Record<string, any>;
    } catch {
      return {};
    }
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    try {
      const text = await request.text();
      return urlEncodedToObject(text);
    } catch {
      return {};
    }
  }

  return {};
}

export function parseQueryParams(request: Request): Record<string, any> {
  const url = new URL(request.url);
  const params: Record<string, any> = {};

  for (const [key, value] of url.searchParams.entries()) {
    params[key] = coerceValue(value);
  }

  return params;
}

function urlEncodedToObject(text: string): Record<string, any> {
  const obj: Record<string, any> = {};
  const params = new URLSearchParams(text);

  for (const [key, value] of params.entries()) {
    if (key.includes("[")) {
      setNestedValue(obj, key, value);
    } else {
      obj[key] = coerceValue(value);
    }
  }

  return obj;
}

function setNestedValue(obj: Record<string, any>, key: string, value: string): void {
  const match = key.match(/^(\w+)\[(\w+)\]$/);
  if (match && match[1] && match[2]) {
    const parent = match[1];
    const child = match[2];
    if (!obj[parent]) obj[parent] = {};
    obj[parent][child] = coerceValue(value);
  } else {
    obj[key] = coerceValue(value);
  }
}

function coerceValue(value: string): any {
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  if (/^\d+$/.test(value)) return Number(value);
  return value;
}
