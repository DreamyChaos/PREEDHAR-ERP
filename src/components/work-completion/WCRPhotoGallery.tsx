"use client";

import * as React from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import type { WCRPhotoAttachment } from "@/lib/storage/types";
import { formatDate } from "@/lib/utils";
import {
  Image as ImageIcon,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Camera,
} from "lucide-react";

interface WCRPhotoGalleryProps {
  photos: WCRPhotoAttachment[];
}

export function WCRPhotoGallery({ photos }: WCRPhotoGalleryProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = React.useState<number | null>(null);

  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-6 bg-slate-50/70 rounded-lg border border-dashed border-slate-200 text-slate-400 text-xs">
        <Camera className="w-8 h-8 mx-auto mb-1 text-slate-300" />
        No inspection or handover photos attached to this report.
      </div>
    );
  }

  const activePhoto = selectedPhotoIndex !== null ? photos[selectedPhotoIndex] : null;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((selectedPhotoIndex + 1) % photos.length);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((selectedPhotoIndex - 1 + photos.length) % photos.length);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-[#2563EB]" />
          Site Inspection & Execution Photos ({photos.length})
        </h4>
        <span className="text-[10px] text-slate-400 font-medium">
          Click any photo to enlarge & inspect
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            onClick={() => setSelectedPhotoIndex(index)}
            className="group relative rounded-lg border border-slate-200 overflow-hidden bg-slate-100 cursor-pointer shadow-2xs hover:shadow-md transition-all hover:border-[#2563EB]"
          >
            <div className="aspect-4/3 w-full relative">
              {photo.url ? (
                <img
                  src={photo.url}
                  alt={photo.caption || photo.fileName}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-slate-400">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Maximize2 className="w-5 h-5 text-white" />
              </div>

              {/* Index Badge */}
              <span className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs">
                #{index + 1}
              </span>
            </div>

            {/* Caption in Card */}
            {photo.caption && (
              <div className="p-2 bg-white border-t border-slate-100">
                <p className="text-[10px] text-slate-700 font-medium line-clamp-2 leading-tight">
                  {photo.caption}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {activePhoto && (
        <Dialog open={selectedPhotoIndex !== null} onOpenChange={() => setSelectedPhotoIndex(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden bg-slate-950 border-slate-800 text-white">
            <div className="relative flex flex-col">
              {/* Header Bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-slate-800 z-10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-200">
                    Photo {(selectedPhotoIndex ?? 0) + 1} of {photos.length}
                  </span>
                  <span className="text-[11px] text-slate-400 truncate max-w-xs">
                    • {activePhoto.fileName}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedPhotoIndex(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Image View */}
              <div className="relative min-h-[400px] max-h-[70vh] flex items-center justify-center bg-black/90 p-4">
                {activePhoto.url && (
                  <img
                    src={activePhoto.url}
                    alt={activePhoto.caption || activePhoto.fileName}
                    className="max-h-[65vh] max-w-full object-contain rounded"
                  />
                )}

                {/* Nav Arrows */}
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={handlePrev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black text-white transition-all shadow-lg"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black text-white transition-all shadow-lg"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Caption & Metadata Footer */}
              <div className="px-4 py-3 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <p className="text-slate-200 font-medium">
                  {activePhoto.caption || "No caption provided"}
                </p>
                <div className="text-[10px] text-slate-400 flex items-center gap-2 shrink-0">
                  <span>{(activePhoto.fileSize / 1024).toFixed(0)} KB</span>
                  {activePhoto.uploadedBy && <span>• Uploaded by {activePhoto.uploadedBy}</span>}
                  <span>• {formatDate(activePhoto.uploadedAt)}</span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
