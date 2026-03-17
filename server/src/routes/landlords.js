const express = require('express');
const { prisma } = require('../lib/prisma');
const { calculateLandlordReputation } = require('../services/reputationService');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const landlords = await prisma.user.findMany({
      where: { role: 'landlord' },
      select: { id: true, displayName: true, createdAt: true, properties: true }
    });

    // Populate reputation scores
    const withScores = await Promise.all(landlords.map(async (l) => {
      const score = await calculateLandlordReputation(l.id);
      return { 
        id: l.id, 
        displayName: l.displayName, 
        createdAt: l.createdAt, 
        propertyCount: l.properties.length,
        reputationScore: score 
      };
    }));

    res.json(withScores);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const landlord = await prisma.user.findUnique({
      where: { id: req.params.id, role: 'landlord' },
      select: { 
        id: true, 
        displayName: true, 
        createdAt: true,
        properties: {
          include: { issues: true }
        }
      }
    });

    if (!landlord) return res.status(404).json({ message: 'Landlord not found' });

    const reputationScore = await calculateLandlordReputation(landlord.id);

    // Provide issue history summaries
    const categoryBreakdown = {};
    let totalIssues = 0;
    
    landlord.properties.forEach(p => {
      p.issues.forEach(i => {
        totalIssues++;
        categoryBreakdown[i.category] = (categoryBreakdown[i.category] || 0) + 1;
      });
    });

    res.json({
      id: landlord.id,
      displayName: landlord.displayName,
      createdAt: landlord.createdAt,
      reputationScore,
      propertyCount: landlord.properties.length,
      issueStats: {
        total: totalIssues,
        categories: categoryBreakdown
      },
      properties: landlord.properties // raw
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
