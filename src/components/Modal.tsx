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

/**
 * Center-screen dialog on desktop, bottom sheet on mobile.
 * Locks body scroll and closes on Escape / backdrop tap.
 */
export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: ModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-espresso-900/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex max-h-[92vh] w-full max-w-lg animate-scale-in flex-col overflow-hidden rounded-t-3xl border border-gold/20 bg-espresso-800 shadow-card sm:rounded-3xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-gold/10 px-5 py-4">
          <div>
            <h2 className="text-xl font-semibold text-cream">{title}</h2>
            {subtitle && (
              <p className="mt-0.5 text-sm text-cream-dim">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-cream-mute transition hover:bg-gold/10 hover:text-cream"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <footer className="flex items-center justify-end gap-3 border-t border-gold/10 bg-espresso-900/40 px-5 py-3.5 safe-bottom">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
