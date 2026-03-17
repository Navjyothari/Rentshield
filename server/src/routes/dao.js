const express = require('express');
const { prisma } = require('../lib/prisma');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { calculateVoteResult } = require('../services/daoService');
const { getIo } = require('../socket');

const router = express.Router();

router.get('/cases', verifyToken, requireRole('dao_member'), async (req, res, next) => {
  try {
    const cases = await prisma.dAOCase.findMany({
      where: { jurors: { some: { id: req.user.id } } },
      include: {
        issue: {
          include: { aiVerdict: true, evidence: true }
        },
        votes: { where: { jurorId: req.user.id } } // Check if user already voted
      },
      orderBy: { openedAt: 'desc' }
    });
    res.json(cases);
  } catch (error) {
    next(error);
  }
});

router.post('/cases/:issueId', verifyToken, requireRole('admin'), async (req, res, next) => {
  try {
    const { issueId } = req.params;
    
    // Select 10 random jurors
    const jurors = await prisma.user.findMany({ where: { role: 'dao_member' } });
    const shuffled = jurors.sort(() => 0.5 - Math.random()).slice(0, 10);

    const daoCase = await prisma.dAOCase.create({
      data: {
        issueId,
        jurors: { connect: shuffled.map(j => ({ id: j.id })) }
      }
    });

    await prisma.issue.update({
      where: { id: issueId },
      data: { status: 'Under_Review' }
    });

    res.status(201).json(daoCase);
  } catch (error) {
    next(error);
  }
});

router.post('/cases/:caseId/vote', verifyToken, requireRole('dao_member'), async (req, res, next) => {
  try {
    const { vote, reason } = req.body;
    const { caseId } = req.params;

    const existingVote = await prisma.dAOVote.findUnique({
      where: { caseId_jurorId: { caseId, jurorId: req.user.id } }
    });

    if (existingVote) return res.status(400).json({ message: 'Already voted on this case' });

    const newVote = await prisma.dAOVote.create({
      data: {
        caseId,
        jurorId: req.user.id,
        vote: Boolean(vote),
        reason
      }
    });

    const tally = await calculateVoteResult(caseId);
    
    // Check if case needs to shift to closed
    if (tally.totalVotes >= 10) {
      await prisma.dAOCase.update({
        where: { id: caseId },
        data: { status: 'Closed', resolution: tally.resolution, closedAt: new Date() }
      });
      // also close the issue
      await prisma.issue.update({
        where: { id: (await prisma.dAOCase.findUnique({where: {id: caseId}})).issueId },
        data: { status: tally.resolution === 'Sustained' ? 'Resolved' : 'Dismissed' }
      });
      getIo().to('dao').emit('dao:case_closed', { caseId, resolution: tally.resolution });
    }

    getIo().to('dao').emit('dao:vote_cast', { caseId, voteTally: tally });
    res.status(201).json(newVote);
  } catch (error) {
    next(error);
  }
});

router.get('/cases/:caseId/votes', verifyToken, requireRole('dao_member'), async (req, res, next) => {
  try {
    const tally = await calculateVoteResult(req.params.caseId);
    res.json(tally);
  } catch (error) {
    next(error);
  }
});

router.post('/cases/:caseId/close', verifyToken, requireRole('admin'), async (req, res, next) => {
  try {
    const tally = await calculateVoteResult(req.params.caseId);
    const resolution = tally.resolution || 'Dismissed'; // Admin force close

    const closedCase = await prisma.dAOCase.update({
      where: { id: req.params.caseId },
      data: { status: 'Closed', resolution, closedAt: new Date() }
    });

    await prisma.issue.update({
      where: { id: closedCase.issueId },
      data: { status: resolution === 'Sustained' ? 'Resolved' : 'Dismissed' }
    });

    getIo().to('dao').emit('dao:case_closed', { caseId: closedCase.id, resolution });
    res.json(closedCase);
  } catch (error) {
    next(error);
  }
});

router.get('/history', verifyToken, requireRole('dao_member'), async (req, res, next) => {
  try {
    const history = await prisma.dAOVote.findMany({
      where: { jurorId: req.user.id },
      include: {
        case: {
          include: { issue: true }
        }
      },
      orderBy: { votedAt: 'desc' }
    });
    res.json(history);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
