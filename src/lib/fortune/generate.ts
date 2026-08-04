import type { BaziChart } from '@/lib/bazi';
import { anthropic } from '@/lib/claude';

import { buildFortunePrompt } from './buildFortunePrompt';
import { fortuneResultSchema, type FortuneCategory, type FortuneResult } from './types';

export async function generateFortune({
  personalitySystemPrompt,
  userName,
  baziChart,
  category,
  dateLabel,
}: {
  personalitySystemPrompt: string;
  userName: string;
  baziChart: BaziChart;
  category: FortuneCategory;
  dateLabel: string;
}): Promise<FortuneResult> {
  const systemPrompt = buildFortunePrompt({
    personalitySystemPrompt,
    userName,
    baziChart,
    category,
    dateLabel,
  });

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 1024,
    thinking: { type: 'disabled' },
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `${dateLabel}の占いをお願いします。`,
      },
    ],
    output_config: {
      effort: 'low',
      format: { type: 'json_schema', schema: fortuneResultSchema },
    },
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('AIからの占い結果を取得できませんでした。');
  }

  return JSON.parse(textBlock.text) as FortuneResult;
}
