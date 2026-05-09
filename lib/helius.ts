const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

type HeliusTokenTransfer = {
  mint?: string;
  tokenAmount?: number | string;
  fromUserAccount?: string;
  toUserAccount?: string;
};

type HeliusNativeTransfer = {
  fromUserAccount?: string;
  toUserAccount?: string;
};

export type HeliusTransaction = {
  signature?: string;
  timestamp?: number;
  feePayer?: string;
  tokenTransfers?: HeliusTokenTransfer[];
  nativeTransfers?: HeliusNativeTransfer[];
  accountData?: Array<{ account?: string }>;
};

export type HeliusMetrics = {
  transaction_volume: number;
  active_users: number;
  volume_24h: number;
  growth_percent: number;
  tx_count_60d: number;
};

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function timestampMs(tx: HeliusTransaction): number | null {
  if (!tx.timestamp || !Number.isFinite(tx.timestamp)) return null;
  return tx.timestamp * 1000;
}

function usdcVolume(tx: HeliusTransaction): number {
  return (tx.tokenTransfers ?? []).reduce((sum, transfer) => {
    if (transfer.mint !== USDC_MINT) return sum;
    return sum + Math.abs(toNumber(transfer.tokenAmount));
  }, 0);
}

function collectWallets(tx: HeliusTransaction, wallets: Set<string>) {
  if (tx.feePayer) wallets.add(tx.feePayer);
  for (const transfer of tx.tokenTransfers ?? []) {
    if (transfer.fromUserAccount) wallets.add(transfer.fromUserAccount);
    if (transfer.toUserAccount) wallets.add(transfer.toUserAccount);
  }
  for (const transfer of tx.nativeTransfers ?? []) {
    if (transfer.fromUserAccount) wallets.add(transfer.fromUserAccount);
    if (transfer.toUserAccount) wallets.add(transfer.toUserAccount);
  }
  for (const account of tx.accountData ?? []) {
    if (account.account) wallets.add(account.account);
  }
}

export async function fetchHeliusTransactions(address: string, apiKey: string, maxPages = 25): Promise<HeliusTransaction[]> {
  const transactions: HeliusTransaction[] = [];
  let before: string | undefined;
  const cutoff = Date.now() - 60 * 24 * 60 * 60 * 1000;

  for (let page = 0; page < maxPages; page += 1) {
    const url = new URL(`https://api.helius.xyz/v0/addresses/${address}/transactions`);
    url.searchParams.set("api-key", apiKey);
    url.searchParams.set("limit", "100");
    if (before) url.searchParams.set("before", before);

    const response = await fetch(url.toString(), { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Helius request failed: ${response.status} ${response.statusText}`);
    }

    const batch = (await response.json()) as HeliusTransaction[];
    if (!Array.isArray(batch) || batch.length === 0) break;
    transactions.push(...batch);

    const last = batch[batch.length - 1];
    before = last?.signature;
    if (!before) break;

    const lastTs = timestampMs(last);
    if (lastTs !== null && lastTs < cutoff) break;
  }

  return transactions;
}

export function calculateHeliusMetrics(transactions: HeliusTransaction[], nowMs = Date.now()): HeliusMetrics {
  const wallets = new Set<string>();
  const oneDayAgo = nowMs - 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = nowMs - 30 * 24 * 60 * 60 * 1000;
  const sixtyDaysAgo = nowMs - 60 * 24 * 60 * 60 * 1000;

  let transactionVolume = 0;
  let volume24h = 0;
  let last30dVolume = 0;
  let previous30dVolume = 0;
  let txCount60d = 0;

  for (const tx of transactions) {
    collectWallets(tx, wallets);
    const txMs = timestampMs(tx);
    if (txMs === null || txMs < sixtyDaysAgo) continue;

    const volume = usdcVolume(tx);
    txCount60d += 1;
    transactionVolume += volume;

    if (txMs >= oneDayAgo) volume24h += volume;
    if (txMs >= thirtyDaysAgo) last30dVolume += volume;
    if (txMs < thirtyDaysAgo) previous30dVolume += volume;
  }

  const growth =
    previous30dVolume > 0
      ? ((last30dVolume - previous30dVolume) / previous30dVolume) * 100
      : last30dVolume > 0
        ? 100
        : 0;

  return {
    transaction_volume: Number(transactionVolume.toFixed(2)),
    active_users: wallets.size,
    volume_24h: Number(volume24h.toFixed(2)),
    growth_percent: Number(growth.toFixed(2)),
    tx_count_60d: txCount60d,
  };
}
