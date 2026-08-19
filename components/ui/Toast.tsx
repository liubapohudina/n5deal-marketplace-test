'use client';

import { CheckCircle2, X, XCircle } from 'lucide-react';

export type ToastType = 'success' | 'error';

type ToastProps = {
  message: string;
  type?: ToastType;
  onClose: () => void;
};

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  const success = type === 'success';

  return (
    <div className="fixed right-6 top-6 z-[10000] w-[360px] max-w-[calc(100vw-48px)] animate-in slide-in-from-top-3 fade-in duration-300">
      <div
        className={`overflow-hidden rounded-2xl border shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl ${
          success
            ? 'border-emerald-500/20 bg-[#101a17]/95'
            : 'border-red-500/20 bg-[#1a1012]/95'
        }`}
      >
        <div className="flex items-start gap-3 p-4">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              success
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-red-500/10 text-red-400'
            }`}
          >
            {success ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          </div>

          <div className="min-w-0 flex-1">
            <p
              className={`text-sm font-semibold ${
                success ? 'text-emerald-300' : 'text-red-300'
              }`}
            >
              {success ? 'Updated successfully' : 'Something went wrong'}
            </p>

            <p className="mt-1 text-sm leading-5 text-zinc-400">{message}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-white/[0.06] hover:text-white"
          >
            <X size={15} />
          </button>
        </div>

        <div
          className={`h-[2px] w-full ${
            success ? 'bg-emerald-500' : 'bg-red-500'
          }`}
        />
      </div>
    </div>
  );
}
