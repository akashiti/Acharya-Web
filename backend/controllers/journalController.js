const prisma = require('../lib/prisma');

// ─── List Journals (paginated, newest first) ─────────────────
exports.getJournals = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [journals, total] = await Promise.all([
      prisma.journal.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.journal.count({
        where: { userId: req.user.id },
      }),
    ]);

    res.json({
      status: 'success',
      data: journals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get Single Journal ──────────────────────────────────────
exports.getJournal = async (req, res, next) => {
  try {
    const journal = await prisma.journal.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!journal) {
      return res.status(404).json({
        status: 'error',
        message: 'Journal entry not found',
      });
    }

    res.json({ status: 'success', data: journal });
  } catch (err) {
    next(err);
  }
};

// ─── Create Journal ──────────────────────────────────────────
exports.createJournal = async (req, res, next) => {
  try {
    const { title, content, mood } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Journal content is required',
      });
    }

    const journal = await prisma.journal.create({
      data: {
        title: title || null,
        content: content.trim(),
        mood: mood || null,
        userId: req.user.id,
      },
    });

    res.status(201).json({ status: 'success', data: journal });
  } catch (err) {
    next(err);
  }
};

// ─── Update Journal ──────────────────────────────────────────
exports.updateJournal = async (req, res, next) => {
  try {
    // Check ownership
    const existing = await prisma.journal.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Journal entry not found',
      });
    }

    const { title, content, mood } = req.body;

    const journal = await prisma.journal.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content: content.trim() }),
        ...(mood !== undefined && { mood }),
      },
    });

    res.json({ status: 'success', data: journal });
  } catch (err) {
    next(err);
  }
};

// ─── Delete Journal ──────────────────────────────────────────
exports.deleteJournal = async (req, res, next) => {
  try {
    // Check ownership
    const existing = await prisma.journal.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Journal entry not found',
      });
    }

    await prisma.journal.delete({
      where: { id: req.params.id },
    });

    res.json({ status: 'success', message: 'Journal entry deleted' });
  } catch (err) {
    next(err);
  }
};
