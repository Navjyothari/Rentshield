const express = require('express');
const { prisma } = require('../lib/prisma');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { analyzeIssue } = require('../services/aiService');
const { getIo } = require('../socket');

const router = express.Router();

router.post('/analyze/:issueId', verifyToken, requireRole('admin'), async (req, res, next) => {
  try {
    const issue = await prisma.issue.findUnique({ where: { id: req.params.issueId } });
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const result = await analyzeIssue(issue.description);

    const verdict = await prisma.aIVerdict.upsert({
      where: { issueId: issue.id },
      update: {
        confidenceScore: result.confidenceScore,
        autoCategory: result.category,
        reasoning: result.reasoning,
        flaggedKeywords: result.flaggedKeywords,
        generatedAt: new Date()
      },
      create: {
        issueId: issue.id,
        confidenceScore: result.confidenceScore,
        autoCategory: result.category,
        reasoning: result.reasoning,
        flaggedKeywords: result.flaggedKeywords,
      }
    });

    getIo().to('admin').emit('ai:verdict_ready', { issueId: issue.id, verdict });
    res.json(verdict);
  } catch (error) {
    next(error);
  }
});

router.get('/verdict/:issueId', verifyToken, async (req, res, next) => {
  try {
    const verdict = await prisma.aIVerdict.findUnique({
      where: { issueId: req.params.issueId }
    });
    if (!verdict) return res.status(404).json({ message: 'Verdict not found' });
    res.json(verdict);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
