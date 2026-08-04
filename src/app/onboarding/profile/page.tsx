import { redirect } from 'next/navigation';

import { auth } from '@/auth';

export default async function OnboardingProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/');
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-zinc-50 px-6 text-center dark:bg-black">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">プロフィール登録</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        準備中です。名前・生年月日・性別の登録フォームは次のステップで実装します。
      </p>
    </div>
  );
}
