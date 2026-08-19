import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  MapPin,
  CalendarDays,
  Users,
} from 'lucide-react';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/currentUser';
import { DeleteAssetButton } from '@/components/seller/DeleteAssetButton';

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

export default async function SellerAssetDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const seller = await requireRole('SELLER');

  const { id } = await params;

  const asset = await prisma.asset.findFirst({
    where: {
      id,
      sellerId: seller.id,
    },
  });

  if (!asset) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#0b0b0f] text-white">
      <div className="mx-auto max-w-[1200px] px-6 py-10 lg:px-10">
        <Link
          href="/seller/assets"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to My Assets
        </Link>

        <div className="mt-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  asset.status === 'PUBLISHED'
                    ? 'bg-emerald-500/10 text-emerald-300'
                    : 'bg-orange-500/10 text-orange-300'
                }`}
              >
                {asset.status}
              </span>

              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
                {asset.industry}
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em]">
              {asset.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                {asset.location}
              </div>

              {asset.foundedYear && (
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} />
                  Founded {asset.foundedYear}
                </div>
              )}

              {asset.employees && (
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  {asset.employees} employees
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/seller/assets/${asset.id}/edit`}
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium transition hover:bg-white/10"
            >
              <Pencil size={16} />
              Edit
            </Link>

            <DeleteAssetButton assetId={asset.id} assetTitle={asset.title} />
          </div>
        </div>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-[26px] border border-white/[0.08] bg-[#141419] p-6">
            <p className="text-xs uppercase tracking-[0.12em] text-zinc-600">
              Asking price
            </p>
            <p className="mt-3 text-3xl font-semibold">
              {formatCurrency(asset.askingPrice)}
            </p>
          </div>

          <div className="rounded-[26px] border border-white/[0.08] bg-[#141419] p-6">
            <p className="text-xs uppercase tracking-[0.12em] text-zinc-600">
              Revenue
            </p>
            <p className="mt-3 text-3xl font-semibold">
              {formatCurrency(asset.revenue)}
            </p>
          </div>

          <div className="rounded-[26px] border border-white/[0.08] bg-[#141419] p-6">
            <p className="text-xs uppercase tracking-[0.12em] text-zinc-600">
              EBITDA
            </p>
            <p className="mt-3 text-3xl font-semibold text-emerald-400">
              {formatCurrency(asset.ebitda)}
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-white/[0.08] bg-[#121217] p-7">
          <p className="text-sm font-medium text-violet-400">Description</p>

          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-zinc-400">
            {asset.description}
          </p>
        </section>

        <section className="mt-6 rounded-[28px] border border-white/[0.08] bg-[#121217] p-7">
          <p className="text-sm font-medium text-violet-400">
            Investment highlights
          </p>

          {asset.investmentHighlights.length > 0 ? (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {asset.investmentHighlights.map((highlight) => (
                <div
                  key={highlight}
                  className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 text-sm text-zinc-300"
                >
                  {highlight}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">
              No investment highlights added yet.
            </p>
          )}
        </section>

        <section className="mt-6 rounded-[28px] border border-white/[0.08] bg-[#121217] p-7">
          <p className="text-sm font-medium text-violet-400">Deal structure</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {asset.dealTypes.length > 0 ? (
              asset.dealTypes.map((dealType) => (
                <span
                  key={dealType}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-300"
                >
                  {dealType}
                </span>
              ))
            ) : (
              <span className="text-sm text-zinc-500">
                No deal type specified.
              </span>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
