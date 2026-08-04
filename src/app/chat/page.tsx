import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { loadRecentChatHistory } from '@/lib/chat/persistence';
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

  const history = await loadRecentChatHistory(userId);

  return (
    <ChatScreen
      character={{
        name: selection.character.name,
        personalityKey: selection.character.personalityKey,
      }}
      userName={profile.name}
      initialMessages={history.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        expression: message.expression ?? undefined,
      }))}
    />
  );
}
