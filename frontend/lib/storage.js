// ─── Firebase Storage Helpers ─────────────────────────────────────────────────
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';

// ─── Validation Constants ─────────────────────────────────────────────────────
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
];

/**
 * Validate a file before upload.
 * @param {File} file
 * @throws {Error} if file is invalid
 */
function validateFile(file) {
  if (!file) throw new Error('No file provided.');
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 5MB.`);
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(`Invalid file type "${file.type}". Allowed: JPEG, PNG, GIF, WebP, SVG.`);
  }
}

/**
 * Upload a file to Firebase Storage and return its public download URL.
 * @param {File} file - The file to upload
 * @param {string} path - Storage path, e.g., 'products/abc123/main.jpg'
 * @returns {Promise<string>} Download URL
 */
export async function uploadFile(file, path) {
  validateFile(file);
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

/**
 * Upload a product image and return its URL.
 */
export async function uploadProductImage(productId, file) {
  const ext = file.name.split('.').pop();
  const path = `products/${productId}/${Date.now()}.${ext}`;
  return uploadFile(file, path);
}

/**
 * Upload a category image and return its URL.
 */
export async function uploadCategoryImage(categoryId, file) {
  const ext = file.name.split('.').pop();
  const path = `categories/${categoryId}/${Date.now()}.${ext}`;
  return uploadFile(file, path);
}

/**
 * Upload a banner image and return its URL.
 */
export async function uploadBannerImage(bannerId, file) {
  const ext = file.name.split('.').pop();
  const path = `banners/${bannerId}/${Date.now()}.${ext}`;
  return uploadFile(file, path);
}

/**
 * Upload a user avatar and return its URL.
 */
export async function uploadAvatar(uid, file) {
  const ext = file.name.split('.').pop();
  const path = `avatars/${uid}/avatar.${ext}`;
  return uploadFile(file, path);
}

/**
 * Delete a file from Firebase Storage by its full URL.
 */
export async function deleteFileByUrl(url) {
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch {
    // Silently ignore if file doesn't exist
  }
}
