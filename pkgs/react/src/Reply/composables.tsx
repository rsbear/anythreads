import { useThreadPersonalization } from "../mod";
import { Timestamp } from "../utils/Timestamp";
import { useReply } from "./Reply.browser";

export function Body({ className }: { className?: string }) {
  const reply = useReply();
  if (!reply) return null;
  return <span className={className}>{reply.body}</span>;
}

export function CreatedAt({ className }: { className?: string }) {
  const reply = useReply();
  if (!reply) return null;
  return (
    <Timestamp
      className={className}
      timestamp={reply.createdAt}
      format="distance"
    />
  );
}

export function UpdatedAt({ className }: { className?: string }) {
  const reply = useReply();
  if (!reply) return null;
  return (
    <Timestamp
      className={className}
      timestamp={reply.createdAt}
      format="distance"
    />
  );
}

export function ReplyToThisButton({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  const reply = useReply();
  const { setReplyToId } = useThreadPersonalization();

  if (!reply) return null;
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        setReplyToId(reply.id);
      }}
    >
      {children}
    </button>
  );
}
