"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X, ArrowLeft } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

export interface DocumentViewerProps {
  open: boolean;
  onClose: () => void;
  documentType: string;
  documentNumber: string;
  statusBadges?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  documentClassName?: string;
}

export function DocumentViewer({
  open,
  onClose,
  documentType,
  documentNumber,
  statusBadges,
  actions,
  children,
  className,
  documentClassName,
}: DocumentViewerProps) {
  const [mounted, setMounted] = React.useState(false);
  const viewerRef = React.useRef<HTMLDivElement>(null);
  const closeBtnRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll, handle Escape key, and trap focus
  React.useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus close button on mount for accessibility
    setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      // Basic focus trapping within the viewer modal
      if (e.key === "Tab" && viewerRef.current) {
        const focusableElements = viewerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const content = (
    <div
      ref={viewerRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${documentType}: ${documentNumber}`}
      className={cn(
        "fixed inset-0 z-[500] flex flex-col bg-[#F5F7FA] select-text animate-in fade-in duration-150 print:bg-white print:static print:inset-auto",
        className
      )}
    >
      {/* Fixed Enterprise Document Toolbar */}
      <header className="shrink-0 h-16 md:h-18 bg-[#0B1F33] border-b border-[#0B1F33] shadow-md px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 z-10 print:hidden">
        {/* Left: Document Metadata */}
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-white/10 shrink-0 md:hidden"
            title="Back / Close"
            aria-label="Back / Close"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 truncate">
                {documentType}
              </span>
              <span className="hidden sm:inline text-slate-500">•</span>
              <h1 className="text-sm sm:text-base font-bold text-white font-numeric tracking-tight truncate">
                {documentNumber}
              </h1>
            </div>
            {statusBadges && (
              <div className="flex items-center gap-2 mt-0.5">
                {statusBadges}
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions & Close */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {actions && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {actions}
            </div>
          )}

          <div className="h-6 w-px bg-white/20 hidden sm:block mx-0.5" />

          <Button
            ref={closeBtnRef}
            variant="ghost"
            size="sm"
            leftIcon={<X className="w-4 h-4" />}
            onClick={onClose}
            className="hidden sm:inline-flex text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
            title="Close document viewer (Esc)"
          >
            Close
          </Button>
        </div>
      </header>

      {/* Dedicated Scrollable Document Canvas */}
      <main className="flex-1 overflow-y-auto bg-[#F5F7FA] py-6 sm:py-8 lg:py-10 px-3 sm:px-6 lg:px-8 print:p-0 print:overflow-visible print:bg-white">
        <div
          className={cn(
            "w-full max-w-[calc(100vw-24px)] sm:max-w-[calc(100vw-48px)] md:max-w-[860px] mx-auto bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-6 sm:p-10 md:p-12 text-slate-800 space-y-6 transition-all print:shadow-none print:border-none print:p-0 print:max-w-full",
            documentClassName
          )}
        >
          {children}
        </div>
      </main>
    </div>
  );

  return createPortal(content, document.body);
}
