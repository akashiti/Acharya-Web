// ─── Firebase Storage Helpers ─────────────────────────────────────────────────
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';

/**
 * Upload a file to Firebase Storage and return its public download URL.
 * @param {File} file - The file to upload
 * @param {string} path - Storage path, e.g., 'products/abc123/main.jpg'
 * @returns {Promise<string>} Download URL
 */
export async function uploadFile(file, path) {
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
