"use client";

import * as React from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PDFPreviewModalProps {
  open: boolean;
  onClose: () => void;
  blobUrl: string | null;
  filename: string;
}

export function PDFPreviewModal({ open, onClose, blobUrl, filename }: PDFPreviewModalProps) {
  // Revoke previous blob URL on close to free memory
  React.useEffect(() => {
    if (!open && blobUrl) {
      return () => URL.revokeObjectURL(blobUrl);
    }
  }, [open, blobUrl]);

  if (!open || !blobUrl) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-black/80" role="dialog" aria-modal="true">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0B1F33] shrink-0">
        <span className="text-sm font-medium text-white truncate">{filename}</span>
        <div className="flex items-center gap-2">
          <a
            href={blobUrl}
            download={filename}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#E07614] text-white rounded-lg hover:bg-[#c96a10] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </a>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF iframe */}
      <div className="flex-1 min-h-0">
        <iframe
          src={blobUrl}
          className="w-full h-full border-0"
          title={filename}
        />
      </div>
    </div>
  );
}
