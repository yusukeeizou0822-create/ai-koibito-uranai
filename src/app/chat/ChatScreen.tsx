'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { getCharacterInitial } from '@/lib/characterTheme';
import type { ChatApiResponse, ChatRole, Expression } from '@/lib/chat/types';

type Message = {
  id: string;
  role: ChatRole;
  content: string;
  expression?: Expression;
};

function createInitialMessages(characterName: string, userName: string): Message[] {
  return [
    {
      id: 'greeting',
      role: 'assistant',
      content: `${userName}、おかえりなさい。${characterName}だよ。今日はどんな一日だった?`,
      expression: 'smile',
    },
  ];
}

function findLastExpression(messages: Message[]): Expression {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const { role, expression } = messages[i];
    if (role === 'assistant' && expression) {
      return expression;
    }
  }
  return 'smile';
}

export function ChatScreen({
  character,
  userName,
  initialMessages,
}: {
  character: { name: string; personalityKey: string; avatarUrl: string | null };
  userName: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(() => [
    ...createInitialMessages(character.name, userName),
    ...initialMessages,
  ]);
  // expressionは会話に応じて自動更新される。現状はキャラクターにつき画像が1枚のみのため表示には未反映だが、
  // 表情ごとの立ち絵が揃った際にすぐ組み込めるよう、state管理ロジックのみ先行して残している。
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- 上記の理由によりexpression自体は未参照
  const [expression, setExpression] = useState<Expression>(() => findLastExpression(messages));
  const [input, setInput] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [avatarFailed, setAvatarFailed] = useState(false);

  const showAvatarImage = Boolean(character.avatarUrl) && !avatarFailed;
  const latestMessage = messages[messages.length - 1];
  const latestSpeakerName = latestMessage?.role === 'user' ? userName : character.name;

  async function handleSend() {
    const content = input.trim();
    if (!content || isReplying) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsReplying(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(typeof data.error === 'string' ? data.error : 'エラーが発生しました。');
        return;
      }

      const { reply, expression: nextExpression } = data as ChatApiResponse;
      setExpression(nextExpression);
      setMessages((prev) => [
        ...prev,
        { id: `assistant-${Date.now()}`, role: 'assistant', content: reply, expression: nextExpression },
      ]);
    } catch {
      setErrorMessage('通信エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsReplying(false);
    }
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-white">
      {/* キャラクター立ち絵（全画面表示。画像・ページとも背景色を白で統一） */}
      <div className="absolute inset-0">
        {showAvatarImage ? (
          // 表情ごとの立ち絵画像が揃ったら、ここでexpressionの値に応じて表示するsrcを切り替える
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

      {/* 左上: 今日の占いを見る（menuとは独立したボタン） */}
      <Link
        href="/fortune"
        className="absolute left-4 top-4 z-20 rounded-full bg-black/40 px-4 py-2 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-black/55"
      >
        今日の占いを見る
      </Link>

      {/* 右上: menuボタン（会話履歴一覧画面へ遷移） */}
      <Link
        href="/chat/history"
        className="absolute right-4 top-4 z-20 rounded-full bg-black/40 px-4 py-2 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-black/55"
      >
        menu
      </Link>

      {/* 下部: セリフ吹き出し + 常時入力欄 */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-3 bg-gradient-to-t from-black/70 via-black/35 to-transparent px-4 pb-4 pt-20 sm:px-8 sm:pb-6">
        {errorMessage && (
          <p className="rounded-lg bg-red-500/80 px-4 py-2 text-sm text-white">{errorMessage}</p>
        )}

        <div className="rounded-2xl bg-black/50 px-5 py-4 text-white shadow-lg backdrop-blur-md">
          <p className="text-sm font-semibold text-[#E8B4B8]">{latestSpeakerName}</p>
          <p className="mt-1 text-base leading-relaxed">
            {isReplying ? '入力中...' : latestMessage?.content}
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSend();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="メッセージを入力..."
            className="flex-1 rounded-full border border-white/20 bg-white/90 px-4 py-2 text-sm text-[#1A1B3A] outline-none focus:border-[#6B4E9E]"
          />
          <button
            type="submit"
            disabled={!input.trim() || isReplying}
            className="rounded-full bg-[#6B4E9E] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5a4085] disabled:opacity-40"
          >
            送信
          </button>
        </form>

        <p className="text-center text-[10px] text-white/60">
          このキャラクターはAIであり、実在の人物ではありません。
        </p>
      </div>
    </div>
  );
}
