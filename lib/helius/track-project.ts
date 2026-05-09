import { getSupabaseAdminClient } from "../supabase-server";

export type TrackingMode = 'program' | 'wallet' | 'none';

export interface TrackingResult {
  tracking_mode: TrackingMode;
  address_used: string | null;
  transaction_count: number;
  unique_wallets: number;
  volume_usd: number;
  last_active_date: string | null;
  data_source: 'onchain_verified' | 'reported' | 'estimated' | 'mock';
  confidence: 'high' | 'medium' | 'low';
  disclaimer?: string;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchHeliusWithRetry(address: string) {
  const apiKey = process.env.HELIUS_API_KEY;
  if (!apiKey) {
    throw new Error("Missing HELIUS_API_KEY");
  }

  const url = `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${apiKey}&limit=100`;
  
  let response = await fetch(url);
  
  if (response.status === 429) {
    console.warn(`[trackProject] Helius rate limit hit for ${address}, waiting 1 second...`);
    await sleep(1000);
    response = await fetch(url);
  }
  
  if (response.status === 404) {
    return null; // Invalid address / not found
  }
  
  if (!response.ok) {
    throw new Error(`Helius returned ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

function calculateMetricsFromTransactions(transactions: any[]) {
  if (!transactions || transactions.length === 0) {
    return {
      transaction_count: 0,
      unique_wallets: 0,
      volume_usd: 0,
      last_active_date: null
    };
  }

  const uniqueSigners = new Set<string>();
  let volume_usd = 0;
  
  for (const tx of transactions) {
    if (tx.feePayer) {
      uniqueSigners.add(tx.feePayer);
    }
    
    // Summing TokenTransfers for USDC and USDT
    if (tx.tokenTransfers && Array.isArray(tx.tokenTransfers)) {
      for (const transfer of tx.tokenTransfers) {
        if (
          transfer.mint === "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" || // USDC
          transfer.mint === "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"   // USDT
        ) {
          volume_usd += (transfer.tokenAmount || 0);
        }
      }
    }
  }

  return {
    transaction_count: transactions.length,
    unique_wallets: uniqueSigners.size,
    volume_usd: volume_usd,
    last_active_date: new Date(transactions[0].timestamp * 1000).toISOString()
  };
}

export async function trackProject(project: {
  name: string;
  program_address?: string;
  wallet_address?: string;
}): Promise<TrackingResult> {
  const result: TrackingResult = {
    tracking_mode: 'none',
    address_used: null,
    transaction_count: 0,
    unique_wallets: 0,
    volume_usd: 0,
    last_active_date: null,
    data_source: 'mock',
    confidence: 'low'
  };

  try {
    let mode: TrackingMode = 'none';
    let targetAddress = null;
    let dataSource: TrackingResult['data_source'] = 'mock';
    let confidence: TrackingResult['confidence'] = 'low';
    let disclaimer = undefined;

    if (project.program_address) {
      mode = 'program';
      targetAddress = project.program_address;
      dataSource = 'onchain_verified';
      confidence = 'high';
    } else if (project.wallet_address) {
      mode = 'wallet';
      targetAddress = project.wallet_address;
      dataSource = 'reported';
      confidence = 'medium';
      disclaimer = "Wallet tracking shows treasury activity only. Full user metrics require program address.";
    }

    if (targetAddress && mode !== 'none') {
      const transactions = await fetchHeliusWithRetry(targetAddress);
      
      if (transactions === null) {
        mode = 'none';
        dataSource = 'mock';
        confidence = 'low';
      } else {
        const metrics = calculateMetricsFromTransactions(transactions);
        
        result.tracking_mode = mode;
        result.address_used = targetAddress;
        result.transaction_count = metrics.transaction_count;
        result.unique_wallets = metrics.unique_wallets;
        result.volume_usd = metrics.volume_usd;
        result.last_active_date = metrics.last_active_date;
        result.data_source = dataSource;
        result.confidence = confidence;
        if (disclaimer) result.disclaimer = disclaimer;

        const supabase = getSupabaseAdminClient();
        const { error } = await supabase
          .from(process.env.SUPABASE_PROJECTS_TABLE ?? "projects")
          .update({
            tracking_mode: result.tracking_mode,
            data_source: result.data_source,
            active_users: result.unique_wallets,
            transaction_volume: result.volume_usd,
            updated_at: new Date().toISOString()
          })
          .eq('name', project.name);

        if (error) {
          console.error(`[trackProject] Failed to update project ${project.name} in Supabase`, error);
        }
      }
    }
  } catch (error) {
    console.error(`[trackProject] Pipeline failed for ${project.name}, returning mock fallback`, error);
  }

  return result;
}
