const prisma = require('../lib/prisma');

// ─── Dashboard Analytics ───────────────────────────────────
exports.getDashboard = async (req, res, next) => {
  try {
    const [totalUsers, totalOrders, totalProducts, orders] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.product.count(),
      prisma.order.findMany({
        where: { paymentStatus: 'PAID' },
        select: { total: true, createdAt: true },
      }),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    // Revenue by month (last 6 months)
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const month = start.toLocaleString('default', { month: 'short' });
      const revenue = orders
        .filter((o) => o.createdAt >= start && o.createdAt <= end)
        .reduce((sum, o) => sum + o.total, 0);
      monthlyRevenue.push({ month, revenue: Math.round(revenue) });
    }

    // Recent orders
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        orderItems: true,
      },
    });

    // Order status counts
    const pendingOrders = await prisma.order.count({ where: { status: 'PENDING' } });
    const confirmedOrders = await prisma.order.count({ where: { status: 'CONFIRMED' } });
    const deliveredOrders = await prisma.order.count({ where: { status: 'DELIVERED' } });

    res.json({
      status: 'success',
      data: {
        totalUsers,
        totalOrders,
        totalProducts,
        totalRevenue: Math.round(totalRevenue),
        monthlyRevenue,
        recentOrders,
        orderStats: { pending: pendingOrders, confirmed: confirmedOrders, delivered: deliveredOrders },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get All Users ─────────────────────────────────────────
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, name: true, email: true, role: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: users,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Update User Role ──────────────────────────────────────
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ status: 'error', message: 'Invalid role' });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    res.json({ status: 'success', data: user });
  } catch (err) {
    next(err);
  }
};
