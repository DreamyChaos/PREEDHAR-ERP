import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { IconButton } from "./IconButton";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] transition-opacity duration-200"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      {/* Modal Dialog Content Container */}
      <div className="relative z-10 w-full max-w-lg transition-all transform duration-200 animate-in fade-in zoom-in-95">
        {children}
      </div>
    </div>
  );
}

export function DialogContent({
  className,
  children,
  onClose,
}: {
  className?: string;
  children: React.ReactNode;
  onClose?: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className={cn(
        "relative w-full rounded-xl bg-white p-6 shadow-xl border border-slate-200 focus:outline-none text-left",
        className
      )}
    >
      {onClose && (
        <div className="absolute top-4 right-4">
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </IconButton>
        </div>
      )}
      {children}
    </div>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1.5 pb-4 border-b border-slate-100 pr-8", className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-lg font-bold text-[#0B1F33] leading-snug", className)}
      {...props}
    />
  );
}

export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs text-slate-500 leading-relaxed", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-4 border-t border-slate-100 mt-6",
        className
      )}
      {...props}
    />
  );
}
