'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { getCharacterInitial } from '@/lib/characterTheme';
import type { ChatRole } from '@/lib/chat/types';

type HistoryMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

type HistoryGroup = {
  dateLabel: string;
  messages: HistoryMessage[];
};

const dateLabelFormatter = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo',
  hour: '2-digit',
  minute: '2-digit',
});

/** 同じ日付が連続するメッセージをまとめ、日付見出しの下に並べる。 */
function groupMessagesByDate(messages: HistoryMessage[]): HistoryGroup[] {
  const groups: HistoryGroup[] = [];

  for (const message of messages) {
    const dateLabel = dateLabelFormatter.format(new Date(message.createdAt));
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.dateLabel === dateLabel) {
      lastGroup.messages.push(message);
    } else {
      groups.push({ dateLabel, messages: [message] });
    }
  }

  return groups;
}

export function HistoryScreen({
  character,
  userName,
  messages,
}: {
  character: { name: string; personalityKey: string; avatarUrl: string | null };
  userName: string;
  messages: HistoryMessage[];
}) {
  const [avatarFailed, setAvatarFailed] = useState(false);

  const showAvatarImage = Boolean(character.avatarUrl) && !avatarFailed;
  const groups = groupMessagesByDate(messages);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-white">
      {/* キャラクター立ち絵（全画面表示。Chat/Fortune画面と統一） */}
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

      {/* 左上: チャットに戻る（chat画面の「今日の占いを見る」ボタンと同じ配置・スタイル） */}
      <Link
        href="/chat"
        className="absolute left-4 top-4 z-20 rounded-full bg-black/40 px-4 py-2 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-black/55"
      >
        チャットに戻る
      </Link>

      {/* 履歴一覧パネル: メッセージ数が多くなるため、他画面の下部パネルより縦に大きく取り内部スクロールにする */}
      <div className="absolute inset-x-4 top-20 bottom-4 z-10 flex flex-col overflow-hidden rounded-2xl bg-black/50 text-white shadow-lg backdrop-blur-md sm:inset-x-8 sm:bottom-6">
        <div className="border-b border-white/15 px-5 py-3">
          <p className="text-sm font-semibold text-[#E8B4B8]">会話履歴</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          {groups.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/60">まだ会話履歴がありません。</p>
          ) : (
            <div className="flex flex-col gap-6">
              {groups.map((group) => (
                <div key={group.dateLabel} className="flex flex-col gap-3">
                  <p className="text-center text-xs text-white/50">{group.dateLabel}</p>
                  {group.messages.map((message) => {
                    const isUser = message.role === 'user';
                    return (
                      <div
                        key={message.id}
                        className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}
                      >
                        <p className="px-1 text-[11px]">
                          <span className={isUser ? 'text-white/50' : 'font-semibold text-[#E8B4B8]'}>
                            {isUser ? userName : character.name}
                          </span>
                          <span className="ml-2 text-white/30">
                            {timeFormatter.format(new Date(message.createdAt))}
                          </span>
                        </p>
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                            isUser ? 'bg-white/90 text-[#1A1B3A]' : 'bg-black/40 text-white'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
