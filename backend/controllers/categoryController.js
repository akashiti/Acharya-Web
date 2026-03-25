const prisma = require('../lib/prisma');

const slugify = (text) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ─── Get All Categories (public) ───────────────────────────
exports.getAll = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    res.json({ status: 'success', data: categories });
  } catch (err) {
    next(err);
  }
};

// ─── Create Category (admin) ───────────────────────────────
exports.create = async (req, res, next) => {
  try {
    const { name, description, image, sortOrder } = req.body;
    if (!name) return res.status(400).json({ status: 'error', message: 'Name is required' });

    let slug = slugify(name);
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const category = await prisma.category.create({
      data: { name, slug, description, image, sortOrder: sortOrder || 0 },
    });
    res.status(201).json({ status: 'success', data: category });
  } catch (err) {
    next(err);
  }
};

// ─── Update Category (admin) ───────────────────────────────
exports.update = async (req, res, next) => {
  try {
    const { name, description, image, sortOrder } = req.body;
    const data = {};
    if (name !== undefined) { data.name = name; data.slug = slugify(name); }
    if (description !== undefined) data.description = description;
    if (image !== undefined) data.image = image;
    if (sortOrder !== undefined) data.sortOrder = sortOrder;

    const category = await prisma.category.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ status: 'success', data: category });
  } catch (err) {
    next(err);
  }
};

// ─── Delete Category (admin) ───────────────────────────────
exports.remove = async (req, res, next) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ status: 'success', message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
};
