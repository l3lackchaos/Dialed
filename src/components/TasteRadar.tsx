import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { TASTE_AXES } from "../lib/constants";
import { useT } from "../i18n";

export type RadarSeries = {
  name: string;
  color: string;
  values: Record<string, number | null>;
};

/**
 * Six-axis tasting radar. Accepts one or more series so it works both for a
 * single brew preview and for comparing average bean profiles on the dashboard.
 */
export default function TasteRadar({
  series,
  height = 260,
}: {
  series: RadarSeries[];
  height?: number;
}) {
  const t = useT();
  const data = TASTE_AXES.map((axis) => {
    const row: Record<string, number | string | null> = {
      axis: t(`taste.${axis.key}` as const),
    };
    series.forEach((s, i) => {
      row[`s${i}`] = s.values[axis.key] ?? 0;
    });
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="rgba(244,233,212,0.12)" />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fill: "#D6C8AC", fontSize: 11, fontWeight: 500 }}
        />
        <PolarRadiusAxis
          domain={[0, 5]}
          tickCount={6}
          tick={{ fill: "#A99B7F", fontSize: 9 }}
          axisLine={false}
        />
        {series.map((s, i) => (
          <Radar
            key={s.name}
            name={s.name}
            dataKey={`s${i}`}
            stroke={s.color}
            strokeWidth={2}
            fill={s.color}
            fillOpacity={series.length > 1 ? 0.12 : 0.3}
            dot={series.length === 1}
          />
        ))}
      </RadarChart>
    </ResponsiveContainer>
  );
}
