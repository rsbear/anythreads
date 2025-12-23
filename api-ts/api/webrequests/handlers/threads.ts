import type { Anythreads } from "../../index";
import { parseBody, parseQueryParams } from "../utils/request";
import { error, resultToResponse } from "../utils/response";

export async function listThreads(
  anythreads: Anythreads,
  request: Request,
  _params: Record<string, string>,
): Promise<Response> {
  const query = parseQueryParams(request);

  const result = await anythreads.threads.findMany({
    where: {
      accountId: query.accountId,
      upstreamId: query.upstreamId,
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

export async function getThread(
  anythreads: Anythreads,
  _request: Request,
  params: Record<string, string>,
): Promise<Response> {
  const result = await anythreads.threads.findOne(params.id || "");
  return resultToResponse(result);
}

export async function getThreadComplete(
  anythreads: Anythreads,
  request: Request,
  params: Record<string, string>,
): Promise<Response> {
  const query = parseQueryParams(request);
  const result = await anythreads.threads.complete(params.id || "", query.maxReplyDepth);

  if (result.isErr) {
    return resultToResponse(result);
  }

  return resultToResponse(result);
}

export async function createThread(
  anythreads: Anythreads,
  request: Request,
  _params: Record<string, string>,
): Promise<Response> {
  const body = await parseBody(request);

  if (!body.title || !body.accountId) {
    return error("INVALID_REQUEST", "title and accountId are required", 400);
  }

  const result = await anythreads.threads.create({
    title: body.title,
    body: body.body || "",
    accountId: body.accountId,
    upstreamId: body.upstreamId,
    allowReplies: body.allowReplies !== undefined ? body.allowReplies : true,
    extras: body.extras || {},
  });

  return resultToResponse(result);
}

export async function updateThread(
  anythreads: Anythreads,
  request: Request,
  params: Record<string, string>,
): Promise<Response> {
  const body = await parseBody(request);

  const result = await anythreads.threads.update(params.id || "", {
    title: body.title,
    body: body.body,
    allowReplies: body.allowReplies,
    extras: body.extras,
  });

  return resultToResponse(result);
}

export async function deleteThread(
  anythreads: Anythreads,
  _request: Request,
  params: Record<string, string>,
): Promise<Response> {
  const result = await anythreads.threads.delete(params.id || "");
  return resultToResponse(result);
}

export async function getUserVotes(
  anythreads: Anythreads,
  request: Request,
  params: Record<string, string>,
): Promise<Response> {
  const query = parseQueryParams(request);
  const toHash = query.toHash === "true";

  const result = await anythreads.threads.userVotes({
    accountId: params.userId || "",
    threadId: params.id || "",
    toHash: toHash,
  });

  if (result.isErr) {
    return resultToResponse(result);
  }

  return resultToResponse(result);
}
