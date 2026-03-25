const crypto = require('crypto');
const prisma = require('../lib/prisma');

// Lazy-load Razorpay to avoid crash if keys not set
let razorpayInstance = null;
function getRazorpay() {
  if (!razorpayInstance) {
    const Razorpay = require('razorpay');
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
}

// ─── Create Razorpay Order ─────────────────────────────────
exports.createPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ status: 'error', message: 'orderId is required' });

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ status: 'error', message: 'Order not found' });
    if (order.userId !== req.user.id) return res.status(403).json({ status: 'error', message: 'Access denied' });

    // If Razorpay keys not set, simulate payment for dev
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      const fakeRzpId = 'order_dev_' + Date.now();
      await prisma.order.update({
        where: { id: orderId },
        data: { razorpayOrderId: fakeRzpId },
      });
      return res.json({
        status: 'success',
        data: { id: fakeRzpId, amount: Math.round(order.total * 100), currency: 'INR' },
        devMode: true,
      });
    }

    const razorpay = getRazorpay();
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(order.total * 100),
      currency: 'INR',
      receipt: orderId,
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { razorpayOrderId: rzpOrder.id },
    });

    res.json({ status: 'success', data: rzpOrder });
  } catch (err) {
    next(err);
  }
};

// ─── Verify Payment ────────────────────────────────────────
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    // Dev mode: skip verification
    if (!process.env.RAZORPAY_KEY_SECRET) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentId: razorpay_payment_id || 'dev_pay_' + Date.now(),
          paymentStatus: 'PAID',
          paymentMethod: 'razorpay_dev',
          status: 'CONFIRMED',
        },
      });
      return res.json({ status: 'success', message: 'Payment verified (dev mode)' });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ status: 'error', message: 'Invalid payment signature' });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentId: razorpay_payment_id,
        paymentStatus: 'PAID',
        paymentMethod: 'razorpay',
        status: 'CONFIRMED',
      },
    });

    res.json({ status: 'success', message: 'Payment verified successfully' });
  } catch (err) {
    next(err);
  }
};

// ─── Admin: Get All Payments ───────────────────────────────
exports.getAllPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { paymentId: { not: null } };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        select: {
          id: true,
          razorpayOrderId: true,
          paymentId: true,
          paymentStatus: true,
          paymentMethod: true,
          total: true,
          createdAt: true,
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: orders,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
};
