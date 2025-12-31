import type { Anythreads } from "../../mod.ts";
import { parseBody, parseQueryParams } from "../utils/request";
import { error, msgToResponse } from "../utils/response";

export async function listVotes(
	anythreads: Anythreads,
	request: Request,
	_params: Record<string, string>,
): Promise<Response> {
	const query = parseQueryParams(request);

	const result = await anythreads.votes.findMany({
		where: {
			accountId: query.accountId,
			threadId: query.threadId,
			replyId: query.replyId,
			direction: query.direction,
		},
		order: {
			createdAt: query.orderCreatedAt || "desc",
			updatedAt: query.orderUpdatedAt,
		},
		limit: query.limit,
		offset: query.offset,
	});

	return msgToResponse(result);
}

export async function getVote(
	anythreads: Anythreads,
	_request: Request,
	params: Record<string, string>,
): Promise<Response> {
	const result = await anythreads.votes.findOne(params.id || "");
	return msgToResponse(result);
}

export async function createVote(
	anythreads: Anythreads,
	request: Request,
	_params: Record<string, string>,
): Promise<Response> {
	const body = await parseBody(request);

	if (!body.accountId || !body.threadId || !body.direction) {
		return error(
			"INVALID_REQUEST",
			"accountId, threadId, and direction are required",
			400,
		);
	}

	if (body.direction !== "up" && body.direction !== "down") {
		return error("INVALID_REQUEST", "direction must be 'up' or 'down'", 400);
	}

	const result = await anythreads.votes.create({
		accountId: body.accountId,
		threadId: body.threadId,
		replyId: body.replyId || null,
		direction: body.direction,
	});

	return msgToResponse(result);
}

export async function updateVote(
	anythreads: Anythreads,
	request: Request,
	params: Record<string, string>,
): Promise<Response> {
	const body = await parseBody(request);

	if (!body.direction) {
		return error("INVALID_REQUEST", "direction is required", 400);
	}

	if (body.direction !== "up" && body.direction !== "down") {
		return error("INVALID_REQUEST", "direction must be 'up' or 'down'", 400);
	}

	const result = await anythreads.votes.update(
		params.id || "",
		body.direction,
	);

	return msgToResponse(result);
}

export async function deleteVote(
	anythreads: Anythreads,
	_request: Request,
	params: Record<string, string>,
): Promise<Response> {
	const result = await anythreads.votes.delete(params.id || "");
	return msgToResponse(result);
}
