import { useThread } from "./Thread.browser.tsx";

export function Title({ className }: { className?: string }) {
  const thread = useThread();
  if (!thread) return null;
  return <span className={className}>{thread.title}</span>;
}

export function Body({ className }: { className?: string }) {
  const thread = useThread();
  if (!thread) return null;
  return <span className={className}>{thread.body}</span>;
}
