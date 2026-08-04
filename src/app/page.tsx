import Link from 'next/link';
import { redirect } from 'next/navigation';

import { auth, signOut } from '@/auth';
import { SignInButton } from '@/components/SignInButton';
import { prisma } from '@/lib/prisma';

export default async function Home() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-zinc-50 px-6 text-center dark:bg-black">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
            恋人だからこそ、あなたの運命を読み解ける。
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">AI恋人×四柱推命占い</p>
        </div>
        <SignInButton />
      </div>
    );
  }

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });

  if (!profile) {
    redirect('/onboarding/profile');
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 px-6 text-center dark:bg-black">
      <p className="text-black dark:text-zinc-50">
        ようこそ、{session.user.name ?? 'ゲスト'}さん
      </p>
      <Link
        href="/chat"
        className="rounded-full bg-foreground px-6 py-3 text-background font-medium transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        チャットへ
      </Link>
      <form
        action={async () => {
          'use server';
          await signOut({ redirectTo: '/' });
        }}
      >
        <button
          type="submit"
          className="rounded-full border border-solid border-black/[.08] px-5 py-2 text-sm transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
        >
          ログアウト
        </button>
      </form>
    </div>
  );
}
