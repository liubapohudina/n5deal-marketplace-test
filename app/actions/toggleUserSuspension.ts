'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/currentUser';

export async function toggleUserSuspension(userId: string) {
  const manager = await requireRole('MANAGER');

  if (manager.id === userId) {
    throw new Error('You cannot suspend your own account.');
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },

    select: {
      id: true,
      role: true,
      status: true,
    },
  });

  if (!user) {
    throw new Error('User not found.');
  }

  if (user.role === 'MANAGER') {
    throw new Error('Manager accounts cannot be moderated.');
  }

  const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: {
        id: user.id,
      },

      data: {
        status: nextStatus,
      },
    });

    await tx.moderationAction.create({
      data: {
        managerId: manager.id,
        userId: user.id,

        action: nextStatus === 'SUSPENDED' ? 'SUSPEND' : 'UNSUSPEND',

        reason:
          nextStatus === 'SUSPENDED'
            ? 'Account suspended by platform manager.'
            : 'Account restored by platform manager.',
      },
    });
  });

  revalidatePath('/manager');
  revalidatePath('/manager/users');
  revalidatePath(`/manager/users/${user.id}`);

  revalidatePath('/buyers');
  revalidatePath('/opportunities');

  return {
    success: true,
    status: nextStatus,
  } as const;
}
