import type {
  ReactNode,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
} from "react";
import { Loader2 } from "lucide-react";

/** Labelled form field wrapper. */
export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-cream-mute">{hint}</span>}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return <input className={`input ${className}`} {...rest} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return <textarea className={`input min-h-[84px] resize-y ${className}`} {...rest} />;
}

export function Select({
  options,
  placeholder,
  className = "",
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & {
  options: readonly string[] | { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <select className={`input appearance-none ${className}`} {...rest}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => {
        const value = typeof opt === "string" ? opt : opt.value;
        const label = typeof opt === "string" ? opt : opt.label;
        return (
          <option key={value} value={value}>
            {label}
          </option>
        );
      })}
    </select>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return <Loader2 className={`h-5 w-5 animate-spin ${className}`} />;
}

export function LoadingState({ label = "Brewing…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-cream-dim">
      <Spinner className="h-7 w-7 text-gold" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10 text-gold">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-cream">{title}</h3>
      <p className="max-w-xs text-sm text-cream-dim">{description}</p>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h2 className="text-2xl font-semibold text-cream">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function StatPill({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-gold/10 bg-espresso-900/40 px-3 py-2">
      <p className="text-[0.65rem] uppercase tracking-wider text-cream-mute">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-cream">{value}</p>
    </div>
  );
}
