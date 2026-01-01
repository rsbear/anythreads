import { formatDistance } from "./date-fmt";

type DateFormatter = "distance" | "formal";

export function Timestamp({
  timestamp,
  format,
  className,
}: {
  timestamp: Date;
  format: DateFormatter;
  className?: string;
}) {
  if (format === "distance") {
    const fmt = formatDistance(timestamp);
    return (
      <time className={className} dateTime={timestamp.toISOString()}>
        {fmt}
      </time>
    );
  }
  return (
    <time className={className} dateTime={timestamp.toISOString()}>
      {timestamp.toLocaleString()}
    </time>
  );
}
