import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { requireRole } from '@/lib/currentUser';
import { PublishAssetForm } from '@/components/seller/PublishAssetForm';

export default async function NewAssetPage() {
  await requireRole('SELLER');

  return (
    <main className="min-h-screen bg-[#0b0b0f] text-white">
      <div className="mx-auto max-w-[1100px] px-6 py-10 lg:px-10">
        <Link
          href="/seller/assets"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to My Assets
        </Link>

        <div className="mt-7">
          <p className="text-sm font-medium text-violet-400">
            Seller workspace
          </p>

          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
            Publish New Asset
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
            Create a marketplace listing for a business or financial asset.
          </p>
        </div>

        <div className="mt-8">
          <PublishAssetForm />
        </div>
      </div>
    </main>
  );
}
