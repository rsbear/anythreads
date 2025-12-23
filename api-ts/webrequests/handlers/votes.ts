import type { Anythreads } from "../../index";
import { parseBody, parseQueryParams } from "../utils/request";
import { error, resultToResponse } from "../utils/response";

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

  return resultToResponse(result);
}

export async function getVote(
  anythreads: Anythreads,
  _request: Request,
  params: Record<string, string>,
): Promise<Response> {
  const result = await anythreads.votes.findOne(params.id || "");
  return resultToResponse(result);
}

export async function voteUpThread(
  anythreads: Anythreads,
  request: Request,
  _params: Record<string, string>,
): Promise<Response> {
  const body = await parseBody(request);

  if (!body.accountId || !body.threadId) {
    return error("INVALID_REQUEST", "accountId and threadId are required", 400);
  }

  const result = await anythreads.votes.voteUpThread(body.accountId, body.threadId);

  return resultToResponse(result);
}

export async function voteDownThread(
  anythreads: Anythreads,
  request: Request,
  _params: Record<string, string>,
): Promise<Response> {
  const body = await parseBody(request);

  if (!body.accountId || !body.threadId) {
    return error("INVALID_REQUEST", "accountId and threadId are required", 400);
  }

  const result = await anythreads.votes.voteDownThread(body.accountId, body.threadId);

  return resultToResponse(result);
}

export async function voteUpReply(
  anythreads: Anythreads,
  request: Request,
  _params: Record<string, string>,
): Promise<Response> {
  const body = await parseBody(request);

  if (!body.accountId || !body.threadId || !body.replyId) {
    return error("INVALID_REQUEST", "accountId, threadId, and replyId are required", 400);
  }

  const result = await anythreads.votes.voteUpReply(body.accountId, body.threadId, body.replyId);

  return resultToResponse(result);
}

export async function voteDownReply(
  anythreads: Anythreads,
  request: Request,
  _params: Record<string, string>,
): Promise<Response> {
  const body = await parseBody(request);

  if (!body.accountId || !body.threadId || !body.replyId) {
    return error("INVALID_REQUEST", "accountId, threadId, and replyId are required", 400);
  }

  const result = await anythreads.votes.voteDownReply(body.accountId, body.threadId, body.replyId);

  return resultToResponse(result);
}

export async function deleteVote(
  anythreads: Anythreads,
  _request: Request,
  params: Record<string, string>,
): Promise<Response> {
  const result = await anythreads.votes.delete(params.id || "");
  return resultToResponse(result);
}
