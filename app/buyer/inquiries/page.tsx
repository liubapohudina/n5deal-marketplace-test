import Link from 'next/link';

import {
  ArrowLeft,
  Building2,
  Check,
  Clock3,
  MapPin,
  MessageSquare,
  Send,
  X,
} from 'lucide-react';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/currentUser';
import { BuyerInquiryActions } from '@/components/buyer/BuyerInquiryActions';

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

type Props = {
  searchParams: Promise<{
    tab?: string;
  }>;
};

export default async function BuyerInquiriesPage({ searchParams }: Props) {
  const buyer = await requireRole('BUYER');

  const { tab } = await searchParams;

  const activeTab = tab === 'sent' ? 'sent' : 'received';

  const inquiries = await prisma.contactRequest.findMany({
    where:
      activeTab === 'sent'
        ? {
            senderId: buyer.id,
          }
        : {
            recipientId: buyer.id,
          },

    include: {
      sender: true,
      recipient: true,
      asset: true,
    },

    orderBy: {
      createdAt: 'desc',
    },
  });

  const pendingCount = inquiries.filter(
    (item) => item.status === 'PENDING',
  ).length;

  const acceptedCount = inquiries.filter(
    (item) => item.status === 'ACCEPTED',
  ).length;

  const declinedCount = inquiries.filter(
    (item) => item.status === 'DECLINED',
  ).length;

  return (
    <main className="min-h-screen bg-[#0b0b0f] text-white">
      <div className="mx-auto max-w-[1400px] px-6 py-10 lg:px-10">
        <Link
          href="/buyer"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Buyer Dashboard
        </Link>

        <div className="mt-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium text-violet-400">
              Buyer workspace
            </p>

            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
              Inquiries
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
              Track conversations with sellers and manage incoming
              opportunities.
            </p>
          </div>

          <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-400">
            {inquiries.length} total inquiries
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-7 inline-flex rounded-2xl border border-white/[0.08] bg-[#121217] p-1">
          <Link
            href="/buyer/inquiries?tab=received"
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition ${
              activeTab === 'received'
                ? 'bg-violet-600 text-white'
                : 'text-zinc-500 hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            <MessageSquare size={15} />
            Received
          </Link>

          <Link
            href="/buyer/inquiries?tab=sent"
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition ${
              activeTab === 'sent'
                ? 'bg-violet-600 text-white'
                : 'text-zinc-500 hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            <Send size={15} />
            Sent
          </Link>
        </div>

        {/* Stats */}
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <StatCard
            label="Pending"
            value={pendingCount}
            icon={<Clock3 size={19} />}
            className="bg-orange-500/10 text-orange-300"
          />

          <StatCard
            label="Accepted"
            value={acceptedCount}
            icon={<Check size={19} />}
            className="bg-emerald-500/10 text-emerald-300"
          />

          <StatCard
            label="Declined"
            value={declinedCount}
            icon={<X size={19} />}
            className="bg-red-500/10 text-red-300"
          />
        </section>

        {/* List */}
        <section className="mt-8">
          {inquiries.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-white/10 bg-[#121217] px-6 py-20 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                {activeTab === 'sent' ? (
                  <Send size={21} />
                ) : (
                  <MessageSquare size={21} />
                )}
              </div>

              <h2 className="mt-5 text-xl font-semibold">
                {activeTab === 'sent'
                  ? 'No sent inquiries yet'
                  : 'No received inquiries yet'}
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
                {activeTab === 'sent'
                  ? 'Messages you send to sellers will appear here.'
                  : 'Seller messages and acquisition opportunities will appear here.'}
              </p>

              {activeTab === 'sent' && (
                <Link
                  href="/opportunities"
                  className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-violet-600 px-5 text-sm font-semibold transition hover:bg-violet-500"
                >
                  Browse opportunities
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {inquiries.map((inquiry) => {
                const person =
                  activeTab === 'sent' ? inquiry.recipient : inquiry.sender;

                return (
                  <article
                    key={inquiry.id}
                    className="rounded-[28px] border border-white/[0.08] bg-[#141419] p-6"
                  >
                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <StatusBadge status={inquiry.status} />

                          <span className="text-xs text-zinc-600">
                            {formatDate(inquiry.createdAt)}
                          </span>

                          <span className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                            {activeTab === 'sent' ? 'Sent' : 'Received'}
                          </span>
                        </div>

                        <div className="mt-5 flex items-center gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">
                            <Building2 size={19} />
                          </div>

                          <div>
                            <Link
                              href={`/sellers/${person.id}`}
                              className="font-semibold transition hover:text-violet-300"
                            >
                              {person.company ?? person.name}
                            </Link>

                            <p className="mt-1 text-sm text-zinc-500">
                              {person.name}
                            </p>
                          </div>
                        </div>

                        {person.location && (
                          <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
                            <MapPin size={15} />
                            {person.location}
                          </div>
                        )}

                        <div className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                          <p className="text-sm leading-6 text-zinc-300">
                            {inquiry.message}
                          </p>
                        </div>
                      </div>

                      <div className="w-full shrink-0 lg:w-[320px]">
                        <div className="rounded-2xl border border-white/[0.08] bg-[#101014] p-4">
                          <p className="text-xs uppercase tracking-[0.12em] text-zinc-600">
                            Opportunity
                          </p>

                          {inquiry.asset ? (
                            <Link
                              href={`/opportunities/${inquiry.asset.id}`}
                              className="mt-2 block font-medium transition hover:text-violet-300"
                            >
                              {inquiry.asset.title}
                            </Link>
                          ) : (
                            <p className="mt-2 text-sm text-zinc-500">
                              Asset unavailable
                            </p>
                          )}
                        </div>

                        {/* Buyer can act only on received messages */}
                        {activeTab === 'received' ? (
                          <div className="mt-4">
                            <BuyerInquiryActions
                              inquiryId={inquiry.id}
                              status={inquiry.status}
                            />
                          </div>
                        ) : (
                          <div className="mt-4 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-center text-sm text-zinc-500">
                            {inquiry.status === 'PENDING'
                              ? 'Waiting for seller response'
                              : inquiry.status === 'ACCEPTED'
                                ? 'Seller accepted your inquiry'
                                : 'Seller declined your inquiry'}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  className: string;
}) {
  return (
    <div className="rounded-[26px] border border-white/[0.08] bg-[#141419] p-6">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${className}`}
      >
        {icon}
      </div>

      <p className="mt-5 text-sm text-zinc-500">{label}</p>

      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
}) {
  const styles = {
    PENDING: 'border-orange-500/20 bg-orange-500/10 text-orange-300',

    ACCEPTED: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',

    DECLINED: 'border-red-500/20 bg-red-500/10 text-red-300',
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}
