'use client';

import Image from 'next/image';
import { useState } from 'react';

import { getCharacterInitial } from '@/lib/characterTheme';

/**
 * avatarUrlの画像読み込みに失敗した場合（未配置など）は、
 * 頭文字の円形プレースホルダーに自動でフォールバックする。
 */
export function CharacterAvatar({
  name,
  avatarUrl,
  className = '',
}: {
  name: string;
  avatarUrl: string | null;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(avatarUrl) && !failed;

  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-full ${className}`}>
      {showImage ? (
        <Image
          src={avatarUrl as string}
          alt={name}
          fill
          sizes="300px"
          className="object-cover object-top"
          onError={() => setFailed(true)}
        />
      ) : (
        <span>{getCharacterInitial(name)}</span>
      )}
    </div>
  );
}
