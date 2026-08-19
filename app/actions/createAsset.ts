'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { z } from 'zod';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export type CreateAssetState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

const assetSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, 'Title must contain at least 5 characters.')
    .max(120),

  description: z
    .string()
    .trim()
    .min(30, 'Description must contain at least 30 characters.')
    .max(3000),

  industry: z.string().trim().min(2, 'Industry is required.'),

  location: z.string().trim().min(2, 'Location is required.'),

  assetType: z.enum(['BUSINESS', 'REAL_ESTATE', 'FINANCIAL_ASSET', 'OTHER']),

  askingPrice: z.coerce.number().positive().optional(),

  revenue: z.coerce.number().positive().optional(),

  ebitda: z.coerce.number().optional(),

  employees: z.coerce.number().int().positive().optional(),

  foundedYear: z.coerce
    .number()
    .int()
    .min(1800)
    .max(new Date().getFullYear())
    .optional(),

  status: z.enum(['DRAFT', 'PUBLISHED']),
});

function optionalNumber(value: FormDataEntryValue | null) {
  if (!value || String(value).trim() === '') {
    return undefined;
  }

  return Number(value);
}

export async function createAsset(
  _previousState: CreateAssetState,
  formData: FormData,
): Promise<CreateAssetState> {
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

  if (!seller) {
    return {
      success: false,
      message: 'User account not found.',
    };
  }

  if (seller.status !== 'ACTIVE') {
    return {
      success: false,
      message: 'Your account is suspended.',
    };
  }

  if (seller.role !== 'SELLER') {
    return {
      success: false,
      message: 'Only sellers can publish assets.',
    };
  }

  const validated = assetSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    industry: formData.get('industry'),
    location: formData.get('location'),
    assetType: formData.get('assetType'),

    askingPrice: optionalNumber(formData.get('askingPrice')),
    revenue: optionalNumber(formData.get('revenue')),
    ebitda: optionalNumber(formData.get('ebitda')),
    employees: optionalNumber(formData.get('employees')),
    foundedYear: optionalNumber(formData.get('foundedYear')),

    status: formData.get('status'),
  });

  if (!validated.success) {
    return {
      success: false,
      message: 'Please check the form fields.',
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const data = validated.data;

  const asset = await prisma.asset.create({
    data: {
      sellerId: seller.id,

      title: data.title,
      description: data.description,
      industry: data.industry,
      location: data.location,
      assetType: data.assetType,

      askingPrice: data.askingPrice,
      revenue: data.revenue,
      ebitda: data.ebitda,
      employees: data.employees,
      foundedYear: data.foundedYear,

      dealTypes: [],
      investmentHighlights: [],

      status: data.status,

      publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
    },
  });

  revalidatePath('/seller');
  revalidatePath('/seller/assets');
  revalidatePath('/opportunities');

  return {
    success: true,
    message:
      asset.status === 'PUBLISHED'
        ? 'Asset published successfully.'
        : 'Draft saved successfully.',
  };
}
