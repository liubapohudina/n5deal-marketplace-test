import Link from 'next/link';

import {
  ArrowUpRight,
  Building2,
  MapPin,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

type HeroInvestmentCardProps = {
  title: string;
  industry: string;
  location: string;
  askingPrice: string;
  ebitda: string;
  matchScore: number;
  href: string;
  variant?: 'purple' | 'green' | 'orange';
};

const variants = {
  purple: {
    accent: 'text-violet-400',
    badge: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
    icon: 'bg-violet-600 text-white shadow-[0_10px_30px_rgba(124,58,237,0.35)]',
    progress: 'bg-violet-500',
    glow: 'from-violet-500/15 via-transparent to-transparent',
    arrow: 'text-violet-400 group-hover:bg-violet-500 group-hover:text-white',
  },

  green: {
    accent: 'text-emerald-400',
    badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    icon: 'bg-emerald-500/20 text-emerald-300',
    progress: 'bg-emerald-400',
    glow: 'from-emerald-500/10 via-transparent to-transparent',
    arrow: 'text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black',
  },

  orange: {
    accent: 'text-orange-400',
    badge: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
    icon: 'bg-orange-500/20 text-orange-300',
    progress: 'bg-orange-400',
    glow: 'from-orange-500/10 via-transparent to-transparent',
    arrow: 'text-orange-400 group-hover:bg-orange-500 group-hover:text-black',
  },
};

export function HeroInvestmentCard({
  title,
  industry,
  location,
  askingPrice,
  ebitda,
  matchScore,
  href,
  variant = 'purple',
}: HeroInvestmentCardProps) {
  const styles = variants[variant];

  const Icon =
    variant === 'purple'
      ? ShieldCheck
      : variant === 'green'
        ? TrendingUp
        : Building2;

  return (
    <article className="group relative overflow-hidden rounded-[30px] border border-white/[0.09] bg-[#101116]/90 p-6 text-white shadow-[0_20px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-[#13141a]">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${styles.glow}`}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${styles.icon}`}
          >
            <Icon size={22} />
          </div>

          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${styles.badge}`}
          >
            {matchScore}% match
          </span>
        </div>

        <div className="mt-6">
          <p
            className={`text-xs font-semibold uppercase tracking-[0.14em] ${styles.accent}`}
          >
            {industry}
          </p>

          <h3 className="mt-2 text-[22px] font-semibold leading-tight tracking-[-0.03em]">
            {title}
          </h3>

          <div className="mt-3 flex items-center gap-2 text-sm text-zinc-400">
            <MapPin size={15} />
            <span>{location}</span>
          </div>
        </div>

        <div className="my-6 h-px bg-white/[0.08]" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">
              Asking price
            </p>

            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {askingPrice}
            </p>
          </div>

          <div className="border-l border-white/[0.08] pl-5">
            <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">
              EBITDA
            </p>

            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {ebitda}
            </p>
          </div>
        </div>

        <div className="mt-7">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Match to criteria</span>

            <span className="font-semibold">{matchScore}%</span>
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className={`h-full rounded-full ${styles.progress}`}
              style={{
                width: `${Math.min(Math.max(matchScore, 0), 100)}%`,
              }}
            />
          </div>
        </div>

        <div className="mt-7 flex items-center justify-between border-t border-white/[0.08] pt-5">
          {href ? (
            <>
              <Link
                href={href}
                className="text-sm font-medium text-zinc-200 transition hover:text-white"
              >
                View details
              </Link>

              <Link
                href={href}
                aria-label={`View ${title}`}
                className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] transition ${styles.arrow}`}
              >
                <ArrowUpRight size={18} />
              </Link>
            </>
          ) : (
            <div>
              <span className="text-sm font-medium text-zinc-600">
                Details unavailable
              </span>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] text-zinc-700">
                <ArrowUpRight size={18} />
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
