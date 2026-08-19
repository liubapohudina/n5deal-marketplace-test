import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

type OpportunityCardProps = {
  href: string;
  title: string;
  industry: string;
  location: string;
  askingPrice: string;
  ebitda: string;
  matchScore: number;
};

export function OpportunityCard({
  href,
  title,
  industry,
  location,
  askingPrice,
  ebitda,
  matchScore,
}: OpportunityCardProps) {
  return (
    <article className="group rounded-[30px] border border-white/10 bg-[#15151a] p-6 transition hover:-translate-y-1 hover:border-violet-500/40">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-medium text-violet-300">
            {matchScore}% match
          </span>

          <h3 className="mt-5 text-xl font-semibold leading-tight text-white">
            {title}
          </h3>

          <p className="mt-2 text-sm text-zinc-500">
            {industry} · {location}
          </p>
        </div>

        <Link
          href={href}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-400 transition group-hover:bg-white group-hover:text-black"
        >
          <ArrowUpRight size={18} />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-600">
            Asking price
          </p>
          <p className="mt-2 text-xl font-semibold text-white">{askingPrice}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-600">
            EBITDA
          </p>
          <p className="mt-2 text-xl font-semibold text-emerald-400">
            {ebitda}
          </p>
        </div>
      </div>
    </article>
  );
}
