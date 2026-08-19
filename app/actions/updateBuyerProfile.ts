'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireRole } from '@/lib/currentUser';
import { prisma } from '@/lib/prisma';

export type BuyerProfileState = {
  success: boolean;
  message: string;

  errors?: {
    thesis?: string[];
    industries?: string[];
    regions?: string[];
    investmentRange?: string[];
  };
};

const profileSchema = z
  .object({
    thesis: z
      .string()
      .trim()
      .min(20, 'Describe your investment strategy in a little more detail.')
      .max(1500, 'Investment thesis is too long.'),

    industries: z
      .array(z.string())
      .min(1, 'Select at least one industry.')
      .max(10),

    regions: z.array(z.string()).min(1, 'Select at least one region.').max(10),

    minInvestment: z.coerce.number().nonnegative().finite(),

    maxInvestment: z.coerce.number().positive().finite(),
  })
  .refine((data) => data.maxInvestment >= data.minInvestment, {
    message:
      'Maximum investment must be greater than or equal to minimum investment.',
    path: ['investmentRange'],
  });

export async function updateBuyerProfile(
  _previousState: BuyerProfileState,
  formData: FormData,
): Promise<BuyerProfileState> {
  /*
   * Security:
   * never trust a userId coming from the browser.
   * We get the current Buyer from the authenticated session.
   */
  const buyer = await requireRole('BUYER');

  const parsed = profileSchema.safeParse({
    thesis: formData.get('thesis'),

    industries: formData.getAll('industries').map(String),

    regions: formData.getAll('regions').map(String),

    minInvestment: formData.get('minInvestment'),

    maxInvestment: formData.get('maxInvestment'),
  });

  if (!parsed.success) {
    const flattened = parsed.error.flatten().fieldErrors;

    return {
      success: false,
      message: 'Please check your investment criteria.',

      errors: {
        thesis: flattened.thesis,
        industries: flattened.industries,
        regions: flattened.regions,
        investmentRange: parsed.error.issues
          .filter((issue) => issue.path[0] === 'investmentRange')
          .map((issue) => issue.message),
      },
    };
  }

  /*
   * Upsert is useful here:
   *
   * Existing Buyer → update profile
   * New Buyer      → create profile
   */
  await prisma.buyerProfile.upsert({
    where: {
      userId: buyer.id,
    },

    update: {
      investmentThesis: parsed.data.thesis,
      industries: parsed.data.industries,
      geographies: parsed.data.regions,
      minDealSize: parsed.data.minInvestment,
      maxDealSize: parsed.data.maxInvestment,
    },

    create: {
      userId: buyer.id,

      investmentThesis: parsed.data.thesis,

      industries: parsed.data.industries,

      geographies: parsed.data.regions,

      minDealSize: parsed.data.minInvestment,

      maxDealSize: parsed.data.maxInvestment,

      investmentTypes: [],

      preferredDealTypes: [],
    },
  });

  revalidatePath('/buyer');
  revalidatePath('/buyer/profile');

  return {
    success: true,
    message: 'Investment profile updated successfully.',
  };
}
