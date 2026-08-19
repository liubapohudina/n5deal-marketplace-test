'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { z } from 'zod';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export type UpdateAssetState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

const updateAssetSchema = z.object({
  assetId: z.string().min(1),

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

  askingPrice: z.number().positive().optional(),

  revenue: z.number().positive().optional(),

  ebitda: z.number().optional(),

  employees: z.number().int().positive().optional(),

  foundedYear: z
    .number()
    .int()
    .min(1800)
    .max(new Date().getFullYear())
    .optional(),

  status: z.enum(['DRAFT', 'PUBLISHED']),
});

function optionalNumber(value: FormDataEntryValue | null) {
  if (value === null || String(value).trim() === '') {
    return undefined;
  }

  return Number(value);
}

export async function updateAsset(
  _previousState: UpdateAssetState,
  formData: FormData,
): Promise<UpdateAssetState> {
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
      message: 'Only sellers can edit assets.',
    };
  }

  const validated = updateAssetSchema.safeParse({
    assetId: formData.get('assetId'),

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

  const asset = await prisma.asset.findFirst({
    where: {
      id: data.assetId,
      sellerId: seller.id,
    },
  });

  if (!asset) {
    return {
      success: false,
      message: 'Asset not found.',
    };
  }

  await prisma.asset.update({
    where: {
      id: asset.id,
    },

    data: {
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

      status: data.status,

      publishedAt:
        data.status === 'PUBLISHED' ? (asset.publishedAt ?? new Date()) : null,
    },
  });

  revalidatePath('/seller');
  revalidatePath('/seller/assets');
  revalidatePath(`/seller/assets/${asset.id}`);
  revalidatePath(`/seller/assets/${asset.id}/edit`);
  revalidatePath('/opportunities');
  revalidatePath(`/opportunities/${asset.id}`);

  return {
    success: true,
    message: 'Asset updated successfully.',
  };
}
