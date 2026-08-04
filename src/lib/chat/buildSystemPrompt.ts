import { formatBaziSummary, type BaziChart } from '@/lib/bazi';

export function buildSystemPrompt({
  personalitySystemPrompt,
  userName,
  baziChart,
}: {
  personalitySystemPrompt: string;
  userName: string;
  baziChart: BaziChart | null;
}): string {
  const lines = [
    personalitySystemPrompt,
    '',
    `ユーザーの名前は「${userName}」です。`,
    '',
    '応答は必ずreplyフィールド（日本語の返信本文）とexpressionフィールド（smile=笑顔, shy=照れ, worried=心配, serious=真剣のいずれか、今の表情）を含む形式で返してください。',
  ];

  if (baziChart) {
    lines.push(
      '',
      `参考: ユーザーの四柱推命の命式は「${formatBaziSummary(baziChart)}」です。占いや運勢、性格、相性について話題になったときのみ自然に触れてください。無関係な会話で無理に持ち出さないでください。`,
    );
  }

  return lines.join('\n');
}
