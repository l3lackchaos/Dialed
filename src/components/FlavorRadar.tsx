import { FLAVOR_AXES } from "../lib/constants";
import { useT } from "../i18n";

type Props = {
  /** 0–5 value per flavor axis. */
  values: Record<string, number | null>;
  size?: number;
  color?: string;
};

/** Tiny dependency-free SVG radar for the 5 flavor axes. */
export default function FlavorRadar({ values, size = 240, color = "#4F6B36" }: Props) {
  const t = useT();
  const n = FLAVOR_AXES.length;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 30; // leave room for labels

  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i: number, radius: number): [number, number] => [
    cx + Math.cos(angle(i)) * radius,
    cy + Math.sin(angle(i)) * radius,
  ];

  const rings = [1, 2, 3, 4, 5];
  const polygon = (radius: (i: number) => number) =>
    FLAVOR_AXES.map((_, i) => pt(i, radius(i)).join(",")).join(" ");

  const valuePoly = polygon((i) => {
    const v = values[FLAVOR_AXES[i]];
    const clamped = Math.max(0, Math.min(5, v ?? 0));
    return (clamped / 5) * r;
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" height={size} role="img" aria-label={t("session.flavorProfile")}>
      {/* grid rings */}
      {rings.map((ring) => (
        <polygon
          key={ring}
          points={polygon(() => (ring / 5) * r)}
          fill="none"
          stroke="rgba(42,39,34,0.10)"
          strokeWidth={1}
        />
      ))}
      {/* spokes */}
      {FLAVOR_AXES.map((_, i) => {
        const [x, y] = pt(i, r);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(42,39,34,0.10)" strokeWidth={1} />;
      })}
      {/* value area */}
      <polygon points={valuePoly} fill={color} fillOpacity={0.22} stroke={color} strokeWidth={2} strokeLinejoin="round" />
      {FLAVOR_AXES.map((_, i) => {
        const v = Math.max(0, Math.min(5, values[FLAVOR_AXES[i]] ?? 0));
        const [x, y] = pt(i, (v / 5) * r);
        return <circle key={i} cx={x} cy={y} r={3} fill={color} />;
      })}
      {/* labels */}
      {FLAVOR_AXES.map((axis, i) => {
        const [x, y] = pt(i, r + 16);
        const anchor = Math.abs(x - cx) < 4 ? "middle" : x > cx ? "start" : "end";
        return (
          <text
            key={axis}
            x={x}
            y={y}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize={11}
            fontWeight={500}
            fill="#6A665C"
          >
            {t(`taste.${axis}` as const)}
          </text>
        );
      })}
    </svg>
  );
}
