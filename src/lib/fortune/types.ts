import type { Expression } from '@/lib/chat/types';

export type FortuneCategory = 'TODAY' | 'LOVE';

export type FortuneResult = {
  headline: string;
  body: string;
  advice: string;
  luckyItem: string;
  luckyColor: string;
  score: number;
  expression: Expression;
};

export const fortuneResultSchema = {
  type: 'object',
  properties: {
    headline: { type: 'string' },
    body: { type: 'string' },
    advice: { type: 'string' },
    luckyItem: { type: 'string' },
    luckyColor: { type: 'string' },
    score: { type: 'integer', minimum: 1, maximum: 5 },
    expression: { type: 'string', enum: ['smile', 'shy', 'worried', 'serious'] },
  },
  required: ['headline', 'body', 'advice', 'luckyItem', 'luckyColor', 'score', 'expression'],
  additionalProperties: false,
};

export const fortuneCategoryLabels: Record<FortuneCategory, string> = {
  TODAY: '今日の運勢',
  LOVE: '恋愛運',
};
