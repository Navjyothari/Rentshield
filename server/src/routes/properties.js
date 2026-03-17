const express = require('express');
const { prisma } = require('../lib/prisma');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const properties = await prisma.property.findMany({
      include: { landlord: { select: { displayName: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(properties);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id },
      include: { 
        landlord: { select: { id: true, displayName: true } },
        issues: {
          where: { status: { in: ['Reported', 'Under_Review', 'Resolved'] } }, // omit dismissed
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!property) return res.status(404).json({ message: 'Property not found' });
    
    // Sanitize issues
    property.issues.forEach(issue => {
      if (issue.isAnonymous) issue.reporterId = null;
    });

    res.json(property);
  } catch (error) {
    next(error);
  }
});

router.post('/', verifyToken, requireRole('landlord'), async (req, res, next) => {
  try {
    const { address, area, city, latitude, longitude } = req.body;
    
    const property = await prisma.property.create({
      data: {
        landlordId: req.user.id,
        address,
        area,
        city,
        latitude: parseFloat(latitude) || null,
        longitude: parseFloat(longitude) || null,
      }
    });

    res.status(201).json(property);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', verifyToken, requireRole('landlord'), async (req, res, next) => {
  try {
    const { address, area, city, latitude, longitude } = req.body;
    
    // Ensure ownership
    const prop = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!prop || prop.landlordId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updated = await prisma.property.update({
      where: { id: req.params.id },
      data: { address, area, city, latitude: parseFloat(latitude), longitude: parseFloat(longitude) }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
