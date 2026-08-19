'use client';

import { useActionState } from 'react';
import { Save } from 'lucide-react';

import { updateAsset, type UpdateAssetState } from '@/app/actions/updateAsset';

type AssetData = {
  id: string;
  title: string;
  description: string;
  industry: string;
  location: string;
  assetType: 'BUSINESS' | 'REAL_ESTATE' | 'FINANCIAL_ASSET' | 'OTHER';
  askingPrice: number | null;
  revenue: number | null;
  ebitda: number | null;
  employees: number | null;
  foundedYear: number | null;
  status: 'DRAFT' | 'PUBLISHED' | 'SUSPENDED';
};

const initialState: UpdateAssetState = {
  success: false,
  message: '',
};

export function EditAssetForm({ asset }: { asset: AssetData }) {
  const [state, formAction, pending] = useActionState(
    updateAsset,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="assetId" value={asset.id} />

      <section className="rounded-[28px] border border-white/[0.08] bg-[#141419] p-6 lg:p-8">
        <p className="text-sm font-medium text-violet-400">Basic information</p>

        <h2 className="mt-2 text-2xl font-semibold">Opportunity details</h2>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Field
            label="Asset title"
            name="title"
            defaultValue={asset.title}
            error={state.errors?.title?.[0]}
          />

          <div>
            <label className="text-sm text-zinc-400">Asset type</label>

            <select
              name="assetType"
              defaultValue={asset.assetType}
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
            defaultValue={asset.industry}
            error={state.errors?.industry?.[0]}
          />

          <Field
            label="Location"
            name="location"
            defaultValue={asset.location}
            error={state.errors?.location?.[0]}
          />
        </div>

        <div className="mt-5">
          <label className="text-sm text-zinc-400">Description</label>

          <textarea
            name="description"
            defaultValue={asset.description}
            className="mt-2 min-h-[180px] w-full resize-none rounded-2xl border border-white/10 bg-[#101014] p-4 text-sm leading-6 text-white outline-none focus:border-violet-500/60"
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
            defaultValue={asset.askingPrice ?? ''}
          />

          <Field
            label="Revenue (€)"
            name="revenue"
            type="number"
            defaultValue={asset.revenue ?? ''}
          />

          <Field
            label="EBITDA (€)"
            name="ebitda"
            type="number"
            defaultValue={asset.ebitda ?? ''}
          />

          <Field
            label="Employees"
            name="employees"
            type="number"
            defaultValue={asset.employees ?? ''}
          />

          <Field
            label="Founded year"
            name="foundedYear"
            type="number"
            defaultValue={asset.foundedYear ?? ''}
          />

          <div>
            <label className="text-sm text-zinc-400">Status</label>

            <select
              name="status"
              defaultValue={
                asset.status === 'SUSPENDED' ? 'DRAFT' : asset.status
              }
              className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-[#101014] px-4 text-sm text-white outline-none focus:border-violet-500/60"
            >
              <option value="DRAFT">Draft</option>

              <option value="PUBLISHED">Published</option>
            </select>
          </div>
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

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
        >
          <Save size={17} />

          {pending ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = 'text',
  error,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  error?: string;
}) {
  return (
    <div>
      <label className="text-sm text-zinc-400">{label}</label>

      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-[#101014] px-4 text-sm text-white outline-none focus:border-violet-500/60"
      />

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
