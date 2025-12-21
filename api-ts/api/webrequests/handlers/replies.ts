import type { Anythreads } from "../../index";
import { parseBody, parseQueryParams } from "../utils/request";
import { error, resultToResponse } from "../utils/response";

export async function listReplies(
  anythreads: Anythreads,
  request: Request,
  _params: Record<string, string>,
): Promise<Response> {
  const query = parseQueryParams(request);

  const result = await anythreads.replies.findMany({
    where: {
      accountId: query.accountId,
      threadId: query.threadId,
      replyToId: query.replyToId,
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

export async function getReply(
  anythreads: Anythreads,
  _request: Request,
  params: Record<string, string>,
): Promise<Response> {
  const result = await anythreads.replies.findOne(params.id || "");
  return resultToResponse(result);
}

export async function createReply(
  anythreads: Anythreads,
  request: Request,
  _params: Record<string, string>,
): Promise<Response> {
  const body = await parseBody(request);

  if (!body.threadId || !body.accountId || !body.body) {
    return error("INVALID_REQUEST", "threadId, accountId, and body are required", 400);
  }

  const result = await anythreads.replies.create({
    threadId: body.threadId,
    accountId: body.accountId,
    body: body.body,
    replyToId: body.replyToId,
    extras: body.extras || {},
  });

  return resultToResponse(result);
}

export async function updateReply(
  anythreads: Anythreads,
  request: Request,
  params: Record<string, string>,
): Promise<Response> {
  const body = await parseBody(request);

  const result = await anythreads.replies.update(params.id || "", {
    body: body.body,
    extras: body.extras,
  });

  return resultToResponse(result);
}

export async function deleteReply(
  anythreads: Anythreads,
  _request: Request,
  params: Record<string, string>,
): Promise<Response> {
  const result = await anythreads.replies.delete(params.id || "");
  return resultToResponse(result);
}
