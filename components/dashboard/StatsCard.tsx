type StatsCardProps = {
  label: string;
  value: string;
  helper?: string;
};

export function StatsCard({ label, value, helper }: StatsCardProps) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
      <p className="text-sm text-zinc-500">{label}</p>

      <div className="mt-4 flex items-end justify-between gap-4">
        <p className="text-3xl font-semibold tracking-tight text-white">
          {value}
        </p>

        {helper && (
          <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-400">
            {helper}
          </span>
        )}
      </div>
    </div>
  );
}
