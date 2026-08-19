import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ContactBuyerForm } from '@/components/buyers/ContactBuyerForm';

import {
  ArrowLeft,
  Building2,
  Euro,
  Globe2,
  MapPin,
  MessageSquare,
  Target,
  TrendingUp,
  UserRound,
} from 'lucide-react';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/currentUser';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Topbar } from '@/components/dashboard/Topbar';

function formatCurrency(value: unknown) {
  if (value === null || value === undefined) {
    return 'Not specified';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value));
}

export default async function BuyerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const currentUser = await getCurrentUser();
  const sellerAssets =
    currentUser?.role === 'SELLER'
      ? await prisma.asset.findMany({
          where: {
            sellerId: currentUser.id,
            status: 'PUBLISHED',
          },
          select: {
            id: true,
            title: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        })
      : [];

  const buyer = await prisma.user.findFirst({
    where: {
      id,
      role: 'BUYER',
      status: 'ACTIVE',
    },

    include: {
      buyerProfile: true,
    },
  });

  if (!buyer) {
    notFound();
  }

  const profile = buyer.buyerProfile;

  const backHref =
    currentUser?.role === 'SELLER'
      ? '/seller/inquiries'
      : currentUser?.role === 'BUYER'
        ? '/buyer'
        : '/buyers';

  const backLabel =
    currentUser?.role === 'SELLER' ? 'Back to inquiries' : 'Back to buyers';

  return (
    <main className="min-h-screen bg-[#09090c] text-white">
      <Sidebar />

      <div className="ml-[84px] min-h-screen">
        <Topbar />

        <div className="mx-auto max-w-[1400px] px-6 py-8 lg:px-10">
          {/* Back */}
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            {backLabel}
          </Link>

          {/* Header */}
          <section className="mt-7 overflow-hidden rounded-[32px] border border-white/[0.08] bg-[linear-gradient(135deg,#141419_0%,#181625_60%,#21183a_100%)] p-8 lg:p-10">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-start">
              <div className="flex items-start gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-violet-600 text-xl font-semibold text-white shadow-[0_12px_35px_rgba(124,58,237,0.3)]">
                  {buyer.company?.[0]?.toUpperCase() ??
                    buyer.name[0]?.toUpperCase()}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
                      Active Buyer
                    </span>

                    {profile && (
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                        Investment profile complete
                      </span>
                    )}
                  </div>

                  <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] lg:text-5xl">
                    {buyer.company ?? buyer.name}
                  </h1>

                  {buyer.company && (
                    <p className="mt-2 text-lg text-zinc-400">{buyer.name}</p>
                  )}

                  {buyer.location && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
                      <MapPin size={16} />
                      {buyer.location}
                    </div>
                  )}
                </div>
              </div>

              {/* Seller CTA */}
              {currentUser?.role === 'SELLER' && (
                <Link
                  href={`/buyers/${buyer.id}#contact`}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 text-sm font-semibold text-white transition hover:bg-violet-500"
                >
                  <MessageSquare size={17} />
                  Contact buyer
                </Link>
              )}
            </div>

            {buyer.bio && (
              <p className="mt-8 max-w-3xl text-sm leading-7 text-zinc-400">
                {buyer.bio}
              </p>
            )}
          </section>

          {/* Main */}
          <div className="mt-6 grid gap-6 xl:grid-cols-[1.65fr_0.85fr]">
            <div className="space-y-6">
              {/* Investment thesis */}
              <section className="rounded-[28px] border border-white/[0.08] bg-[#141419] p-7 lg:p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                    <Target size={20} />
                  </div>

                  <div>
                    <p className="text-sm text-violet-400">
                      Acquisition strategy
                    </p>

                    <h2 className="mt-1 text-2xl font-semibold">
                      Investment thesis
                    </h2>
                  </div>
                </div>

                {profile?.investmentThesis ? (
                  <p className="mt-6 text-sm leading-7 text-zinc-400">
                    {profile.investmentThesis}
                  </p>
                ) : (
                  <p className="mt-6 text-sm text-zinc-500">
                    No investment thesis has been provided yet.
                  </p>
                )}
              </section>

              {/* Industries + Geographies */}
              <section className="grid gap-6 md:grid-cols-2">
                <ProfileCard
                  icon={<Building2 size={20} />}
                  title="Target industries"
                  subtitle="Preferred sectors"
                  values={profile?.industries ?? []}
                  variant="violet"
                />

                <ProfileCard
                  icon={<Globe2 size={20} />}
                  title="Geographies"
                  subtitle="Target markets"
                  values={profile?.geographies ?? []}
                  variant="emerald"
                />
              </section>

              {/* Investment types */}
              <section className="grid gap-6 md:grid-cols-2">
                <ProfileCard
                  icon={<TrendingUp size={20} />}
                  title="Investment types"
                  subtitle="Preferred transaction strategy"
                  values={profile?.investmentTypes ?? []}
                  variant="orange"
                />

                <ProfileCard
                  icon={<Target size={20} />}
                  title="Deal types"
                  subtitle="Preferred deal structure"
                  values={profile?.preferredDealTypes ?? []}
                  variant="blue"
                />
              </section>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Investment range */}
              <section className="rounded-[28px] border border-white/[0.08] bg-[#141419] p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                  <Euro size={20} />
                </div>

                <p className="mt-6 text-sm text-zinc-500">Investment range</p>

                <h2 className="mt-1 text-xl font-semibold">Deal size</h2>

                <div className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
                  <p className="text-xs uppercase tracking-[0.12em] text-zinc-600">
                    Minimum
                  </p>

                  <p className="mt-2 text-2xl font-semibold">
                    {formatCurrency(profile?.minDealSize)}
                  </p>
                </div>

                <div className="mt-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
                  <p className="text-xs uppercase tracking-[0.12em] text-zinc-600">
                    Maximum
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-emerald-400">
                    {formatCurrency(profile?.maxDealSize)}
                  </p>
                </div>
              </section>

              {/* Buyer info */}
              <section className="rounded-[28px] border border-white/[0.08] bg-[#141419] p-7">
                <p className="text-sm text-zinc-500">Buyer information</p>

                <div className="mt-5 space-y-4">
                  <InfoRow
                    icon={<UserRound size={16} />}
                    label="Contact"
                    value={buyer.name}
                  />

                  <InfoRow
                    icon={<Building2 size={16} />}
                    label="Company"
                    value={buyer.company ?? 'Not specified'}
                  />

                  <InfoRow
                    icon={<MapPin size={16} />}
                    label="Location"
                    value={buyer.location ?? 'Not specified'}
                  />
                </div>
              </section>

              {/* Contact */}
              {currentUser?.role === 'SELLER' && (
                <section
                  id="contact"
                  className="rounded-[28px] border border-violet-500/20 bg-[linear-gradient(180deg,rgba(124,58,237,0.12),rgba(20,20,25,1))] p-7"
                >
                  <p className="text-sm font-medium text-violet-300">
                    Potential buyer
                  </p>

                  <h2 className="mt-2 text-xl font-semibold">
                    Interested in this buyer?
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    Start a conversation about one of your available
                    opportunities.
                  </p>

                  {sellerAssets.length > 0 ? (
                    <ContactBuyerForm
                      buyerId={buyer.id}
                      buyerName={buyer.name}
                      assets={sellerAssets}
                    />
                  ) : (
                    <div className="mt-6 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4">
                      <p className="text-sm font-medium text-orange-300">
                        No published assets
                      </p>

                      <p className="mt-2 text-sm leading-6 text-zinc-400">
                        You need at least one published asset before contacting
                        this buyer.
                      </p>

                      <Link
                        href="/seller/assets/new"
                        className="mt-4 inline-flex text-sm font-medium text-violet-400 transition hover:text-violet-300"
                      >
                        Publish new asset →
                      </Link>
                    </div>
                  )}
                </section>
              )}
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}

function ProfileCard({
  icon,
  title,
  subtitle,
  values,
  variant,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  values: string[];
  variant: 'violet' | 'emerald' | 'orange' | 'blue';
}) {
  const styles = {
    violet: 'bg-violet-500/10 text-violet-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    orange: 'bg-orange-500/10 text-orange-400',
    blue: 'bg-blue-500/10 text-blue-400',
  };

  return (
    <div className="rounded-[28px] border border-white/[0.08] bg-[#141419] p-7">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${styles[variant]}`}
      >
        {icon}
      </div>

      <p className="mt-5 text-xs text-zinc-600">{subtitle}</p>

      <h3 className="mt-1 text-lg font-semibold">{title}</h3>

      {values.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {values.map((value) => (
            <span
              key={value}
              className="rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-xs text-zinc-300"
            >
              {value}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm text-zinc-500">Not specified</p>
      )}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-white/[0.07] pb-4 last:border-0 last:pb-0">
      <div className="mt-0.5 text-zinc-600">{icon}</div>

      <div>
        <p className="text-xs text-zinc-600">{label}</p>

        <p className="mt-1 text-sm text-zinc-300">{value}</p>
      </div>
    </div>
  );
}
