import type { LanguageModelV1 } from "ai";

/**
 * Result of a moderation check.
 */
export interface ModerationResult {
	allowed: boolean;
	reason?: string;
	categories?: string[];
}

/**
 * Global configuration for AI moderation.
 */
export interface ModerationConfig {
	/** The AI provider from Vercel AI SDK (e.g., openai("gpt-4o-mini")) */
	provider: LanguageModelV1;
	/** Custom moderation prompt (optional, uses default if not provided) */
	prompt?: string;
	/** Whether to moderate thread content (default: true) */
	checkThreads?: boolean;
	/** Whether to moderate reply content (default: true) */
	checkReplies?: boolean;
	/** Callback when content is flagged */
	onFlag?: (content: string, reason: string) => void;
}
