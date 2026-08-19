'use client';

import { useState, useTransition } from 'react';

import { Check, Loader2, X } from 'lucide-react';

import { updateBuyerInquiryStatus } from '@/app/actions/updateBuyerInquiryStatus';

export function BuyerInquiryActions({
  inquiryId,
  status,
}: {
  inquiryId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
}) {
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  if (status !== 'PENDING') {
    return (
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-center text-sm text-zinc-500">
        Inquiry {status.toLowerCase()}
      </div>
    );
  }

  function handleUpdate(nextStatus: 'ACCEPTED' | 'DECLINED') {
    setError('');

    startTransition(async () => {
      try {
        await updateBuyerInquiryStatus(inquiryId, nextStatus);
      } catch {
        setError('Unable to update this inquiry.');
      }
    });
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => handleUpdate('DECLINED')}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 text-sm font-medium text-red-300 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X size={16} />
          Decline
        </button>

        <button
          type="button"
          disabled={pending}
          onClick={() => handleUpdate('ACCEPTED')}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Check size={16} />
          )}
          Accept
        </button>
      </div>

      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
    </div>
  );
}
