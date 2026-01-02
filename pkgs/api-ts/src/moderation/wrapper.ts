import type {
	RepliesDataAdapter,
	ReplyCreate,
	ReplyUpdate,
} from "../adapters/adapter-replies.ts";
import type {
	ThreadCreate,
	ThreadsDataAdapter,
	ThreadUpdate,
} from "../adapters/adapter-threads.ts";
import type { Anythreads } from "../adapters/mod.ts";
import type { ModerationContext, WriteContext } from "../common/context.ts";
import { err } from "../common/msg.ts";
import { moderateContent } from "./service.ts";
import type { ModerationConfig } from "./types.ts";

/**
 * Wrap an Anythreads instance with moderation behavior.
 * Moderation is applied to threads.create, threads.update, replies.create, replies.update.
 */
export function withModeration(
	adapter: Anythreads,
	config: ModerationConfig,
): Anythreads {
	return {
		...adapter,
		threads: withThreadsModeration(adapter.threads, config),
		replies: withRepliesModeration(adapter.replies, config),
	};
}

function withThreadsModeration(
	threads: ThreadsDataAdapter,
	config: ModerationConfig,
): ThreadsDataAdapter {
	return {
		...threads,

		async create(data: ThreadCreate, ctx?: WriteContext) {
			// Skip moderation if disabled globally or via context
			if (config.checkThreads === false || ctx?.moderation?.skip === true) {
				const result = await threads.create(data, ctx);
				return {
					...result,
					metadata: { ...result.metadata, moderation: "pass" as const },
				};
			}

			// Use context provider/prompt if provided, otherwise use global config
			const provider = ctx?.moderation?.provider ?? config.provider;
			const prompt = ctx?.moderation?.prompt ?? config.prompt;
			const content = `${data.title}\n\n${data.body}`;

			const modResult = await moderateContent(content, provider, prompt);

			if (!modResult.allowed) {
				const reason = modResult.reason || "Content violates moderation policy";
				config.onFlag?.(content, reason);
				return err(
					reason,
					{ categories: modResult.categories },
					{ moderation: "reject" },
				);
			}

			const result = await threads.create(data, ctx);
			return {
				...result,
				metadata: { ...result.metadata, moderation: "pass" as const },
			};
		},

		async update(id: string, data: ThreadUpdate, ctx?: WriteContext) {
			// Skip moderation if disabled globally or via context
			if (config.checkThreads === false || ctx?.moderation?.skip === true) {
				const result = await threads.update(id, data, ctx);
				return {
					...result,
					metadata: { ...result.metadata, moderation: "pass" as const },
				};
			}

			// Only moderate if title or body is being updated
			if (!data.title && !data.body) {
				return threads.update(id, data, ctx);
			}

			const provider = ctx?.moderation?.provider ?? config.provider;
			const prompt = ctx?.moderation?.prompt ?? config.prompt;
			const content = [data.title, data.body].filter(Boolean).join("\n\n");

			const modResult = await moderateContent(content, provider, prompt);

			if (!modResult.allowed) {
				const reason = modResult.reason || "Content violates moderation policy";
				config.onFlag?.(content, reason);
				return err(
					reason,
					{ categories: modResult.categories },
					{ moderation: "reject" },
				);
			}

			const result = await threads.update(id, data, ctx);
			return {
				...result,
				metadata: { ...result.metadata, moderation: "pass" as const },
			};
		},
	};
}

function withRepliesModeration(
	replies: RepliesDataAdapter,
	config: ModerationConfig,
): RepliesDataAdapter {
	return {
		...replies,

		async create(data: ReplyCreate, ctx?: WriteContext) {
			// Skip moderation if disabled globally or via context
			if (config.checkReplies === false || ctx?.moderation?.skip === true) {
				const result = await replies.create(data, ctx);
				return {
					...result,
					metadata: { ...result.metadata, moderation: "pass" as const },
				};
			}

			const provider = ctx?.moderation?.provider ?? config.provider;
			const prompt = ctx?.moderation?.prompt ?? config.prompt;

			const modResult = await moderateContent(data.body, provider, prompt);

			if (!modResult.allowed) {
				const reason = modResult.reason || "Content violates moderation policy";
				config.onFlag?.(data.body, reason);
				return err(
					reason,
					{ categories: modResult.categories },
					{ moderation: "reject" },
				);
			}

			const result = await replies.create(data, ctx);
			return {
				...result,
				metadata: { ...result.metadata, moderation: "pass" as const },
			};
		},

		async update(id: string, data: ReplyUpdate, ctx?: WriteContext) {
			// Skip moderation if disabled globally or via context
			if (config.checkReplies === false || ctx?.moderation?.skip === true) {
				const result = await replies.update(id, data, ctx);
				return {
					...result,
					metadata: { ...result.metadata, moderation: "pass" as const },
				};
			}

			// Only moderate if body is being updated
			if (!data.body) {
				return replies.update(id, data, ctx);
			}

			const provider = ctx?.moderation?.provider ?? config.provider;
			const prompt = ctx?.moderation?.prompt ?? config.prompt;

			const modResult = await moderateContent(data.body, provider, prompt);

			if (!modResult.allowed) {
				const reason = modResult.reason || "Content violates moderation policy";
				config.onFlag?.(data.body, reason);
				return err(
					reason,
					{ categories: modResult.categories },
					{ moderation: "reject" },
				);
			}

			const result = await replies.update(id, data, ctx);
			return {
				...result,
				metadata: { ...result.metadata, moderation: "pass" as const },
			};
		},
	};
}
