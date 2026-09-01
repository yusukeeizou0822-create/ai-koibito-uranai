import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { loadRecentChatHistory } from '@/lib/chat/persistence';
import { prisma } from '@/lib/prisma';

import { HistoryScreen } from './HistoryScreen';

// 履歴一覧画面ではchat画面のAI応答用コンテキストより広めに表示する
const HISTORY_PAGE_LIMIT = 200;

export default async function ChatHistoryPage() {
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

  const history = await loadRecentChatHistory(userId, HISTORY_PAGE_LIMIT);

  return (
    <HistoryScreen
      character={{
        name: selection.character.name,
        personalityKey: selection.character.personalityKey,
        avatarUrl: `${selection.character.avatarBaseUrl}.png`,
      }}
      userName={profile.name}
      messages={history.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
      }))}
    />
  );
}
