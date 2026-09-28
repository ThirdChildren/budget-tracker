import { useEffect, type FC, type ReactNode } from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

// Bottom sheet su mobile, dialog centrato su desktop
export const TransactionSheet: FC<Props> = ({ open, onClose, title, subtitle, children }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-hero/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      <div
        className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[2rem] border border-line bg-surface shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-300 sm:max-w-xl sm:rounded-[2rem] sm:slide-in-from-bottom-4"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* maniglia mobile */}
        <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-line sm:hidden" />
        <div className="flex items-start justify-between gap-4 px-5 pb-2 pt-4 sm:px-7 sm:pt-6">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-subtle">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-subtle transition-colors hover:bg-line hover:text-ink"
            aria-label="Chiudi"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-5 pt-2 sm:px-7 sm:pb-7">{children}</div>
      </div>
    </div>
  );
};
