export type DateFmt = "distance" | "full";

type Unit = "second" | "minute" | "hour" | "day" | "month" | "year";

interface FormatDistanceOptions {
  addSuffix?: boolean;
  unit?: Unit;
  roundingMethod?: "floor" | "ceil" | "round";
}

/**
 * Formats the distance between the given date and now in a strict format.
 * Returns distance like "5 minutes", "2 hours", "3 days", etc.
 *
 * @param date - The date to compare with now
 * @param options - Optional configuration
 * @returns Formatted distance string
 *
 * @example
 * formatDistance(new Date(Date.now() - 1000 * 60 * 5))
 * // => "5 minutes"
 *
 * formatDistance(new Date(Date.now() + 1000 * 60 * 30), { addSuffix: true })
 * // => "in 30 minutes"
 */
export function formatDistance(
  date: Date,
  options: FormatDistanceOptions = {},
): string {
  const { addSuffix = false, unit, roundingMethod = "round" } = options;

  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const isPast = diffMs < 0;
  const absDiffMs = Math.abs(diffMs);

  // Time unit definitions in milliseconds
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;
  const month = day * 30.44; // Average month length
  const year = day * 365.25; // Account for leap years

  let value: number;
  let unitName: Unit;

  if (unit) {
    // If unit is specified, use it
    unitName = unit;
    switch (unit) {
      case "second":
        value = absDiffMs / second;
        break;
      case "minute":
        value = absDiffMs / minute;
        break;
      case "hour":
        value = absDiffMs / hour;
        break;
      case "day":
        value = absDiffMs / day;
        break;
      case "month":
        value = absDiffMs / month;
        break;
      case "year":
        value = absDiffMs / year;
        break;
    }
  } else {
    // Auto-select the most appropriate unit
    if (absDiffMs < minute) {
      value = absDiffMs / second;
      unitName = "second";
    } else if (absDiffMs < hour) {
      value = absDiffMs / minute;
      unitName = "minute";
    } else if (absDiffMs < day) {
      value = absDiffMs / hour;
      unitName = "hour";
    } else if (absDiffMs < month) {
      value = absDiffMs / day;
      unitName = "day";
    } else if (absDiffMs < year) {
      value = absDiffMs / month;
      unitName = "month";
    } else {
      value = absDiffMs / year;
      unitName = "year";
    }
  }

  // Apply rounding method
  let roundedValue: number;
  switch (roundingMethod) {
    case "floor":
      roundedValue = Math.floor(value);
      break;
    case "ceil":
      roundedValue = Math.ceil(value);
      break;
    case "round":
    default:
      roundedValue = Math.round(value);
      break;
  }

  // Handle zero case
  if (roundedValue === 0) {
    roundedValue = 1;
  }

  // Format the unit name (singular vs plural)
  const unitLabel = roundedValue === 1 ? unitName : `${unitName}s`;

  // Build the result string
  let result = `${roundedValue} ${unitLabel}`;

  if (addSuffix) {
    result = isPast ? `${result} ago` : `in ${result}`;
  }

  return result;
}

// Example usage:
// formatDistance(new Date(Date.now() - 1000 * 60 * 5))
// => "5 minutes"
//
// formatDistance(new Date(Date.now() + 1000 * 60 * 30), { addSuffix: true })
// => "in 30 minutes"
//
// formatDistance(new Date(Date.now() - 1000 * 60 * 60 * 24 * 2))
// => "2 days"
//
// formatDistance(new Date(Date.now() - 1000 * 60 * 60 * 3), { unit: 'minute' })
// => "180 minutes"
