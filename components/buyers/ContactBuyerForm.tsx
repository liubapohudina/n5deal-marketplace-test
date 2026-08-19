'use client';

import { useActionState } from 'react';
import { Check, Send } from 'lucide-react';

import {
  contactBuyer,
  type ContactBuyerState,
} from '@/app/actions/contactBuyer';

const initialState: ContactBuyerState = {
  success: false,
  message: '',
};

type AssetOption = {
  id: string;
  title: string;
};

export function ContactBuyerForm({
  buyerId,
  buyerName,
  assets,
}: {
  buyerId: string;
  buyerName: string;
  assets: AssetOption[];
}) {
  const [state, formAction, pending] = useActionState(
    contactBuyer,
    initialState,
  );

  if (state.success) {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
        <div className="flex items-center gap-3 text-emerald-300">
          <Check size={18} />
          <span className="font-medium">Message sent successfully</span>
        </div>

        <p className="mt-2 text-sm leading-6 text-zinc-400">
          {buyerName} will now see your inquiry in their Buyer workspace.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="buyerId" value={buyerId} />

      <div>
        <label className="text-sm text-zinc-400">Opportunity</label>

        <select
          name="assetId"
          required
          defaultValue=""
          className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-[#101014] px-4 text-sm text-white outline-none transition focus:border-violet-500/60"
        >
          <option value="" disabled>
            Select one of your assets
          </option>

          {assets.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.title}
            </option>
          ))}
        </select>

        {state.errors?.assetId?.[0] && (
          <p className="mt-2 text-xs text-red-400">{state.errors.assetId[0]}</p>
        )}
      </div>

      <div>
        <label className="text-sm text-zinc-400">Message</label>

        <textarea
          name="message"
          required
          minLength={10}
          maxLength={1500}
          defaultValue={`Hi ${buyerName}, I noticed your investment profile and thought one of our opportunities may be relevant to your acquisition criteria.`}
          className="mt-2 min-h-[150px] w-full resize-none rounded-2xl border border-white/10 bg-[#101014] p-4 text-sm leading-6 text-white outline-none transition focus:border-violet-500/60"
        />

        {state.errors?.message?.[0] && (
          <p className="mt-2 text-xs text-red-400">{state.errors.message[0]}</p>
        )}
      </div>

      {state.message && !state.success && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {state.message}
        </div>
      )}

      <button
        type="submit"
        disabled={pending || assets.length === 0}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send size={16} />
        {pending ? 'Sending...' : 'Send inquiry'}
      </button>
    </form>
  );
}
