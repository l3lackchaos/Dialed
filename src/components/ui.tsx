import type {
  ReactNode,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
} from "react";
import { Loader2, ChevronLeft } from "lucide-react";

export function Field({
  label,
  optionalText,
  hint,
  children,
  className = "",
}: {
  label: string;
  optionalText?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="label">
        {label}
        {optionalText && <span className="ml-1.5 font-normal text-cream-mute">· {optionalText}</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-cream-mute">{hint}</span>}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return <input className={`field ${className}`} {...rest} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return <textarea className={`field ${className}`} {...rest} />;
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
    <select className={`field ${className}`} {...rest}>
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
  return <Loader2 className={`animate-spin ${className}`} />;
}

export function PageLoader({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-cream-dim">
      <Spinner className="h-6 w-6 text-gold" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-espresso-700 ${className}`} />;
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
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/12 text-gold">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-cream">{title}</h3>
      <p className="max-w-xs text-[0.95rem] leading-relaxed text-cream-dim">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** Full-screen form shell with a back header and a sticky save bar. */
export function FormScreen({
  title,
  onClose,
  closeLabel,
  footer,
  children,
}: {
  title: string;
  onClose: () => void;
  closeLabel: string;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-espresso">
      <header className="safe-top sticky top-0 z-40 border-b border-cream/10 bg-espresso/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-lg items-center gap-2 px-3 py-3">
          <button onClick={onClose} className="-ml-1 flex h-10 items-center gap-1 rounded-lg pl-1 pr-2 text-cream-dim transition-colors hover:text-cream">
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm font-medium">{closeLabel}</span>
          </button>
          <h2 className="flex-1 truncate text-center text-base font-semibold text-cream">{title}</h2>
          <div className="h-10 w-16" aria-hidden />
        </div>
      </header>
      <div className="mx-auto w-full max-w-lg flex-1 px-4 py-5">{children}</div>
      <footer className="safe-bottom sticky bottom-0 z-40 border-t border-cream/10 bg-espresso/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-lg gap-3 px-4 py-3">{footer}</div>
      </footer>
    </div>
  );
}
