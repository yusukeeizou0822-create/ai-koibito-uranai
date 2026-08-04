import type { BaziChart } from '@/lib/bazi';
import { prisma } from '@/lib/prisma';

import { generateFortune } from './generate';
import { getTodayDateLabel, getTodayReadingDate } from './today';
import type { FortuneCategory, FortuneResult } from './types';

const CATEGORIES: FortuneCategory[] = ['TODAY', 'LOVE'];

async function getOrCreateFortune({
  userId,
  category,
  readingDate,
  personalitySystemPrompt,
  userName,
  baziChart,
}: {
  userId: string;
  category: FortuneCategory;
  readingDate: Date;
  personalitySystemPrompt: string;
  userName: string;
  baziChart: BaziChart;
}): Promise<FortuneResult> {
  const existing = await prisma.fortuneReading.findUnique({
    where: { userId_category_readingDate: { userId, category, readingDate } },
  });
  if (existing) {
    return existing.resultJson as unknown as FortuneResult;
  }

  const result = await generateFortune({
    personalitySystemPrompt,
    userName,
    baziChart,
    category,
    dateLabel: getTodayDateLabel(),
  });

  try {
    await prisma.fortuneReading.create({
      data: { userId, category, readingDate, resultJson: result },
    });
  } catch {
    // 同時リクエストでユニーク制約に衝突した場合は、既存の結果を使う
    const existingAfterRace = await prisma.fortuneReading.findUnique({
      where: { userId_category_readingDate: { userId, category, readingDate } },
    });
    if (existingAfterRace) {
      return existingAfterRace.resultJson as unknown as FortuneResult;
    }
  }

  return result;
}

export async function getOrCreateTodayFortunes({
  userId,
  personalitySystemPrompt,
  userName,
  baziChart,
}: {
  userId: string;
  personalitySystemPrompt: string;
  userName: string;
  baziChart: BaziChart;
}): Promise<Record<FortuneCategory, FortuneResult>> {
  const readingDate = getTodayReadingDate();

  const results = await Promise.all(
    CATEGORIES.map((category) =>
      getOrCreateFortune({
        userId,
        category,
        readingDate,
        personalitySystemPrompt,
        userName,
        baziChart,
      }),
    ),
  );

  return { TODAY: results[0], LOVE: results[1] };
}
