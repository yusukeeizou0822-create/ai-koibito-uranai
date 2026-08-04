import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

import { ChatScreen } from './ChatScreen';

export default async function ChatPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect('/');
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) {
    redirect('/onboarding/profile');
  }

  const selection = await prisma.userCharacterSelection.findUnique({
    where: { userId },
    include: { character: true },
  });
  if (!selection) {
    redirect('/onboarding/profile');
  }

  return (
    <ChatScreen
      character={{
        name: selection.character.name,
        personalityKey: selection.character.personalityKey,
      }}
      userName={profile.name}
    />
  );
}
