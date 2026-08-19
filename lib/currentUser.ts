import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export type AppRole = 'BUYER' | 'SELLER' | 'MANAGER';

export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return null;
  }

  return prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });
}

/**
 * Requires an authenticated and ACTIVE user.
 *
 * Guest      -> /login
 * Suspended  -> /account-suspended
 * Active     -> returns user
 */
export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.status === 'SUSPENDED') {
    redirect('/account-suspended');
  }

  return user;
}

/**
 * Requires an authenticated ACTIVE user
 * with the specified role.
 */
export async function requireRole(role: AppRole) {
  const user = await requireUser();

  if (user.role !== role) {
    redirect(getDashboardForRole(user.role));
  }

  return user;
}

/**
 * Returns the main dashboard for a role.
 */
export function getDashboardForRole(role: AppRole) {
  switch (role) {
    case 'BUYER':
      return '/buyer';

    case 'SELLER':
      return '/seller';

    case 'MANAGER':
      return '/manager';

    default:
      return '/';
  }
}
