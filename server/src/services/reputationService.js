const { prisma } = require('../lib/prisma');

const calculateLandlordReputation = async (landlordId) => {
  const properties = await prisma.property.findMany({
    where: { landlordId },
    include: { issues: true },
  });

  let totalIssues = 0;
  let closedIssues = 0;
  let sustainedIssues = 0;

  properties.forEach(p => {
    p.issues.forEach(i => {
      totalIssues++;
      if (i.status === 'Resolved' || i.status === 'Dismissed') {
        closedIssues++;
      }
      if (i.daoCase?.resolution === 'Sustained') {
        sustainedIssues++;
      }
    });
  });

  if (totalIssues === 0) return 100;

  // Penalize for sustained (tenant won) issues against landlord
  const negativeImpact = sustainedIssues * 10;
  
  // Reward for resolving issues
  const resolutionBonus = closedIssues * 5;

  let score = 100 - negativeImpact + resolutionBonus;
  if (score < 0) score = 0;
  if (score > 100) score = 100;

  return score;
};

module.exports = { calculateLandlordReputation };
