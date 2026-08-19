'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/currentUser';

export async function toggleAssetSuspension(assetId: string) {
  await requireRole('MANAGER');

  const asset = await prisma.asset.findUnique({
    where: {
      id: assetId,
    },

    select: {
      id: true,
      status: true,
      sellerId: true,
      publishedAt: true,
    },
  });

  if (!asset) {
    throw new Error('Asset not found.');
  }

  const nextStatus =
    asset.status === 'SUSPENDED'
      ? asset.publishedAt
        ? 'PUBLISHED'
        : 'DRAFT'
      : 'SUSPENDED';

  await prisma.asset.update({
    where: {
      id: asset.id,
    },

    data: {
      status: nextStatus,
    },
  });

  revalidatePath('/');
  revalidatePath('/opportunities');

  revalidatePath('/manager');
  revalidatePath('/manager/assets');
  revalidatePath(`/manager/assets/${asset.id}`);

  revalidatePath('/seller');
  revalidatePath('/seller/assets');

  return {
    success: true,
    status: nextStatus,
  } as const;
}
