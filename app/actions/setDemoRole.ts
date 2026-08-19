'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function setDemoRole(formData: FormData) {
  const role = String(formData.get('role') ?? '');

  const allowedRoles = ['BUYER', 'SELLER', 'MANAGER'];

  if (!allowedRoles.includes(role)) {
    throw new Error('Invalid role');
  }

  const cookieStore = await cookies();

  cookieStore.set('demo-role', role, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  if (role === 'BUYER') redirect('/');
  if (role === 'SELLER') redirect('/seller');
  if (role === 'MANAGER') redirect('/manager');
}
