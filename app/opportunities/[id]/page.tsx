import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Check,
  MapPin,
  Users,
} from 'lucide-react';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/currentUser';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Topbar } from '@/components/dashboard/Topbar';
import { ContactSellerForm } from '@/components/opportunities/ContactSellerForm';

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

export default async function OpportunityDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  const asset = await prisma.asset.findFirst({
    where: {
      id,
      status: 'PUBLISHED',
    },

    include: {
      seller: true,
    },
  });

  if (!asset) {
    notFound();
  }

  if (!asset || asset.status !== 'PUBLISHED') {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#0b0b0f] text-white">
      <Sidebar role={currentUser?.role ?? null} />

      <div className="min-h-screen pb-24 md:ml-[84px] md:pb-0">
        <Topbar />

        <div className="mx-auto max-w-[1450px] px-6 py-8 lg:px-10">
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to opportunities
          </Link>

          <div className="mt-7 grid gap-7 xl:grid-cols-[1fr_390px]">
            <div>
              <section className="overflow-hidden rounded-[32px] border border-white/[0.08] bg-[#141419]">
                <div className="border-b border-white/[0.08] p-8 lg:p-10">
                  <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
                          {asset.aiMatchScore ?? 0}% match
                        </span>

                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
                          {asset.industry}
                        </span>

                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
                          {asset.assetType.replaceAll('_', ' ')}
                        </span>
                      </div>

                      <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-[-0.045em] lg:text-5xl">
                        {asset.title}
                      </h1>

                      <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-zinc-500">
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

                    <div className="shrink-0 rounded-[24px] border border-violet-500/20 bg-violet-500/10 px-6 py-5">
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-violet-300">
                        Asking price
                      </p>

                      <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                        {formatCurrency(asset.askingPrice)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-px bg-white/[0.08] md:grid-cols-3">
                  <div className="bg-[#141419] p-7">
                    <p className="text-xs uppercase tracking-[0.14em] text-zinc-600">
                      Revenue
                    </p>

                    <p className="mt-3 text-2xl font-semibold">
                      {formatCurrency(asset.revenue)}
                    </p>
                  </div>

                  <div className="bg-[#141419] p-7">
                    <p className="text-xs uppercase tracking-[0.14em] text-zinc-600">
                      EBITDA
                    </p>

                    <p className="mt-3 text-2xl font-semibold text-emerald-400">
                      {formatCurrency(asset.ebitda)}
                    </p>
                  </div>

                  <div className="bg-[#141419] p-7">
                    <p className="text-xs uppercase tracking-[0.14em] text-zinc-600">
                      Deal type
                    </p>

                    <p className="mt-3 text-lg font-semibold">
                      {asset.dealTypes[0] ?? 'Flexible'}
                    </p>
                  </div>
                </div>
              </section>

              <section className="mt-6 rounded-[30px] border border-white/[0.08] bg-[#121217] p-8">
                <p className="text-sm font-medium text-violet-400">
                  Opportunity overview
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
                  About the business
                </h2>

                <p className="mt-5 max-w-4xl text-[15px] leading-7 text-zinc-400">
                  {asset.description}
                </p>
              </section>

              <section className="mt-6 rounded-[30px] border border-white/[0.08] bg-[#121217] p-8">
                <p className="text-sm font-medium text-violet-400">
                  Key strengths
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
                  Investment highlights
                </h2>

                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  {asset.investmentHighlights.map((highlight) => (
                    <div
                      key={highlight}
                      className="flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4"
                    >
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                        <Check size={14} />
                      </div>

                      <span className="text-sm leading-6 text-zinc-300">
                        {highlight}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-5">
              <section className="rounded-[30px] border border-white/[0.08] bg-[#141419] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
                  Seller
                </p>

                <div className="mt-5 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white">
                    <Building2 size={21} />
                  </div>

                  <div>
                    <p className="font-semibold">
                      {asset.seller.company ?? asset.seller.name}
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      {asset.seller.location}
                    </p>
                  </div>
                </div>

                {asset.seller.bio && (
                  <p className="mt-5 text-sm leading-6 text-zinc-400">
                    {asset.seller.bio}
                  </p>
                )}
              </section>

              <ContactSellerForm
                assetId={asset.id}
                sellerName={asset.seller.name}
              />
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
