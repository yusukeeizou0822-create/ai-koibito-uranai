import { config } from 'dotenv';

config({ path: '.env.local' });

import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

import { calculateBaziChart } from '../src/lib/bazi';
import { PrismaClient } from '../src/generated/prisma/client';

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const profiles = await prisma.profile.findMany();
  const targets = profiles.filter((p) => p.baziChartJson == null);

  console.log(`baziChartJson未設定のプロフィール: ${targets.length}件`);

  for (const profile of targets) {
    const baziChart = calculateBaziChart(profile.birthDate, profile.birthTime);
    await prisma.profile.update({
      where: { id: profile.id },
      data: { baziChartJson: baziChart },
    });
    console.log(`- ${profile.id} (${profile.name}): ${baziChart.year.ganZhi} ${baziChart.month.ganZhi} ${baziChart.day.ganZhi}`);
  }

  console.log('バックフィル完了');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
