'use client';

import { useActionState } from 'react';
import { Send } from 'lucide-react';
import Link from 'next/link';

import {
  contactSeller,
  type ContactSellerState,
} from '../../app/actions/contactSeller';

const initialState: ContactSellerState = {
  success: false,
  message: '',
};

export function ContactSellerForm({
  assetId,
  sellerName,
}: {
  assetId: string;
  sellerName: string;
}) {
  const [state, formAction, pending] = useActionState(
    contactSeller,
    initialState,
  );

  return (
    <section className="rounded-[30px] border border-violet-500/20 bg-gradient-to-b from-violet-500/10 to-[#141419] p-6">
      <p className="text-sm font-medium text-violet-300">
        Interested in this opportunity?
      </p>

      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
        Contact seller
      </h2>

      <p className="mt-3 text-sm leading-6 text-zinc-400">
        Send an inquiry to {sellerName}. Your message will be saved in the
        marketplace.
      </p>

      <form action={formAction} className="mt-6">
        <input type="hidden" name="assetId" value={assetId} />

        <textarea
          name="message"
          required
          minLength={10}
          maxLength={1000}
          defaultValue="Hi, I'm interested in learning more about this opportunity. Could we discuss the business and transaction details?"
          className="min-h-[145px] w-full resize-none rounded-2xl border border-white/10 bg-[#101014] p-4 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500/60"
          placeholder="Write your message..."
        />

        {state.requiresLogin ? (
          <div className="mt-4 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
            <p className="text-sm text-violet-200">
              Sign in to contact this seller.
            </p>

            <Link
              href={`/login?callbackUrl=/opportunities/${assetId}`}
              className="mt-3 inline-flex rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500"
            >
              Sign in to continue
            </Link>
          </div>
        ) : state.message ? (
          <div
            className={`mt-3 rounded-xl px-4 py-3 text-sm ${
              state.success
                ? 'bg-emerald-500/10 text-emerald-300'
                : 'bg-red-500/10 text-red-300'
            }`}
          >
            {state.message}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={17} />

          {pending ? 'Sending...' : 'Send inquiry'}
        </button>
      </form>
    </section>
  );
}
