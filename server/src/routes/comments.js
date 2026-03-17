const express = require('express');
const { prisma } = require('../lib/prisma');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = express.Router();

router.get('/:issueId', verifyToken, async (req, res, next) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { issueId: req.params.issueId },
      include: { author: { select: { displayName: true, role: true } } },
      orderBy: { createdAt: 'asc' }
    });
    res.json(comments);
  } catch (error) {
    next(error);
  }
});

router.post('/:issueId', verifyToken, async (req, res, next) => {
  try {
    const { content } = req.body;
    let authorRole = req.user.role;
    // Map roles to CommentAuthorRole enum
    if (authorRole === 'dao_member' || authorRole === 'admin') authorRole = 'dao';
    
    const comment = await prisma.comment.create({
      data: {
        issueId: req.params.issueId,
        authorId: req.user.id,
        authorRole,
        content
      },
      include: { author: { select: { displayName: true, role: true } } }
    });
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', verifyToken, requireRole('admin'), async (req, res, next) => {
  try {
    await prisma.comment.delete({ where: { id: req.params.id } });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
