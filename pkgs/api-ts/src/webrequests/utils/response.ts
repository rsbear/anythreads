import type { Msg } from "../../common/msg.ts";
import { isErr, isNone, isSome } from "../../common/msg.ts";
import type { ErrorResponse, SuccessResponse } from "../types";

export function json<T>(
	value: SuccessResponse<T> | ErrorResponse,
	status = 200,
): Response {
	return new Response(JSON.stringify(value), {
		status,
		headers: {
			"Content-Type": "application/json",
		},
	});
}

export function success<T>(value: T, status = 200): Response {
	return json<T>({ value }, status);
}

export function error(code: string, message: string, status = 400): Response {
	return json({ error: { code, message } }, status);
}

export function resultToResponse<T>(result: {
	isOk: boolean;
	isErr: boolean;
	value?: T;
	err?: { tag: string; msg: string };
}): Response {
	if (result.isOk && result.value !== undefined) {
		return success(result.value);
	}
	if (result.isErr && result.err) {
		const status = errorCodeToStatus(result.err.tag);
		return error(result.err.tag, result.err.msg, status);
	}
	return error("UNKNOWN_ERROR", "An unknown error occurred", 500);
}

export function msgToResponse<T>(result: Msg<T>): Response {
	if (isSome(result)) {
		return success(result.value);
	}
	if (isNone(result)) {
		const reason = result.value?.reason || "Not found";
		return error("NOT_FOUND", reason, 404);
	}
	if (isErr(result)) {
		const metadata = result.value.metadata || {};
		const code = (metadata.code as string) || "INTERNAL_ERROR";
		const status = metadata.status || errorCodeToStatus(code);
		return error(code, result.value.msg, status);
	}
	return error("UNKNOWN_ERROR", "An unknown error occurred", 500);
}

function errorCodeToStatus(code: string): number {
	if (code.includes("NOT_FOUND")) return 404;
	if (code.includes("ALREADY_EXISTS") || code.includes("DUPLICATE")) return 409;
	if (code.includes("INVALID") || code.includes("REQUIRED")) return 400;
	return 500;
}
