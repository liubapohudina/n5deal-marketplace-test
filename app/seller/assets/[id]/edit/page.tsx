import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/currentUser';
import { EditAssetForm } from '@/components/seller/EditAssetForm';

export default async function EditSellerAssetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const seller = await requireRole('SELLER');
  const { id } = await params;

  const asset = await prisma.asset.findFirst({
    where: {
      id,
      sellerId: seller.id,
    },
  });

  if (!asset) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#0b0b0f] text-white">
      <div className="mx-auto max-w-[1100px] px-6 py-10 lg:px-10">
        <Link
          href={`/seller/assets/${asset.id}`}
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to asset
        </Link>

        <div className="mt-7">
          <p className="text-sm font-medium text-violet-400">
            Seller workspace
          </p>

          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
            Edit Asset
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            Update listing details, financial metrics and publication status.
          </p>
        </div>

        <div className="mt-8">
          <EditAssetForm
            asset={{
              id: asset.id,
              title: asset.title,
              description: asset.description,
              industry: asset.industry,
              location: asset.location,
              assetType: asset.assetType,
              askingPrice: asset.askingPrice ? Number(asset.askingPrice) : null,
              revenue: asset.revenue ? Number(asset.revenue) : null,
              ebitda: asset.ebitda ? Number(asset.ebitda) : null,
              employees: asset.employees,
              foundedYear: asset.foundedYear,
              status: asset.status,
            }}
          />
        </div>
      </div>
    </main>
  );
}
