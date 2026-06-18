import type { PourStep } from "./types";

/** Brew ratio as "1:16.7" from dose and water. */
export function computeRatio(
  dose: number | null | undefined,
  water: number | null | undefined,
): string | null {
  if (!dose || !water || dose <= 0) return null;
  return `1:${(water / dose).toFixed(1)}`;
}

/** Human date like "18 Jun 2026". Accepts a yyyy-mm-dd or ISO string. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value.length <= 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** "3 days ago" style relative label for roast freshness etc. */
export function daysSince(value: string | null | undefined): number | null {
  if (!value) return null;
  const d = new Date(value.length <= 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(d.getTime())) return null;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / 86_400_000);
}

/** "Rested 5d" freshness chip text from a roast date. */
export function restLabel(roastDate: string | null | undefined): string | null {
  const days = daysSince(roastDate);
  if (days === null) return null;
  if (days < 0) return "Roasts soon";
  if (days === 0) return "Roasted today";
  if (days === 1) return "Rested 1 day";
  return `Rested ${days} days`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Validate / normalise an mm:ss string; returns null if blank. */
export function isValidTime(value: string): boolean {
  if (!value) return true;
  return /^\d{1,2}:[0-5]\d$/.test(value.trim());
}

export function parsePourSchedule(raw: unknown): PourStep[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((r): r is Record<string, unknown> => typeof r === "object" && r !== null)
    .map((r) => ({
      pour: String(r.pour ?? ""),
      cumulative_g: String(r.cumulative_g ?? ""),
      time: String(r.time ?? ""),
      note: String(r.note ?? ""),
    }));
}

export function average(nums: Array<number | null | undefined>): number | null {
  const vals = nums.filter((n): n is number => typeof n === "number");
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}
