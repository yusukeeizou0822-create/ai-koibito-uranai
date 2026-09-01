'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { getCharacterInitial } from '@/lib/characterTheme';
import { fortuneCategoryLabels, type FortuneCategory, type FortuneResult } from '@/lib/fortune/types';

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
    <span className="text-base tracking-wide text-[#E8B4B8]" aria-label={`運勢スコア ${clamped}/5`}>
      {'★'.repeat(clamped)}
      <span className="text-white/25">{'★'.repeat(5 - clamped)}</span>
    </span>
  );
}

function FortuneBadge({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] text-white">
      <span className="text-white/60">{label}: </span>
      {value}
    </span>
  );
}

export function FortuneScreen({
  character,
  fortunes,
  errorMessage,
}: {
  character: { name: string; personalityKey: string; avatarUrl: string | null };
  fortunes: Record<FortuneCategory, FortuneResult> | null;
  errorMessage: string | null;
}) {
  const [activeCategory, setActiveCategory] = useState<FortuneCategory>('TODAY');
  const [avatarFailed, setAvatarFailed] = useState(false);

  const showAvatarImage = Boolean(character.avatarUrl) && !avatarFailed;
  const activeResult = fortunes ? fortunes[activeCategory] : null;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-white">
      {/* キャラクター立ち絵（全画面表示。画像・ページとも背景色を白で統一） */}
      <div className="absolute inset-0">
        {showAvatarImage ? (
          <Image
            src={character.avatarUrl as string}
            alt={character.name}
            fill
            sizes="100vw"
            priority
            className="object-contain object-bottom"
            onError={() => setAvatarFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10rem] font-semibold text-zinc-200">
            {getCharacterInitial(character.name)}
          </div>
        )}
      </div>

      {/* 左上: チャットに戻る（chat画面の「今日の占いを見る」ボタンと対になる配置） */}
      <Link
        href="/chat"
        className="absolute left-4 top-4 z-20 rounded-full bg-black/40 px-4 py-2 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-black/55"
      >
        チャットに戻る
      </Link>

      {/* 下部: タブ切り替え + 占い内容パネル */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-3 bg-gradient-to-t from-black/70 via-black/35 to-transparent px-4 pb-4 pt-20 sm:px-8 sm:pb-6">
        {errorMessage && (
          <p className="rounded-lg bg-red-500/80 px-4 py-2 text-sm text-white">{errorMessage}</p>
        )}

        {fortunes && (
          <div className="rounded-2xl bg-black/50 text-white shadow-lg backdrop-blur-md">
            {/* タブ: 今日の運勢 / 恋愛運 */}
            <div className="flex border-b border-white/15">
              {CATEGORY_ORDER.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    category === activeCategory
                      ? 'border-b-2 border-[#E8B4B8] text-white'
                      : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  {fortuneCategoryLabels[category]}
                </button>
              ))}
            </div>

            {/* 選択中タブの内容 */}
            {activeResult && (
              <div className="flex flex-col gap-2 px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base font-semibold">{activeResult.headline}</p>
                  <ScoreStars score={activeResult.score} />
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/90">
                  {activeResult.body}
                </p>
                <p className="rounded-xl bg-white/10 px-4 py-2 text-sm">
                  <span className="font-medium text-[#E8B4B8]">ワンポイント: </span>
                  {activeResult.advice}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <FortuneBadge label="ラッキーアイテム" value={activeResult.luckyItem} />
                  <FortuneBadge label="ラッキーカラー" value={activeResult.luckyColor} />
                  <FortuneBadge label="今の表情" value={EXPRESSION_LABELS[activeResult.expression]} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
