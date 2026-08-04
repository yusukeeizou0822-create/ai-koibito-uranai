import Link from 'next/link';

import { characterGradient, defaultCharacterGradient, getCharacterInitial } from '@/lib/characterTheme';
import { fortuneCategoryLabels, type FortuneCategory, type FortuneResult } from '@/lib/fortune';

const EXPRESSION_LABELS: Record<FortuneResult['expression'], string> = {
  smile: '笑顔',
  shy: '照れ',
  worried: '心配',
  serious: '真剣',
};

const CATEGORY_ORDER: FortuneCategory[] = ['TODAY', 'LOVE'];

function ScoreStars({ score }: { score: number }) {
  const clamped = Math.min(5, Math.max(1, Math.round(score)));
  return (
    <span className="text-lg tracking-wide text-[#E8B4B8]" aria-label={`運勢スコア ${clamped}/5`}>
      {'★'.repeat(clamped)}
      <span className="text-black/15">{'★'.repeat(5 - clamped)}</span>
    </span>
  );
}

function FortuneCard({ category, result }: { category: FortuneCategory; result: FortuneResult }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-black/[.06] bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#6B4E9E]">{fortuneCategoryLabels[category]}</p>
        <ScoreStars score={result.score} />
      </div>
      <p className="text-lg font-semibold text-[#1A1B3A]">{result.headline}</p>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">{result.body}</p>
      <p className="rounded-xl bg-zinc-50 px-4 py-3 text-sm text-[#1A1B3A]">
        <span className="font-medium text-[#6B4E9E]">ワンポイント: </span>
        {result.advice}
      </p>
      <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
        <span>ラッキーアイテム: {result.luckyItem}</span>
        <span>ラッキーカラー: {result.luckyColor}</span>
        <span>今の表情: {EXPRESSION_LABELS[result.expression]}</span>
      </div>
    </div>
  );
}

export function FortuneScreen({
  character,
  fortunes,
  errorMessage,
}: {
  character: { name: string; personalityKey: string };
  fortunes: Record<FortuneCategory, FortuneResult> | null;
  errorMessage: string | null;
}) {
  const gradient = characterGradient[character.personalityKey] ?? defaultCharacterGradient;

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: '#1A1B3A' }}>
      <div
        className="relative flex flex-col items-center gap-3 overflow-hidden px-6 py-10"
        style={{ background: gradient }}
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/30 bg-white/10 text-3xl font-semibold text-white shadow-xl backdrop-blur-sm">
          {getCharacterInitial(character.name)}
        </div>
        <p className="text-lg font-semibold text-white">{character.name}からの占い</p>
        <Link href="/chat" className="text-xs text-white/70 underline underline-offset-2 hover:text-white">
          チャットに戻る
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-4 bg-zinc-50 px-6 py-8">
        {errorMessage && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorMessage}
          </p>
        )}
        {fortunes &&
          CATEGORY_ORDER.map((category) => (
            <FortuneCard key={category} category={category} result={fortunes[category]} />
          ))}
      </div>
    </div>
  );
}
