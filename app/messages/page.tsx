import Link from 'next/link';

import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  MessageSquare,
  Search,
  Send,
  SlidersHorizontal,
} from 'lucide-react';

import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/currentUser';

type SearchParams = {
  tab?: string;
  search?: string;
  status?: string;
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

function getDashboardHref(role: 'BUYER' | 'SELLER' | 'MANAGER') {
  if (role === 'SELLER') return '/seller';
  if (role === 'BUYER') return '/buyer';
  if (role === 'MANAGER') return '/manager';

  return '/';
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await requireUser();

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#09090c] px-6 text-white">
        <div className="w-full max-w-[520px] rounded-[30px] border border-white/[0.08] bg-[#141419] p-8 text-center">
          <MessageSquare size={24} className="mx-auto text-violet-400" />

          <h1 className="mt-5 text-2xl font-semibold">
            Sign in to view messages
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            Your marketplace conversations will appear here.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-violet-600 px-5 text-sm font-semibold hover:bg-violet-500"
          >
            Log in
          </Link>
        </div>
      </main>
    );
  }

  const params = await searchParams;

  const tab =
    params.tab === 'received' || params.tab === 'sent' ? params.tab : 'all';

  const search = params.search?.trim() ?? '';

  const status =
    params.status === 'PENDING' ||
    params.status === 'ACCEPTED' ||
    params.status === 'DECLINED'
      ? params.status
      : '';

  const messages = await prisma.contactRequest.findMany({
    where: {
      ...(tab === 'received'
        ? {
            recipientId: user.id,
          }
        : tab === 'sent'
          ? {
              senderId: user.id,
            }
          : {
              OR: [
                {
                  senderId: user.id,
                },
                {
                  recipientId: user.id,
                },
              ],
            }),

      ...(status
        ? {
            status,
          }
        : {}),

      ...(search
        ? {
            OR: [
              {
                message: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                sender: {
                  name: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                sender: {
                  company: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                recipient: {
                  name: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                recipient: {
                  company: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                asset: {
                  title: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
            ],
          }
        : {}),
    },

    include: {
      sender: true,
      recipient: true,
      asset: true,
    },

    orderBy: {
      createdAt: 'desc',
    },
  });

  const pendingCount = messages.filter(
    (item) => item.status === 'PENDING',
  ).length;

  const acceptedCount = messages.filter(
    (item) => item.status === 'ACCEPTED',
  ).length;

  const declinedCount = messages.filter(
    (item) => item.status === 'DECLINED',
  ).length;

  const filtersActive = Boolean(search) || Boolean(status) || tab !== 'all';

  return (
    <main className="min-h-screen bg-[#09090c] text-white">
      <div className="mx-auto max-w-[1450px] px-6 py-10 lg:px-10">
        <Link
          href={getDashboardHref(user.role)}
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <div className="mt-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium text-violet-400">
              Marketplace conversations
            </p>

            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
              Messages
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
              Review sent and received inquiries across the marketplace.
            </p>
          </div>

          <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-400">
            {messages.length} conversations
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-7 inline-flex rounded-2xl border border-white/[0.08] bg-[#121217] p-1">
          <Link
            href="/messages"
            className={`rounded-xl px-5 py-2.5 text-sm font-medium transition ${
              tab === 'all'
                ? 'bg-violet-600 text-white'
                : 'text-zinc-500 hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            All
          </Link>

          <Link
            href="/messages?tab=received"
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition ${
              tab === 'received'
                ? 'bg-violet-600 text-white'
                : 'text-zinc-500 hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            <MessageSquare size={15} />
            Received
          </Link>

          <Link
            href="/messages?tab=sent"
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition ${
              tab === 'sent'
                ? 'bg-violet-600 text-white'
                : 'text-zinc-500 hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            <Send size={15} />
            Sent
          </Link>
        </div>

        {/* Stats */}
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <MessageStat
            label="Pending"
            value={pendingCount}
            className="bg-orange-500/10 text-orange-300"
          />

          <MessageStat
            label="Accepted"
            value={acceptedCount}
            className="bg-emerald-500/10 text-emerald-300"
          />

          <MessageStat
            label="Declined"
            value={declinedCount}
            className="bg-red-500/10 text-red-300"
          />
        </section>

        {/* Search */}
        <section className="mt-6 rounded-[28px] border border-white/[0.08] bg-[#121217] p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-zinc-400">
            <SlidersHorizontal size={16} />
            Search & filters
          </div>

          <form
            action="/messages"
            method="GET"
            className="grid gap-3 lg:grid-cols-[1.5fr_0.8fr_auto]"
          >
            {tab !== 'all' && <input type="hidden" name="tab" value={tab} />}

            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <input
                type="search"
                name="search"
                defaultValue={search}
                placeholder="Search message, company, opportunity..."
                className="h-12 w-full rounded-2xl border border-white/10 bg-[#19191f] pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-500/60"
              />
            </div>

            <select
              name="status"
              defaultValue={status}
              className="h-12 rounded-2xl border border-white/10 bg-[#19191f] px-4 text-sm text-zinc-300 outline-none"
            >
              <option value="">All statuses</option>

              <option value="PENDING">Pending</option>

              <option value="ACCEPTED">Accepted</option>

              <option value="DECLINED">Declined</option>
            </select>

            <button
              type="submit"
              className="h-12 rounded-2xl bg-violet-600 px-6 text-sm font-semibold hover:bg-violet-500"
            >
              Apply
            </button>
          </form>

          {filtersActive && (
            <div className="mt-4 border-t border-white/[0.07] pt-4">
              <Link
                href="/messages"
                className="text-sm text-zinc-500 transition hover:text-white"
              >
                Clear filters
              </Link>
            </div>
          )}
        </section>

        {/* List */}
        <section className="mt-8">
          {messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((message) => {
                const isSent = message.senderId === user.id;

                const counterpart = isSent ? message.recipient : message.sender;

                const counterpartHref =
                  counterpart.role === 'BUYER'
                    ? `/buyers/${counterpart.id}`
                    : `/sellers/${counterpart.id}`;

                return (
                  <article
                    key={message.id}
                    className="rounded-[28px] border border-white/[0.08] bg-[#141419] p-6"
                  >
                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <StatusBadge status={message.status} />

                          <span className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-wider text-zinc-500">
                            {isSent ? 'Sent' : 'Received'}
                          </span>

                          <span className="text-xs text-zinc-600">
                            {formatDate(message.createdAt)}
                          </span>
                        </div>

                        <div className="mt-5 flex items-center gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">
                            <Building2 size={19} />
                          </div>

                          <div>
                            <Link
                              href={counterpartHref}
                              className="font-semibold transition hover:text-violet-300"
                            >
                              {counterpart.company ?? counterpart.name}
                            </Link>

                            <p className="mt-1 text-sm text-zinc-500">
                              {counterpart.name} · {counterpart.role}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                          <p className="text-sm leading-6 text-zinc-300">
                            {message.message}
                          </p>
                        </div>
                      </div>

                      <div className="w-full shrink-0 lg:w-[320px]">
                        <div className="rounded-2xl border border-white/[0.08] bg-[#101014] p-4">
                          <p className="text-xs uppercase tracking-[0.12em] text-zinc-600">
                            Opportunity
                          </p>

                          {message.asset ? (
                            <Link
                              href={`/opportunities/${message.asset.id}`}
                              className="mt-2 block font-medium transition hover:text-violet-300"
                            >
                              {message.asset.title}
                            </Link>
                          ) : (
                            <p className="mt-2 text-sm text-zinc-500">
                              No linked asset
                            </p>
                          )}
                        </div>

                        <div className="mt-4 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3">
                          <p className="text-xs text-zinc-600">
                            Conversation state
                          </p>

                          <p className="mt-1 text-sm font-medium text-zinc-300">
                            {message.status === 'PENDING'
                              ? isSent
                                ? 'Waiting for response'
                                : 'Awaiting your response'
                              : message.status === 'ACCEPTED'
                                ? 'Connection established'
                                : 'Inquiry declined'}
                          </p>
                        </div>

                        <Link
                          href={
                            user.role === 'SELLER'
                              ? '/seller/inquiries'
                              : user.role === 'BUYER'
                                ? '/buyer/inquiries'
                                : '/messages'
                          }
                          className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
                        >
                          Open inquiry
                          <ArrowUpRight size={15} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-white/10 bg-[#121217] px-6 py-20 text-center">
              <MessageSquare size={22} className="mx-auto text-zinc-600" />

              <h2 className="mt-4 text-xl font-semibold">No messages found</h2>

              <p className="mt-2 text-sm text-zinc-500">
                Your marketplace conversations will appear here.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function MessageStat({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className="rounded-[26px] border border-white/[0.08] bg-[#141419] p-6">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${className}`}
      >
        <MessageSquare size={19} />
      </div>

      <p className="mt-5 text-sm text-zinc-500">{label}</p>

      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
}) {
  const styles = {
    PENDING: 'border-orange-500/20 bg-orange-500/10 text-orange-300',

    ACCEPTED: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',

    DECLINED: 'border-red-500/20 bg-red-500/10 text-red-300',
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}
