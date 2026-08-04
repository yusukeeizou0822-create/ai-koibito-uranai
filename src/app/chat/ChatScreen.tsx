'use client';

import { useState } from 'react';

import { characterGradient, defaultCharacterGradient, getCharacterInitial } from '@/lib/characterTheme';

type Expression = 'smile' | 'shy' | 'worried' | 'serious';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  expression?: Expression;
};

const EXPRESSION_ORDER: Expression[] = ['smile', 'shy', 'worried', 'serious'];

const EXPRESSION_LABELS: Record<Expression, string> = {
  smile: '笑顔',
  shy: '照れ',
  worried: '心配',
  serious: '真剣',
};

const DUMMY_REPLIES: Record<Expression, string> = {
  smile: 'うん、今日も会えてうれしいな。ゆっくり話そう。',
  shy: 'そんなこと言われると、ちょっと照れちゃうな……。',
  worried: '大丈夫? 無理してない? ちゃんと休んでね。',
  serious: 'それは大事な話だね。しっかり聞かせて。',
};

function createInitialMessages(characterName: string, userName: string): Message[] {
  return [
    {
      id: 'dummy-1',
      role: 'assistant',
      content: `${userName}、おかえりなさい。${characterName}だよ。今日はどんな一日だった?`,
      expression: 'smile',
    },
    {
      id: 'dummy-2',
      role: 'user',
      content: '今日はちょっと疲れたかも。',
    },
    {
      id: 'dummy-3',
      role: 'assistant',
      content: 'そっか、おつかれさま。無理してない? ゆっくり休んでね。',
      expression: 'worried',
    },
  ];
}

export function ChatScreen({
  character,
  userName,
}: {
  character: { name: string; personalityKey: string };
  userName: string;
}) {
  const [messages, setMessages] = useState<Message[]>(() =>
    createInitialMessages(character.name, userName),
  );
  const [expression, setExpression] = useState<Expression>('smile');
  const [input, setInput] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const gradient = characterGradient[character.personalityKey] ?? defaultCharacterGradient;

  function handleSend() {
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

    // Step7でClaude APIに置き換えるまでのダミー応答（実際のAI連携ではない）
    setTimeout(() => {
      const nextExpression = EXPRESSION_ORDER[(EXPRESSION_ORDER.indexOf(expression) + 1) % EXPRESSION_ORDER.length];
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: DUMMY_REPLIES[nextExpression],
        expression: nextExpression,
      };
      setExpression(nextExpression);
      setMessages((prev) => [...prev, assistantMessage]);
      setIsReplying(false);
    }, 700);
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row" style={{ backgroundColor: '#1A1B3A' }}>
      {/* 立ち絵パネル */}
      <div
        className="relative flex flex-col items-center justify-center gap-4 overflow-hidden px-6 py-10 lg:w-2/5 lg:min-h-screen"
        style={{ background: gradient }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute left-[15%] top-[20%] h-1 w-1 rounded-full bg-white" />
          <div className="absolute left-[70%] top-[15%] h-1.5 w-1.5 rounded-full bg-white" />
          <div className="absolute left-[30%] top-[70%] h-1 w-1 rounded-full bg-white" />
          <div className="absolute left-[80%] top-[60%] h-1 w-1 rounded-full bg-white" />
          <div className="absolute left-[50%] top-[40%] h-1.5 w-1.5 rounded-full bg-white" />
        </div>

        <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-4 border-white/30 bg-white/10 text-6xl font-semibold text-white shadow-xl backdrop-blur-sm lg:h-64 lg:w-64">
          {getCharacterInitial(character.name)}
        </div>

        <p className="relative text-xl font-semibold text-white">{character.name}</p>
        <p className="relative rounded-full bg-white/15 px-4 py-1 text-sm text-[#E8B4B8]">
          {EXPRESSION_LABELS[expression]}
        </p>

        <div className="relative mt-2 flex flex-wrap justify-center gap-2">
          {EXPRESSION_ORDER.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setExpression(e)}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                e === expression
                  ? 'bg-[#E8B4B8] text-[#1A1B3A]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {EXPRESSION_LABELS[e]}
            </button>
          ))}
        </div>
        <p className="relative text-center text-xs text-white/60">
          ※現在は表情プレビュー用のボタンです。会話中の自動切り替えはStep7で実装します。
        </p>
      </div>

      {/* チャットパネル */}
      <div className="flex flex-1 flex-col bg-white lg:min-h-screen">
        <header className="border-b border-black/[.08] px-6 py-4">
          <p className="text-lg font-semibold text-[#1A1B3A]">{character.name}</p>
          <p className="text-xs text-zinc-500">
            このキャラクターはAIであり、実在の人物ではありません。
          </p>
        </header>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-6 py-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  message.role === 'user'
                    ? 'bg-[#6B4E9E] text-white'
                    : 'border border-black/[.06] bg-zinc-50 text-[#1A1B3A]'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isReplying && (
            <div className="flex justify-start">
              <div className="max-w-[75%] rounded-2xl border border-black/[.06] bg-zinc-50 px-4 py-2 text-sm text-zinc-400">
                入力中...
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2 border-t border-black/[.08] px-6 py-4"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="メッセージを入力..."
            className="flex-1 rounded-full border border-black/[.15] px-4 py-2 text-sm text-[#1A1B3A] outline-none focus:border-[#6B4E9E]"
          />
          <button
            type="submit"
            disabled={!input.trim() || isReplying}
            className="rounded-full bg-[#6B4E9E] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5a4085] disabled:opacity-40"
          >
            送信
          </button>
        </form>
      </div>
    </div>
  );
}
