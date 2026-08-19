'use client';

import { useState, useTransition } from 'react';
import { Trash2, X, AlertTriangle } from 'lucide-react';

import { deleteAsset } from '@/app/actions/deleteAsset';

export function DeleteAssetButton({
  assetId,
  assetTitle,
}: {
  assetId: string;
  assetTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function handleDelete() {
    setError('');

    startTransition(async () => {
      try {
        await deleteAsset(assetId);
      } catch {
        setError('Unable to delete this asset. Please try again.');
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 text-sm font-medium text-red-300 transition hover:bg-red-500/15"
      >
        <Trash2 size={16} />
        Delete
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => !isPending && setOpen(false)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#15151a] p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
                <AlertTriangle size={22} />
              </div>

              <button
                type="button"
                disabled={isPending}
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <h2 className="mt-5 text-xl font-semibold text-white">
              Delete asset?
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              You are about to permanently delete{' '}
              <span className="font-medium text-white">{assetTitle}</span>. This
              action cannot be undone.
            </p>

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setOpen(false)}
                className="h-11 rounded-xl border border-white/10 px-5 text-sm font-medium text-zinc-300 transition hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={handleDelete}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-500 px-5 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={16} />

                {isPending ? 'Deleting...' : 'Delete asset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
