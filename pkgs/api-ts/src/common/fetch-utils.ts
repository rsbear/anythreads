import { err, type Msg, none, some } from "./msg.ts";

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
): Promise<Msg<T>> {
	try {
		const baseUrl = config.url.endsWith("/")
			? config.url.slice(0, -1)
			: config.url;
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
			if (response.status === 404) {
				return none(errorData.message || "Not found");
			}
			return err(errorData.message || `HTTP ${response.status}`, {
				code: errorData.code || "FETCH_ERROR",
				status: response.status,
				statusText: response.statusText,
				url: url.toString(),
				responseBody: responseData,
			});
		}

		return some(responseData.value as T);
	} catch (error) {
		return err(
			error instanceof Error ? error.message : "Network request failed",
			{
				code: "NETWORK_ERROR",
				error: error instanceof Error ? error.message : String(error),
				url: path,
			},
		);
	}
}
