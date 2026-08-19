'use client';

import { Loader2, RotateCcw, ShieldOff, X } from 'lucide-react';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import { toggleUserSuspension } from '@/app/actions/toggleUserSuspension';
import { Toast, type ToastType } from '@/components/ui/Toast';

type Props = {
  userId: string;
  status: 'ACTIVE' | 'SUSPENDED';
  disabled?: boolean;
};

type ToastState = {
  message: string;
  type: ToastType;
} | null;

export function UserModerationButton({
  userId,
  status,
  disabled = false,
}: Props) {
  const router = useRouter();

  const [pending, startTransition] = useTransition();

  const [confirmOpen, setConfirmOpen] = useState(false);

  const [toast, setToast] = useState<ToastState>(null);

  const suspended = status === 'SUSPENDED';

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 4000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toast]);

  function handleModeration() {
    if (disabled || pending) {
      return;
    }

    setConfirmOpen(false);

    startTransition(async () => {
      try {
        const result = await toggleUserSuspension(userId);

        setToast({
          type: 'success',

          message:
            result.status === 'SUSPENDED'
              ? 'User account has been suspended.'
              : 'User account has been restored.',
        });

        router.refresh();
      } catch (error) {
        setToast({
          type: 'error',

          message:
            error instanceof Error
              ? error.message
              : 'Unable to update this account.',
        });
      }
    });
  }

  return (
    <>
      <div className="relative">
        <button
          type="button"
          disabled={disabled || pending}
          onClick={() => setConfirmOpen((current) => !current)}
          className={`inline-flex h-11 items-center gap-2 rounded-xl border px-5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
            suspended
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:border-emerald-500/30 hover:bg-emerald-500/15'
              : 'border-red-500/20 bg-red-500/10 text-red-300 hover:border-red-500/30 hover:bg-red-500/15'
          }`}
        >
          {pending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : suspended ? (
            <RotateCcw size={16} />
          ) : (
            <ShieldOff size={16} />
          )}

          {pending ? 'Updating...' : suspended ? 'Unsuspend' : 'Suspend'}
        </button>

        {/* Custom confirmation */}
        {confirmOpen && !pending && (
          <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[310px] rounded-2xl border border-white/10 bg-[#17171d] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">
                  {suspended ? 'Restore account?' : 'Suspend account?'}
                </p>

                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  {suspended
                    ? 'This user will regain access to marketplace functionality.'
                    : 'This user will lose access to protected marketplace actions.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-white/[0.06] hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="h-9 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-medium text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleModeration}
                className={`h-9 rounded-xl text-xs font-semibold transition ${
                  suspended
                    ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                    : 'bg-red-500 text-white hover:bg-red-400'
                }`}
              >
                {suspended ? 'Restore' : 'Suspend'}
              </button>
            </div>
          </div>
        )}
      </div>

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
