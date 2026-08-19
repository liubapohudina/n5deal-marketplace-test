import Link from 'next/link';

import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  MapPin,
  Search,
  SlidersHorizontal,
  Target,
  Users,
} from 'lucide-react';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/currentUser';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Topbar } from '@/components/dashboard/Topbar';

type SearchParams = {
  search?: string;
  industry?: string;
  geography?: string;
};

export default async function BuyersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const currentUser = await getCurrentUser();
  const params = await searchParams;

  const search = params.search?.trim() ?? '';
  const industry = params.industry?.trim() ?? '';
  const geography = params.geography?.trim() ?? '';

  const buyers = await prisma.user.findMany({
    where: {
      role: 'BUYER',
      status: 'ACTIVE',

      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                company: {
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
                bio: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                buyerProfile: {
                  investmentThesis: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
            ],
          }
        : {}),

      ...(industry
        ? {
            buyerProfile: {
              industries: {
                has: industry,
              },
            },
          }
        : {}),

      ...(geography
        ? {
            buyerProfile: {
              geographies: {
                has: geography,
              },
            },
          }
        : {}),
    },

    include: {
      buyerProfile: true,
    },

    orderBy: {
      createdAt: 'desc',
    },
  });

  const allProfiles = await prisma.buyerProfile.findMany({
    select: {
      industries: true,
      geographies: true,
    },
  });

  const industries = Array.from(
    new Set(allProfiles.flatMap((profile) => profile.industries)),
  ).sort();

  const geographies = Array.from(
    new Set(allProfiles.flatMap((profile) => profile.geographies)),
  ).sort();

  const filtersActive =
    Boolean(search) || Boolean(industry) || Boolean(geography);

  const backHref =
    currentUser?.role === 'SELLER'
      ? '/seller'
      : currentUser?.role === 'BUYER'
        ? '/buyer'
        : '/';

  return (
    <main className="min-h-screen bg-[#09090c] text-white">
      <Sidebar role={currentUser?.role ?? null} />

      <div className="ml-[84px] min-h-screen">
        <Topbar />

        <div className="mx-auto max-w-[1500px] px-6 py-8 lg:px-10">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>

          {/* Header */}
          <section className="mt-7 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-medium text-violet-400">
                N5Deal Marketplace
              </p>

              <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] lg:text-5xl">
                Buyers
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                Discover active investors and acquirers looking for businesses
                and financial assets.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-400">
              <Users size={15} />
              <span className="font-semibold text-white">{buyers.length}</span>
              active buyers
            </div>
          </section>

          {/* Filters */}
          <section className="mt-8 rounded-[28px] border border-white/[0.08] bg-[#121217] p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-zinc-400">
              <SlidersHorizontal size={16} />
              Search & filters
            </div>

            <form
              action="/buyers"
              method="GET"
              className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_auto]"
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
                  placeholder="Search company, buyer, thesis..."
                  className="h-12 w-full rounded-2xl border border-white/10 bg-[#19191f] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500/60"
                />
              </div>

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

              <select
                name="geography"
                defaultValue={geography}
                className="h-12 rounded-2xl border border-white/10 bg-[#19191f] px-4 text-sm text-zinc-300 outline-none focus:border-violet-500/60"
              >
                <option value="">All geographies</option>

                {geographies.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 text-sm font-semibold text-white transition hover:bg-violet-500"
              >
                <Search size={16} />
                Apply
              </button>
            </form>

            {filtersActive && (
              <div className="mt-4 border-t border-white/[0.07] pt-4">
                <Link
                  href="/buyers"
                  className="text-sm text-zinc-500 transition hover:text-white"
                >
                  Clear filters
                </Link>
              </div>
            )}
          </section>

          {/* Results */}
          <div className="mt-7">
            <p className="text-sm text-zinc-500">Marketplace participants</p>

            <h2 className="mt-1 text-xl font-semibold">
              {buyers.length === 0
                ? 'No buyers found'
                : `${buyers.length} ${
                    buyers.length === 1 ? 'buyer' : 'buyers'
                  } found`}
            </h2>
          </div>

          {buyers.length > 0 ? (
            <section className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {buyers.map((buyer) => {
                const profile = buyer.buyerProfile;

                return (
                  <Link
                    key={buyer.id}
                    href={`/buyers/${buyer.id}`}
                    className="group block"
                  >
                    <article className="flex h-full flex-col rounded-[28px] border border-white/[0.08] bg-[#141419] p-6 transition duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:bg-[#17171d]">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">
                          <Building2 size={21} />
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-500 transition group-hover:bg-violet-600 group-hover:text-white">
                          <ArrowUpRight size={17} />
                        </div>
                      </div>

                      {/* Buyer */}
                      <h3 className="mt-6 text-xl font-semibold tracking-[-0.03em] transition group-hover:text-violet-300">
                        {buyer.company ?? buyer.name}
                      </h3>

                      {buyer.company && (
                        <p className="mt-1 text-sm text-zinc-500">
                          {buyer.name}
                        </p>
                      )}

                      {buyer.location && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
                          <MapPin size={15} />
                          {buyer.location}
                        </div>
                      )}

                      {/* Thesis */}
                      <div className="mt-5">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-zinc-600">
                          <Target size={14} />
                          Acquisition focus
                        </div>

                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-400">
                          {profile?.investmentThesis ??
                            buyer.bio ??
                            'Investment criteria have not been specified yet.'}
                        </p>
                      </div>

                      {/* Industries */}
                      <div className="mt-5 flex flex-wrap gap-2">
                        {profile?.industries.slice(0, 3).map((item) => (
                          <span
                            key={item}
                            className="rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-xs text-zinc-400"
                          >
                            {item}
                          </span>
                        ))}

                        {profile && profile.industries.length > 3 && (
                          <span className="rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-xs text-zinc-500">
                            +{profile.industries.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Deal size */}
                      <div className="mt-auto pt-6">
                        <div className="border-t border-white/[0.07] pt-5">
                          <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-600">
                            Target deal size
                          </p>

                          <p className="mt-2 text-sm font-semibold">
                            {profile?.minDealSize
                              ? formatCurrency(profile.minDealSize)
                              : 'Any'}
                            {' — '}
                            {profile?.maxDealSize
                              ? formatCurrency(profile.maxDealSize)
                              : 'Any'}
                          </p>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </section>
          ) : (
            <section className="mt-5 rounded-[30px] border border-dashed border-white/10 bg-[#121217] px-6 py-20 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                <Users size={21} />
              </div>

              <h2 className="mt-5 text-xl font-semibold">
                No buyers match your filters
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
                Try changing the industry, geography or search term.
              </p>

              <Link
                href="/buyers"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                Clear filters
              </Link>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

function formatCurrency(value: unknown) {
  if (value === null || value === undefined) {
    return 'Any';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value));
}
