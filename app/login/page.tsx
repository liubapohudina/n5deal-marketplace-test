'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LockKeyhole, Mail } from 'lucide-react';

import { authClient } from '@/lib/auth-client';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setLoading(true);
    setError('');

    const result = await authClient.signIn.email({
      email,
      password,
    });

    if (result.error) {
      setError(result.error.message ?? 'Unable to sign in.');
      setLoading(false);
      return;
    }
    const session = await authClient.getSession();

    const role = session.data?.user?.role;

    if (role === 'SELLER') {
      router.push('/seller');
    } else if (role === 'BUYER') {
      router.push('/buyer');
    } else if (role === 'MANAGER') {
      router.push('/manager');
    } else {
      router.push('/');
    }

    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0b0f] px-6 text-white">
      <div className="w-full max-w-[430px]">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 text-lg font-bold">
            N5
          </div>

          <p className="mt-6 text-sm font-medium text-violet-400">
            N5Deal Marketplace
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
            Welcome back
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            Sign in to access the marketplace.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-[28px] border border-white/[0.08] bg-[#141419] p-6"
        >
          <label className="text-sm text-zinc-400">Email</label>

          <div className="relative mt-2">
            <Mail
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
            />

            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="buyer@n5deal.demo"
              className="h-12 w-full rounded-2xl border border-white/10 bg-[#101014] pl-11 pr-4 text-sm outline-none placeholder:text-zinc-600 focus:border-violet-500/60"
            />
          </div>

          <label className="mt-5 block text-sm text-zinc-400">Password</label>

          <div className="relative mt-2">
            <LockKeyhole
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
            />

            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="h-12 w-full rounded-2xl border border-white/10 bg-[#101014] pl-11 pr-4 text-sm outline-none placeholder:text-zinc-600 focus:border-violet-500/60"
            />
          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 h-12 w-full rounded-2xl bg-violet-600 text-sm font-semibold transition hover:bg-violet-500 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  );
}
