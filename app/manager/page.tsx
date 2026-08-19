import Link from 'next/link';

import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  ShieldCheck,
  Users,
} from 'lucide-react';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/currentUser';

export default async function ManagerPage() {
  const manager = await requireRole('MANAGER');

  const [
    buyersCount,
    sellersCount,
    activeAssetsCount,
    suspendedUsersCount,
    recentUsers,
    recentAssets,
    recentModeration,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        role: 'BUYER',
        status: 'ACTIVE',
      },
    }),

    prisma.user.count({
      where: {
        role: 'SELLER',
        status: 'ACTIVE',
      },
    }),

    prisma.asset.count({
      where: {
        status: 'PUBLISHED',
      },
    }),

    prisma.user.count({
      where: {
        status: 'SUSPENDED',
      },
    }),

    prisma.user.findMany({
      where: {
        role: {
          in: ['BUYER', 'SELLER'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    }),

    prisma.asset.findMany({
      include: {
        seller: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    }),
    prisma.moderationAction.findMany({
      include: {
        manager: {
          select: {
            name: true,
          },
        },

        moderatedUser: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },

      take: 5,
    }),
  ]);

  return (
    <main className="min-h-screen bg-[#09090c] text-white">
      <div className="mx-auto max-w-[1500px] px-6 py-10 lg:px-10">
        {/* Navigation */}
        <div className="mb-8 flex w-full flex-col gap-1 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1 sm:w-auto sm:flex-row sm:items-center">
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
          >
            <ArrowLeft size={15} />
            Marketplace
          </Link>

          <div className="h-5 w-px bg-white/10" />

          <Link
            href="/manager/users"
            className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
          >
            <Users size={15} />
            Users
          </Link>

          <Link
            href="/manager/assets"
            className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
          >
            <BriefcaseBusiness size={15} />
            Assets
          </Link>
          <Link
            href="/manager/moderation"
            className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
          >
            <ShieldCheck size={15} />
            Moderation
          </Link>
        </div>

        {/* Header */}
        <section className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium text-violet-400">
              Platform Manager
            </p>

            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] lg:text-5xl">
              Welcome back, {manager.name}
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
              Monitor marketplace participants, assets and moderation activity.
            </p>
          </div>

          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-sm text-violet-300">
            Manager access
          </div>
        </section>

        {/* Stats */}
        <section className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ManagerStat
            href="/manager/users?role=BUYER"
            icon={<Users size={20} />}
            label="Active buyers"
            value={buyersCount}
            variant="violet"
          />

          <ManagerStat
            href="/manager/users?role=SELLER"
            icon={<Building2 size={20} />}
            label="Active sellers"
            value={sellersCount}
            variant="emerald"
          />

          <ManagerStat
            href="/manager/assets?status=PUBLISHED"
            icon={<BriefcaseBusiness size={20} />}
            label="Published assets"
            value={activeAssetsCount}
            variant="orange"
          />

          <ManagerStat
            href="/manager/users?status=SUSPENDED"
            icon={<ShieldCheck size={20} />}
            label="Suspended users"
            value={suspendedUsersCount}
            variant="red"
          />
        </section>

        {/* Main */}
        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          {/* Users */}
          <section className="rounded-[30px] border border-white/[0.08] bg-[#121217] p-6 lg:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">
                  Marketplace participants
                </p>

                <h2 className="mt-1 text-2xl font-semibold">Recent users</h2>
              </div>

              <Link
                href="/manager/users"
                className="text-sm font-medium text-violet-400 transition hover:text-violet-300"
              >
                View all →
              </Link>
            </div>

            <div className="mt-6 divide-y divide-white/[0.07]">
              {recentUsers.map((user) => (
                <Link
                  key={user.id}
                  href={`/manager/users/${user.id}`}
                  className="group flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium transition group-hover:text-violet-300">
                        {user.company ?? user.name}
                      </p>

                      <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                        {user.role}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-zinc-500">{user.name}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={user.status} />

                    <ArrowUpRight
                      size={17}
                      className="text-zinc-600 transition group-hover:text-violet-400"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Assets */}
          <section className="rounded-[30px] border border-white/[0.08] bg-[#121217] p-6 lg:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Marketplace inventory</p>

                <h2 className="mt-1 text-2xl font-semibold">Recent assets</h2>
              </div>

              <Link
                href="/manager/assets"
                className="text-sm font-medium text-violet-400 transition hover:text-violet-300"
              >
                View all →
              </Link>
            </div>

            <div className="mt-6 divide-y divide-white/[0.07]">
              {recentAssets.map((asset) => (
                <Link
                  key={asset.id}
                  href={`/manager/assets/${asset.id}`}
                  className="group flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium transition group-hover:text-violet-300">
                      {asset.title}
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      {asset.seller.company ?? asset.seller.name}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <AssetStatusBadge status={asset.status} />

                    <ArrowUpRight
                      size={17}
                      className="text-zinc-600 transition group-hover:text-violet-400"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </section>
          <section className="mt-8 rounded-[30px] border border-white/[0.08] bg-[#121217] p-6 lg:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Platform activity</p>

                <h2 className="mt-1 text-2xl font-semibold">
                  Recent moderation
                </h2>
              </div>

              <Link
                href="/manager/moderation"
                className="text-sm font-medium text-violet-400 transition hover:text-violet-300"
              >
                View all →
              </Link>
            </div>
            <div className="mt-6 divide-y divide-white/[0.07]">
              {recentModeration.length > 0 ? (
                recentModeration.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between gap-3 py-4 first:pt-0 last:pb-0 md:flex-row md:items-center"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${
                            item.action === 'SUSPEND'
                              ? 'border-red-500/20 bg-red-500/10 text-red-300'
                              : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                          }`}
                        >
                          {item.action}
                        </span>

                        <Link
                          href={`/manager/users/${item.moderatedUser.id}`}
                          className="text-sm font-medium transition hover:text-violet-300"
                        >
                          {item.moderatedUser.company ??
                            item.moderatedUser.name}
                        </Link>
                      </div>

                      <p className="mt-2 text-xs text-zinc-600">
                        By {item.manager.name}
                      </p>
                    </div>

                    <span className="text-xs text-zinc-600">
                      {new Intl.DateTimeFormat('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      }).format(item.createdAt)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="py-8 text-sm text-zinc-500">
                  No moderation actions yet.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function ManagerStat({
  href,
  icon,
  label,
  value,
  variant,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: number;
  variant: 'violet' | 'emerald' | 'orange' | 'red';
}) {
  const styles = {
    violet: 'bg-violet-500/10 text-violet-300',
    emerald: 'bg-emerald-500/10 text-emerald-300',
    orange: 'bg-orange-500/10 text-orange-300',
    red: 'bg-red-500/10 text-red-300',
  };

  return (
    <Link
      href={href}
      className="group rounded-[28px] border border-white/[0.08] bg-[#141419] p-7 transition duration-300 hover:-translate-y-1 hover:border-violet-500/25 hover:bg-[#17171d]"
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${styles[variant]}`}
        >
          {icon}
        </div>

        <ArrowUpRight
          size={18}
          className="text-zinc-700 transition group-hover:text-violet-400"
        />
      </div>

      <p className="mt-7 text-sm text-zinc-500">{label}</p>

      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </Link>
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

function AssetStatusBadge({
  status,
}: {
  status: 'DRAFT' | 'PUBLISHED' | 'SUSPENDED';
}) {
  const styles = {
    DRAFT: 'border-orange-500/20 bg-orange-500/10 text-orange-300',

    PUBLISHED: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',

    SUSPENDED: 'border-red-500/20 bg-red-500/10 text-red-300',
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}
