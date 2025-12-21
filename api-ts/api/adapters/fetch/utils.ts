import type { Result } from "../../utils/result";
import { resultErr, resultOk } from "../../utils/result";

export interface FetchConfig {
  url: string;
  credentials?: "include" | "omit" | "same-origin";
}

export async function fetchRequest<T>(
  config: FetchConfig,
  path: string,
  options?: {
    method?: string;
    body?: any;
    params?: Record<string, any>;
  },
): Promise<Result<T>> {
  try {
    const baseUrl = config.url.endsWith("/") ? config.url.slice(0, -1) : config.url;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${baseUrl}${cleanPath}`);

    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const response = await fetch(url.toString(), {
      method: options?.method || "GET",
      headers,
      body: options?.body ? JSON.stringify(options.body) : undefined,
      credentials: config.credentials,
    });

    const responseData: any = await response.json();

    if (!response.ok) {
      const errorData = responseData?.error || {};
      return resultErr(
        (errorData.code as any) || "FETCH_ERROR",
        errorData.message || `HTTP ${response.status}`,
        {
          status: response.status,
          statusText: response.statusText,
          url: url.toString(),
          responseBody: responseData,
        },
      );
    }

    return resultOk(responseData.data as T);
  } catch (err) {
    return resultErr(
      "NETWORK_ERROR",
      err instanceof Error ? err.message : "Network request failed",
      {
        error: err,
        url: path,
      },
    );
  }
}
