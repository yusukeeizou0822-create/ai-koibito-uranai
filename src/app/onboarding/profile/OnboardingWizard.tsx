'use client';

import { useState, useTransition } from 'react';

import { CharacterAvatar } from '@/components/CharacterAvatar';
import { characterTaglines } from '@/lib/characterTaglines';

import { submitOnboarding } from './actions';

type CharacterOption = {
  id: string;
  type: 'BOYFRIEND' | 'GIRLFRIEND';
  personalityKey: string;
  name: string;
  avatarBaseUrl: string;
};

type Gender = 'MALE' | 'FEMALE';

type Step = 'profile' | 'character';

const genderToCharacterType: Record<Gender, CharacterOption['type']> = {
  MALE: 'GIRLFRIEND',
  FEMALE: 'BOYFRIEND',
};

export function OnboardingWizard({ characters }: { characters: CharacterOption[] }) {
  const [step, setStep] = useState<Step>('profile');
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [characterId, setCharacterId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [isPending, startTransition] = useTransition();

  const candidates = gender ? characters.filter((c) => c.type === genderToCharacterType[gender]) : [];

  function handleNextFromProfile() {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = '名前を入力してください';
    if (!birthDate) nextErrors.birthDate = '生年月日を入力してください';
    if (!gender) nextErrors.gender = '性別を選択してください';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      setStep('character');
    }
  }

  function handleBackToProfile() {
    setStep('profile');
    setErrors({});
  }

  function handleSubmit() {
    if (!characterId) {
      setErrors({ character: 'お相手を1人選んでください' });
      return;
    }
    if (!gender) {
      setErrors({ character: '性別が選択されていません。最初からやり直してください。' });
      return;
    }

    setErrors({});
    setSubmitError('');
    startTransition(async () => {
      const result = await submitOnboarding({ name, birthDate, gender, characterId });
      if (result?.error) {
        setSubmitError(result.error);
      }
    });
  }

  if (step === 'profile') {
    return (
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex flex-col gap-1 text-center">
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">プロフィール登録</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            四柱推命の占いに使用します。正確な情報を入力してください。
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-black dark:text-zinc-50">
            名前
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-md border border-black/[.15] bg-white px-3 py-2 text-black dark:border-white/[.2] dark:bg-zinc-900 dark:text-zinc-50"
            />
            {errors.name && <span className="text-sm text-red-600 dark:text-red-400">{errors.name}</span>}
          </label>

          <label className="flex flex-col gap-1 text-sm text-black dark:text-zinc-50">
            生年月日
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="rounded-md border border-black/[.15] bg-white px-3 py-2 text-black dark:border-white/[.2] dark:bg-zinc-900 dark:text-zinc-50"
            />
            {errors.birthDate && (
              <span className="text-sm text-red-600 dark:text-red-400">{errors.birthDate}</span>
            )}
          </label>

          <label className="flex flex-col gap-1 text-sm text-black dark:text-zinc-50">
            性別
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender | '')}
              className="rounded-md border border-black/[.15] bg-white px-3 py-2 text-black dark:border-white/[.2] dark:bg-zinc-900 dark:text-zinc-50"
            >
              <option value="">選択してください</option>
              <option value="FEMALE">女性</option>
              <option value="MALE">男性</option>
            </select>
            {errors.gender && <span className="text-sm text-red-600 dark:text-red-400">{errors.gender}</span>}
          </label>
        </div>

        <button
          type="button"
          onClick={handleNextFromProfile}
          className="rounded-full bg-foreground px-6 py-3 text-background font-medium transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          次へ
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">お相手を選んでください</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">1人選んで「次へ」を押してください。</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {candidates.map((character) => {
          const selected = character.id === characterId;
          return (
            <button
              key={character.id}
              type="button"
              onClick={() => setCharacterId(character.id)}
              className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors ${
                selected
                  ? 'border-black bg-black/[.04] dark:border-white dark:bg-white/[.08]'
                  : 'border-black/[.15] hover:bg-black/[.02] dark:border-white/[.2] dark:hover:bg-white/[.04]'
              }`}
            >
              <CharacterAvatar
                name={character.name}
                avatarUrl={`${character.avatarBaseUrl}.png`}
                className="h-20 w-20 border border-black/[.08] bg-zinc-100 text-2xl font-semibold text-zinc-500 dark:border-white/[.2] dark:bg-zinc-800 dark:text-zinc-300"
              />
              <span className="text-lg font-semibold text-black dark:text-zinc-50">{character.name}</span>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {characterTaglines[character.personalityKey]}
              </span>
            </button>
          );
        })}
      </div>

      {errors.character && <p className="text-sm text-red-600 dark:text-red-400">{errors.character}</p>}
      {submitError && <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={handleBackToProfile}
          disabled={isPending}
          className="rounded-full border border-solid border-black/[.08] px-5 py-3 text-sm transition-colors hover:bg-black/[.04] disabled:opacity-50 dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
        >
          戻る
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="flex-1 rounded-full bg-foreground px-6 py-3 text-background font-medium transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
        >
          {isPending ? '登録中...' : '次へ'}
        </button>
      </div>
    </div>
  );
}
