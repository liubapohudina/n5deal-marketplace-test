'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Check,
  Euro,
  Globe2,
  Loader2,
  Save,
  Sparkles,
} from 'lucide-react';

import {
  updateBuyerProfile,
  type BuyerProfileState,
} from '@/app/actions/updateBuyerProfile';

const INDUSTRIES = [
  'B2B SaaS',
  'Cybersecurity',
  'FinTech',
  'Healthcare',
  'Manufacturing',
  'E-commerce',
  'Logistics',
  'Professional Services',
];

const REGIONS = [
  'Germany',
  'United Kingdom',
  'France',
  'Benelux',
  'Nordics',
  'Southern Europe',
  'Central Europe',
  'United States',
];

const initialState: BuyerProfileState = {
  success: false,
  message: '',
};

type Props = {
  profile: {
    thesis: string;
    industries: string[];
    regions: string[];
    minInvestment: number | null;
    maxInvestment: number | null;
  };
};

export function BuyerProfileForm({ profile }: Props) {
  const [state, formAction, pending] = useActionState(
    updateBuyerProfile,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
      {/* Investment thesis */}
      <section className="rounded-[28px] border border-white/[0.08] bg-[#141419] p-6 lg:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
            <Sparkles size={20} />
          </div>

          <div>
            <h2 className="text-lg font-semibold">Acquisition strategy</h2>

            <p className="mt-1 text-sm leading-6 text-zinc-500">
              Describe the type of businesses you are interested in acquiring.
            </p>
          </div>
        </div>

        <div className="mt-7">
          <label htmlFor="thesis" className="text-sm font-medium text-zinc-400">
            Investment thesis
          </label>

          <textarea
            id="thesis"
            name="thesis"
            defaultValue={profile.thesis}
            rows={5}
            maxLength={1500}
            placeholder="We acquire profitable B2B software companies with recurring revenue, strong customer retention and opportunities for international expansion..."
            className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-[#101014] px-4 py-4 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10"
          />

          {state.errors?.thesis?.[0] && (
            <p className="mt-2 text-xs text-red-400">
              {state.errors.thesis[0]}
            </p>
          )}
        </div>
      </section>

      {/* Industries */}
      <section className="rounded-[28px] border border-white/[0.08] bg-[#141419] p-6 lg:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
            <Building2 size={20} />
          </div>

          <div>
            <h2 className="text-lg font-semibold">Target industries</h2>

            <p className="mt-1 text-sm text-zinc-500">
              Select one or more sectors you are interested in.
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          {INDUSTRIES.map((industry) => (
            <label key={industry} className="cursor-pointer">
              <input
                type="checkbox"
                name="industries"
                value={industry}
                defaultChecked={profile.industries.includes(industry)}
                className="peer sr-only"
              />

              <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-400 transition hover:border-white/20 hover:text-white peer-checked:border-violet-500/40 peer-checked:bg-violet-500/10 peer-checked:text-violet-300">
                <Check size={14} className="hidden peer-checked:block" />
                {industry}
              </span>
            </label>
          ))}
        </div>

        {state.errors?.industries?.[0] && (
          <p className="mt-3 text-xs text-red-400">
            {state.errors.industries[0]}
          </p>
        )}
      </section>

      {/* Regions */}
      <section className="rounded-[28px] border border-white/[0.08] bg-[#141419] p-6 lg:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
            <Globe2 size={20} />
          </div>

          <div>
            <h2 className="text-lg font-semibold">Target regions</h2>

            <p className="mt-1 text-sm text-zinc-500">
              Choose the geographic markets relevant to your strategy.
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          {REGIONS.map((region) => (
            <label key={region} className="cursor-pointer">
              <input
                type="checkbox"
                name="regions"
                value={region}
                defaultChecked={profile.regions.includes(region)}
                className="peer sr-only"
              />

              <span className="inline-flex rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-400 transition hover:border-white/20 hover:text-white peer-checked:border-violet-500/40 peer-checked:bg-violet-500/10 peer-checked:text-violet-300">
                {region}
              </span>
            </label>
          ))}
        </div>

        {state.errors?.regions?.[0] && (
          <p className="mt-3 text-xs text-red-400">{state.errors.regions[0]}</p>
        )}
      </section>

      {/* Investment range */}
      <section className="rounded-[28px] border border-white/[0.08] bg-[#141419] p-6 lg:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
            <Euro size={20} />
          </div>

          <div>
            <h2 className="text-lg font-semibold">Investment range</h2>

            <p className="mt-1 text-sm text-zinc-500">
              Define the acquisition value range you are comfortable with.
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="minInvestment"
              className="text-sm font-medium text-zinc-400"
            >
              Minimum investment
            </label>

            <div className="relative mt-2">
              <Euro
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
              />

              <input
                id="minInvestment"
                name="minInvestment"
                type="number"
                min="0"
                step="10000"
                defaultValue={profile.minInvestment ?? ''}
                placeholder="500000"
                className="h-12 w-full rounded-2xl border border-white/10 bg-[#101014] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="maxInvestment"
              className="text-sm font-medium text-zinc-400"
            >
              Maximum investment
            </label>

            <div className="relative mt-2">
              <Euro
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
              />

              <input
                id="maxInvestment"
                name="maxInvestment"
                type="number"
                min="0"
                step="10000"
                defaultValue={profile.maxInvestment ?? ''}
                placeholder="10000000"
                className="h-12 w-full rounded-2xl border border-white/10 bg-[#101014] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10"
              />
            </div>
          </div>
        </div>

        {state.errors?.investmentRange?.[0] && (
          <p className="mt-3 text-xs text-red-400">
            {state.errors.investmentRange[0]}
          </p>
        )}
      </section>

      {/* Result */}
      {state.message && (
        <div
          className={`rounded-2xl border px-5 py-4 text-sm ${
            state.success
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
              : 'border-red-500/20 bg-red-500/10 text-red-300'
          }`}
        >
          {state.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Link
          href="/buyer"
          className="text-sm text-zinc-500 transition hover:text-white"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 min-w-[170px] items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={17} />
              Save profile
            </>
          )}
        </button>
      </div>
    </form>
  );
}
