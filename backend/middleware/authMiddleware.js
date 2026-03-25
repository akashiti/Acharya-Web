const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

// ─── Protect Route (JWT verification) ────────────────────────
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized. Please log in.',
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token. Please log in again.',
      });
    }

    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token no longer exists.',
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

// ─── Admin Only ─────────────────────────────────────────────
exports.adminOnly = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Admin privileges required.',
    });
  }
  next();
};
