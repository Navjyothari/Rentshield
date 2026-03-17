const express = require('express');
const { prisma } = require('../lib/prisma');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = express.Router();

// All routes require Admin
router.use(verifyToken, requireRole('admin'));

router.get('/users', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, displayName: true, createdAt: true }
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.patch('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, email: true, role: true, displayName: true }
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.delete('/users/:id', async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    const totalIssues = await prisma.issue.count();
    const openCases = await prisma.dAOCase.count({ where: { status: { not: 'Closed' } } });
    const activeUsers = await prisma.user.count();
    
    // Avg resolution time: average diff between issue creation and closed case
    const resolvedCases = await prisma.dAOCase.findMany({ 
      where: { status: 'Closed', closedAt: { not: null } },
      include: { issue: true }
    });

    let avgResolutionTimeMs = 0;
    if (resolvedCases.length > 0) {
      const times = resolvedCases.map(c => c.closedAt.getTime() - c.issue.createdAt.getTime());
      avgResolutionTimeMs = times.reduce((a,b)=>a+b, 0) / times.length;
    }
    
    // For recharts (issues over last 30 days, grouped by day)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentIssues = await prisma.issue.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true }
    });

    const issuesByDay = {};
    recentIssues.forEach(i => {
      const day = i.createdAt.toISOString().split('T')[0];
      issuesByDay[day] = (issuesByDay[day] || 0) + 1;
    });

    const chartData = Object.keys(issuesByDay).map(date => ({
      date, count: issuesByDay[date]
    })).sort((a,b) => a.date.localeCompare(b.date));

    res.json({
      totalIssues,
      openCases,
      activeUsers,
      avgResolutionTimeDays: avgResolutionTimeMs / (1000 * 60 * 60 * 24),
      chartData
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
