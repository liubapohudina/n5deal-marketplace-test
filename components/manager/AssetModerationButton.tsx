'use client';

import { Loader2, RotateCcw, ShieldOff } from 'lucide-react';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import { toggleAssetSuspension } from '@/app/actions/toggleAssetSuspension';
import { Toast, type ToastType } from '@/components/ui/Toast';

type ToastState = {
  message: string;
  type: ToastType;
} | null;

export function AssetModerationButton({
  assetId,
  status,
}: {
  assetId: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SUSPENDED';
}) {
  const router = useRouter();

  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<ToastState>(null);

  const suspended = status === 'SUSPENDED';

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [toast]);

  function handleClick() {
    startTransition(async () => {
      try {
        const result = await toggleAssetSuspension(assetId);

        setToast({
          type: 'success',
          message:
            result.status === 'SUSPENDED'
              ? 'Asset has been suspended.'
              : 'Asset has been restored.',
        });

        router.refresh();
      } catch (error) {
        setToast({
          type: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Unable to update this asset.',
        });
      }
    });
  }

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={handleClick}
        className={`inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition disabled:opacity-50 ${
          suspended
            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15'
            : 'border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/15'
        }`}
      >
        {pending ? (
          <Loader2 size={15} className="animate-spin" />
        ) : suspended ? (
          <RotateCcw size={15} />
        ) : (
          <ShieldOff size={15} />
        )}

        {pending ? 'Updating...' : suspended ? 'Restore' : 'Suspend'}
      </button>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
