'use server';

import { headers } from 'next/headers';
import { z } from 'zod';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const registrationProfileSchema = z.object({
  role: z.enum(['BUYER', 'SELLER']),

  company: z.string().trim().min(2, 'Company name is required.').max(120),
});

export type CompleteRegistrationResult = {
  success: boolean;
  message?: string;
  redirectTo?: string;
};

export async function completeRegistration(
  role: string,
  company: string,
): Promise<CompleteRegistrationResult> {
  const parsed = registrationProfileSchema.safeParse({
    role,
    company,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Invalid registration data.',
    };
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return {
      success: false,
      message: 'Authentication session was not created.',
    };
  }

  const { role: safeRole, company: safeCompany } = parsed.data;

  const user = await prisma.user.update({
    where: {
      id: session.user.id,
    },

    data: {
      role: safeRole,
      company: safeCompany,
      status: 'ACTIVE',
    },
  });

  // Buyer-specific marketplace profile.
  if (safeRole === 'BUYER') {
    await prisma.buyerProfile.upsert({
      where: {
        userId: user.id,
      },

      update: {},

      create: {
        userId: user.id,

        investmentThesis: null,

        industries: [],
        geographies: [],
        investmentTypes: [],
        preferredDealTypes: [],

        minDealSize: null,
        maxDealSize: null,
      },
    });
  }

  return {
    success: true,
    redirectTo: safeRole === 'SELLER' ? '/seller' : '/buyer',
  };
}
