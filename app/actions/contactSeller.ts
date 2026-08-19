'use server';

import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export type ContactSellerState = {
  success: boolean;
  message: string;
  requiresLogin?: boolean;
};

export async function contactSeller(
  _previousState: ContactSellerState,
  formData: FormData,
): Promise<ContactSellerState> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      success: false,
      requiresLogin: true,
      message: 'Sign in to contact this seller.',
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    return {
      success: false,
      message: 'User account not found.',
    };
  }

  if (user.status !== 'ACTIVE') {
    return {
      success: false,
      message: 'Your account is currently suspended.',
    };
  }

  if (user.role !== 'BUYER') {
    return {
      success: false,
      message: 'Only buyers can contact sellers.',
    };
  }

  const assetId = String(formData.get('assetId') ?? '');
  const message = String(formData.get('message') ?? '').trim();

  if (!assetId) {
    return {
      success: false,
      message: 'Opportunity not found.',
    };
  }

  if (message.length < 10) {
    return {
      success: false,
      message: 'Please enter a more detailed message.',
    };
  }

  const asset = await prisma.asset.findUnique({
    where: {
      id: assetId,
    },
  });

  if (!asset || asset.status !== 'PUBLISHED') {
    return {
      success: false,
      message: 'This opportunity is no longer available.',
    };
  }

  const existingRequest = await prisma.contactRequest.findFirst({
    where: {
      senderId: user.id,
      recipientId: asset.sellerId,
      assetId: asset.id,
      status: 'PENDING',
    },
  });

  if (existingRequest) {
    return {
      success: false,
      message: 'You already have a pending inquiry for this opportunity.',
    };
  }

  await prisma.contactRequest.create({
    data: {
      senderId: user.id,
      recipientId: asset.sellerId,
      assetId: asset.id,
      message,
      status: 'PENDING',
    },
  });

  return {
    success: true,
    message: 'Inquiry sent successfully.',
  };
}
