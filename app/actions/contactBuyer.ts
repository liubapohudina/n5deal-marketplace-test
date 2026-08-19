'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export type ContactBuyerState = {
  success: boolean;
  message: string;
  errors?: {
    assetId?: string[];
    message?: string[];
  };
};

const schema = z.object({
  buyerId: z.string().min(1),
  assetId: z.string().min(1, 'Select one of your assets.'),
  message: z
    .string()
    .trim()
    .min(10, 'Message must contain at least 10 characters.')
    .max(1500, 'Message is too long.'),
});

export async function contactBuyer(
  _previousState: ContactBuyerState,
  formData: FormData,
): Promise<ContactBuyerState> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return {
      success: false,
      message: 'Please sign in first.',
    };
  }

  const seller = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!seller || seller.role !== 'SELLER' || seller.status !== 'ACTIVE') {
    return {
      success: false,
      message: 'Only active sellers can contact buyers.',
    };
  }

  const parsed = schema.safeParse({
    buyerId: formData.get('buyerId'),
    assetId: formData.get('assetId'),
    message: formData.get('message'),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: 'Please check the form.',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { buyerId, assetId, message } = parsed.data;

  const buyer = await prisma.user.findFirst({
    where: {
      id: buyerId,
      role: 'BUYER',
      status: 'ACTIVE',
    },
  });

  if (!buyer) {
    return {
      success: false,
      message: 'Buyer not found.',
    };
  }

  const asset = await prisma.asset.findFirst({
    where: {
      id: assetId,
      sellerId: seller.id,
      status: 'PUBLISHED',
    },
  });

  if (!asset) {
    return {
      success: false,
      message: 'Selected asset is not available.',
    };
  }

  const existingRequest = await prisma.contactRequest.findFirst({
    where: {
      senderId: seller.id,
      recipientId: buyer.id,
      assetId: asset.id,
      status: 'PENDING',
    },
  });

  if (existingRequest) {
    return {
      success: false,
      message:
        'You already have a pending inquiry with this buyer for this asset.',
    };
  }

  await prisma.contactRequest.create({
    data: {
      senderId: seller.id,
      recipientId: buyer.id,
      assetId: asset.id,
      message,
      status: 'PENDING',
    },
  });

  revalidatePath(`/buyers/${buyer.id}`);
  revalidatePath('/buyer/inquiries');
  revalidatePath('/seller');

  return {
    success: true,
    message: 'Message sent to buyer successfully.',
  };
}
