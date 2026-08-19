import Link from 'next/link';

import {
  ArrowLeft,
  ArrowUpRight,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  Users,
} from 'lucide-react';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/currentUser';
import { UserModerationButton } from '@/components/manager/UserModerationButton';

type SearchParams = {
  search?: string;
  role?: string;
  status?: string;
};

export default async function ManagerUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const manager = await requireRole('MANAGER');
  const params = await searchParams;

  const search = params.search?.trim() ?? '';

  const role =
    params.role === 'BUYER' || params.role === 'SELLER' ? params.role : '';

  const status =
    params.status === 'ACTIVE' || params.status === 'SUSPENDED'
      ? params.status
      : '';

  const users = await prisma.user.findMany({
    where: {
      role: {
        in: ['BUYER', 'SELLER'],
      },

      ...(role
        ? {
            role,
          }
        : {}),

      ...(status
        ? {
            status,
          }
        : {}),

      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                email: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                company: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                location: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    },

    orderBy: {
      createdAt: 'desc',
    },
  });

  const filtersActive = Boolean(search) || Boolean(role) || Boolean(status);

  return (
    <main className="min-h-screen bg-[#09090c] text-white">
      <div className="mx-auto max-w-[1500px] px-6 py-10 lg:px-10">
        <Link
          href="/manager"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Manager Dashboard
        </Link>

        <div className="mt-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium text-violet-400">
              Platform Manager
            </p>

            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
              Marketplace Users
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
              Review buyers and sellers, search participants and manage
              marketplace access.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-400">
            <Users size={15} />
            <span className="font-semibold text-white">{users.length}</span>
            users
          </div>
        </div>

        {/* Filters */}
        <section className="mt-8 rounded-[28px] border border-white/[0.08] bg-[#121217] p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-zinc-400">
            <SlidersHorizontal size={16} />
            Search & filters
          </div>

          <form
            action="/manager/users"
            method="GET"
            className="grid gap-3 lg:grid-cols-[1.5fr_0.8fr_0.8fr_auto]"
          >
            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <input
                type="search"
                name="search"
                defaultValue={search}
                placeholder="Search name, company, email..."
                className="h-12 w-full rounded-2xl border border-white/10 bg-[#19191f] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500/60"
              />
            </div>

            <select
              name="role"
              defaultValue={role}
              className="h-12 rounded-2xl border border-white/10 bg-[#19191f] px-4 text-sm text-zinc-300 outline-none focus:border-violet-500/60"
            >
              <option value="">All roles</option>
              <option value="BUYER">Buyers</option>
              <option value="SELLER">Sellers</option>
            </select>

            <select
              name="status"
              defaultValue={status}
              className="h-12 rounded-2xl border border-white/10 bg-[#19191f] px-4 text-sm text-zinc-300 outline-none focus:border-violet-500/60"
            >
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </select>

            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 text-sm font-semibold transition hover:bg-violet-500"
            >
              <Search size={16} />
              Apply
            </button>
          </form>

          {filtersActive && (
            <div className="mt-4 border-t border-white/[0.07] pt-4">
              <Link
                href="/manager/users"
                className="text-sm text-zinc-500 transition hover:text-white"
              >
                Clear filters
              </Link>
            </div>
          )}
        </section>

        {/* Users */}
        {users.length > 0 ? (
          <section className="mt-8 space-y-3">
            {users.map((user) => (
              <article
                key={user.id}
                className="rounded-[24px] border border-white/[0.08] bg-[#141419] p-5"
              >
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                  <div className="flex min-w-0 items-center gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                        user.role === 'BUYER'
                          ? 'bg-violet-500/10 text-violet-300'
                          : 'bg-emerald-500/10 text-emerald-300'
                      }`}
                    >
                      {user.role === 'BUYER' ? (
                        <Users size={20} />
                      ) : (
                        <UserRound size={20} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/manager/users/${user.id}`}
                          className="truncate font-semibold transition hover:text-violet-300"
                        >
                          {user.company ?? user.name}
                        </Link>

                        <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium text-zinc-500">
                          {user.role}
                        </span>

                        <StatusBadge status={user.status} />
                      </div>

                      <p className="mt-1 truncate text-sm text-zinc-500">
                        {user.name} · {user.email}
                      </p>

                      {user.location && (
                        <p className="mt-1 text-xs text-zinc-600">
                          {user.location}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-3">
                    <Link
                      href={`/manager/users/${user.id}`}
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
                    >
                      View
                      <ArrowUpRight size={15} />
                    </Link>

                    <UserModerationButton
                      userId={user.id}
                      status={user.status}
                      disabled={user.id === manager.id}
                    />
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="mt-8 rounded-[28px] border border-dashed border-white/10 bg-[#121217] px-6 py-20 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
              <Users size={21} />
            </div>

            <h2 className="mt-5 text-xl font-semibold">No users found</h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
              Try changing the role, status or search query.
            </p>

            <Link
              href="/manager/users"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              Clear filters
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: 'ACTIVE' | 'SUSPENDED' }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${
        status === 'ACTIVE'
          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
          : 'border-red-500/20 bg-red-500/10 text-red-300'
      }`}
    >
      {status}
    </span>
  );
}
