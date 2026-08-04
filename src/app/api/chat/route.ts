import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import type { BaziChart } from '@/lib/bazi';
import { anthropic } from '@/lib/claude';
import { buildSystemPrompt } from '@/lib/chat/buildSystemPrompt';
import { chatResponseSchema, type ChatTurn, type Expression } from '@/lib/chat/types';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'ログインが必要です。' }, { status: 401 });
  }

  let body: { message?: string; history?: ChatTurn[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'リクエストの形式が正しくありません。' }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json({ error: 'メッセージを入力してください。' }, { status: 400 });
  }

  const history = Array.isArray(body.history) ? body.history : [];

  const [profile, selection] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.userCharacterSelection.findUnique({
      where: { userId },
      include: { character: { include: { personality: true } } },
    }),
  ]);

  if (!profile || !selection?.character.personality) {
    return NextResponse.json(
      { error: 'プロフィールまたはお相手の選択が完了していません。' },
      { status: 400 },
    );
  }

  const systemPrompt = buildSystemPrompt({
    personalitySystemPrompt: selection.character.personality.systemPrompt,
    userName: profile.name,
    baziChart: profile.baziChartJson as BaziChart | null,
  });

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 1024,
      thinking: { type: 'disabled' },
      system: systemPrompt,
      messages: [
        ...history.map((turn) => ({ role: turn.role, content: turn.content })),
        { role: 'user' as const, content: message },
      ],
      output_config: {
        effort: 'low',
        format: { type: 'json_schema', schema: chatResponseSchema },
      },
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'AIからの応答を取得できませんでした。' }, { status: 502 });
    }

    const parsed = JSON.parse(textBlock.text) as { reply: string; expression: Expression };
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Claude API error:', error);
    return NextResponse.json({ error: 'AIとの通信でエラーが発生しました。' }, { status: 502 });
  }
}
