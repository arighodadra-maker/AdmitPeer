import { ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '@/lib/firebase';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_IMAGE_DIM = 1800;
const IMAGE_QUALITY = 0.82;
const COMPRESS_THRESHOLD = 200 * 1024;
// Files under this go straight to Firestore as base64 (1 round trip).
// Files above use Firebase Storage (2+ round trips but handles large payloads).
const INLINE_THRESHOLD = 256 * 1024; // 256 KB → ~341 KB base64, safe under Firestore 1 MB doc limit

export function validateTranscriptFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only PDF, JPG, PNG, or WEBP files are accepted.' };
  }
  if (file.size > MAX_BYTES) {
    return { valid: false, error: 'File must be under 10 MB.' };
  }
  return { valid: true };
}

const PHOTO_ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const PHOTO_MAX_DIM = 400; // px — enough for any avatar display size
const PHOTO_QUALITY = 0.85;
const PHOTO_MAX_BYTES = 5 * 1024 * 1024;

export function validateProfilePhoto(file: File): { valid: boolean; error?: string } {
  if (!PHOTO_ALLOWED.includes(file.type)) {
    return { valid: false, error: 'Only JPG, PNG, WEBP, or GIF files are accepted.' };
  }
  if (file.size > PHOTO_MAX_BYTES) {
    return { valid: false, error: 'Photo must be under 5 MB.' };
  }
  return { valid: true };
}

export async function uploadProfilePhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      // Centre-crop to square then scale down to PHOTO_MAX_DIM
      const size = Math.min(img.width, img.height);
      const sx = (img.width  - size) / 2;
      const sy = (img.height - size) / 2;
      const dim = Math.min(size, PHOTO_MAX_DIM);
      const canvas = document.createElement('canvas');
      canvas.width = dim;
      canvas.height = dim;
      canvas.getContext('2d')!.drawImage(img, sx, sy, size, size, 0, 0, dim, dim);
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('Compression failed')); return; }
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        },
        'image/jpeg',
        PHOTO_QUALITY,
      );
    };
    img.onerror = reject;
    img.src = url;
  });
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function compressImage(file: File): Promise<File> {
  if (file.size < COMPRESS_THRESHOLD) return file;
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > MAX_IMAGE_DIM || height > MAX_IMAGE_DIM) {
        const scale = MAX_IMAGE_DIM / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('Compression failed')); return; }
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
        },
        'image/jpeg',
        IMAGE_QUALITY,
      );
    };
    img.onerror = reject;
    img.src = url;
  });
}

export type TranscriptUploadResult =
  | { inline: true; dataUrl: string }   // stored directly in Firestore
  | { inline: false; path: string };    // stored in Firebase Storage

export async function uploadTranscript(
  uid: string,
  role: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<TranscriptUploadResult> {
  const isImage = file.type.startsWith('image/');
  const toUpload = isImage ? await compressImage(file) : file;

  // Fast path: small file → base64 in Firestore, single round trip
  if (toUpload.size <= INLINE_THRESHOLD) {
    const dataUrl = await fileToBase64(toUpload);
    onProgress?.(100);
    return { inline: true, dataUrl };
  }

  // Large file → Firebase Storage with progress
  const ext = isImage ? 'jpg' : (file.name.split('.').pop() ?? 'pdf');
  const path = `transcripts/${role}/${uid}.${ext}`;
  const task = uploadBytesResumable(ref(storage, path), toUpload);
  await new Promise<void>((resolve, reject) => {
    task.on(
      'state_changed',
      (snap) => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      () => resolve(),
    );
  });
  return { inline: false, path };
}
