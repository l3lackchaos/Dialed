// Controlled vocabularies from the spec. UI dropdowns are driven by these lists
// so the data stays consistent and the radar/averages line up across brews.

export const PROCESSES = [
  "Washed",
  "Natural",
  "Honey",
  "Anaerobic",
  "Semi-CM",
  "Chardonnay",
  "Double Anaerobic",
] as const;

export const ROAST_LEVELS = [
  "Light",
  "Medium-Light",
  "Medium",
  "Medium-Dark",
  "Omni",
  "Vienna",
] as const;

export const DRIPPERS = [
  "V60",
  "Origami",
  "Kalita Tsubame",
  "Pegasus",
  "Switch",
  "OREA",
] as const;

export const GRINDERS = [
  "C40 Nitro Blade+Starwave",
  "X25 Tigershark",
  "C2",
] as const;

// The six tasting axes used everywhere — sliders, radar, averages.
export const TASTE_AXES = [
  { key: "acidity", label: "Acidity" },
  { key: "body", label: "Body" },
  { key: "sweetness", label: "Sweetness" },
  { key: "bitterness", label: "Bitterness" },
  { key: "clarity", label: "Clarity" },
  { key: "overall", label: "Overall" },
] as const;

export type TasteAxis = (typeof TASTE_AXES)[number]["key"];

// The five flavor axes plotted on the radar (overall is the star score, separate).
export const FLAVOR_AXES = [
  "acidity",
  "body",
  "sweetness",
  "bitterness",
  "clarity",
] as const;

export type FlavorAxis = (typeof FLAVOR_AXES)[number];

// A tint per roast level so bean cards are scannable at a glance.
export const ROAST_TINT: Record<string, string> = {
  Light: "#E8C77A",
  "Medium-Light": "#D9A95A",
  Medium: "#C8963A",
  "Medium-Dark": "#9C6B2E",
  Omni: "#B98640",
  Vienna: "#6E4423",
};
