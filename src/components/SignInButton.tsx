import { signIn } from '@/auth';

export function SignInButton() {
  return (
    <form
      action={async () => {
        'use server';
        await signIn('google', { redirectTo: '/' });
      }}
    >
      <button
        type="submit"
        className="rounded-full bg-foreground px-6 py-3 text-background font-medium transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        Googleでログイン
      </button>
    </form>
  );
}
