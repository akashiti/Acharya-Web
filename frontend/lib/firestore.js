// ─── Firestore Service Helpers ────────────────────────────────────────────────
// All Firestore CRUD operations for the frontend.
// Import from here instead of using Firestore SDK directly in components.

import {
  collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc,
  deleteDoc, query, where, orderBy, limit, onSnapshot,
  serverTimestamp, increment, writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ─── Re-export db for convenience ────────────────────────────────────────────
export { db };

// ─── Products ─────────────────────────────────────────────────────────────────
export const productsCol = () => collection(db, 'products');

export async function getProducts({ categoryId, featuredOnly, publishedOnly = true, limitCount } = {}) {
  let q = collection(db, 'products');
  const constraints = [];
  if (publishedOnly) constraints.push(where('published', '==', true));
  if (featuredOnly)  constraints.push(where('featured', '==', true));
  if (categoryId)    constraints.push(where('categoryId', '==', categoryId));
  constraints.push(orderBy('createdAt', 'desc'));
  if (limitCount)    constraints.push(limit(limitCount));
  q = query(q, ...constraints);
  const snap = await getDocs(q);
  const products = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  // Fallback for empty local database so Shop UI doesn't break
  if (products.length === 0) {
    return [
      {
        id: 'mock-1', slug: 'rudraksha-mala-108', title: 'Authentic 108 Rudraksha Mala',
        price: 1500, salePrice: 1200, stock: 50, featured: true, published: true,
        description: 'Blessed 108 bead Rudraksha mala for enhanced meditation and spiritual focus.',
        images: ['https://images.unsplash.com/photo-1605367375053-5d513511eb49?q=80&w=600&auto=format&fit=crop'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'mock-2', slug: 'himalayan-singing-bowl', title: 'Himalayan Singing Bowl',
        price: 3500, salePrice: 2999, stock: 15, featured: false, published: true,
        description: 'Hand-hammered singing bowl from the Himalayas for deep vibrational healing.',
        images: ['https://images.unsplash.com/photo-1610444583212-3df7beba8d88?q=80&w=600&auto=format&fit=crop'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'mock-3', slug: 'sandalwood-incense', title: 'Pure Sandalwood Incense',
        price: 450, salePrice: 400, stock: 100, featured: true, published: true,
        description: 'Organic sandalwood incense sticks for purifying your space.',
        images: ['https://images.unsplash.com/photo-1608678096538-237435f30894?q=80&w=600&auto=format&fit=crop'],
        createdAt: new Date().toISOString()
      }
    ];
  }

  return products;
}

export async function getAllProducts() {
  const snap = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getProductBySlug(slug) {
  const q = query(collection(db, 'products'), where('slug', '==', slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function getProductById(id) {
  const snap = await getDoc(doc(db, 'products', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createProduct(data) {
  return addDoc(collection(db, 'products'), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

export async function updateProduct(id, data) {
  return updateDoc(doc(db, 'products', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteProduct(id) {
  return deleteDoc(doc(db, 'products', id));
}

// ─── Categories ───────────────────────────────────────────────────────────────
export async function getCategories() {
  const snap = await getDocs(query(collection(db, 'categories'), orderBy('sortOrder', 'asc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getCategoryById(id) {
  const snap = await getDoc(doc(db, 'categories', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createCategory(data) {
  return addDoc(collection(db, 'categories'), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

export async function updateCategory(id, data) {
  return updateDoc(doc(db, 'categories', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteCategory(id) {
  return deleteDoc(doc(db, 'categories', id));
}

// ─── Cart (Subcollection: cartItems/{uid}/items/{productId}) ──────────────────
export function cartItemsCol(uid) {
  return collection(db, 'cartItems', uid, 'items');
}

// In-memory product cache to avoid N+1 reads on every cart snapshot
const _productCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedProduct(productId) {
  const cached = _productCache.get(productId);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;
  const product = await getProductById(productId);
  _productCache.set(productId, { data: product, ts: Date.now() });
  return product;
}

export function subscribeToCart(uid, callback) {
  return onSnapshot(cartItemsCol(uid), async (snap) => {
    const items = snap.docs.map(d => ({ productId: d.id, ...d.data() }));
    const enriched = await Promise.all(
      items.map(async (item) => {
        const product = await getCachedProduct(item.productId);
        return { ...item, product };
      })
    );
    callback(enriched);
  });
}

export async function addToCart(uid, productId, quantity = 1) {
  const ref = doc(db, 'cartItems', uid, 'items', productId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return updateDoc(ref, { quantity, updatedAt: serverTimestamp() });
  }
  return setDoc(ref, { productId, quantity, addedAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

export async function removeFromCart(uid, productId) {
  return deleteDoc(doc(db, 'cartItems', uid, 'items', productId));
}

export async function clearCart(uid) {
  const snap = await getDocs(cartItemsCol(uid));
  const batch = writeBatch(db);
  snap.docs.forEach(d => batch.delete(d.ref));
  return batch.commit();
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export async function getOrdersByUser(uid) {
  const q = query(collection(db, 'orders'), where('userId', '==', uid), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getAllOrders() {
  const snap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getOrderById(id) {
  const snap = await getDoc(doc(db, 'orders', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function updateOrder(id, data) {
  return updateDoc(doc(db, 'orders', id), { ...data, updatedAt: serverTimestamp() });
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function updateUserProfile(uid, data) {
  return updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() });
}

export async function getAllUsers() {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─── Journals ─────────────────────────────────────────────────────────────────
export async function getUserJournals(uid) {
  const q = query(collection(db, 'journals'), where('userId', '==', uid), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createJournal(uid, data) {
  return addDoc(collection(db, 'journals'), { ...data, userId: uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

export async function updateJournal(id, data) {
  return updateDoc(doc(db, 'journals', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteJournal(id) {
  return deleteDoc(doc(db, 'journals', id));
}

// ─── Articles ─────────────────────────────────────────────────────────────────
export async function getPublishedArticles() {
  const q = query(collection(db, 'articles'), where('published', '==', true), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getAllArticles() {
  const snap = await getDocs(query(collection(db, 'articles'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getArticleBySlug(slug) {
  const q = query(collection(db, 'articles'), where('slug', '==', slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function createArticle(data) {
  return addDoc(collection(db, 'articles'), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

export async function updateArticle(id, data) {
  return updateDoc(doc(db, 'articles', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteArticle(id) {
  return deleteDoc(doc(db, 'articles', id));
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
export async function getTestimonials({ featuredOnly = false } = {}) {
  let q = collection(db, 'testimonials');
  if (featuredOnly) {
    q = query(q, where('featured', '==', true), orderBy('createdAt', 'desc'));
  } else {
    q = query(q, orderBy('createdAt', 'desc'));
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createTestimonial(data) {
  return addDoc(collection(db, 'testimonials'), { ...data, createdAt: serverTimestamp() });
}

export async function updateTestimonial(id, data) {
  return updateDoc(doc(db, 'testimonials', id), data);
}

export async function deleteTestimonial(id) {
  return deleteDoc(doc(db, 'testimonials', id));
}

// ─── Banners (CMS) ────────────────────────────────────────────────────────────
export async function getBanners({ activeOnly = true } = {}) {
  let q = collection(db, 'banners');
  if (activeOnly) q = query(q, where('active', '==', true), orderBy('position', 'asc'));
  else q = query(q, orderBy('position', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createBanner(data) {
  return addDoc(collection(db, 'banners'), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

export async function updateBanner(id, data) {
  return updateDoc(doc(db, 'banners', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteBanner(id) {
  return deleteDoc(doc(db, 'banners', id));
}

// ─── Site Content (CMS) ───────────────────────────────────────────────────────
export async function getSiteContent(section) {
  const snap = await getDoc(doc(db, 'siteContent', section));
  if (!snap.exists()) return null;
  return snap.data();
}

export async function setSiteContent(section, content) {
  return setDoc(doc(db, 'siteContent', section), { content, updatedAt: serverTimestamp() }, { merge: true });
}

// ─── Contacts ─────────────────────────────────────────────────────────────────
// NOTE: For public contact form submissions, use the Cloud Function via
//       api.js → submitContact() which has server-side validation.
//       The functions below are for admin reads/deletes only.

export async function getAllContacts() {
  const snap = await getDocs(query(collection(db, 'contacts'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function deleteContact(id) {
  return deleteDoc(doc(db, 'contacts', id));
}
