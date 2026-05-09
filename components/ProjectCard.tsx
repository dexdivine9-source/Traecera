type ProjectCardProps = {
  project: {
    name: string;
    description: string | null;
    transaction_volume: number | null;
    active_users: number | null;
    volume_24h: number | null;
    growth_percent: number | null;
    metrics_updated_at: string | null;
  };
};

function formatMoney(value: number | null | undefined) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

function formatNumber(value: number | null | undefined) {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const growth = project.growth_percent ?? 0;
  const growthClass = growth >= 0 ? "text-emerald-400" : "text-red-400";

  return (
    <section className="rounded-xl border border-white/10 bg-zinc-900/60 p-6">
      <h1 className="text-2xl font-semibold text-white">{project.name}</h1>
      {project.description ? <p className="mt-2 text-zinc-300">{project.description}</p> : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm text-zinc-400">Transaction volume</p>
          <p className="text-lg font-medium text-white">{formatMoney(project.transaction_volume)}</p>
        </div>
        <div>
          <p className="text-sm text-zinc-400">Active users</p>
          <p className="text-lg font-medium text-white">{formatNumber(project.active_users)}</p>
        </div>
        <div>
          <p className="text-sm text-zinc-400">24h volume</p>
          <p className="text-lg font-medium text-white">{formatMoney(project.volume_24h)}</p>
        </div>
        <div>
          <p className="text-sm text-zinc-400">30d growth</p>
          <p className={`text-lg font-medium ${growthClass}`}>{growth.toFixed(2)}%</p>
        </div>
      </div>

      {project.metrics_updated_at ? (
        <p className="mt-6 text-xs text-zinc-500">
          Last updated: {new Date(project.metrics_updated_at).toLocaleString()}
        </p>
      ) : null}
    </section>
  );
}
