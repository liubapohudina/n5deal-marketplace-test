import Link from 'next/link';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CircleDollarSign,
  FilePlus2,
  MessageSquare,
  ArrowLeft,
} from 'lucide-react';

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

export default async function SellerPage() {
  const seller = await requireRole('SELLER');

  const [assets, publishedCount, draftCount, inquiriesCount] =
    await Promise.all([
      prisma.asset.findMany({
        where: {
          sellerId: seller.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      }),

      prisma.asset.count({
        where: {
          sellerId: seller.id,
          status: 'PUBLISHED',
        },
      }),

      prisma.asset.count({
        where: {
          sellerId: seller.id,
          status: 'DRAFT',
        },
      }),

      prisma.contactRequest.count({
        where: {
          status: 'PENDING',
          OR: [
            {
              recipientId: seller.id,
            },
            {
              senderId: seller.id,
            },
          ],
        },
      }),
    ]);

  return (
    <main className="min-h-screen bg-[#0b0b0f] text-white">
      <div className="mx-auto max-w-[1450px] px-6 py-10 lg:px-10">
        <div className="mb-8 inline-flex items-center gap-1 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1">
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
          >
            <ArrowLeft size={15} />
            Marketplace
          </Link>

          <div className="h-5 w-px bg-white/10" />

          <Link
            href="/seller/assets"
            className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
          >
            <BriefcaseBusiness size={15} />
            My Assets
          </Link>
        </div>

        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium text-violet-400">
              Seller workspace
            </p>

            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
              Welcome back, {seller.name}
            </h1>

            <p className="mt-3 text-sm text-zinc-500">
              Manage your listings and connect with potential buyers.
            </p>
          </div>

          <Link
            href="/seller/assets/new"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            <FilePlus2 size={18} />
            Publish new asset
          </Link>
        </div>
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {/* Published assets */}
          <Link
            href="/seller/assets?status=PUBLISHED"
            className="group rounded-[28px] border border-white/[0.08] bg-[#141419] p-6 transition duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:bg-[#17171c]"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">
                <BriefcaseBusiness size={20} />
              </div>

              <ArrowUpRight
                size={18}
                className="text-zinc-700 transition duration-300 group-hover:text-violet-400"
              />
            </div>

            <p className="mt-6 text-sm text-zinc-500">Published assets</p>

            <div className="mt-2 flex items-end justify-between">
              <p className="text-3xl font-semibold">{publishedCount}</p>

              <span className="text-xs text-zinc-600 transition group-hover:text-zinc-400">
                View assets
              </span>
            </div>
          </Link>

          {/* Draft listings */}
          <Link
            href="/seller/assets?status=DRAFT"
            className="group rounded-[28px] border border-white/[0.08] bg-[#141419] p-6 transition duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:bg-[#17171c]"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-300">
                <CircleDollarSign size={20} />
              </div>

              <ArrowUpRight
                size={18}
                className="text-zinc-700 transition duration-300 group-hover:text-orange-400"
              />
            </div>

            <p className="mt-6 text-sm text-zinc-500">Draft listings</p>

            <div className="mt-2 flex items-end justify-between">
              <p className="text-3xl font-semibold">{draftCount}</p>

              <span className="text-xs text-zinc-600 transition group-hover:text-zinc-400">
                View drafts
              </span>
            </div>
          </Link>

          {/* Pending inquiries */}
          <Link
            href="/seller/inquiries"
            className="group rounded-[28px] border border-white/[0.08] bg-[#141419] p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:bg-[#17171c]"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
                <MessageSquare size={20} />
              </div>

              <ArrowUpRight
                size={18}
                className="text-zinc-700 transition duration-300 group-hover:text-emerald-400"
              />
            </div>

            <p className="mt-6 text-sm text-zinc-500">Pending inquiries</p>

            <div className="mt-2 flex items-end justify-between">
              <p className="text-3xl font-semibold">{inquiriesCount}</p>

              <span className="text-xs text-zinc-600 transition group-hover:text-zinc-400">
                View inquiries
              </span>
            </div>
          </Link>
        </section>
        <section className="mt-8 rounded-[30px] border border-white/[0.08] bg-[#121217] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">Portfolio</p>

              <h2 className="mt-1 text-2xl font-semibold">Recent assets</h2>
            </div>

            <Link
              href="/seller/assets"
              className="text-sm font-medium text-violet-400 hover:text-violet-300"
            >
              View all →
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {assets.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
                <p className="text-zinc-400">
                  You haven&apos;t created any assets yet.
                </p>
              </div>
            ) : (
              assets.map((asset) => (
                <Link
                  href={`/seller/assets/${asset.id}`}
                  key={asset.id}
                  className="group flex flex-col justify-between gap-5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition hover:border-violet-500/30 md:flex-row md:items-center"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          asset.status === 'PUBLISHED'
                            ? 'bg-emerald-500/10 text-emerald-300'
                            : 'bg-orange-500/10 text-orange-300'
                        }`}
                      >
                        {asset.status}
                      </span>

                      <span className="text-xs text-zinc-600">
                        {asset.industry}
                      </span>
                    </div>

                    <h3 className="mt-3 text-lg font-semibold">
                      {asset.title}
                    </h3>

                    <p className="mt-1 text-sm text-zinc-500">
                      {asset.location}
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs text-zinc-600">Asking price</p>

                      <p className="mt-1 font-semibold">
                        {formatCurrency(asset.askingPrice)}
                      </p>
                    </div>

                    <ArrowUpRight
                      size={18}
                      className="text-zinc-500 transition group-hover:text-violet-400"
                    />
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
