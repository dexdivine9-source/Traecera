import { createClient } from "@supabase/supabase-js";
import type { HeliusMetrics } from "./helius";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const PROJECTS_TABLE = process.env.SUPABASE_PROJECTS_TABLE ?? "projects";
const SNAPSHOTS_TABLE = process.env.SUPABASE_METRICS_TABLE ?? "project_metrics_snapshots";

export function getSupabaseServerClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function getSupabaseAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function listProgramAddresses(limit = 500): Promise<string[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from(PROJECTS_TABLE)
    .select("program_address")
    .not("program_address", "is", null)
    .limit(limit);

  if (error) throw new Error(`Failed to fetch program addresses: ${error.message}`);

  return (data ?? [])
    .map((row) => row.program_address as string | null)
    .filter((address): address is string => Boolean(address));
}

export async function saveProjectMetrics(programAddress: string, metrics: HeliusMetrics) {
  const supabase = getSupabaseAdminClient();
  const updatedAt = new Date().toISOString();

  const { data: project, error: lookupError } = await supabase
    .from(PROJECTS_TABLE)
    .select("id")
    .eq("program_address", programAddress)
    .maybeSingle();

  if (lookupError) throw new Error(`Failed to lookup project: ${lookupError.message}`);
  if (!project?.id) throw new Error(`Project not found for program_address: ${programAddress}`);

  const { error: updateError } = await supabase
    .from(PROJECTS_TABLE)
    .update({
      transaction_volume: metrics.transaction_volume,
      active_users: metrics.active_users,
      volume_24h: metrics.volume_24h,
      growth_percent: metrics.growth_percent,
      metrics_updated_at: updatedAt,
    })
    .eq("id", project.id);

  if (updateError) throw new Error(`Failed to update project metrics: ${updateError.message}`);

  const { error: snapshotError } = await supabase.from(SNAPSHOTS_TABLE).insert({
    project_id: project.id,
    program_address: programAddress,
    transaction_volume: metrics.transaction_volume,
    active_users: metrics.active_users,
    volume_24h: metrics.volume_24h,
    growth_percent: metrics.growth_percent,
    tx_count_60d: metrics.tx_count_60d,
    collected_at: updatedAt,
  });

  if (snapshotError) throw new Error(`Failed to insert metrics snapshot: ${snapshotError.message}`);

  return { projectId: project.id, updatedAt };
}
