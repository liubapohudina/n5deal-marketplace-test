'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function updateBuyerInquiryStatus(
  inquiryId: string,
  status: 'ACCEPTED' | 'DECLINED',
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const buyer = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!buyer || buyer.role !== 'BUYER' || buyer.status !== 'ACTIVE') {
    throw new Error('Unauthorized');
  }

  const inquiry = await prisma.contactRequest.findFirst({
    where: {
      id: inquiryId,

      // Security:
      // Buyer can update only inquiries sent TO this Buyer.
      recipientId: buyer.id,
    },
  });

  if (!inquiry) {
    throw new Error('Inquiry not found.');
  }

  if (inquiry.status !== 'PENDING') {
    throw new Error('Inquiry has already been processed.');
  }

  await prisma.contactRequest.update({
    where: {
      id: inquiry.id,
    },

    data: {
      status,
    },
  });

  revalidatePath('/buyer');
  revalidatePath('/buyer/inquiries');

  // Seller should immediately see the updated status too.
  revalidatePath('/seller/inquiries');
}
