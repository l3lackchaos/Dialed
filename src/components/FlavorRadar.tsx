import { FLAVOR_AXES } from "../lib/constants";
import { useT } from "../i18n";

type Props = {
  /** 0–5 value per flavor axis. */
  values: Record<string, number | null>;
  size?: number;
};

/** Tiny dependency-free SVG radar for the 5 flavor axes. Theme-aware via classes. */
export default function FlavorRadar({ values, size = 240 }: Props) {
  const t = useT();
  const n = FLAVOR_AXES.length;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 30;

  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i: number, radius: number): [number, number] => [
    cx + Math.cos(angle(i)) * radius,
    cy + Math.sin(angle(i)) * radius,
  ];
  const polygon = (radius: (i: number) => number) =>
    FLAVOR_AXES.map((_, i) => pt(i, radius(i)).join(",")).join(" ");

  const valuePoly = polygon((i) => {
    const v = Math.max(0, Math.min(5, values[FLAVOR_AXES[i]] ?? 0));
    return (v / 5) * r;
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" height={size} role="img" aria-label={t("session.flavorProfile")}>
      {[1, 2, 3, 4, 5].map((ring) => (
        <polygon key={ring} points={polygon(() => (ring / 5) * r)} className="fill-none stroke-cream/10" strokeWidth={1} />
      ))}
      {FLAVOR_AXES.map((_, i) => {
        const [x, y] = pt(i, r);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} className="stroke-cream/10" strokeWidth={1} />;
      })}
      <polygon points={valuePoly} className="fill-gold/25 stroke-gold" strokeWidth={2} strokeLinejoin="round" />
      {FLAVOR_AXES.map((_, i) => {
        const v = Math.max(0, Math.min(5, values[FLAVOR_AXES[i]] ?? 0));
        const [x, y] = pt(i, (v / 5) * r);
        return <circle key={i} cx={x} cy={y} r={3} className="fill-gold" />;
      })}
      {FLAVOR_AXES.map((axis, i) => {
        const [x, y] = pt(i, r + 16);
        const anchor = Math.abs(x - cx) < 4 ? "middle" : x > cx ? "start" : "end";
        return (
          <text key={axis} x={x} y={y} textAnchor={anchor} dominantBaseline="middle" fontSize={11} fontWeight={500} className="fill-cream-dim">
            {t(`taste.${axis}` as const)}
          </text>
        );
      })}
    </svg>
  );
}
