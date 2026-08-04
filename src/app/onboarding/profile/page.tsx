import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

import { OnboardingWizard } from './OnboardingWizard';

export default async function OnboardingProfilePage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect('/');
  }

  const existingProfile = await prisma.profile.findUnique({ where: { userId } });
  if (existingProfile) {
    redirect('/');
  }

  const characters = await prisma.character.findMany({
    select: { id: true, type: true, personalityKey: true, name: true },
    orderBy: [{ type: 'asc' }, { personalityKey: 'asc' }],
  });

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-12 dark:bg-black">
      <OnboardingWizard characters={characters} />
    </div>
  );
}
