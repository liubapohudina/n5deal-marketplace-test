import Link from 'next/link';
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CircleDollarSign,
  MapPin,
  Sparkles,
  Target,
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

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function calculateMatch(
  asset: {
    industry: string;
    location: string;
    askingPrice: unknown;
    dealTypes: string[];
  },
  profile: {
    industries: string[];
    geographies: string[];
    minDealSize: unknown;
    maxDealSize: unknown;
    preferredDealTypes: string[];
  },
) {
  let score = 0;
  const reasons: string[] = [];

  // Industry — 35 points
  const industryMatches =
    profile.industries.length === 0 ||
    profile.industries.some(
      (industry) => normalize(industry) === normalize(asset.industry),
    );

  if (industryMatches && profile.industries.length > 0) {
    score += 35;
    reasons.push('Industry matches your investment criteria');
  }

  // Geography — 25 points
  const geographyMatches =
    profile.geographies.length === 0 ||
    profile.geographies.some((geography) => {
      const assetLocation = normalize(asset.location);
      const targetGeography = normalize(geography);

      return (
        assetLocation.includes(targetGeography) ||
        targetGeography.includes(assetLocation)
      );
    });

  if (geographyMatches && profile.geographies.length > 0) {
    score += 25;
    reasons.push('Located in a preferred geography');
  }

  // Deal size — 30 points
  if (asset.askingPrice !== null && asset.askingPrice !== undefined) {
    const price = Number(asset.askingPrice);

    const min =
      profile.minDealSize !== null && profile.minDealSize !== undefined
        ? Number(profile.minDealSize)
        : null;

    const max =
      profile.maxDealSize !== null && profile.maxDealSize !== undefined
        ? Number(profile.maxDealSize)
        : null;

    const aboveMin = min === null || price >= min;
    const belowMax = max === null || price <= max;

    if (aboveMin && belowMax && (min !== null || max !== null)) {
      score += 30;
      reasons.push('Asking price fits your target deal size');
    }
  }

  // Deal type — 10 points
  if (
    profile.preferredDealTypes.length > 0 &&
    asset.dealTypes.some((assetDealType) =>
      profile.preferredDealTypes.some(
        (preferred) => normalize(preferred) === normalize(assetDealType),
      ),
    )
  ) {
    score += 10;
    reasons.push('Deal structure matches your preferences');
  }

  return {
    score: Math.min(score, 100),
    reasons,
  };
}

export default async function MatchesPage() {
  const buyer = await requireRole('BUYER');

  const profile = await prisma.buyerProfile.findUnique({
    where: {
      userId: buyer.id,
    },
  });

  if (!profile) {
    return (
      <main className="min-h-screen bg-[#09090c] text-white">
        <div className="mx-auto max-w-[1400px] px-6 py-10 lg:px-10">
          <Link
            href="/buyer"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Buyer Dashboard
          </Link>

          <div className="mt-8 rounded-[32px] border border-white/[0.08] bg-[#141419] px-6 py-20 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">
              <Target size={24} />
            </div>

            <h1 className="mt-6 text-2xl font-semibold">
              Complete your investment profile
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
              Add your industries, target geographies and deal size so we can
              find relevant acquisition opportunities.
            </p>

            <Link
              href="/buyer/profile"
              className="mt-7 inline-flex h-11 items-center justify-center rounded-xl bg-violet-600 px-5 text-sm font-semibold transition hover:bg-violet-500"
            >
              Complete profile
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const assets = await prisma.asset.findMany({
    where: {
      status: 'PUBLISHED',

      seller: {
        status: 'ACTIVE',
      },
    },

    include: {
      seller: {
        select: {
          id: true,
          name: true,
          company: true,
        },
      },
    },

    orderBy: {
      publishedAt: 'desc',
    },
  });

  const matches = assets
    .map((asset) => {
      const match = calculateMatch(asset, profile);

      return {
        asset,
        ...match,
      };
    })
    // Don't call something a match when it matched nothing.
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const strongMatches = matches.filter((item) => item.score >= 70).length;

  const averageScore =
    matches.length > 0
      ? Math.round(
          matches.reduce((total, item) => total + item.score, 0) /
            matches.length,
        )
      : 0;

  return (
    <main className="min-h-screen bg-[#09090c] text-white">
      <div className="mx-auto max-w-[1450px] px-6 py-10 lg:px-10">
        <Link
          href="/buyer"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Buyer Dashboard
        </Link>

        {/* Header */}
        <section className="relative mt-8 overflow-hidden rounded-[34px] border border-white/[0.08] bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.20),transparent_38%),linear-gradient(135deg,#17151f_0%,#111116_55%,#0d0d11_100%)] p-8 lg:p-10">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet-500/[0.08] blur-3xl" />

          <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300">
                <Sparkles size={14} />
                Personalized matching
              </div>

              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] lg:text-5xl">
                Your Matches
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
                Opportunities ranked against your investment profile, including
                industry, geography, target deal size and preferred deal
                structure.
              </p>
            </div>

            <Link
              href="/buyer/profile"
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] px-5 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.09] hover:text-white"
            >
              Edit investment criteria
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <StatCard
            label="Matched opportunities"
            value={String(matches.length)}
            helper="Based on your profile"
          />

          <StatCard
            label="Strong matches"
            value={String(strongMatches)}
            helper="70% match or higher"
          />

          <StatCard
            label="Average match"
            value={`${averageScore}%`}
            helper="Across matched opportunities"
          />
        </section>

        {/* Profile criteria */}
        <section className="mt-6 rounded-[28px] border border-white/[0.08] bg-[#121217] p-6">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-zinc-600">
                Matching criteria
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {profile.industries.map((industry) => (
                  <CriteriaBadge
                    key={`industry-${industry}`}
                    label={industry}
                  />
                ))}

                {profile.geographies.map((geography) => (
                  <CriteriaBadge key={`geo-${geography}`} label={geography} />
                ))}

                {(profile.minDealSize !== null ||
                  profile.maxDealSize !== null) && (
                  <CriteriaBadge
                    label={`${formatCurrency(
                      profile.minDealSize,
                    )} – ${formatCurrency(profile.maxDealSize)}`}
                  />
                )}
              </div>
            </div>

            <Link
              href="/opportunities"
              className="inline-flex items-center gap-2 text-sm font-medium text-violet-300 transition hover:text-violet-200"
            >
              Browse full marketplace
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </section>

        {/* Matches */}
        <section className="mt-8">
          <div className="mb-5">
            <p className="text-sm text-zinc-500">
              Ranked for your investment profile
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              Recommended opportunities
            </h2>
          </div>

          {matches.length === 0 ? (
            <div className="rounded-[30px] border border-dashed border-white/10 bg-[#121217] px-6 py-20 text-center">
              <Target size={24} className="mx-auto text-zinc-600" />

              <h3 className="mt-5 text-xl font-semibold">No matches yet</h3>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
                We could not find published opportunities matching your current
                investment criteria.
              </p>

              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link
                  href="/buyer/profile"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-violet-600 px-5 text-sm font-semibold transition hover:bg-violet-500"
                >
                  Update criteria
                </Link>

                <Link
                  href="/opportunities"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 px-5 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"
                >
                  Browse marketplace
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 xl:grid-cols-2">
              {matches.map(({ asset, score, reasons }) => (
                <article
                  key={asset.id}
                  className="group rounded-[30px] border border-white/[0.08] bg-[#141419] p-6 transition hover:border-violet-500/25"
                >
                  <div className="flex items-start justify-between gap-5">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
                          {asset.industry}
                        </span>

                        <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
                          <MapPin size={13} />
                          {asset.location}
                        </span>
                      </div>

                      <Link
                        href={`/opportunities/${asset.id}`}
                        className="mt-4 block text-xl font-semibold leading-7 transition group-hover:text-violet-300"
                      >
                        {asset.title}
                      </Link>

                      <div className="mt-3 flex items-center gap-2 text-sm text-zinc-500">
                        <Building2 size={15} />

                        {asset.seller.company ?? asset.seller.name}
                      </div>
                    </div>

                    <MatchScore score={score} />
                  </div>

                  {/* Financials */}
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/[0.07] bg-[#101014] p-4">
                      <div className="flex items-center gap-2 text-xs text-zinc-600">
                        <CircleDollarSign size={14} />
                        Asking price
                      </div>

                      <p className="mt-2 text-lg font-semibold">
                        {formatCurrency(asset.askingPrice)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/[0.07] bg-[#101014] p-4">
                      <p className="text-xs text-zinc-600">EBITDA</p>

                      <p className="mt-2 text-lg font-semibold">
                        {formatCurrency(asset.ebitda)}
                      </p>
                    </div>
                  </div>

                  {/* Match reasons */}
                  {reasons.length > 0 && (
                    <div className="mt-5">
                      <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
                        Why it matches
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {reasons.map((reason) => (
                          <span
                            key={reason}
                            className="rounded-full bg-emerald-500/[0.08] px-3 py-1.5 text-xs text-emerald-300"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 border-t border-white/[0.07] pt-5">
                    <Link
                      href={`/opportunities/${asset.id}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-violet-300 transition hover:text-violet-200"
                    >
                      View opportunity
                      <ArrowUpRight size={15} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function CriteriaBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400">
      {label}
    </span>
  );
}

function MatchScore({ score }: { score: number }) {
  const styles =
    score >= 80
      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
      : score >= 60
        ? 'border-violet-500/20 bg-violet-500/10 text-violet-300'
        : 'border-orange-500/20 bg-orange-500/10 text-orange-300';

  return (
    <div
      className={`flex h-[70px] w-[70px] shrink-0 flex-col items-center justify-center rounded-2xl border ${styles}`}
    >
      <span className="text-xl font-semibold">{score}%</span>

      <span className="text-[9px] font-medium uppercase tracking-wider opacity-70">
        Match
      </span>
    </div>
  );
}

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[26px] border border-white/[0.08] bg-[#141419] p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">
        <Sparkles size={19} />
      </div>

      <p className="mt-5 text-sm text-zinc-500">{label}</p>

      <p className="mt-2 text-3xl font-semibold">{value}</p>

      <p className="mt-2 text-xs text-zinc-600">{helper}</p>
    </div>
  );
}
