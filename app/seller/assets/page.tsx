import Link from 'next/link';
import { FilePlus2, ArrowLeft } from 'lucide-react';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/currentUser';

function formatCurrency(value: unknown) {
  if (value === null || value === undefined) return 'N/A';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value));
}

export default async function SellerAssetsPage() {
  const seller = await requireRole('SELLER');

  const assets = await prisma.asset.findMany({
    where: {
      sellerId: seller.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <main className="min-h-screen bg-[#0b0b0f] text-white">
      <div className="mx-auto max-w-[1400px] px-6 py-10 lg:px-10">
        <Link
          href="/seller"
          className="mb-7 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Seller Dashboard
        </Link>
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-violet-400">
              Seller workspace
            </p>

            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
              My Assets
            </h1>

            <p className="mt-3 text-sm text-zinc-500">
              Manage your published and draft opportunities.
            </p>
          </div>

          <Link
            href="/seller/assets/new"
            className="inline-flex h-12 items-center gap-2 rounded-2xl bg-violet-600 px-5 text-sm font-semibold hover:bg-violet-500"
          >
            <FilePlus2 size={18} />
            Publish new asset
          </Link>
        </div>

        <div className="mt-8 overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#121217]">
          {assets.map((asset) => (
            <Link
              href={`/seller/assets/${asset.id}`}
              key={asset.id}
              className="grid gap-4 border-b border-white/[0.07] p-5 transition last:border-b-0 hover:bg-white/[0.03] lg:grid-cols-[2fr_1fr_1fr_1fr]"
            >
              <div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    asset.status === 'PUBLISHED'
                      ? 'bg-emerald-500/10 text-emerald-300'
                      : 'bg-orange-500/10 text-orange-300'
                  }`}
                >
                  {asset.status}
                </span>

                <h2 className="mt-3 font-semibold">{asset.title}</h2>

                <p className="mt-1 text-sm text-zinc-500">{asset.location}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-600">
                  Industry
                </p>

                <p className="mt-2 text-sm">{asset.industry}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-600">
                  Asking price
                </p>

                <p className="mt-2 text-sm font-semibold">
                  {formatCurrency(asset.askingPrice)}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-600">
                  EBITDA
                </p>

                <p className="mt-2 text-sm font-semibold text-emerald-400">
                  {formatCurrency(asset.ebitda)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
