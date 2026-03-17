const express = require('express');
const { prisma } = require('../lib/prisma');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { analyzeIssue } = require('../services/aiService');
const { getIo } = require('../socket');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { status, category, area } = req.query;
    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (area) where.property = { area };

    const issues = await prisma.issue.findMany({
      where,
      include: {
        property: { select: { address: true, area: true, city: true, riskScore: true } },
        aiVerdict: { select: { confidenceScore: true, autoCategory: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Sanitize anonymous issues
    const sanitized = issues.map(issue => {
      if (issue.isAnonymous) issue.reporterId = null;
      return issue;
    });

    res.json(sanitized);
  } catch (error) {
    next(error);
  }
});

router.get('/my', verifyToken, requireRole('tenant'), async (req, res, next) => {
  try {
    const issues = await prisma.issue.findMany({
      where: { reporterId: req.user.id },
      include: { property: true, aiVerdict: true, daoCase: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(issues);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const issue = await prisma.issue.findUnique({
      where: { id: req.params.id },
      include: {
        property: true,
        evidence: true,
        aiVerdict: true,
        daoCase: true,
        comments: {
          include: { author: { select: { displayName: true, role: true } } },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    if (issue.isAnonymous) issue.reporterId = null;

    res.json(issue);
  } catch (error) {
    next(error);
  }
});

router.post('/', verifyToken, requireRole('tenant'), async (req, res, next) => {
  try {
    const { propertyId, category, severity, description, isAnonymous } = req.body;
    
    const issue = await prisma.issue.create({
      data: {
        propertyId,
        category,
        severity: parseInt(severity),
        description,
        isAnonymous: Boolean(isAnonymous),
        reporterId: Boolean(isAnonymous) ? null : req.user.id,
      }
    });

    // Trigger AI analysis asynchronously
    analyzeIssue(description).then(async (result) => {
      const verdict = await prisma.aIVerdict.create({
        data: {
          issueId: issue.id,
          category: result.category, // Just an extra metadata mapping 
          confidenceScore: result.confidenceScore,
          autoCategory: result.category,
          reasoning: result.reasoning,
          flaggedKeywords: result.flaggedKeywords,
        }
      });
      getIo().to('admin').emit('ai:verdict_ready', { issueId: issue.id, verdict });
    });

    res.status(201).json(issue);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', verifyToken, requireRole('admin', 'dao_member'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const issue = await prisma.issue.update({
      where: { id: req.params.id },
      data: { status }
    });
    
    getIo().emit('issue:status_changed', { issueId: issue.id, newStatus: status });
    res.json(issue);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', verifyToken, requireRole('admin'), async (req, res, next) => {
  try {
    await prisma.issue.delete({ where: { id: req.params.id } });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
