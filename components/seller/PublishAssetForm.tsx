'use client';

import { useActionState } from 'react';
import { Save, Send } from 'lucide-react';

import { createAsset, type CreateAssetState } from '@/app/actions/createAsset';

const initialState: CreateAssetState = {
  success: false,
  message: '',
};

export function PublishAssetForm() {
  const [state, formAction, pending] = useActionState(
    createAsset,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
      <section className="rounded-[28px] border border-white/[0.08] bg-[#141419] p-6 lg:p-8">
        <p className="text-sm font-medium text-violet-400">Basic information</p>

        <h2 className="mt-2 text-2xl font-semibold">
          Describe the opportunity
        </h2>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Field
            label="Asset title"
            name="title"
            placeholder="Profitable B2B SaaS Platform"
            error={state.errors?.title?.[0]}
          />

          <div>
            <label className="text-sm text-zinc-400">Asset type</label>

            <select
              name="assetType"
              defaultValue="BUSINESS"
              className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-[#101014] px-4 text-sm text-white outline-none focus:border-violet-500/60"
            >
              <option value="BUSINESS">Business</option>
              <option value="REAL_ESTATE">Real Estate</option>
              <option value="FINANCIAL_ASSET">Financial Asset</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <Field
            label="Industry"
            name="industry"
            placeholder="SaaS"
            error={state.errors?.industry?.[0]}
          />

          <Field
            label="Location"
            name="location"
            placeholder="Berlin, Germany"
            error={state.errors?.location?.[0]}
          />
        </div>

        <div className="mt-5">
          <label className="text-sm text-zinc-400">Description</label>

          <textarea
            name="description"
            placeholder="Describe the business, transaction context and key characteristics..."
            className="mt-2 min-h-[180px] w-full resize-none rounded-2xl border border-white/10 bg-[#101014] p-4 text-sm leading-6 text-white outline-none placeholder:text-zinc-600 focus:border-violet-500/60"
          />

          {state.errors?.description?.[0] && (
            <p className="mt-2 text-xs text-red-400">
              {state.errors.description[0]}
            </p>
          )}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/[0.08] bg-[#141419] p-6 lg:p-8">
        <p className="text-sm font-medium text-violet-400">Financials</p>

        <h2 className="mt-2 text-2xl font-semibold">Deal metrics</h2>

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Field
            label="Asking price (€)"
            name="askingPrice"
            type="number"
            placeholder="4200000"
          />

          <Field
            label="Revenue (€)"
            name="revenue"
            type="number"
            placeholder="3800000"
          />

          <Field
            label="EBITDA (€)"
            name="ebitda"
            type="number"
            placeholder="850000"
          />

          <Field
            label="Employees"
            name="employees"
            type="number"
            placeholder="34"
          />

          <Field
            label="Founded year"
            name="foundedYear"
            type="number"
            placeholder="2017"
          />
        </div>
      </section>

      {state.message && (
        <div
          className={`rounded-2xl px-5 py-4 text-sm ${
            state.success
              ? 'bg-emerald-500/10 text-emerald-300'
              : 'bg-red-500/10 text-red-300'
          }`}
        >
          {state.message}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="submit"
          name="status"
          value="DRAFT"
          disabled={pending}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-sm font-semibold text-zinc-300 transition hover:bg-white/10 disabled:opacity-50"
        >
          <Save size={17} />
          Save draft
        </button>

        <button
          type="submit"
          name="status"
          value="PUBLISHED"
          disabled={pending}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
        >
          <Send size={17} />
          {pending ? 'Saving...' : 'Publish asset'}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = 'text',
  error,
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  error?: string;
}) {
  return (
    <div>
      <label className="text-sm text-zinc-400">{label}</label>

      <input
        name={name}
        type={type}
        placeholder={placeholder}
        className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-[#101014] px-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-500/60"
      />

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
