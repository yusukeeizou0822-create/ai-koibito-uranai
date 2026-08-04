'use server';

import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { calculateBaziChart } from '@/lib/bazi';
import { prisma } from '@/lib/prisma';

type OnboardingInput = {
  name: string;
  birthDate: string;
  gender: 'MALE' | 'FEMALE';
  characterId: string;
};

const genderToCharacterType = {
  MALE: 'GIRLFRIEND',
  FEMALE: 'BOYFRIEND',
} as const;

export async function submitOnboarding(input: OnboardingInput): Promise<{ error?: string }> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { error: 'ログインが必要です。トップページからログインし直してください。' };
  }

  const name = input.name.trim();
  if (!name) {
    return { error: '名前を入力してください。' };
  }

  const birthDate = new Date(input.birthDate);
  if (Number.isNaN(birthDate.getTime())) {
    return { error: '正しい生年月日を入力してください。' };
  }

  if (input.gender !== 'MALE' && input.gender !== 'FEMALE') {
    return { error: '性別を選択してください。' };
  }

  if (!input.characterId) {
    return { error: 'お相手を1人選んでください。' };
  }

  const character = await prisma.character.findUnique({ where: { id: input.characterId } });
  if (!character || character.type !== genderToCharacterType[input.gender]) {
    return { error: 'お相手の選択が正しくありません。もう一度選び直してください。' };
  }

  const baziChart = calculateBaziChart(birthDate, null);

  await prisma.$transaction([
    prisma.profile.upsert({
      where: { userId },
      update: { name, birthDate, gender: input.gender, baziChartJson: baziChart },
      create: { userId, name, birthDate, gender: input.gender, baziChartJson: baziChart },
    }),
    prisma.userCharacterSelection.upsert({
      where: { userId },
      update: { characterId: character.id },
      create: { userId, characterId: character.id },
    }),
  ]);

  redirect('/');
}
