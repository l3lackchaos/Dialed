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
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium text-cream">{label}</span>
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gold/15 text-xs font-bold text-gold">
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
      />
      <div className="mt-1 flex justify-between px-0.5 text-[0.6rem] text-cream-mute">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n}>{n}</span>
        ))}
      </div>
    </div>
  );
}
