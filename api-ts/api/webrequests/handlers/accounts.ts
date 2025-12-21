import type { Anythreads } from "../../index";
import { parseBody, parseQueryParams } from "../utils/request";
import { error, resultToResponse } from "../utils/response";

export async function listAccounts(
  anythreads: Anythreads,
  request: Request,
  _params: Record<string, string>,
): Promise<Response> {
  const query = parseQueryParams(request);

  const result = await anythreads.accounts.findMany({
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

export async function getAccount(
  anythreads: Anythreads,
  _request: Request,
  params: Record<string, string>,
): Promise<Response> {
  const result = await anythreads.accounts.findOne(params.id || "");
  return resultToResponse(result);
}

export async function createAccount(
  anythreads: Anythreads,
  request: Request,
  _params: Record<string, string>,
): Promise<Response> {
  const body = await parseBody(request);

  if (!body.username) {
    return error("INVALID_REQUEST", "username is required", 400);
  }

  const result = await anythreads.accounts.create({
    username: body.username,
    email: body.email,
    upstreamId: body.upstreamId,
    badge: body.badge,
    extras: body.extras || {},
  });

  return resultToResponse(result);
}

export async function updateAccount(
  anythreads: Anythreads,
  request: Request,
  params: Record<string, string>,
): Promise<Response> {
  const body = await parseBody(request);

  const result = await anythreads.accounts.update(params.id || "", {
    username: body.username,
    email: body.email,
    upstreamId: body.upstreamId,
    badge: body.badge,
    extras: body.extras,
  });

  return resultToResponse(result);
}

export async function deleteAccount(
  anythreads: Anythreads,
  _request: Request,
  params: Record<string, string>,
): Promise<Response> {
  const result = await anythreads.accounts.delete(params.id || "");
  return resultToResponse(result);
}

export async function banAccount(
  anythreads: Anythreads,
  request: Request,
  params: Record<string, string>,
): Promise<Response> {
  const body = await parseBody(request);
  const until = body.until ? new Date(body.until) : null;
  const result = await anythreads.accounts.ban(params.id || "", until);
  return resultToResponse(result);
}

export async function unbanAccount(
  anythreads: Anythreads,
  _request: Request,
  params: Record<string, string>,
): Promise<Response> {
  const result = await anythreads.accounts.unban(params.id || "");
  return resultToResponse(result);
}
