import { Star } from "lucide-react";

/** Tap-to-rate 1–5 stars. Read-only when onChange is omitted. */
export default function StarRating({
  value,
  onChange,
  size = 28,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
}) {
  const readonly = !onChange;
  return (
    <div className="flex items-center gap-1.5" role={readonly ? undefined : "radiogroup"}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value;
        const star = (
          <Star
            style={{ width: size, height: size }}
            className={filled ? "fill-gold text-gold" : "fill-transparent text-cream-mute"}
            strokeWidth={2}
          />
        );
        if (readonly) return <span key={n}>{star}</span>;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${n}`}
            aria-checked={value === n}
            role="radio"
            className="transition-transform active:scale-90"
          >
            {star}
          </button>
        );
      })}
    </div>
  );
}
