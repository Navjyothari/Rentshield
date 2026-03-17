const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clean existing data (in reverse order of dependencies)
  await prisma.comment.deleteMany();
  await prisma.dAOVote.deleteMany();
  await prisma.dAOCase.deleteMany();
  await prisma.aIVerdict.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 12);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@rentshield.com',
      passwordHash,
      role: 'admin',
      displayName: 'System Admin',
    },
  });

  const landlords = [];
  for (let i = 1; i <= 15; i++) {
    landlords.push(await prisma.user.create({
      data: {
        email: `landlord${i}@rentshield.com`,
        passwordHash,
        role: 'landlord',
        displayName: `Landlord ${i}`,
      },
    }));
  }

  const jurors = [];
  for (let i = 1; i <= 10; i++) {
    jurors.push(await prisma.user.create({
      data: {
        email: `juror${i}@rentshield.com`,
        passwordHash,
        role: 'dao_member',
        displayName: `Juror ${i}`,
      },
    }));
  }

  const tenants = [];
  for (let i = 1; i <= 5; i++) {
    tenants.push(await prisma.user.create({
      data: {
        email: `tenant${i}@rentshield.com`,
        passwordHash,
        role: 'tenant',
        displayName: `Tenant ${i}`,
      },
    }));
  }

  // 2. Create Properties
  const areas = ['Downtown', 'Midtown', 'East Side', 'West End', 'Harbor District', 'Riverside'];
  const properties = [];
  for (const landlord of landlords) {
    for (let j = 0; j < 2; j++) {
      properties.push(await prisma.property.create({
        data: {
          landlordId: landlord.id,
          address: `${Math.floor(Math.random() * 9000) + 100} Main St, Apt ${Math.floor(Math.random() * 100)}`,
          area: areas[Math.floor(Math.random() * areas.length)],
          city: 'Metropolis',
          latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
          longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
          riskScore: Math.floor(Math.random() * 100),
        },
      }));
    }
  }

  // 3. Create Issues
  const categories = ['Safety', 'Maintenance', 'Harassment', 'Discrimination'];
  const statuses = ['Reported', 'Under_Review', 'Resolved', 'Dismissed'];
  const issues = [];

  for (let i = 0; i < 50; i++) {
    const property = properties[Math.floor(Math.random() * properties.length)];
    const category = categories[i % categories.length];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const isAnonymous = Math.random() > 0.3; // 70% anonymous
    const reporter = isAnonymous ? null : tenants[Math.floor(Math.random() * tenants.length)];

    // Date spread over last 90 days
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - Math.floor(Math.random() * 90));

    const issue = await prisma.issue.create({
      data: {
        propertyId: property.id,
        category,
        severity: Math.floor(Math.random() * 3) + 2, // 2-4 mostly
        status,
        description: `This is a detailed description of the ${category} issue reported at ${property.address}. The severity is significant and needs attention.`,
        isAnonymous,
        reporterId: reporter ? reporter.id : null,
        createdAt: pastDate,
        updatedAt: pastDate,
      },
    });
    issues.push(issue);

    // 4. Create AI Verdict for every issue
    await prisma.aIVerdict.create({
      data: {
        issueId: issue.id,
        confidenceScore: 0.5 + Math.random() * 0.45, // 0.5 to 0.95
        autoCategory: category,
        reasoning: `AI analysis confirms the description matches the characteristics of a ${category} issue.`,
        flaggedKeywords: ['issue', 'reported', category.toLowerCase()],
        generatedAt: pastDate,
      },
    });

    // 5. Create Comments (2-5 per issue)
    const numComments = Math.floor(Math.random() * 4) + 2;
    for (let j = 0; j < numComments; j++) {
      // Pick random author role
      const roles = [
        { role: 'tenant', user: reporter || tenants[0] },
        { role: 'landlord', user: landlords[Math.floor(Math.random() * landlords.length)] },
        { role: 'dao', user: jurors[Math.floor(Math.random() * jurors.length)] }
      ];
      const selected = roles[Math.floor(Math.random() * roles.length)];

      await prisma.comment.create({
        data: {
          issueId: issue.id,
          authorId: selected.user.id,
          authorRole: selected.role,
          content: `Comment ${j + 1} on issue regarding ${category}. This is an elaborate discussion point added by a ${selected.role}.`,
          createdAt: new Date(pastDate.getTime() + j * 86400000), // 1 day later
        }
      });
    }
  }

  // 6. Create DAO Cases (15 cases)
  const caseStatuses = ['Pending', 'Voting', 'Closed'];
  const daoIssues = issues.slice(0, 15);

  for (let i = 0; i < daoIssues.length; i++) {
    const issue = daoIssues[i];
    const status = caseStatuses[i % caseStatuses.length];

    // Pick 10 random jurors
    const shuffledJurors = [...jurors].sort(() => 0.5 - Math.random()).slice(0, 10);

    const daoCase = await prisma.dAOCase.create({
      data: {
        issueId: issue.id,
        status,
        resolution: status === 'Closed' ? (Math.random() > 0.5 ? 'Sustained' : 'Dismissed') : null,
        openedAt: issue.createdAt,
        closedAt: status === 'Closed' ? new Date() : null,
        jurors: {
          connect: shuffledJurors.map(j => ({ id: j.id }))
        }
      }
    });

    // Add votes for Voting or Closed cases
    if (status !== 'Pending') {
      const numVotes = status === 'Closed' ? 10 : Math.floor(Math.random() * 9) + 1; // 1-9 votes if voting, 10 if closed
      for (let j = 0; j < numVotes; j++) {
        await prisma.dAOVote.create({
          data: {
            caseId: daoCase.id,
            jurorId: shuffledJurors[j].id,
            vote: Math.random() > 0.5,
            reason: `Based on the evidence, I vote to ${Math.random() > 0.5 ? 'sustain' : 'dismiss'} the issue.`,
            votedAt: new Date(daoCase.openedAt.getTime() + 86400000)
          }
        });
      }
    }
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
