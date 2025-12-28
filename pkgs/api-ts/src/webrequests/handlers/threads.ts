import type { Anythreads } from "../../mod.ts";
import { parseBody, parseQueryParams } from "../utils/request";
import { error, msgToResponse } from "../utils/response";

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

  return msgToResponse(result);
}

export async function getThread(
  anythreads: Anythreads,
  _request: Request,
  params: Record<string, string>,
): Promise<Response> {
  const result = await anythreads.threads.findOne(params.id || "");
  return msgToResponse(result);
}

export async function getThreadComplete(
  anythreads: Anythreads,
  request: Request,
  params: Record<string, string>,
): Promise<Response> {
  const query = parseQueryParams(request);
  const result = await anythreads.threads.complete(params.id || "", query.maxReplyDepth);

  return msgToResponse(result);
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

  return msgToResponse(result);
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

  return msgToResponse(result);
}

export async function deleteThread(
  anythreads: Anythreads,
  _request: Request,
  params: Record<string, string>,
): Promise<Response> {
  const result = await anythreads.threads.delete(params.id || "");
  return msgToResponse(result);
}
