import type { Anythreads } from "../mod.ts";
import * as accounts from "./handlers/accounts.ts";
import * as replies from "./handlers/replies.ts";
import * as threads from "./handlers/threads.ts";
import * as votes from "./handlers/votes.ts";
import type { Route } from "./types.ts";
import { error } from "./utils/response.ts";
import { matchRoute } from "./utils/router.ts";

const routes: Route[] = [
  { method: "GET", pattern: "/threads", handler: threads.listThreads },
  { method: "GET", pattern: "/threads/:id", handler: threads.getThread },
  {
    method: "GET",
    pattern: "/threads/:id/complete",
    handler: threads.getThreadComplete,
  },
  { method: "POST", pattern: "/threads", handler: threads.createThread },
  { method: "PATCH", pattern: "/threads/:id", handler: threads.updateThread },
  { method: "DELETE", pattern: "/threads/:id", handler: threads.deleteThread },

  { method: "GET", pattern: "/accounts", handler: accounts.listAccounts },
  { method: "GET", pattern: "/accounts/:id", handler: accounts.getAccount },
  { method: "POST", pattern: "/accounts", handler: accounts.createAccount },
  {
    method: "PATCH",
    pattern: "/accounts/:id",
    handler: accounts.updateAccount,
  },
  {
    method: "DELETE",
    pattern: "/accounts/:id",
    handler: accounts.deleteAccount,
  },
  {
    method: "POST",
    pattern: "/accounts/:id/ban",
    handler: accounts.banAccount,
  },
  {
    method: "POST",
    pattern: "/accounts/:id/unban",
    handler: accounts.unbanAccount,
  },

  { method: "GET", pattern: "/replies", handler: replies.listReplies },
  { method: "GET", pattern: "/replies/:id", handler: replies.getReply },
  { method: "POST", pattern: "/replies", handler: replies.createReply },
  { method: "PATCH", pattern: "/replies/:id", handler: replies.updateReply },
  { method: "DELETE", pattern: "/replies/:id", handler: replies.deleteReply },

  { method: "GET", pattern: "/votes", handler: votes.listVotes },
  { method: "GET", pattern: "/votes/:id", handler: votes.getVote },
  { method: "POST", pattern: "/votes/create", handler: votes.createVote },
  { method: "PUT", pattern: "/votes/:id/update", handler: votes.updateVote },
  { method: "DELETE", pattern: "/votes/:id/delete", handler: votes.deleteVote },
  {
    method: "GET",
    pattern: "/accounts/:accountId/threads/:threadId/votes",
    handler: accounts.getPersonalizedThread,
  },
];

export async function webrequests(
  request: Request,
  anythreads: Anythreads,
): Promise<Response> {
  try {
    const url = new URL(request.url);
    let path = url.pathname;

    if (path.startsWith("/anythreads")) {
      path = path.slice("/anythreads".length);
    }
    if (path.startsWith("/api")) {
      path = path.slice("/api".length);
    }

    if (!path || path === "/") {
      return error("NOT_FOUND", "Route not found", 404);
    }

    const match = matchRoute(routes, request.method, path);

    if (!match) {
      return error("NOT_FOUND", "Route not found", 404);
    }

    return await match.handler(anythreads, request, match.params);
  } catch (err) {
    return error("INTERNAL_ERROR", "An internal error occurred", 500);
  }
}
