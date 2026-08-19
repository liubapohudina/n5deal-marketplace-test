import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  ArrowLeft,
  BriefcaseBusiness,
  Mail,
  MapPin,
  ShieldCheck,
  Target,
  UserRound,
} from 'lucide-react';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/currentUser';
import { UserModerationButton } from '@/components/manager/UserModerationButton';

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

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

export default async function ManagerUserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const manager = await requireRole('MANAGER');
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: {
      id,
    },

    include: {
      buyerProfile: true,

      assets: {
        orderBy: {
          createdAt: 'desc',
        },
      },

      moderatedUser: {
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },

        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });
  if (!user) {
    notFound();
  }

  const buyerProfile = user.buyerProfile;

  return (
    <main className="min-h-screen bg-[#09090c] text-white">
      <div className="mx-auto max-w-[1400px] px-6 py-10 lg:px-10">
        <Link
          href="/manager/users"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to users
        </Link>

        {/* Header */}
        <section className="mt-7 rounded-[32px] border border-white/[0.08] bg-[linear-gradient(135deg,#141419_0%,#181625_60%,#21183a_100%)] p-8 lg:p-10">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-start">
            <div className="flex items-start gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-violet-600 text-xl font-semibold text-white">
                {user.name
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0]?.toUpperCase())
                  .join('')}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <RoleBadge role={user.role} />
                  <StatusBadge status={user.status} />
                </div>

                <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] lg:text-5xl">
                  {user.company ?? user.name}
                </h1>

                {user.company && (
                  <p className="mt-2 text-lg text-zinc-400">{user.name}</p>
                )}

                <div className="mt-5 flex flex-wrap gap-4 text-sm text-zinc-500">
                  <div className="flex items-center gap-2">
                    <Mail size={15} />
                    {user.email}
                  </div>

                  {user.location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={15} />
                      {user.location}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {user.role !== 'MANAGER' && (
              <UserModerationButton
                userId={user.id}
                status={user.status}
                disabled={user.id === manager.id}
              />
            )}
          </div>
        </section>

        {/* Main layout */}
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_0.85fr]">
          <div className="space-y-6">
            {/* Buyer profile */}
            {/* Buyer profile */}
            {user.role === 'BUYER' && (
              <section className="rounded-[28px] border border-white/[0.08] bg-[#141419] p-7 lg:p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                    <Target size={20} />
                  </div>

                  <div>
                    <p className="text-sm text-violet-400">Buyer profile</p>

                    <h2 className="mt-1 text-2xl font-semibold">
                      Investment criteria
                    </h2>
                  </div>
                </div>

                {buyerProfile ? (
                  <div className="mt-7 space-y-6">
                    <div>
                      <p className="text-xs uppercase tracking-[0.12em] text-zinc-600">
                        Investment thesis
                      </p>

                      <p className="mt-2 text-sm leading-7 text-zinc-400">
                        {buyerProfile.investmentThesis ?? 'Not specified'}
                      </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <ProfileList
                        label="Industries"
                        values={buyerProfile.industries}
                      />

                      <ProfileList
                        label="Geographies"
                        values={buyerProfile.geographies}
                      />

                      <ProfileList
                        label="Investment types"
                        values={buyerProfile.investmentTypes}
                      />

                      <ProfileList
                        label="Preferred deal types"
                        values={buyerProfile.preferredDealTypes}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <MetricCard
                        label="Minimum deal size"
                        value={formatCurrency(buyerProfile.minDealSize)}
                      />

                      <MetricCard
                        label="Maximum deal size"
                        value={formatCurrency(buyerProfile.maxDealSize)}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="mt-6 text-sm text-zinc-500">
                    Buyer has not completed an investment profile yet.
                  </p>
                )}
              </section>
            )}

            {/* Seller assets */}
            {user.role === 'SELLER' && (
              <section className="rounded-[28px] border border-white/[0.08] bg-[#141419] p-7 lg:p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                    <BriefcaseBusiness size={20} />
                  </div>

                  <div>
                    <p className="text-sm text-emerald-400">Seller portfolio</p>

                    <h2 className="mt-1 text-2xl font-semibold">Assets</h2>
                  </div>
                </div>

                {user.assets.length > 0 ? (
                  <div className="mt-7 space-y-3">
                    {user.assets.map((asset) => (
                      <Link
                        key={asset.id}
                        href={`/manager/assets/${asset.id}`}
                        className="block rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition hover:border-violet-500/25 hover:bg-white/[0.04]"
                      >
                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <AssetStatusBadge status={asset.status} />

                              <span className="text-xs text-zinc-600">
                                {asset.industry}
                              </span>
                            </div>

                            <h3 className="mt-3 font-semibold">
                              {asset.title}
                            </h3>

                            <p className="mt-1 text-sm text-zinc-500">
                              {asset.location}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-xs uppercase tracking-wider text-zinc-600">
                              Asking price
                            </p>

                            <p className="mt-1 font-semibold">
                              {formatCurrency(asset.askingPrice)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="mt-6 text-sm text-zinc-500">
                    Seller has no assets.
                  </p>
                )}
              </section>
            )}
          </div>

          {/* Right side */}
          <aside className="space-y-6">
            {/* Account info */}
            <section className="rounded-[28px] border border-white/[0.08] bg-[#141419] p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                <UserRound size={19} />
              </div>

              <p className="mt-6 text-sm text-zinc-500">Account</p>

              <h2 className="mt-1 text-xl font-semibold">User details</h2>

              <div className="mt-6 space-y-4">
                <InfoRow label="Name" value={user.name} />

                <InfoRow label="Email" value={user.email} />

                <InfoRow
                  label="Company"
                  value={user.company ?? 'Not specified'}
                />

                <InfoRow
                  label="Location"
                  value={user.location ?? 'Not specified'}
                />

                <InfoRow label="Role" value={user.role} />

                <InfoRow label="Created" value={formatDate(user.createdAt)} />
              </div>
            </section>

            {/* Moderation */}
            <section className="rounded-[28px] border border-white/[0.08] bg-[#141419] p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
                <ShieldCheck size={19} />
              </div>

              <p className="mt-6 text-sm text-zinc-500">Moderation</p>

              <h2 className="mt-1 text-xl font-semibold">Action history</h2>

              {user.moderatedUser.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {user.moderatedUser.map((action) => (
                    <div
                      key={action.id}
                      className="border-b border-white/[0.07] pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <ModerationBadge action={action.action} />

                        <span className="text-xs text-zinc-600">
                          {formatDate(action.createdAt)}
                        </span>
                      </div>

                      {action.reason && (
                        <p className="mt-3 text-sm leading-6 text-zinc-500">
                          {action.reason}
                        </p>
                      )}

                      <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2">
                        <p className="text-xs text-zinc-600">Performed by</p>

                        <p className="mt-1 text-sm text-zinc-400">
                          {action.manager.name}
                        </p>

                        <p className="mt-0.5 text-xs text-zinc-600">
                          {action.manager.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] p-5">
                  <p className="text-sm text-zinc-500">
                    No moderation actions recorded.
                  </p>
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
function ModerationBadge({ action }: { action: 'SUSPEND' | 'UNSUSPEND' }) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-medium ${
        action === 'SUSPEND'
          ? 'border-red-500/20 bg-red-500/10 text-red-300'
          : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
      }`}
    >
      {action}
    </span>
  );
}
function RoleBadge({ role }: { role: 'BUYER' | 'SELLER' | 'MANAGER' }) {
  const styles = {
    BUYER: 'border-violet-500/20 bg-violet-500/10 text-violet-300',

    SELLER: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',

    MANAGER: 'border-orange-500/20 bg-orange-500/10 text-orange-300',
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-medium ${styles[role]}`}
    >
      {role}
    </span>
  );
}

function StatusBadge({ status }: { status: 'ACTIVE' | 'SUSPENDED' }) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-medium ${
        status === 'ACTIVE'
          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
          : 'border-red-500/20 bg-red-500/10 text-red-300'
      }`}
    >
      {status}
    </span>
  );
}

function AssetStatusBadge({
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
      className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function ProfileList({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.12em] text-zinc-600">
        {label}
      </p>

      {values.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {values.map((value) => (
            <span
              key={value}
              className="rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-xs text-zinc-300"
            >
              {value}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-zinc-500">Not specified</p>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
      <p className="text-xs uppercase tracking-wider text-zinc-600">{label}</p>

      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-white/[0.07] pb-4 last:border-0 last:pb-0">
      <p className="text-xs text-zinc-600">{label}</p>

      <p className="mt-1 break-words text-sm text-zinc-300">{value}</p>
    </div>
  );
}
