# Acharya Ways — Architectural Audit & Restructuring Blueprint
### Senior Architect Review • Firebase-First Serverless Architecture

---

## 1. EXECUTIVE SUMMARY

**Platform**: Acharya Ways — Wellness E-Commerce & CMS  
**Current State**: Partially migrated from Express/Prisma monolith → Firebase serverless  
**Verdict**: The Firebase migration is ~70% complete. The frontend and Cloud Functions are well-structured, but the legacy backend is dead weight, and several critical gaps will cause runtime failures.

### Severity Matrix

| Severity | Count | Category |
|----------|-------|----------|
| 🔴 CRITICAL | 4 | Security, Data Loss, Build Failures |
| 🟡 HIGH | 5 | Runtime Errors, Broken Features |
| 🟠 MEDIUM | 4 | Performance, Maintainability |
| 🟢 LOW | 3 | Code Hygiene, DX |

---

## 2. ARCHITECTURE DIAGRAM (Current State)

```
┌──────────────────────────────────────────────────────────────┐
│                    CURRENT ARCHITECTURE                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  frontend/                 functions/           backend/     │
│  ┌──────────────┐         ┌──────────────┐    ┌──────────┐  │
│  │ Next.js 14   │         │ Cloud Funcs  │    │ Express  │  │
│  │ Static Export│         │ index.js     │    │ +Prisma  │  │
│  │              │────────▶│ 8 exports    │    │ 9 routes │  │
│  │ Firebase SDK │         │ admin-sdk    │    │ JWT auth │  │
│  │ Auth/FS/Stor │         │ Razorpay     │    │ SQLite?  │  │
│  └──────────────┘         └──────────────┘    └──────────┘  │
│         │                        │                  │        │
│         ▼                        ▼                  ▼        │
│  ┌─────────────────────────────────────┐    ┌──────────┐    │
│  │         Firebase Backend            │    │ DEAD     │    │
│  │  Firestore │ Auth │ Storage         │    │ Not used │    │
│  └─────────────────────────────────────┘    └──────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. CRITICAL FINDINGS (🔴)

### 3.1 — DEAD BACKEND: `backend/` is a Ghost Module

**Files**: `backend/server.js`, all controllers, routes, middleware  
**Risk**: Confusion, security surface, wasted dependency installs

The entire `backend/` directory runs Express + Prisma with JWT auth. But:
- Frontend `AuthContext.jsx` uses **Firebase Auth** (not JWT)
- Frontend `firestore.js` talks **directly to Firestore** (not Express API)
- Frontend `api.js` calls **Cloud Functions** (not Express routes)
- No frontend code imports from or calls the Express server

**The backend is completely disconnected.** It's leftover from the pre-Firebase architecture.

```
Action: DELETE entire backend/ directory after verification
Verification: grep -r "localhost:5000" frontend/  → should return 0 hits
              grep -r "API_URL" frontend/          → should return 0 hits
```

---

### 3.2 — ENV SECRETS COMMITTED TO GIT

**File**: `frontend/.env.local` (line 7)  
**Risk**: API key exposure in public repo

The `.env.local` was pushed to the GitHub repo (`omkar-1.0` branch). Even though `.gitignore` excludes `**/.env.local`, the file was committed before the `.gitignore` was in place.

Contains: Firebase API Key, App ID, Messaging Sender ID.

```
Action:
  1. git rm --cached frontend/.env.local
  2. Force-push to remove from history (or use BFG Repo-Cleaner)
  3. Rotate the API key in Firebase Console → Project Settings
  4. Add API key restrictions in Google Cloud Console
```

> [!CAUTION]
> Firebase API keys are designed to be public in web apps, but they MUST be restricted to your domain(s) via Google Cloud Console → API & Services → Credentials → HTTP referrer restrictions. Without this, anyone can abuse your project quotas.

---

### 3.3 — `output: 'export'` Kills Dynamic Features

**File**: `frontend/next.config.mjs`  
**Risk**: All `use client` hydration timing issues, no API routes, no middleware

Static export (`next build && next export`) means:
- No SSR, no ISR, no API routes, no `middleware.js`
- `useRouter` from `next/navigation` has limitations
- `generateStaticParams` is required for all dynamic route `[slug]` pages

This is acceptable for a Firebase Hosting SPA, but demands that:
- **Every page** is a client component or uses `generateStaticParams`
- Dynamic routes **must** either be fully client-side or have all slugs pre-generated

```
Action: Audit every page under app/ for generateStaticParams conflicts
        (This was already a known build issue from your deployment attempts)
```

---

### 3.4 — CORS Wildcard on Payment Functions

**File**: `functions/index.js` (lines 233-235, 297-299)  
**Risk**: Any domain can call your Razorpay functions

```javascript
res.set('Access-Control-Allow-Origin', '*');  // ← DANGEROUS
```

Payment functions (`createRazorpayOrder`, `verifyRazorpayPayment`) accept requests from **any origin**. An attacker can craft requests from their own site.

```
Action: Replace '*' with your Firebase Hosting domain:
        res.set('Access-Control-Allow-Origin', 'https://acharya-aashish-ways.web.app');
        Or use the functions.config() to make it configurable.
```

---

## 4. HIGH-SEVERITY FINDINGS (🟡)

### 4.1 — Firestore Rules: Journal Read Fails for New Documents

**File**: `firestore.rules` (lines 57-60)

```
match /journals/{journalId} {
  allow read, write: if isAuth() && resource.data.userId == request.auth.uid;
  allow create: if isAuth() && request.resource.data.userId == request.auth.uid;
}
```

The `read` rule checks `resource.data.userId`, but `resource` is `null` when the document doesn't exist yet. This doesn't affect reads (you can't read a non-existent doc), but `write` includes `update` AND `delete`, so this is fine — **except**: the `write` rule and the `create` rule overlap. The `create` rule is unreachable because `write` already covers it, **but** `write` requires `resource.data.userId` which doesn't exist on create. Net effect: **create might fail** depending on Firestore's rule evaluation order.

```
Action: Split explicitly:
  allow read: if isAuth() && resource.data.userId == request.auth.uid;
  allow create: if isAuth() && request.resource.data.userId == request.auth.uid;
  allow update, delete: if isAuth() && resource.data.userId == request.auth.uid;
```

---

### 4.2 — No Error Boundaries in Frontend

**File**: `frontend/app/layout.jsx`  
**Risk**: Any Firebase SDK error crashes the entire app with a white screen

Next.js 14 App Router supports `error.jsx` and `global-error.jsx` files. None exist.

```
Action: Create error.jsx in app/, app/admin/, app/shop/, app/cart/
        Create loading.jsx for skeleton UIs during Firebase data fetches
```

---

### 4.3 — Cart `subscribeToCart` N+1 Query Problem

**File**: `frontend/lib/firestore.js` (lines 90-101)

```javascript
export function subscribeToCart(uid, callback) {
  return onSnapshot(cartItemsCol(uid), async (snap) => {
    const items = snap.docs.map(d => ({ productId: d.id, ...d.data() }));
    const enriched = await Promise.all(
      items.map(async (item) => {
        const product = await getProductById(item.productId);  // ← 1 read per item!
        return { ...item, product };
      })
    );
    callback(enriched);
  });
}
```

Every cart change triggers **N additional Firestore reads** (one per cart item). With 10 items, that's 11 reads per snapshot. Firestore charges per read.

```
Action: Cache product data in the cart item document itself (denormalization)
        OR use getDoc with a local Map cache that invalidates on product updates
```

---

### 4.4 — Missing Firestore Indexes for Banners and Products

**File**: `firestore.indexes.json`

The `getBanners` function queries `where('active', '==', true), orderBy('position')` but there's **no composite index** for `banners` collection with `active` + `position` fields.

Similarly, `getProducts` with `publishedOnly + categoryId + orderBy(createdAt)` needs a 3-field index which exists, but `publishedOnly + featuredOnly` is a different combination not fully covered.

```
Action: Add missing indexes:
  { collection: "banners", fields: [active ASC, position ASC] }
  { collection: "products", fields: [published ASC, featured ASC, createdAt DESC] }
```

---

### 4.5 — `functions.config()` Is Deprecated

**File**: `functions/index.js` (lines 262-263, 321)

```javascript
functions.config().razorpay.key_id
functions.config().razorpay.key_secret
```

`functions.config()` is deprecated in Firebase Functions v2. Even in v1 (which this project uses), it's being phased out in favor of `defineSecret()` from `firebase-functions/params` or environment variables via `.env` files in the functions directory.

```
Action: Migrate to parameterized config:
  const { defineSecret } = require('firebase-functions/params');
  const razorpayKeyId = defineSecret('RAZORPAY_KEY_ID');
  const razorpaySecret = defineSecret('RAZORPAY_KEY_SECRET');
```

---

## 5. MEDIUM-SEVERITY FINDINGS (🟠)

### 5.1 — Duplicate Contact Submission Logic

`frontend/lib/firestore.js:submitContact` writes directly to Firestore. `frontend/services/api.js:submitContact` calls the Cloud Function `submitContact`. Both exist; it's unclear which pages use which. The Cloud Function has email validation; the direct write does not.

```
Action: Remove the direct Firestore write. Always use the Cloud Function
        (it has server-side validation and rate-limiting potential).
```

### 5.2 — No File Size/Type Validation on Storage Uploads

**File**: `frontend/lib/storage.js`

`uploadFile` takes any `File` object and pushes it to Storage. No client-side validation for file size or MIME type. Storage rules check auth but not file properties.

```
Action: Add client-side validation (max 5MB, image/* MIME types)
        Add Storage rule constraints:
        allow write: if ... && request.resource.size < 5 * 1024 * 1024
                     && request.resource.contentType.matches('image/.*');
```

### 5.3 — `render.yaml` Is Leftover

**File**: `render.yaml` (root)

This is a Render.com deployment config for the Express backend. Since the backend is dead and deployment is Firebase, this file is misleading.

```
Action: Delete render.yaml
```

### 5.4 — Build Artifact Logs in Repo

Multiple `.txt` files in both `frontend/` and `backend/` are debug/build logs that were committed:

```
frontend/: build_attempt.txt, build_err.txt, build_err_new.txt, build_fresh.txt,
           build_latest.txt, build_log.txt, build_log_new.txt, build_log_new2.txt,
           build_out.txt, build_out2.txt, build_out_new.txt, build_output.txt, build_result.txt
backend/:  boot_log.txt, debug.txt, prisma_output.txt, seed_out.txt, seed_output.txt,
           startup_log.txt, startup_output.txt, test_output.txt
root/:     git_out.txt, git_result.txt, push_log.txt, push_result.txt
```

```
Action: Delete all .txt log files. Add *.txt to .gitignore (or be selective).
```

---

## 6. LOW-SEVERITY FINDINGS (🟢)

### 6.1 — `crypto` Listed as Dependency in Functions

**File**: `functions/package.json` — `"crypto": "*"`

`crypto` is a built-in Node.js module. It doesn't need to be in `dependencies`. This is harmless but incorrect.

### 6.2 — Backend Test Files Are Stale

`backend/test_boot.js` and `backend/test_startup.js` test Express server boot — irrelevant if backend is removed.

### 6.3 — Batch Scripts Are Platform-Specific

`deploy_functions.bat`, `push_to_github.bat`, `setup_git.bat` — Windows-only, not cross-platform.

---

## 7. TARGET ARCHITECTURE (Post-Restructuring)

```
┌──────────────────────────────────────────────────────────────┐
│                    TARGET ARCHITECTURE                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  frontend/                          functions/               │
│  ┌────────────────────────┐        ┌──────────────────────┐  │
│  │  Next.js 14 (Static)   │        │  Cloud Functions v1  │  │
│  │                        │        │                      │  │
│  │  app/                  │        │  Callable:           │  │
│  │   ├─ layout.jsx        │        │   ├─ createOrder     │  │
│  │   ├─ error.jsx    ← NEW│        │   ├─ setAdminClaim   │  │
│  │   ├─ loading.jsx  ← NEW│        │   ├─ adminGetUsers   │  │
│  │   ├─ page.jsx          │        │   ├─ adminUpdateUser │  │
│  │   ├─ shop/             │        │   └─ submitContact   │  │
│  │   ├─ cart/             │        │                      │  │
│  │   ├─ checkout/         │        │  HTTPS:              │  │
│  │   ├─ admin/            │        │   ├─ createRzpOrder  │  │
│  │   ├─ login/            │        │   └─ verifyRzpPay    │  │
│  │   └─ signup/           │        │                      │  │
│  │                        │        │  Trigger:            │  │
│  │  lib/                  │        │   └─ onUserCreate    │  │
│  │   ├─ firebase.js       │        └──────────────────────┘  │
│  │   ├─ firestore.js      │                                  │
│  │   └─ storage.js        │        Config Files:             │
│  │                        │        ┌──────────────────────┐  │
│  │  context/              │        │  firebase.json       │  │
│  │   ├─ AuthContext.jsx   │        │  firestore.rules     │  │
│  │   └─ CartContext.jsx   │        │  firestore.indexes   │  │
│  │                        │        │  storage.rules       │  │
│  │  services/             │        │  .firebaserc         │  │
│  │   └─ api.js            │        └──────────────────────┘  │
│  │                        │                                  │
│  │  components/ (10)      │        ❌ backend/ → DELETED     │
│  └────────────────────────┘        ❌ render.yaml → DELETED  │
│                                    ❌ *.bat → DELETED        │
│                                    ❌ *.txt logs → DELETED   │
└──────────────────────────────────────────────────────────────┘
```

---

## 8. RESTRUCTURING EXECUTION PLAN

### Phase 1: Cleanup & Security Hardening
| # | Task | Files | Priority |
|---|------|-------|----------|
| 1 | Remove `backend/` directory entirely | `backend/*` | 🔴 |
| 2 | Purge `.env.local` from git history | git BFG / filter-branch | 🔴 |
| 3 | Delete `render.yaml`, all `.txt` logs, `.bat` scripts | root, frontend, backend | 🟡 |
| 4 | Fix CORS on payment functions → restrict origin | `functions/index.js` | 🔴 |
| 5 | Remove `"crypto": "*"` from functions deps | `functions/package.json` | 🟢 |

### Phase 2: Firebase Rules & Indexes
| # | Task | Files | Priority |
|---|------|-------|----------|
| 6 | Fix journal rules (split read/create/update+delete) | `firestore.rules` | 🟡 |
| 7 | Add missing composite indexes (banners, products) | `firestore.indexes.json` | 🟡 |
| 8 | Add Storage file size/type constraints | `storage.rules` | 🟠 |

### Phase 3: Frontend Resilience
| # | Task | Files | Priority |
|---|------|-------|----------|
| 9 | Add `error.jsx` and `global-error.jsx` | `frontend/app/` | 🟡 |
| 10 | Add `loading.jsx` skeleton UIs | `frontend/app/`, subdirs | 🟡 |
| 11 | Fix cart N+1 problem with product caching | `frontend/lib/firestore.js` | 🟠 |
| 12 | Remove duplicate `submitContact` from firestore.js | `frontend/lib/firestore.js` | 🟠 |
| 13 | Add client-side file upload validation | `frontend/lib/storage.js` | 🟠 |

### Phase 4: Functions Modernization
| # | Task | Files | Priority |
|---|------|-------|----------|
| 14 | Migrate `functions.config()` → `defineSecret` or `.env` | `functions/index.js` | 🟡 |
| 15 | Add structured logging and error reporting | `functions/index.js` | 🟠 |

### Phase 5: Build & Deploy Verification
| # | Task | Files | Priority |
|---|------|-------|----------|
| 16 | Run `next build` — verify clean static export | `frontend/` | 🔴 |
| 17 | Deploy functions → verify all 8 exports | `functions/` | 🔴 |
| 18 | Deploy rules + indexes → verify Firestore | root config | 🔴 |
| 19 | Smoke test: signup → browse → add to cart → checkout | browser | 🔴 |

---

## 9. VERIFICATION PLAN

### Automated
```bash
# 1. Frontend build must succeed
cd frontend && npm run build

# 2. Functions must lint cleanly
cd functions && npx eslint index.js

# 3. Firestore rules must deploy without errors
firebase deploy --only firestore:rules,firestore:indexes

# 4. Storage rules must deploy without errors
firebase deploy --only storage

# 5. No references to old backend exist
grep -r "localhost:5000" frontend/ --include="*.js" --include="*.jsx"
grep -r "API_URL" frontend/ --include="*.js" --include="*.jsx"
# Both should return 0 results
```

### Manual (User)
1. Open the deployed site → verify home page loads
2. Sign up with a new account → verify Firestore `users/` document created
3. Browse shop → verify products load from Firestore
4. Add items to cart → verify real-time cart updates
5. Proceed to checkout → verify Razorpay payment flow
6. Login to admin panel → verify admin dashboard loads
7. Check Firebase Console → verify rules are active, indexes are built

---

## 10. FILES TO DELETE (Full List)

```
DELETE backend/                          (entire directory)
DELETE render.yaml
DELETE deploy_functions.bat
DELETE push_to_github.bat
DELETE setup_git.bat
DELETE git_out.txt
DELETE git_result.txt
DELETE push_log.txt
DELETE push_result.txt
DELETE frontend/build_attempt.txt
DELETE frontend/build_err.txt
DELETE frontend/build_err_new.txt
DELETE frontend/build_fresh.txt
DELETE frontend/build_latest.txt
DELETE frontend/build_log.txt
DELETE frontend/build_log_new.txt
DELETE frontend/build_log_new2.txt
DELETE frontend/build_out.txt
DELETE frontend/build_out2.txt
DELETE frontend/build_out_new.txt
DELETE frontend/build_output.txt
DELETE frontend/build_result.txt
```

---

> [!IMPORTANT]
> This document is your single source of truth for the restructuring. Each phase is designed to be executed independently and verified before moving to the next. Do NOT skip Phase 1 — the security fixes are non-negotiable before any public deployment.
