import { Expression as DbExpression, MessageRole } from '@/generated/prisma/enums';
import { prisma } from '@/lib/prisma';

import type { ChatRole, Expression } from './types';

const roleToDb: Record<ChatRole, MessageRole> = {
  user: MessageRole.USER,
  assistant: MessageRole.ASSISTANT,
};

const roleFromDb: Record<MessageRole, ChatRole> = {
  [MessageRole.USER]: 'user',
  [MessageRole.ASSISTANT]: 'assistant',
};

const expressionToDb: Record<Expression, DbExpression> = {
  smile: DbExpression.SMILE,
  shy: DbExpression.SHY,
  worried: DbExpression.WORRIED,
  serious: DbExpression.SERIOUS,
};

const expressionFromDb: Record<DbExpression, Expression> = {
  [DbExpression.SMILE]: 'smile',
  [DbExpression.SHY]: 'shy',
  [DbExpression.WORRIED]: 'worried',
  [DbExpression.SERIOUS]: 'serious',
};

export type StoredChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  expression: Expression | null;
  createdAt: Date;
};

const HISTORY_LIMIT = 50;

/** ユーザーの直近の会話履歴を、古い→新しい順で返す。 */
export async function loadRecentChatHistory(
  userId: string,
  limit: number = HISTORY_LIMIT,
): Promise<StoredChatMessage[]> {
  const messages = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return messages.reverse().map((message) => ({
    id: message.id,
    role: roleFromDb[message.role],
    content: message.content,
    expression: message.expression ? expressionFromDb[message.expression] : null,
    createdAt: message.createdAt,
  }));
}

export async function saveChatTurn({
  userId,
  userMessage,
  assistantReply,
  assistantExpression,
}: {
  userId: string;
  userMessage: string;
  assistantReply: string;
  assistantExpression: Expression;
}): Promise<void> {
  await prisma.chatMessage.createMany({
    data: [
      { userId, role: roleToDb.user, content: userMessage },
      {
        userId,
        role: roleToDb.assistant,
        content: assistantReply,
        expression: expressionToDb[assistantExpression],
      },
    ],
  });
}
