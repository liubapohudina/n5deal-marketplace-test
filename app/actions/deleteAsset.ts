'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function deleteAsset(assetId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const seller = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!seller || seller.status !== 'ACTIVE') {
    throw new Error('Unauthorized');
  }

  if (seller.role !== 'SELLER') {
    throw new Error('Only sellers can delete assets.');
  }

  // Дуже важливо:
  // перевіряємо, що asset належить саме цьому seller.
  const asset = await prisma.asset.findFirst({
    where: {
      id: assetId,
      sellerId: seller.id,
    },
  });

  if (!asset) {
    throw new Error('Asset not found.');
  }

  // Якщо ContactRequest пов'язаний з Asset і в schema
  // немає onDelete: Cascade, спочатку видаляємо inquiries.
  await prisma.$transaction([
    prisma.contactRequest.deleteMany({
      where: {
        assetId: asset.id,
      },
    }),

    prisma.asset.delete({
      where: {
        id: asset.id,
      },
    }),
  ]);

  revalidatePath('/seller');
  revalidatePath('/seller/assets');
  revalidatePath('/opportunities');

  redirect('/seller/assets');
}
