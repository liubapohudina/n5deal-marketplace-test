import Link from 'next/link';
import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  MapPin,
  MessageSquare,
  Search,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/currentUser';

function formatCurrency(value: unknown) {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value));
}

export default async function BuyerPage() {
  const buyer = await requireRole('BUYER');

  const [buyerProfile, opportunities, opportunitiesCount, inquiries] =
    await Promise.all([
      prisma.buyerProfile.findUnique({
        where: {
          userId: buyer.id,
        },
      }),

      prisma.asset.findMany({
        where: {
          status: 'PUBLISHED',
        },
        orderBy: [
          {
            aiMatchScore: 'desc',
          },
          {
            publishedAt: 'desc',
          },
        ],
        take: 3,
      }),

      prisma.asset.count({
        where: {
          status: 'PUBLISHED',
        },
      }),

      prisma.contactRequest.findMany({
        where: {
          senderId: buyer.id,
        },
        include: {
          asset: true,
          recipient: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 4,
      }),
    ]);
  const pendingInquiries = await prisma.contactRequest.count({
    where: {
      status: 'PENDING',
      OR: [
        {
          senderId: buyer.id,
        },
        {
          recipientId: buyer.id,
        },
      ],
    },
  });

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
            href="/opportunities"
            className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
          >
            <Search size={15} />
            Opportunities
          </Link>
          <Link
            href="/matches"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            <Sparkles size={16} />
            View my matches
          </Link>
        </div>

        {/* Header */}
        <section className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium text-violet-400">
              Buyer workspace
            </p>

            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] lg:text-5xl">
              Welcome back, {buyer.name}
            </h1>

            <p className="mt-3 text-sm text-zinc-500">
              Discover businesses matched to your acquisition criteria.
            </p>
          </div>

          <Link
            href="/opportunities"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 text-sm font-semibold transition hover:bg-violet-500"
          >
            <Search size={17} />
            Explore opportunities
          </Link>
        </section>

        {/* Stats */}
        <section className="mt-10 grid gap-4 md:grid-cols-3">
          <DashboardStat
            icon={<BriefcaseBusiness size={20} />}
            label="Available opportunities"
            value={String(opportunitiesCount)}
            variant="violet"
          />

          <DashboardStat
            icon={<Sparkles size={20} />}
            label="Best match"
            value={
              opportunities.length
                ? `${opportunities[0].aiMatchScore ?? 0}%`
                : '—'
            }
            variant="emerald"
          />

          <Link
            href="/buyer/inquiries"
            className="group rounded-[28px] border border-white/[0.08] bg-[#141419] p-7 transition duration-200 hover:-translate-y-1 hover:border-violet-500/30"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-300">
              <MessageSquare size={20} />
            </div>

            <p className="mt-7 text-sm text-zinc-500">Pending inquiries</p>

            <div className="mt-2 flex items-end justify-between">
              <p className="text-3xl font-semibold">{pendingInquiries}</p>

              <span className="translate-x-1 text-sm text-violet-400 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100">
                View →
              </span>
            </div>
          </Link>
        </section>

        {/* Main content */}
        <div className="mt-8 grid gap-6 xl:grid-cols-[1.7fr_0.8fr]">
          {/* Matches */}
          <section className="rounded-[30px] border border-white/[0.08] bg-[#121217] p-6 lg:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Recommended</p>

                <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                  Top opportunities
                </h2>
              </div>

              <Link
                href="/opportunities"
                className="text-sm font-medium text-violet-400 transition hover:text-violet-300"
              >
                View all →
              </Link>
            </div>

            <div className="mt-7 space-y-3">
              {opportunities.map((asset) => (
                <Link
                  key={asset.id}
                  href={`/opportunities/${asset.id}`}
                  className="group block rounded-[22px] border border-white/[0.07] bg-white/[0.025] p-5 transition hover:border-white/[0.14] hover:bg-white/[0.045]"
                >
                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
                          {asset.aiMatchScore ?? 0}% match
                        </span>

                        <span className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                          {asset.industry}
                        </span>
                      </div>

                      <h3 className="mt-3 text-lg font-semibold transition group-hover:text-violet-300">
                        {asset.title}
                      </h3>

                      <div className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
                        <MapPin size={14} />
                        {asset.location}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-8">
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-zinc-600">
                          Asking price
                        </p>

                        <p className="mt-1 font-semibold">
                          {formatCurrency(asset.askingPrice)}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-zinc-600">
                          EBITDA
                        </p>

                        <p className="mt-1 font-semibold text-emerald-400">
                          {formatCurrency(asset.ebitda)}
                        </p>
                      </div>

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-400 transition group-hover:bg-violet-600 group-hover:text-white">
                        <ArrowUpRight size={17} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}

              {opportunities.length === 0 && (
                <div className="py-14 text-center text-sm text-zinc-500">
                  No published opportunities are currently available.
                </div>
              )}
            </div>
          </section>

          {/* Criteria */}
          <section className="rounded-[30px] border border-white/[0.08] bg-[#121217] p-6 lg:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
              <Target size={21} />
            </div>

            <p className="mt-6 text-sm text-zinc-500">Investment profile</p>

            <h2 className="mt-1 text-2xl font-semibold">Your criteria</h2>

            {buyerProfile ? (
              <div className="mt-7 space-y-5">
                <CriteriaItem
                  icon={<Building2 size={16} />}
                  label="Target industries"
                  value={
                    buyerProfile.industries?.length
                      ? buyerProfile.industries.join(', ')
                      : 'Any industry'
                  }
                />

                <CriteriaItem
                  icon={<MapPin size={16} />}
                  label="Target regions"
                  value={
                    buyerProfile.geographies?.length
                      ? buyerProfile.geographies.join(', ')
                      : 'Any region'
                  }
                />

                <CriteriaItem
                  icon={<TrendingUp size={16} />}
                  label="Investment range"
                  value={`${formatCurrency(
                    buyerProfile.minDealSize,
                  )} – ${formatCurrency(buyerProfile.maxDealSize)}`}
                />

                <div className="pt-3">
                  <Link
                    href="/buyer/profile"
                    className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-sm font-medium text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    Edit investment criteria
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-7">
                <p className="text-sm leading-6 text-zinc-500">
                  Complete your investment profile to receive more relevant
                  acquisition opportunities.
                </p>

                <Link
                  href="/buyer/profile"
                  className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-violet-600 text-sm font-semibold transition hover:bg-violet-500"
                >
                  Create investment profile
                </Link>
              </div>
            )}
          </section>
        </div>

        {/* Recent inquiries */}
        <section className="mt-8 rounded-[30px] border border-white/[0.08] bg-[#121217] p-6 lg:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">Activity</p>

              <h2 className="mt-1 text-2xl font-semibold">Recent inquiries</h2>
            </div>

            <Link
              href="/buyer/inquiries"
              className="text-sm font-medium text-violet-400 hover:text-violet-300"
            >
              View all →
            </Link>
          </div>

          <div className="mt-6">
            {inquiries.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center">
                <MessageSquare size={22} className="mx-auto text-zinc-600" />

                <p className="mt-3 text-sm text-zinc-500">
                  You haven&apos;t contacted any sellers yet.
                </p>

                <Link
                  href="/opportunities"
                  className="mt-4 inline-flex text-sm font-medium text-violet-400 hover:text-violet-300"
                >
                  Browse opportunities →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.07]">
                {inquiries.map((inquiry) => (
                  <div
                    key={inquiry.id}
                    className="flex flex-col justify-between gap-4 py-5 first:pt-0 last:pb-0 md:flex-row md:items-center"
                  >
                    <div>
                      <p className="font-medium">
                        {inquiry.asset?.title ?? 'Opportunity'}
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        Seller:{' '}
                        {inquiry.recipient.company ?? inquiry.recipient.name}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <InquiryStatus status={inquiry.status} />

                      {inquiry.asset && (
                        <Link
                          href={`/opportunities/${inquiry.asset.id}`}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-zinc-400 transition hover:bg-white/[0.07] hover:text-white"
                        >
                          <ArrowUpRight size={16} />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function DashboardStat({
  icon,
  label,
  value,
  variant,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  variant: 'violet' | 'emerald';
}) {
  const styles = {
    violet: 'bg-violet-500/10 text-violet-300',
    emerald: 'bg-emerald-500/10 text-emerald-300',
  };

  return (
    <div className="rounded-[28px] border border-white/[0.08] bg-[#141419] p-7">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${styles[variant]}`}
      >
        {icon}
      </div>

      <p className="mt-7 text-sm text-zinc-500">{label}</p>

      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function CriteriaItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-white/[0.07] pb-5 last:border-0">
      <div className="flex items-center gap-2 text-xs text-zinc-600">
        {icon}
        {label}
      </div>

      <p className="mt-2 text-sm leading-6 text-zinc-300">{value}</p>
    </div>
  );
}

function InquiryStatus({
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
