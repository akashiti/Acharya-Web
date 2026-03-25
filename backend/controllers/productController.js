const prisma = require('../lib/prisma');

// Helper: slugify
const slugify = (text) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ─── Get All Products (public) ─────────────────────────────
exports.getAll = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      minPrice,
      maxPrice,
      featured,
      sort = 'newest',
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = { published: true };

    if (category) where.categoryId = category;
    if (featured === 'true') where.featured = true;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'title') orderBy = { title: 'asc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy,
        skip,
        take: parseInt(limit),
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get All Products (Admin — includes unpublished) ────────
exports.adminGetAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: products,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get Product by Slug (public) ──────────────────────────
exports.getBySlug = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: { category: true },
    });

    if (!product || !product.published) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }

    res.json({ status: 'success', data: product });
  } catch (err) {
    next(err);
  }
};

// ─── Get Product by ID (admin) ─────────────────────────────
exports.getById = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { category: true },
    });

    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }

    res.json({ status: 'success', data: product });
  } catch (err) {
    next(err);
  }
};

// ─── Create Product (admin) ────────────────────────────────
exports.create = async (req, res, next) => {
  try {
    const { title, description, price, salePrice, images, stock, categoryId, featured, published } = req.body;

    if (!title || !description || price === undefined) {
      return res.status(400).json({ status: 'error', message: 'Title, description, and price are required' });
    }

    let slug = slugify(title);
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const product = await prisma.product.create({
      data: {
        title,
        slug,
        description,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        images: images ? JSON.stringify(images) : '[]',
        stock: stock ? parseInt(stock) : 0,
        categoryId: categoryId || null,
        featured: featured || false,
        published: published || false,
      },
      include: { category: true },
    });

    res.status(201).json({ status: 'success', data: product });
  } catch (err) {
    next(err);
  }
};

// ─── Update Product (admin) ────────────────────────────────
exports.update = async (req, res, next) => {
  try {
    const { title, description, price, salePrice, images, stock, categoryId, featured, published } = req.body;

    const data = {};
    if (title !== undefined) {
      data.title = title;
      data.slug = slugify(title);
    }
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = parseFloat(price);
    if (salePrice !== undefined) data.salePrice = salePrice ? parseFloat(salePrice) : null;
    if (images !== undefined) data.images = JSON.stringify(images);
    if (stock !== undefined) data.stock = parseInt(stock);
    if (categoryId !== undefined) data.categoryId = categoryId || null;
    if (featured !== undefined) data.featured = featured;
    if (published !== undefined) data.published = published;

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data,
      include: { category: true },
    });

    res.json({ status: 'success', data: product });
  } catch (err) {
    next(err);
  }
};

// ─── Delete Product (admin) ────────────────────────────────
exports.remove = async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ status: 'success', message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};
