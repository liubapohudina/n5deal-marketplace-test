import Link from 'next/link';
import {
  ArrowUpRight,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';

import { prisma } from '@/lib/prisma';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Topbar } from '@/components/dashboard/Topbar';

type SearchParams = {
  search?: string;
  industry?: string;
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
};

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

function parsePositiveNumber(value?: string) {
  if (!value) {
    return undefined;
  }

  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return undefined;
  }

  return number;
}

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const search = params.search?.trim() ?? '';
  const industry = params.industry?.trim() ?? '';
  const location = params.location?.trim() ?? '';

  const minPrice = parsePositiveNumber(params.minPrice);
  const maxPrice = parsePositiveNumber(params.maxPrice);

  const sort = params.sort ?? 'newest';

  const priceFilter =
    minPrice !== undefined || maxPrice !== undefined
      ? {
          askingPrice: {
            ...(minPrice !== undefined ? { gte: minPrice } : {}),
            ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
          },
        }
      : {};

  const assets = await prisma.asset.findMany({
    where: {
      status: 'PUBLISHED',

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
            ],
          }
        : {}),

      ...(industry
        ? {
            industry,
          }
        : {}),

      ...(location
        ? {
            location,
          }
        : {}),

      ...priceFilter,
    },

    orderBy:
      sort === 'price-low'
        ? {
            askingPrice: 'asc',
          }
        : sort === 'price-high'
          ? {
              askingPrice: 'desc',
            }
          : sort === 'match'
            ? {
                aiMatchScore: 'desc',
              }
            : {
                publishedAt: 'desc',
              },
  });

  const [industryRows, locationRows] = await Promise.all([
    prisma.asset.findMany({
      where: {
        status: 'PUBLISHED',
      },
      select: {
        industry: true,
      },
      distinct: ['industry'],
      orderBy: {
        industry: 'asc',
      },
    }),

    prisma.asset.findMany({
      where: {
        status: 'PUBLISHED',
      },
      select: {
        location: true,
      },
      distinct: ['location'],
      orderBy: {
        location: 'asc',
      },
    }),
  ]);

  const filtersActive =
    Boolean(search) ||
    Boolean(industry) ||
    Boolean(location) ||
    minPrice !== undefined ||
    maxPrice !== undefined ||
    sort !== 'newest';

  return (
    <main className="min-h-screen bg-[#09090c] text-white">
      <Sidebar />

      <div className="ml-[84px] min-h-screen">
        <Topbar />

        <div className="mx-auto max-w-[1550px] px-6 py-8 lg:px-10">
          {/* Header */}
          <section className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-medium text-violet-400">
                N5Deal Marketplace
              </p>

              <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] lg:text-5xl">
                Investment Opportunities
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                Explore businesses and financial assets available for
                acquisition across global markets.
              </p>
            </div>

            <div className="inline-flex w-fit rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-400">
              <span className="font-semibold text-white">{assets.length}</span>

              <span className="ml-1.5">
                {assets.length === 1 ? 'opportunity' : 'opportunities'}
              </span>
            </div>
          </section>

          {/* Filters */}
          <section className="mt-8 rounded-[28px] border border-white/[0.08] bg-[#121217] p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-zinc-400">
              <SlidersHorizontal size={16} />
              Search & filters
            </div>

            <form method="GET" action="/opportunities" className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                />

                <input
                  type="search"
                  name="search"
                  defaultValue={search}
                  placeholder="Search companies, industries, locations..."
                  className="h-12 w-full rounded-2xl border border-white/10 bg-[#19191f] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10"
                />
              </div>

              {/* Filter row */}
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_0.8fr_0.8fr_1fr_auto]">
                {/* Industry */}
                <select
                  name="industry"
                  defaultValue={industry}
                  className="h-12 rounded-2xl border border-white/10 bg-[#19191f] px-4 text-sm text-zinc-300 outline-none transition focus:border-violet-500/60"
                >
                  <option value="">All industries</option>

                  {industryRows.map((item) => (
                    <option key={item.industry} value={item.industry}>
                      {item.industry}
                    </option>
                  ))}
                </select>

                {/* Location */}
                <select
                  name="location"
                  defaultValue={location}
                  className="h-12 rounded-2xl border border-white/10 bg-[#19191f] px-4 text-sm text-zinc-300 outline-none transition focus:border-violet-500/60"
                >
                  <option value="">All locations</option>

                  {locationRows.map((item) => (
                    <option key={item.location} value={item.location}>
                      {item.location}
                    </option>
                  ))}
                </select>

                {/* Min price */}
                <input
                  name="minPrice"
                  type="number"
                  min="0"
                  step="100000"
                  defaultValue={params.minPrice ?? ''}
                  placeholder="Min €"
                  className="h-12 rounded-2xl border border-white/10 bg-[#19191f] px-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-500/60"
                />

                {/* Max price */}
                <input
                  name="maxPrice"
                  type="number"
                  min="0"
                  step="100000"
                  defaultValue={params.maxPrice ?? ''}
                  placeholder="Max €"
                  className="h-12 rounded-2xl border border-white/10 bg-[#19191f] px-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-500/60"
                />

                {/* Sort */}
                <select
                  name="sort"
                  defaultValue={sort}
                  className="h-12 rounded-2xl border border-white/10 bg-[#19191f] px-4 text-sm text-zinc-300 outline-none transition focus:border-violet-500/60"
                >
                  <option value="newest">Newest first</option>

                  <option value="match">Best match</option>

                  <option value="price-low">Price: Low → High</option>

                  <option value="price-high">Price: High → Low</option>
                </select>

                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 text-sm font-semibold text-white transition hover:bg-violet-500"
                >
                  <Search size={16} />
                  Apply
                </button>
              </div>

              {filtersActive && (
                <div className="flex items-center justify-between border-t border-white/[0.07] pt-4">
                  <p className="text-xs text-zinc-600">
                    Showing filtered marketplace results
                  </p>

                  <Link
                    href="/opportunities"
                    className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
                  >
                    <X size={14} />
                    Clear filters
                  </Link>
                </div>
              )}
            </form>
          </section>

          {/* Results info */}
          <div className="mt-7 flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">Marketplace results</p>

              <h2 className="mt-1 text-xl font-semibold">
                {assets.length === 0
                  ? 'No matching opportunities'
                  : `${assets.length} ${
                      assets.length === 1 ? 'opportunity' : 'opportunities'
                    } found`}
              </h2>
            </div>
          </div>

          {/* Assets */}
          {assets.length > 0 ? (
            <section className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {assets.map((asset) => (
                <Link
                  key={asset.id}
                  href={`/opportunities/${asset.id}`}
                  className="group block"
                >
                  <article className="flex h-full flex-col rounded-[28px] border border-white/[0.08] bg-[#141419] p-6 transition duration-300 hover:-translate-y-1 hover:border-violet-500/35 hover:bg-[#17171d]">
                    {/* Top */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="inline-flex rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
                          {asset.aiMatchScore ?? 0}% match
                        </span>
                      </div>

                      <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1 text-xs text-zinc-500">
                        {asset.industry}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="mt-5 text-xl font-semibold leading-tight tracking-[-0.03em] transition group-hover:text-violet-300">
                      {asset.title}
                    </h3>

                    {/* Location */}
                    <div className="mt-3 flex items-center gap-2 text-sm text-zinc-500">
                      <MapPin size={15} />
                      {asset.location}
                    </div>

                    {/* Description */}
                    <p className="mt-5 line-clamp-3 text-sm leading-6 text-zinc-400">
                      {asset.description}
                    </p>

                    {/* Financials */}
                    <div className="my-6 h-px bg-white/[0.07]" />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-600">
                          Asking price
                        </p>

                        <p className="mt-2 text-xl font-semibold">
                          {formatCurrency(asset.askingPrice)}
                        </p>
                      </div>

                      <div className="border-l border-white/[0.08] pl-5">
                        <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-600">
                          EBITDA
                        </p>

                        <p className="mt-2 text-xl font-semibold text-emerald-400">
                          {formatCurrency(asset.ebitda)}
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto pt-7">
                      <div className="flex items-center justify-between border-t border-white/[0.07] pt-5">
                        <div className="text-xs text-zinc-600">
                          {asset.foundedYear
                            ? `Founded ${asset.foundedYear}`
                            : 'M&A opportunity'}
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-400 transition group-hover:border-violet-500/30 group-hover:bg-violet-600 group-hover:text-white">
                          <ArrowUpRight size={17} />
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </section>
          ) : (
            /* Empty state */
            <section className="mt-5 rounded-[30px] border border-dashed border-white/10 bg-[#121217] px-6 py-20 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                <Search size={21} />
              </div>

              <h2 className="mt-5 text-xl font-semibold">
                No opportunities found
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
                We couldn&apos;t find any opportunities matching your current
                search criteria. Try changing the industry, location or price
                range.
              </p>

              <Link
                href="/opportunities"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                Clear all filters
              </Link>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
