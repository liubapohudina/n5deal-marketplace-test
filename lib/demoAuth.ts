import { cookies } from 'next/headers';

export type DemoRole = 'BUYER' | 'SELLER' | 'MANAGER';

export async function getDemoRole(): Promise<DemoRole | null> {
  const cookieStore = await cookies();
  const role = cookieStore.get('demo-role')?.value;

  if (role === 'BUYER' || role === 'SELLER' || role === 'MANAGER') {
    return role;
  }

  return null;
}
