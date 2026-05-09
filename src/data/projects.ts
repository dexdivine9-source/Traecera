export interface ProjectMetrics {
  active_users: number;
  transaction_volume: number;
  growth_percent: number;
  onchain_activity: "Low" | "Medium" | "High";
  volume_24h?: number;
}

export interface Project {
  id: string;
  name: string;
  logo: string;
  description: string;
  country: string;
  x_link: string;
  category: string;
  status: "Live" | "Beta" | "Coming Soon";
  metrics: ProjectMetrics;
  trending_score: number;
  traecera_score?: number;
  score_breakdown?: {
    verification: number;
    status: number;
    completeness: number;
    onchain: number;
    activity: number;
  };
  last_updated: string;
}

function num(v: unknown): number {
  return typeof v === "number" && !Number.isNaN(v) ? v : 0;
}

/** Map a Supabase `projects` row (flat columns and/or nested `metrics` JSON) into the UI `Project` shape. */
export function mapSupabaseProjectRow(row: Record<string, unknown>): Project {
  const slug = typeof row.slug === "string" ? row.slug : "";
  const rawId = row.id;
  const id =
    slug ||
    (typeof rawId === "string" ? rawId : rawId != null ? String(rawId) : "");

  const metricsObj =
    row.metrics && typeof row.metrics === "object" && !Array.isArray(row.metrics)
      ? (row.metrics as Record<string, unknown>)
      : null;

  const active_users = num(row.active_users ?? metricsObj?.active_users);
  const transaction_volume = num(row.transaction_volume ?? metricsObj?.transaction_volume);
  const growth_percent = num(row.growth_percent ?? metricsObj?.growth_percent);
  const volume_24hRaw = row.volume_24h ?? metricsObj?.volume_24h;

  let onchain_activity: ProjectMetrics["onchain_activity"] = "Medium";
  const oa = row.onchain_activity ?? metricsObj?.onchain_activity;
  if (oa === "Low" || oa === "Medium" || oa === "High") {
    onchain_activity = oa;
  }

  let status: Project["status"] = "Live";
  const statusRaw = row.status;
  if (statusRaw === "Beta" || statusRaw === "Coming Soon" || statusRaw === "Live") {
    status = statusRaw;
  }

  return {
    id,
    name: typeof row.name === "string" ? row.name : "Untitled",
    logo: typeof row.logo === "string" ? row.logo : "",
    description: typeof row.description === "string" ? row.description : "",
    country: typeof row.country === "string" ? row.country : "",
    x_link: typeof row.x_link === "string" ? row.x_link : "",
    category: typeof row.category === "string" ? row.category : "Other",
    status,
    metrics: {
      active_users,
      transaction_volume,
      growth_percent,
      onchain_activity,
      ...(typeof volume_24hRaw === "number" ? { volume_24h: volume_24hRaw } : {}),
    },
    trending_score: num(row.trending_score ?? metricsObj?.trending_score),
    traecera_score: typeof row.traecera_score === "number" ? row.traecera_score : undefined,
    score_breakdown: typeof row.score_breakdown === "object" && row.score_breakdown !== null ? row.score_breakdown as any : undefined,
    last_updated:
      typeof row.last_updated === "string"
        ? row.last_updated
        : typeof row.metrics_updated_at === "string"
          ? row.metrics_updated_at
          : typeof row.created_at === "string"
            ? row.created_at
            : new Date().toISOString(),
  };
}
