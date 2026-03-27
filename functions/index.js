// ─── Cloud Functions - Acharya Ways ──────────────────────────────────────────
// All Cloud Functions for the platform.
// Deploy: firebase deploy --only functions

const functions  = require('firebase-functions');
const admin      = require('firebase-admin');
const crypto     = require('crypto');
const Razorpay   = require('razorpay');

// Allowed origins for CORS (Firebase Hosting domains)
const ALLOWED_ORIGINS = [
  'https://acharya-aashish-ways.web.app',
  'https://acharya-aashish-ways.firebaseapp.com',
  'http://localhost:3000', // dev only
];

admin.initializeApp();
const db = admin.firestore();

// ─── Region ───────────────────────────────────────────────────────────────────
const REGION = 'asia-south1'; // Mumbai - lowest latency for India

// ─── 1. onUserCreate Trigger ──────────────────────────────────────────────────
// Fires whenever a new Firebase Auth user is created.
// Creates a Firestore user document and sets default custom claim role='USER'.
exports.onUserCreate = functions
  .region(REGION)
  .auth.user()
  .onCreate(async (user) => {
    const { uid, email, displayName, photoURL } = user;

    // Set custom claim: role = USER (default)
    await admin.auth().setCustomUserClaims(uid, { role: 'USER' });

    // Create Firestore profile document
    await db.collection('users').doc(uid).set({
      name:      displayName || '',
      email:     email || '',
      role:      'USER',
      avatar:    photoURL   || null,
      phone:     null,
      address:   null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true }); // merge so we don't overwrite if frontend already set it

    console.log(`✅ User created: ${uid} (${email})`);
  });

// ─── 2. setAdminClaim (Admin-only Callable) ───────────────────────────────────
// Elevates a user to ADMIN role. Only existing admins can call this.
exports.setAdminClaim = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    // Must be authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'You must be logged in.');
    }

    // Must be an admin
    if (context.auth.token.role !== 'ADMIN') {
      throw new functions.https.HttpsError('permission-denied', 'Only admins can assign admin roles.');
    }

    const { targetUid, role } = data;
    if (!targetUid || !['ADMIN', 'USER'].includes(role)) {
      throw new functions.https.HttpsError('invalid-argument', 'targetUid and role (ADMIN | USER) are required.');
    }

    await admin.auth().setCustomUserClaims(targetUid, { role });
    await db.collection('users').doc(targetUid).update({ role, updatedAt: admin.firestore.FieldValue.serverTimestamp() });

    console.log(`✅ Role updated: ${targetUid} → ${role}`);
    return { success: true, message: `User ${targetUid} role set to ${role}` };
  });

// ─── 3. adminGetUsers (Admin-only Callable) ───────────────────────────────────
// Returns a list of all Firebase Auth users with their custom claims.
exports.adminGetUsers = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'You must be logged in.');
    }
    if (context.auth.token.role !== 'ADMIN') {
      throw new functions.https.HttpsError('permission-denied', 'Admin only.');
    }

    const listResult = await admin.auth().listUsers(data.limit || 100, data.pageToken);
    const users = listResult.users.map(u => ({
      uid:           u.uid,
      email:         u.email,
      displayName:   u.displayName || '',
      photoURL:      u.photoURL || null,
      role:          (u.customClaims && u.customClaims.role) || 'USER',
      disabled:      u.disabled,
      createdAt:     u.metadata.creationTime,
      lastSignInAt:  u.metadata.lastSignInTime,
    }));

    return { users, pageToken: listResult.pageToken };
  });

// ─── 4. adminUpdateUser (Admin-only Callable) ─────────────────────────────────
// Update user role or disabled status.
exports.adminUpdateUser = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'You must be logged in.');
    }
    if (context.auth.token.role !== 'ADMIN') {
      throw new functions.https.HttpsError('permission-denied', 'Admin only.');
    }

    const { targetUid, role, disabled } = data;
    if (!targetUid) {
      throw new functions.https.HttpsError('invalid-argument', 'targetUid is required.');
    }

    const updates = {};
    if (role && ['ADMIN', 'USER'].includes(role)) {
      await admin.auth().setCustomUserClaims(targetUid, { role });
      updates.role = role;
    }
    if (typeof disabled === 'boolean') {
      await admin.auth().updateUser(targetUid, { disabled });
    }
    if (Object.keys(updates).length > 0) {
      updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
      await db.collection('users').doc(targetUid).update(updates);
    }

    return { success: true };
  });

// ─── 5. createOrder (Callable) ────────────────────────────────────────────────
// Validates cart items, checks stock, creates a Firestore order document,
// and clears the user's cart. Called from the checkout page.
exports.createOrder = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to place an order.');
    }

    const uid = context.auth.uid;
    const { shippingInfo, notes } = data;

    if (!shippingInfo || !shippingInfo.name || !shippingInfo.email || !shippingInfo.address) {
      throw new functions.https.HttpsError('invalid-argument', 'Complete shipping information is required.');
    }

    // Fetch cart items
    const cartSnap = await db.collection('cartItems').doc(uid).collection('items').get();
    if (cartSnap.empty) {
      throw new functions.https.HttpsError('failed-precondition', 'Your cart is empty.');
    }

    // Validate products and compute totals
    const orderItems = [];
    let subtotal = 0;

    await Promise.all(cartSnap.docs.map(async (cartDoc) => {
      const { productId, quantity } = cartDoc.data();
      const productSnap = await db.collection('products').doc(productId).get();

      if (!productSnap.exists) {
        throw new functions.https.HttpsError('not-found', `Product ${productId} not found.`);
      }

      const product = productSnap.data();
      if (!product.published) {
        throw new functions.https.HttpsError('failed-precondition', `Product "${product.title}" is no longer available.`);
      }
      if (product.stock < quantity) {
        throw new functions.https.HttpsError('failed-precondition', `Insufficient stock for "${product.title}".`);
      }

      const price = product.salePrice || product.price;
      orderItems.push({
        productId,
        title:    product.title,
        price,
        quantity,
        imageUrl: (product.images && product.images[0]) || null,
      });
      subtotal += price * quantity;
    }));

    const tax   = parseFloat((subtotal * 0.18).toFixed(2)); // 18% GST
    const total = parseFloat((subtotal + tax).toFixed(2));

    // Create order in Firestore
    const orderRef = db.collection('orders').doc();
    await orderRef.set({
      userId:        uid,
      items:         orderItems,
      subtotal,
      tax,
      total,
      status:        'PENDING',
      paymentStatus: 'UNPAID',
      paymentMethod: null,
      razorpayOrderId: null,
      paymentId:     null,
      shippingName:    shippingInfo.name,
      shippingEmail:   shippingInfo.email,
      shippingPhone:   shippingInfo.phone  || null,
      shippingAddress: shippingInfo.address,
      shippingCity:    shippingInfo.city   || null,
      shippingState:   shippingInfo.state  || null,
      shippingZip:     shippingInfo.zip    || null,
      notes:           notes || null,
      createdAt:     admin.firestore.FieldValue.serverTimestamp(),
      updatedAt:     admin.firestore.FieldValue.serverTimestamp(),
    });

    // Decrement stock for each product
    const batch = db.batch();
    orderItems.forEach(item => {
      const productRef = db.collection('products').doc(item.productId);
      batch.update(productRef, { stock: admin.firestore.FieldValue.increment(-item.quantity) });
    });

    // Clear cart
    cartSnap.docs.forEach(cartDoc => batch.delete(cartDoc.ref));
    await batch.commit();

    console.log(`✅ Order created: ${orderRef.id} for user ${uid}`);
    return { success: true, orderId: orderRef.id, total };
  });

// ─── 6. createRazorpayOrder (HTTPS function) ──────────────────────────────────
// Creates a Razorpay order for payment processing.
exports.createRazorpayOrder = functions
  .region(REGION)
  .https.onRequest(async (req, res) => {
    // CORS headers — restrict to known origins
    const origin = req.headers.origin;
    if (ALLOWED_ORIGINS.includes(origin)) {
      res.set('Access-Control-Allow-Origin', origin);
    }
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(204).send('');

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
      // Verify Firebase ID token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const idToken = authHeader.split('Bearer ')[1];
      const decoded = await admin.auth().verifyIdToken(idToken);

      const { orderId } = req.body;
      if (!orderId) return res.status(400).json({ error: 'orderId is required' });

      // Fetch order from Firestore
      const orderSnap = await db.collection('orders').doc(orderId).get();
      if (!orderSnap.exists) return res.status(404).json({ error: 'Order not found' });

      const order = orderSnap.data();
      if (order.userId !== decoded.uid) return res.status(403).json({ error: 'Forbidden' });
      if (order.paymentStatus === 'PAID') return res.status(400).json({ error: 'Order already paid' });

      // Initialize Razorpay
      const razorpay = new Razorpay({
        key_id:     functions.config().razorpay.key_id,
        key_secret: functions.config().razorpay.key_secret,
      });

      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount:   Math.round(order.total * 100), // in paise
        currency: 'INR',
        receipt:  orderId,
        notes:    { orderId, userId: decoded.uid },
      });

      // Save razorpayOrderId to Firestore order
      await db.collection('orders').doc(orderId).update({
        razorpayOrderId: razorpayOrder.id,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.json({
        razorpayOrderId: razorpayOrder.id,
        amount:          razorpayOrder.amount,
        currency:        razorpayOrder.currency,
        key:             functions.config().razorpay.key_id,
      });
    } catch (err) {
      console.error('createRazorpayOrder error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

// ─── 7. verifyRazorpayPayment (HTTPS function) ────────────────────────────────
// Verifies Razorpay payment signature and marks the order as PAID.
exports.verifyRazorpayPayment = functions
  .region(REGION)
  .https.onRequest(async (req, res) => {
    // CORS headers — restrict to known origins
    const origin = req.headers.origin;
    if (ALLOWED_ORIGINS.includes(origin)) {
      res.set('Access-Control-Allow-Origin', origin);
    }
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(204).send('');

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
      // Verify Firebase ID token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const idToken = authHeader.split('Bearer ')[1];
      await admin.auth().verifyIdToken(idToken);

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
        return res.status(400).json({ error: 'Missing required payment fields' });
      }

      // Verify HMAC signature
      const expectedSignature = crypto
        .createHmac('sha256', functions.config().razorpay.key_secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ error: 'Invalid payment signature' });
      }

      // Mark order as PAID
      await db.collection('orders').doc(orderId).update({
        paymentStatus:  'PAID',
        status:         'CONFIRMED',
        paymentId:      razorpay_payment_id,
        paymentMethod:  'RAZORPAY',
        updatedAt:      admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`✅ Payment verified: ${razorpay_payment_id} for order ${orderId}`);
      return res.json({ success: true, message: 'Payment verified and order confirmed.' });
    } catch (err) {
      console.error('verifyRazorpayPayment error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

// ─── 8. submitContact (Callable) ─────────────────────────────────────────────
// Rate-limited contact form submission.
exports.submitContact = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const { name, email, phone, message, type } = data;
    if (!name || !email || !message) {
      throw new functions.https.HttpsError('invalid-argument', 'Name, email, and message are required.');
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid email address.');
    }

    await db.collection('contacts').add({
      name,
      email,
      phone:    phone   || null,
      message,
      type:     type    || 'GENERAL',
      userId:   context.auth ? context.auth.uid : null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, message: 'Your message has been received. We will get back to you soon!' };
  });
