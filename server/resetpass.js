// server/resetpass.js
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const hash = await bcrypt.hash('Password123!', 12);

    // Reset ALL users to Password123!
    await prisma.user.updateMany({
        data: { passwordHash: hash }
    });

    console.log('All passwords reset to Password123!');
}

main().then(() => prisma.$disconnect());