import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

/** Bottom sheet on mobile, centered dialog on larger screens. Solid, not glass. */
export default function Modal({ open, onClose, title, subtitle, children, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-sheet flex items-end justify-center sm:items-center">
      <div className="animate-fade-in absolute inset-0 bg-espresso-900/80" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="animate-sheet-up relative flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-cream/10 bg-espresso-800 shadow-pop sm:rounded-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-cream/10 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-cream">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-cream-dim">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="-mr-1 rounded-lg p-1.5 text-cream-mute transition-colors hover:text-cream"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <footer className="safe-bottom flex gap-3 border-t border-cream/10 bg-espresso-900/40 px-5 py-3.5">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
