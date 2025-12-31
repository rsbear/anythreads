"use client";

import type { ReplyWithNested } from "@anythreads/api/threads";
import type { PropsWithChildren } from "react";

export default function UpvoteButton({
	children,
	className,
	action,
	reply,
	threadId,
}: PropsWithChildren<{
	className?: string;
	action: any;
	reply: ReplyWithNested;
	threadId: string;
}>) {
	async function handleUpvoteClick() {
		const fd = new FormData();
		fd.set("threadId", threadId);
		fd.set("replyId", reply.id);
		fd.set("currentDirection", "up");
		return await action(fd);
	}
	return (
		<button type="button" className={className} onClick={handleUpvoteClick}>
			{children}
		</button>
	);
}
