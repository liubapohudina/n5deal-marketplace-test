import Link from 'next/link';

import {
  ArrowLeft,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/currentUser';

type SearchParams = {
  search?: string;
  action?: string;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default async function ManagerModerationPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireRole('MANAGER');

  const params = await searchParams;

  const search = params.search?.trim() ?? '';

  const action =
    params.action === 'SUSPEND' || params.action === 'UNSUSPEND'
      ? params.action
      : '';

  const actions = await prisma.moderationAction.findMany({
    where: {
      ...(action ? { action } : {}),

      ...(search
        ? {
            OR: [
              {
                moderatedUser: {
                  name: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                moderatedUser: {
                  email: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                moderatedUser: {
                  company: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                manager: {
                  name: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                reason: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    },

    include: {
      manager: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      moderatedUser: {
        select: {
          id: true,
          name: true,
          email: true,
          company: true,
          role: true,
          status: true,
        },
      },
    },

    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <main className="min-h-screen bg-[#09090c] text-white">
      <div className="mx-auto max-w-[1450px] px-6 py-10 lg:px-10">
        <Link
          href="/manager"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Manager Dashboard
        </Link>

        <div className="mt-8">
          <p className="text-sm font-medium text-violet-400">
            Platform Manager
          </p>

          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
            Moderation Activity
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
            Review account suspension and restoration actions performed by
            platform managers.
          </p>
        </div>

        <section className="mt-8 rounded-[28px] border border-white/[0.08] bg-[#121217] p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-zinc-400">
            <SlidersHorizontal size={16} />
            Search & filters
          </div>

          <form
            action="/manager/moderation"
            method="GET"
            className="grid gap-3 lg:grid-cols-[1.5fr_0.8fr_auto]"
          >
            <div className="relative">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <input
                type="search"
                name="search"
                defaultValue={search}
                placeholder="Search user, manager, reason..."
                className="h-12 w-full rounded-2xl border border-white/10 bg-[#19191f] pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-500/60"
              />
            </div>

            <select
              name="action"
              defaultValue={action}
              className="h-12 rounded-2xl border border-white/10 bg-[#19191f] px-4 text-sm text-zinc-300 outline-none"
            >
              <option value="">All actions</option>
              <option value="SUSPEND">Suspended</option>
              <option value="UNSUSPEND">Unsuspended</option>
            </select>

            <button
              type="submit"
              className="h-12 rounded-2xl bg-violet-600 px-6 text-sm font-semibold transition hover:bg-violet-500"
            >
              Apply
            </button>
          </form>
        </section>

        <section className="mt-8 space-y-3">
          {actions.length > 0 ? (
            actions.map((item) => (
              <article
                key={item.id}
                className="rounded-[24px] border border-white/[0.08] bg-[#141419] p-5"
              >
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <ModerationBadge action={item.action} />

                      <span className="text-xs text-zinc-600">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>

                    <Link
                      href={`/manager/users/${item.moderatedUser.id}`}
                      className="mt-4 block text-lg font-semibold transition hover:text-violet-300"
                    >
                      {item.moderatedUser.company ?? item.moderatedUser.name}
                    </Link>

                    <p className="mt-1 text-sm text-zinc-500">
                      {item.moderatedUser.name} · {item.moderatedUser.role}
                    </p>

                    {item.reason && (
                      <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
                        {item.reason}
                      </p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                    <p className="text-xs text-zinc-600">Performed by</p>

                    <p className="mt-1 text-sm font-medium text-zinc-300">
                      {item.manager.name}
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      {item.manager.email}
                    </p>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[28px] border border-dashed border-white/10 bg-[#121217] py-20 text-center">
              <ShieldCheck size={22} className="mx-auto text-zinc-600" />

              <h2 className="mt-4 text-xl font-semibold">
                No moderation activity
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Moderation actions will appear here.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function ModerationBadge({ action }: { action: 'SUSPEND' | 'UNSUSPEND' }) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-medium ${
        action === 'SUSPEND'
          ? 'border-red-500/20 bg-red-500/10 text-red-300'
          : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
      }`}
    >
      {action}
    </span>
  );
}
