import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/currentUser';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Topbar } from '@/components/dashboard/Topbar';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { OpportunityCard } from '@/components/dashboard/OpportunityCard';
import { HeroInvestmentCard } from '@/components/dashboard/HeroInvestmentCard';
import { MarketplaceOverview } from '@/components/dashboard/MarketplaceOverview';

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

export default async function Home() {
  const user = await getCurrentUser();
  const assets = await prisma.asset.findMany({
    where: {
      status: 'PUBLISHED',
    },
    orderBy: {
      publishedAt: 'desc',
    },
    take: 6,
  });

  const buyersCount = await prisma.user.count({
    where: {
      role: 'BUYER',
      status: 'ACTIVE',
    },
  });

  const sellersCount = await prisma.user.count({
    where: {
      role: 'SELLER',
      status: 'ACTIVE',
    },
  });

  const assetsCount = await prisma.asset.count({
    where: {
      status: 'PUBLISHED',
    },
  });

  const messagesCount = await prisma.contactRequest.count({
    where: {
      status: 'PENDING',
    },
  });
  const featuredAssets = await prisma.asset.findMany({
    where: {
      status: 'PUBLISHED',
    },
    orderBy: {
      aiMatchScore: 'desc',
    },
    take: 3,
  });
  return (
    <main className="min-h-screen bg-[#09090c] text-white">
      <Sidebar role={user?.role ?? null} />

      <div className="min-h-screen md:ml-[84px]">
        <Topbar />

        <div className="px-8 py-8">
          <section className="relative overflow-hidden rounded-[32px] border border-white/[0.09] bg-[linear-gradient(135deg,#12131a_0%,#171525_45%,#21183a_100%)] p-10 text-white shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            {/* Violet glow */}
            <div className="pointer-events-none absolute -right-32 -top-40 h-[520px] w-[520px] rounded-full bg-violet-600/20 blur-[120px]" />

            {/* Soft blue glow */}
            <div className="pointer-events-none absolute -left-40 bottom-[-220px] h-[460px] w-[460px] rounded-full bg-indigo-500/10 blur-[120px]" />

            {/* subtle highlight */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(139,92,246,0.13),transparent_35%)]" />

            <div className="relative z-10">
              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
                <div>
                  <p className="mb-3 text-sm font-medium text-violet-400">
                    N5Deal Marketplace
                  </p>

                  <h1 className="max-w-3xl text-[38px] font-semibold leading-[0.98] tracking-[-0.045em] sm:text-[46px] md:text-[54px] lg:text-[58px]">
                    Global M&A Investment Opportunities
                  </h1>

                  <h1 className="max-w-3xl text-[38px] font-semibold leading-[0.98] tracking-[-0.045em] sm:text-[46px] md:text-[54px] lg:text-[58px]">
                    Global M&A Investment Opportunities
                  </h1>
                </div>

                <Link
                  href="/opportunities"
                  className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-white px-5 text-center text-sm font-semibold text-black transition hover:bg-zinc-200 sm:w-auto lg:mt-0"
                >
                  Explore all opportunities
                </Link>
              </div>

              <div className="mt-10 grid gap-5 xl:grid-cols-3">
                {featuredAssets.map((asset) => (
                  <HeroInvestmentCard
                    key={asset.id}
                    title={asset.title}
                    href={`/opportunities/${asset.id}`}
                    industry={asset.industry}
                    location={asset.location}
                    askingPrice={formatCurrency(asset.askingPrice)}
                    ebitda={formatCurrency(asset.ebitda)}
                    matchScore={asset.aiMatchScore ?? 0}
                  />
                ))}
              </div>
            </div>
          </section>

          <MarketplaceOverview
            opportunities={assetsCount}
            buyers={buyersCount}
            sellers={sellersCount}
            messages={messagesCount}
          />

          <section className="mt-8">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-sm text-zinc-500">Marketplace overview</p>
                <h2 className="mt-1 text-2xl font-semibold">
                  Your investment dashboard
                </h2>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <StatsCard
                label="Published assets"
                value={String(assetsCount)}
                helper="+ live"
              />

              <StatsCard label="Active buyers" value={String(buyersCount)} />

              <StatsCard label="Active sellers" value={String(sellersCount)} />
            </div>
          </section>

          <section className="mt-10">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Curated for you</p>
                <h2 className="mt-1 text-2xl font-semibold">
                  Recommended opportunities
                </h2>
              </div>

              <Link
                href="/opportunities"
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10"
              >
                View all
              </Link>
            </div>

            <div className="grid gap-5 xl:grid-cols-3">
              {assets.map((asset) => (
                <OpportunityCard
                  key={asset.id}
                  title={asset.title}
                  href={`/opportunities/${asset.id}`}
                  industry={asset.industry}
                  location={asset.location}
                  askingPrice={formatCurrency(asset.askingPrice)}
                  ebitda={formatCurrency(asset.ebitda)}
                  matchScore={asset.aiMatchScore ?? 0}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
