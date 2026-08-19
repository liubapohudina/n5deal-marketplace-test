import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

import { prisma } from '@/lib/prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    maxPasswordLength: 128,
    autoSignIn: true,
  },

  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: true,
        defaultValue: 'BUYER',

        // Дуже важливо:
        // клієнт не може сам передати MANAGER.
        input: false,
      },

      status: {
        type: 'string',
        required: true,
        defaultValue: 'ACTIVE',
        input: false,
      },
    },
  },
});
