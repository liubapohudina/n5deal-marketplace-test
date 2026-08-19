import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CircleDollarSign,
  MapPin,
  ShieldAlert,
  TrendingUp,
  Users,
} from 'lucide-react';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/currentUser';
import { AssetModerationButton } from '@/components/manager/AssetModerationButton';

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

function formatDate(date: Date | null) {
  if (!date) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export default async function ManagerAssetDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole('MANAGER');

  const { id } = await params;

  const asset = await prisma.asset.findUnique({
    where: {
      id,
    },

    include: {
      seller: {
        select: {
          id: true,
          name: true,
          company: true,
          email: true,
          location: true,
          status: true,
        },
      },

      contactRequests: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  if (!asset) {
    notFound();
  }

  const pendingInquiries = asset.contactRequests.filter(
    (item) => item.status === 'PENDING',
  ).length;

  const acceptedInquiries = asset.contactRequests.filter(
    (item) => item.status === 'ACCEPTED',
  ).length;

  return (
    <main className="min-h-screen bg-[#09090c] text-white">
      <div className="mx-auto max-w-[1450px] px-6 py-10 lg:px-10">
        <Link
          href="/manager/assets"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to assets
        </Link>

        {/* Header */}
        <section className="mt-7 overflow-hidden rounded-[32px] border border-white/[0.08] bg-[linear-gradient(135deg,#141419_0%,#181625_60%,#21183a_100%)] p-8 lg:p-10">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-start">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={asset.status} />

                <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-zinc-500">
                  {asset.assetType.replaceAll('_', ' ')}
                </span>

                <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-zinc-500">
                  {asset.industry}
                </span>
              </div>

              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] lg:text-5xl">
                {asset.title}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-zinc-500">
                <div className="flex items-center gap-2">
                  <MapPin size={15} />
                  {asset.location}
                </div>

                {asset.foundedYear && (
                  <div className="flex items-center gap-2">
                    <CalendarDays size={15} />
                    Founded {asset.foundedYear}
                  </div>
                )}

                {asset.employees && (
                  <div className="flex items-center gap-2">
                    <Users size={15} />
                    {asset.employees} employees
                  </div>
                )}
              </div>
            </div>

            <AssetModerationButton assetId={asset.id} status={asset.status} />
          </div>
        </section>

        {/* Financial metrics */}
        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<CircleDollarSign size={19} />}
            label="Asking price"
            value={formatCurrency(asset.askingPrice)}
            className="bg-violet-500/10 text-violet-300"
          />

          <MetricCard
            icon={<TrendingUp size={19} />}
            label="Revenue"
            value={formatCurrency(asset.revenue)}
            className="bg-blue-500/10 text-blue-300"
          />

          <MetricCard
            icon={<TrendingUp size={19} />}
            label="EBITDA"
            value={formatCurrency(asset.ebitda)}
            className="bg-emerald-500/10 text-emerald-300"
          />

          <MetricCard
            icon={<ShieldAlert size={19} />}
            label="AI match score"
            value={
              asset.aiMatchScore !== null ? `${asset.aiMatchScore}%` : 'N/A'
            }
            className="bg-orange-500/10 text-orange-300"
          />
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_0.85fr]">
          {/* Main */}
          <div className="space-y-6">
            {/* Description */}
            <section className="rounded-[28px] border border-white/[0.08] bg-[#141419] p-7 lg:p-8">
              <p className="text-sm text-violet-400">Asset overview</p>

              <h2 className="mt-1 text-2xl font-semibold">
                About this opportunity
              </h2>

              <p className="mt-6 text-sm leading-7 text-zinc-400">
                {asset.description}
              </p>
            </section>

            {/* Deal types */}
            <section className="rounded-[28px] border border-white/[0.08] bg-[#141419] p-7 lg:p-8">
              <p className="text-sm text-zinc-500">Transaction structure</p>

              <h2 className="mt-1 text-2xl font-semibold">Deal types</h2>

              {asset.dealTypes.length > 0 ? (
                <div className="mt-6 flex flex-wrap gap-2">
                  {asset.dealTypes.map((dealType) => (
                    <span
                      key={dealType}
                      className="rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-sm text-zinc-300"
                    >
                      {dealType}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-sm text-zinc-500">
                  No deal types specified.
                </p>
              )}
            </section>

            {/* Highlights */}
            <section className="rounded-[28px] border border-white/[0.08] bg-[#141419] p-7 lg:p-8">
              <p className="text-sm text-zinc-500">Investment case</p>

              <h2 className="mt-1 text-2xl font-semibold">
                Investment highlights
              </h2>

              {asset.investmentHighlights.length > 0 ? (
                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  {asset.investmentHighlights.map((highlight) => (
                    <div
                      key={highlight}
                      className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-sm leading-6 text-zinc-300"
                    >
                      {highlight}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-sm text-zinc-500">
                  No highlights specified.
                </p>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Seller */}
            <section className="rounded-[28px] border border-white/[0.08] bg-[#141419] p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                <Building2 size={19} />
              </div>

              <p className="mt-6 text-sm text-zinc-500">Seller</p>

              <h2 className="mt-1 text-xl font-semibold">
                {asset.seller.company ?? asset.seller.name}
              </h2>

              <p className="mt-1 text-sm text-zinc-500">{asset.seller.name}</p>

              <div className="mt-5 space-y-3">
                <InfoRow label="Email" value={asset.seller.email} />

                <InfoRow
                  label="Location"
                  value={asset.seller.location ?? 'Not specified'}
                />

                <InfoRow label="Account status" value={asset.seller.status} />
              </div>

              <Link
                href={`/manager/users/${asset.seller.id}`}
                className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-sm font-medium text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
              >
                View seller profile
              </Link>
            </section>

            {/* Inquiry stats */}
            <section className="rounded-[28px] border border-white/[0.08] bg-[#141419] p-7">
              <p className="text-sm text-zinc-500">Engagement</p>

              <h2 className="mt-1 text-xl font-semibold">Inquiries</h2>

              <div className="mt-6 grid gap-3">
                <InfoMetric
                  label="Total inquiries"
                  value={asset.contactRequests.length}
                />

                <InfoMetric label="Pending" value={pendingInquiries} />

                <InfoMetric label="Accepted" value={acceptedInquiries} />
              </div>
            </section>

            {/* Asset details */}
            <section className="rounded-[28px] border border-white/[0.08] bg-[#141419] p-7">
              <p className="text-sm text-zinc-500">Metadata</p>

              <h2 className="mt-1 text-xl font-semibold">Asset details</h2>

              <div className="mt-6 space-y-4">
                <InfoRow label="Status" value={asset.status} />

                <InfoRow
                  label="Asset type"
                  value={asset.assetType.replaceAll('_', ' ')}
                />

                <InfoRow label="Industry" value={asset.industry} />

                <InfoRow
                  label="Published"
                  value={formatDate(asset.publishedAt)}
                />

                <InfoRow label="Created" value={formatDate(asset.createdAt)} />

                <InfoRow label="Updated" value={formatDate(asset.updatedAt)} />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function MetricCard({
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

      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function StatusBadge({
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
      className={`rounded-full border px-3 py-1 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-white/[0.07] pb-3 last:border-0 last:pb-0">
      <p className="text-xs text-zinc-600">{label}</p>

      <p className="mt-1 break-words text-sm text-zinc-300">{value}</p>
    </div>
  );
}

function InfoMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-3">
      <span className="text-sm text-zinc-500">{label}</span>

      <span className="text-lg font-semibold">{value}</span>
    </div>
  );
}
