const { prisma } = require('../lib/prisma');

const calculateVoteResult = async (caseId) => {
  const votes = await prisma.dAOVote.findMany({ where: { caseId } });
  
  const sustainCount = votes.filter(v => v.vote === true).length;
  const dismissCount = votes.filter(v => v.vote === false).length;
  
  let resolution = null;
  
  // Decide only if votes > 5 (majority out of 10)
  if (sustainCount > 5) resolution = 'Sustained';
  else if (dismissCount > 5) resolution = 'Dismissed';
  // Else still voting / tied
  
  return { 
    sustainCount, 
    dismissCount, 
    totalVotes: votes.length,
    resolution 
  };
};

module.exports = { calculateVoteResult };
