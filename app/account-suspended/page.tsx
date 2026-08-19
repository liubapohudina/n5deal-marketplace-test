import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function AccountSuspendedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#09090c] px-6 text-white">
      <div className="w-full max-w-[520px] rounded-[30px] border border-red-500/20 bg-[#141419] p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
          <ShieldAlert size={24} />
        </div>

        <h1 className="mt-6 text-3xl font-semibold tracking-[-0.04em]">
          Account suspended
        </h1>

        <p className="mt-4 text-sm leading-6 text-zinc-500">
          Your marketplace account has been suspended by the platform team.
          Protected actions are temporarily unavailable.
        </p>

        <Link
          href="/"
          className="mt-7 inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-5 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
        >
          Back to marketplace
        </Link>
      </div>
    </main>
  );
}
