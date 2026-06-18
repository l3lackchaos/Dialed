/** A labelled 1–5 tasting slider with a live value badge. */
export default function ScoreSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[0.95rem] font-medium text-cream">{label}</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/15 text-sm font-bold text-gold tnum">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider"
        aria-label={label}
        aria-valuetext={`${value} / 5`}
      />
    </div>
  );
}
