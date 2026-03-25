const prisma = require('../lib/prisma');

// ─── Get Cart ──────────────────────────────────────────────
exports.getCart = async (req, res, next) => {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const total = items.reduce((sum, item) => {
      const price = item.product.salePrice || item.product.price;
      return sum + price * item.quantity;
    }, 0);

    res.json({ status: 'success', data: items, total, count: items.length });
  } catch (err) {
    next(err);
  }
};

// ─── Add / Update Cart Item ────────────────────────────────
exports.addItem = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ status: 'error', message: 'productId required' });

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.published) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }

    const item = await prisma.cartItem.upsert({
      where: { userId_productId: { userId: req.user.id, productId } },
      update: { quantity: parseInt(quantity) },
      create: { userId: req.user.id, productId, quantity: parseInt(quantity) },
      include: { product: true },
    });

    res.json({ status: 'success', data: item });
  } catch (err) {
    next(err);
  }
};

// ─── Remove Cart Item ──────────────────────────────────────
exports.removeItem = async (req, res, next) => {
  try {
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id, productId: req.params.productId },
    });
    res.json({ status: 'success', message: 'Item removed from cart' });
  } catch (err) {
    next(err);
  }
};

// ─── Clear Cart ────────────────────────────────────────────
exports.clearCart = async (req, res, next) => {
  try {
    await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
    res.json({ status: 'success', message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
};
