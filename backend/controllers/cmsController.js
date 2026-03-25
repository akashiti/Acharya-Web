const prisma = require('../lib/prisma');

// ═══════════════════════════════════════════════════════════
// BANNERS
// ═══════════════════════════════════════════════════════════

exports.getBanners = async (req, res, next) => {
  try {
    const active = req.query.active;
    const where = active === 'true' ? { active: true } : {};
    const banners = await prisma.banner.findMany({ where, orderBy: { position: 'asc' } });
    res.json({ status: 'success', data: banners });
  } catch (err) {
    next(err);
  }
};

exports.createBanner = async (req, res, next) => {
  try {
    const { title, subtitle, image, link, position, active } = req.body;
    if (!title) return res.status(400).json({ status: 'error', message: 'Title is required' });

    const banner = await prisma.banner.create({
      data: { title, subtitle, image, link, position: position || 0, active: active !== false },
    });
    res.status(201).json({ status: 'success', data: banner });
  } catch (err) {
    next(err);
  }
};

exports.updateBanner = async (req, res, next) => {
  try {
    const { title, subtitle, image, link, position, active } = req.body;
    const data = {};
    if (title !== undefined) data.title = title;
    if (subtitle !== undefined) data.subtitle = subtitle;
    if (image !== undefined) data.image = image;
    if (link !== undefined) data.link = link;
    if (position !== undefined) data.position = position;
    if (active !== undefined) data.active = active;

    const banner = await prisma.banner.update({ where: { id: req.params.id }, data });
    res.json({ status: 'success', data: banner });
  } catch (err) {
    next(err);
  }
};

exports.deleteBanner = async (req, res, next) => {
  try {
    await prisma.banner.delete({ where: { id: req.params.id } });
    res.json({ status: 'success', message: 'Banner deleted' });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════
// SITE CONTENT (key-value CMS)
// ═══════════════════════════════════════════════════════════

exports.getContent = async (req, res, next) => {
  try {
    const content = await prisma.siteContent.findUnique({
      where: { section: req.params.section },
    });
    res.json({
      status: 'success',
      data: content ? JSON.parse(content.content) : null,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllContent = async (req, res, next) => {
  try {
    const contents = await prisma.siteContent.findMany();
    const mapped = {};
    contents.forEach((c) => {
      mapped[c.section] = JSON.parse(c.content);
    });
    res.json({ status: 'success', data: mapped });
  } catch (err) {
    next(err);
  }
};

exports.upsertContent = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ status: 'error', message: 'content is required' });

    const result = await prisma.siteContent.upsert({
      where: { section: req.params.section },
      update: { content: JSON.stringify(content) },
      create: { section: req.params.section, content: JSON.stringify(content) },
    });

    res.json({ status: 'success', data: { section: result.section, content: JSON.parse(result.content) } });
  } catch (err) {
    next(err);
  }
};
