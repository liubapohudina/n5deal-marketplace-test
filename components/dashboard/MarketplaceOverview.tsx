import { BriefcaseBusiness, MessageSquare, Store, Users } from 'lucide-react';

type MarketplaceOverviewProps = {
  opportunities: number;
  buyers: number;
  sellers: number;
  messages: number;
};

const items = [
  {
    key: 'opportunities',
    label: 'Active Opportunities',
    helper: '+12% vs last month',
    icon: BriefcaseBusiness,
    iconClass: 'bg-violet-500/15 text-violet-300',
  },
  {
    key: 'buyers',
    label: 'Active Buyers',
    helper: '+8% vs last month',
    icon: Users,
    iconClass: 'bg-emerald-500/15 text-emerald-300',
  },
  {
    key: 'sellers',
    label: 'Active Sellers',
    helper: '+5% vs last month',
    icon: Store,
    iconClass: 'bg-orange-500/15 text-orange-300',
  },
  {
    key: 'messages',
    label: 'New Messages',
    helper: '+3 vs last week',
    icon: MessageSquare,
    iconClass: 'bg-fuchsia-500/15 text-fuchsia-300',
  },
] as const;

export function MarketplaceOverview({
  opportunities,
  buyers,
  sellers,
  messages,
}: MarketplaceOverviewProps) {
  const values = {
    opportunities,
    buyers,
    sellers,
    messages,
  };

  return (
    <section className="mt-6 overflow-hidden rounded-[30px] border border-white/[0.08] bg-[#111116] shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
      <div className="grid lg:grid-cols-[190px_repeat(4,1fr)]">
        <div className="flex items-center border-b border-white/[0.08] px-7 py-7 lg:border-b-0 lg:border-r">
          <div>
            <p className="text-sm font-medium text-zinc-500">Marketplace</p>

            <h3 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-white">
              Overview
            </h3>
          </div>
        </div>

        {items.map((item, index) => {
          const Icon = item.icon;
          const value = values[item.key];

          return (
            <div
              key={item.key}
              className={`flex items-center gap-4 px-6 py-6 ${
                index !== items.length - 1
                  ? 'border-b border-white/[0.08] lg:border-b-0 lg:border-r'
                  : ''
              }`}
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${item.iconClass}`}
              >
                <Icon size={21} />
              </div>

              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold tracking-[-0.03em] text-white">
                    {value}
                  </span>
                </div>

                <p className="mt-1 text-sm text-zinc-400">{item.label}</p>

                <p className="mt-1 text-xs font-medium text-emerald-400">
                  ↗ {item.helper}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
