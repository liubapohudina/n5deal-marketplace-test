'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export type UpdateAccountState = {
  success: boolean;
  message: string;

  errors?: {
    name?: string[];
    company?: string[];
  };
};

const updateAccountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must contain at least 2 characters.')
    .max(100, 'Name is too long.'),

  company: z.string().trim().max(120, 'Company name is too long.'),
});

export async function updateAccount(
  _previousState: UpdateAccountState,
  formData: FormData,
): Promise<UpdateAccountState> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return {
      success: false,
      message: 'Please sign in first.',
    };
  }

  const parsed = updateAccountSchema.safeParse({
    name: formData.get('name'),
    company: formData.get('company'),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: 'Please check the entered information.',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const currentUser = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!currentUser) {
    return {
      success: false,
      message: 'Account not found.',
    };
  }

  if (currentUser.status !== 'ACTIVE') {
    return {
      success: false,
      message: 'This account is currently suspended.',
    };
  }

  await prisma.user.update({
    where: {
      id: currentUser.id,
    },

    data: {
      name: parsed.data.name,
      company: parsed.data.company || null,
    },
  });

  revalidatePath('/');
  revalidatePath('/settings/account');

  if (currentUser.role === 'SELLER') {
    revalidatePath('/seller');
  }

  if (currentUser.role === 'MANAGER') {
    revalidatePath('/manager');
  }

  return {
    success: true,
    message: 'Account settings updated successfully.',
  };
}
