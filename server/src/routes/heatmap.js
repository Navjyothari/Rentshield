const express = require('express');
const { prisma } = require('../lib/prisma');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const issues = await prisma.issue.findMany({
      include: {
        property: { select: { latitude: true, longitude: true, id: true, address: true, riskScore: true } }
      }
    });

    // Valid points only
    const validPoints = issues.filter(i => i.property.latitude && i.property.longitude);

    const geoJSON = {
      type: 'FeatureCollection',
      features: validPoints.map(i => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [i.property.longitude, i.property.latitude]
        },
        properties: {
          issueId: i.id,
          propertyId: i.property.id,
          address: i.property.address,
          category: i.category,
          severity: i.severity,
          status: i.status,
          riskScore: i.property.riskScore
        }
      }))
    };

    res.json(geoJSON);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
