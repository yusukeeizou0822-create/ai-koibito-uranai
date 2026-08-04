import { formatBaziSummary, type BaziChart } from '@/lib/bazi';

import type { FortuneCategory } from './types';

const categoryInstructions: Record<FortuneCategory, string> = {
  TODAY:
    '「今日の運勢」を占ってください。仕事・人間関係・体調など、ユーザーの1日全般に関する運勢を占い師のような視点で、恋人としての言葉遣いのまま伝えてください。',
  LOVE:
    '「恋愛運」を占ってください。ユーザーとあなた自身の関係や、ユーザーの恋愛面に関する運勢を、恋人だからこそ話せる親密さを込めて伝えてください。',
};

export function buildFortunePrompt({
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
}): string {
  return [
    personalitySystemPrompt,
    '',
    `ユーザーの名前は「${userName}」です。今日の日付は${dateLabel}です。`,
    `ユーザーの四柱推命の命式は「${formatBaziSummary(baziChart)}」です。この命式を根拠に、恋人であるあなたが四柱推命の知識を活かして占ってください。`,
    '',
    categoryInstructions[category],
    '',
    '応答は以下のフィールドを持つ形式で返してください。',
    '- headline: 占い結果を一言で表す短い見出し（15文字以内）',
    '- body: あなたの口調で語る占いの本文（120〜200文字程度）',
    '- advice: 今日ユーザーが意識するとよいワンポイントアドバイス（あなたの口調のまま、50文字程度）',
    '- luckyItem: 今日のラッキーアイテム',
    '- luckyColor: 今日のラッキーカラー',
    '- score: 運勢の良さを表す1〜5の整数（5が最も良い）',
    '- expression: 占いを伝えるときのあなたの表情（smile=笑顔, shy=照れ, worried=心配, serious=真剣）',
  ].join('\n');
}
