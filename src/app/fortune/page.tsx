import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import type { BaziChart } from '@/lib/bazi';
import { getOrCreateTodayFortunes, type FortuneCategory, type FortuneResult } from '@/lib/fortune';
import { prisma } from '@/lib/prisma';

import { FortuneScreen } from './FortuneScreen';

export default async function FortunePage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect('/');
  }

  const [profile, selection] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.userCharacterSelection.findUnique({
      where: { userId },
      include: { character: { include: { personality: true } } },
    }),
  ]);

  if (!profile || !selection?.character.personality) {
    redirect('/onboarding/profile');
  }

  const baziChart = profile.baziChartJson as BaziChart | null;
  if (!baziChart) {
    redirect('/onboarding/profile');
  }

  let fortunes: Record<FortuneCategory, FortuneResult> | null = null;
  let errorMessage: string | null = null;
  try {
    fortunes = await getOrCreateTodayFortunes({
      userId,
      personalitySystemPrompt: selection.character.personality.systemPrompt,
      userName: profile.name,
      baziChart,
    });
  } catch (error) {
    console.error('Fortune generation error:', error);
    errorMessage = '占い結果の取得に失敗しました。時間をおいて再度お試しください。';
  }

  return (
    <FortuneScreen
      character={{
        name: selection.character.name,
        personalityKey: selection.character.personalityKey,
        avatarUrl: `${selection.character.avatarBaseUrl}.png`,
      }}
      fortunes={fortunes}
      errorMessage={errorMessage}
    />
  );
}
