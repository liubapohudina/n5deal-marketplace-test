import Link from 'next/link';
import { ArrowLeft, Target } from 'lucide-react';

import { requireRole } from '@/lib/currentUser';
import { prisma } from '@/lib/prisma';
import { BuyerProfileForm } from '@/components/buyer/BuyerProfileForm';

export default async function BuyerProfilePage() {
  const buyer = await requireRole('BUYER');

  const profile = await prisma.buyerProfile.findUnique({
    where: {
      userId: buyer.id,
    },
  });

  return (
    <main className="min-h-screen bg-[#09090c] text-white">
      <div className="mx-auto max-w-[950px] px-6 py-10 lg:px-10">
        <Link
          href="/buyer"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Buyer Dashboard
        </Link>

        <div className="mt-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
            <Target size={21} />
          </div>

          <p className="mt-6 text-sm font-medium text-violet-400">
            Buyer workspace
          </p>

          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
            Investment Profile
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
            Define what you are looking to acquire. These criteria can be used
            to match you with relevant opportunities.
          </p>
        </div>

        <div className="mt-8">
          <BuyerProfileForm
            profile={{
              thesis: profile?.investmentThesis ?? '',
              industries: profile?.industries ?? [],
              regions: profile?.geographies ?? [],
              minInvestment: profile?.minDealSize
                ? Number(profile.minDealSize)
                : null,
              maxInvestment: profile?.maxDealSize
                ? Number(profile.maxDealSize)
                : null,
            }}
          />
        </div>
      </div>
    </main>
  );
}
