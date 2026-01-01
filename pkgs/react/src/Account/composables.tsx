import { useAccount } from "./Account.browser";

/**
 * Wraps account.username in a span
 */
export function Username({ className }: { className?: string }) {
  const account = useAccount();
  if (!account) return null;
  return <span className={className}>{account.username}</span>;
}

/**
 * Wraps account.badge in a span
 */
export function Badge({ className }: { className?: string }) {
  const account = useAccount();
  if (!account) return null;
  return <span className={className}>{account.username}</span>;
}
