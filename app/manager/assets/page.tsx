import Link from 'next/link';

import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  CircleDollarSign,
  MapPin,
  Search,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/currentUser';
import { AssetModerationButton } from '@/components/manager/AssetModerationButton';

type SearchParams = {
  search?: string;
  status?: string;
  industry?: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export default async function ManagerAssetsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireRole('MANAGER');

  const params = await searchParams;

  const search = params.search?.trim() ?? '';

  const status =
    params.status === 'DRAFT' ||
    params.status === 'PUBLISHED' ||
    params.status === 'SUSPENDED'
      ? params.status
      : '';

  const industry = params.industry?.trim() ?? '';

  const [
    assets,
    totalCount,
    publishedCount,
    draftCount,
    suspendedCount,
    allAssetsForStats,
  ] = await Promise.all([
    prisma.asset.findMany({
      where: {
        ...(status ? { status } : {}),

        ...(industry
          ? {
              industry,
            }
          : {}),

        ...(search
          ? {
              OR: [
                {
                  title: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
                {
                  description: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
                {
                  industry: {
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
                {
                  seller: {
                    name: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                },
                {
                  seller: {
                    company: {
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
        seller: {
          select: {
            id: true,
            name: true,
            company: true,
            status: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    }),

    prisma.asset.count(),

    prisma.asset.count({
      where: {
        status: 'PUBLISHED',
      },
    }),

    prisma.asset.count({
      where: {
        status: 'DRAFT',
      },
    }),

    prisma.asset.count({
      where: {
        status: 'SUSPENDED',
      },
    }),

    prisma.asset.findMany({
      select: {
        status: true,
        industry: true,
        askingPrice: true,
      },
    }),
  ]);

  const industries = Array.from(
    new Set(allAssetsForStats.map((asset) => asset.industry)),
  ).sort();

  const totalAskingValue = allAssetsForStats.reduce(
    (sum, asset) => sum + (asset.askingPrice ? Number(asset.askingPrice) : 0),
    0,
  );

  const industryCounts = allAssetsForStats.reduce<Record<string, number>>(
    (acc, asset) => {
      acc[asset.industry] = (acc[asset.industry] ?? 0) + 1;

      return acc;
    },
    {},
  );

  const topIndustries = Object.entries(industryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxIndustryCount = Math.max(
    ...topIndustries.map(([, count]) => count),
    1,
  );

  const filtersActive = Boolean(search) || Boolean(status) || Boolean(industry);

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

        {/* Header */}
        <section className="mt-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium text-violet-400">
              Platform Manager
            </p>

            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] lg:text-5xl">
              Marketplace Assets
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
              Monitor marketplace inventory, review asset quality and moderate
              listings.
            </p>
          </div>

          <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-400">
            <span className="font-semibold text-white">{totalCount}</span> total
            assets
          </div>
        </section>

        {/* Stats */}
        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<BriefcaseBusiness size={20} />}
            label="Total assets"
            value={String(totalCount)}
            className="bg-violet-500/10 text-violet-300"
          />

          <StatCard
            icon={<BarChart3 size={20} />}
            label="Published"
            value={String(publishedCount)}
            className="bg-emerald-500/10 text-emerald-300"
          />

          <StatCard
            icon={<ShieldAlert size={20} />}
            label="Suspended"
            value={String(suspendedCount)}
            className="bg-red-500/10 text-red-300"
          />

          <StatCard
            icon={<CircleDollarSign size={20} />}
            label="Total asking value"
            value={formatCurrency(totalAskingValue)}
            className="bg-orange-500/10 text-orange-300"
          />
        </section>

        {/* Analytics */}
        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          {/* Status distribution */}
          <div className="rounded-[28px] border border-white/[0.08] bg-[#141419] p-7">
            <div>
              <p className="text-sm text-zinc-500">Asset analytics</p>

              <h2 className="mt-1 text-xl font-semibold">
                Status distribution
              </h2>
            </div>

            <div className="mt-7 space-y-5">
              <StatusBar
                label="Published"
                value={publishedCount}
                total={totalCount}
                barClassName="bg-emerald-500"
              />

              <StatusBar
                label="Draft"
                value={draftCount}
                total={totalCount}
                barClassName="bg-orange-500"
              />

              <StatusBar
                label="Suspended"
                value={suspendedCount}
                total={totalCount}
                barClassName="bg-red-500"
              />
            </div>
          </div>

          {/* Industries */}
          <div className="rounded-[28px] border border-white/[0.08] bg-[#141419] p-7">
            <div>
              <p className="text-sm text-zinc-500">Marketplace composition</p>

              <h2 className="mt-1 text-xl font-semibold">Top industries</h2>
            </div>

            <div className="mt-7 space-y-4">
              {topIndustries.length > 0 ? (
                topIndustries.map(([name, count]) => (
                  <div key={name}>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-zinc-400">{name}</span>

                      <span className="text-sm font-semibold">{count}</span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-violet-500"
                        style={{
                          width: `${(count / maxIndustryCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500">
                  No asset data available.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="mt-8 rounded-[28px] border border-white/[0.08] bg-[#121217] p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-zinc-400">
            <SlidersHorizontal size={16} />
            Search & filters
          </div>

          <form
            action="/manager/assets"
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
                placeholder="Search asset, seller, location..."
                className="h-12 w-full rounded-2xl border border-white/10 bg-[#19191f] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500/60"
              />
            </div>

            <select
              name="status"
              defaultValue={status}
              className="h-12 rounded-2xl border border-white/10 bg-[#19191f] px-4 text-sm text-zinc-300 outline-none focus:border-violet-500/60"
            >
              <option value="">All statuses</option>

              <option value="PUBLISHED">Published</option>

              <option value="DRAFT">Draft</option>

              <option value="SUSPENDED">Suspended</option>
            </select>

            <select
              name="industry"
              defaultValue={industry}
              className="h-12 rounded-2xl border border-white/10 bg-[#19191f] px-4 text-sm text-zinc-300 outline-none focus:border-violet-500/60"
            >
              <option value="">All industries</option>

              {industries.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
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
                href="/manager/assets"
                className="text-sm text-zinc-500 transition hover:text-white"
              >
                Clear filters
              </Link>
            </div>
          )}
        </section>

        {/* Results */}
        <div className="mt-7 flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500">Marketplace inventory</p>

            <h2 className="mt-1 text-xl font-semibold">
              {assets.length} assets found
            </h2>
          </div>
        </div>

        {assets.length > 0 ? (
          <section className="mt-5 space-y-3">
            {assets.map((asset) => (
              <article
                key={asset.id}
                className="rounded-[24px] border border-white/[0.08] bg-[#141419] p-5"
              >
                <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <AssetStatusBadge status={asset.status} />

                      <span className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-wider text-zinc-500">
                        {asset.assetType.replaceAll('_', ' ')}
                      </span>

                      <span className="text-xs text-zinc-600">
                        {asset.industry}
                      </span>
                    </div>

                    <Link
                      href={`/manager/assets/${asset.id}`}
                      className="mt-3 block truncate text-lg font-semibold transition hover:text-violet-300"
                    >
                      {asset.title}
                    </Link>

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                      <span>{asset.seller.company ?? asset.seller.name}</span>

                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} />
                        {asset.location}
                      </span>
                    </div>
                  </div>

                  <div className="grid shrink-0 grid-cols-2 gap-5 md:grid-cols-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                        Asking price
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {asset.askingPrice
                          ? formatCurrency(Number(asset.askingPrice))
                          : 'N/A'}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                        EBITDA
                      </p>

                      <p className="mt-1 text-sm font-semibold text-emerald-400">
                        {asset.ebitda
                          ? formatCurrency(Number(asset.ebitda))
                          : 'N/A'}
                      </p>
                    </div>

                    <div className="flex items-end gap-2">
                      <Link
                        href={`/manager/assets/${asset.id}`}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
                      >
                        View
                        <ArrowUpRight size={15} />
                      </Link>

                      <AssetModerationButton
                        assetId={asset.id}
                        status={asset.status}
                      />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="mt-5 rounded-[28px] border border-dashed border-white/10 bg-[#121217] px-6 py-20 text-center">
            <BriefcaseBusiness size={22} className="mx-auto text-zinc-600" />

            <h2 className="mt-4 text-xl font-semibold">No assets found</h2>

            <p className="mt-2 text-sm text-zinc-500">
              Try changing your filters.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  className: string;
}) {
  return (
    <div className="rounded-[26px] border border-white/[0.08] bg-[#141419] p-6">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${className}`}
      >
        {icon}
      </div>

      <p className="mt-5 text-sm text-zinc-500">{label}</p>

      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function StatusBar({
  label,
  value,
  total,
  barClassName,
}: {
  label: string;
  value: number;
  total: number;
  barClassName: string;
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">{label}</p>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{value}</span>

          <span className="text-xs text-zinc-600">{percentage}%</span>
        </div>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`h-full rounded-full ${barClassName}`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
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
