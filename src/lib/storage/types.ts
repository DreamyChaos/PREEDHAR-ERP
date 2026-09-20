export interface WCRPhotoAttachment {
  id: string;
  reportId: string;
  fileName: string;
  storagePath: string;
  url: string; // Base64 or signed/public URL
  dataUrl?: string; // Compressed base64 string for PDFs
  category?: 'BEFORE' | 'AFTER';
  mimeType: string;
  fileSize: number; // In bytes
  caption?: string;
  uploadedAt: string;
  uploadedBy?: string;
}

export interface PhotoUploadResult {
  success: boolean;
  photo?: WCRPhotoAttachment;
  error?: string;
  isLiveStorage: boolean;
}

export const ALLOWED_PHOTO_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const MAX_PHOTO_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_PHOTOS_PER_REPORT = 12;

