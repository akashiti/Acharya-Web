const prisma = require('../lib/prisma');

// ─── Create Order from Cart ────────────────────────────────
exports.createOrder = async (req, res, next) => {
  try {
    const { shippingName, shippingEmail, shippingPhone, shippingAddress, shippingCity, shippingState, shippingZip, notes } = req.body;

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Cart is empty' });
    }

    // Check stock
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          status: 'error',
          message: `Insufficient stock for "${item.product.title}". Available: ${item.product.stock}`,
        });
      }
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.product.salePrice || item.product.price;
      return sum + price * item.quantity;
    }, 0);
    const tax = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST
    const total = Math.round((subtotal + tax) * 100) / 100;

    // Create order with items
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        subtotal,
        tax,
        total,
        shippingName: shippingName || req.user.name,
        shippingEmail: shippingEmail || req.user.email,
        shippingPhone,
        shippingAddress,
        shippingCity,
        shippingState,
        shippingZip,
        notes,
        orderItems: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            title: item.product.title,
            price: item.product.salePrice || item.product.price,
            quantity: item.quantity,
          })),
        },
      },
      include: { orderItems: { include: { product: true } } },
    });

    // Reduce stock
    for (const item of cartItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });

    res.status(201).json({ status: 'success', data: order });
  } catch (err) {
    next(err);
  }
};

// ─── Get My Orders ─────────────────────────────────────────
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { orderItems: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ status: 'success', data: orders });
  } catch (err) {
    next(err);
  }
};

// ─── Get Single Order ──────────────────────────────────────
exports.getOrder = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        orderItems: { include: { product: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found' });
    }

    // Users can only view their own orders (unless admin)
    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ status: 'error', message: 'Access denied' });
    }

    res.json({ status: 'success', data: order });
  } catch (err) {
    next(err);
  }
};

// ─── Admin: Get All Orders ─────────────────────────────────
exports.adminGetAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          orderItems: true,
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

// ─── Admin: Update Order Status ────────────────────────────
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, paymentStatus } = req.body;
    const data = {};
    if (status) data.status = status;
    if (paymentStatus) data.paymentStatus = paymentStatus;

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data,
      include: { orderItems: true, user: { select: { id: true, name: true, email: true } } },
    });

    res.json({ status: 'success', data: order });
  } catch (err) {
    next(err);
  }
};
