import { generateObject, type LanguageModelV1 } from "ai";
import { z } from "zod";
import type { ModerationResult } from "./types.ts";

const ModerationSchema = z.object({
	allowed: z.boolean(),
	reason: z.string().optional(),
	categories: z.array(z.string()).optional(),
});

const DEFAULT_PROMPT = `
You are a content moderator. Analyze the following content and determine if it should be allowed.

Check for:
- Hate speech or discrimination
- Harassment or bullying
- Violence or threats
- Sexual content
- Spam or scams

If the content violates any of these policies, set allowed to false and provide a reason.
`.trim();

/**
 * Moderate content using an AI provider.
 *
 * @param content - The content to moderate
 * @param provider - The AI provider from Vercel AI SDK
 * @param customPrompt - Optional custom moderation prompt
 * @returns ModerationResult indicating if content is allowed
 */
export async function moderateContent(
	content: string,
	provider: LanguageModelV1,
	customPrompt?: string,
): Promise<ModerationResult> {
	try {
		const { object } = await generateObject({
			model: provider,
			schema: ModerationSchema,
			prompt: `${customPrompt || DEFAULT_PROMPT}\n\nContent to moderate:\n${content}`,
		});
		return object;
	} catch (error) {
		// Fail open: allow content if moderation service errors
		console.error("[anythreads] Moderation error:", error);
		return { allowed: true };
	}
}
