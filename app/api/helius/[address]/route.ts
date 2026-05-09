import { NextResponse } from "next/server";
import { calculateHeliusMetrics, fetchHeliusTransactions } from "@/lib/helius";
import { saveProjectMetrics } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET(_: Request, context: { params: Promise<{ address: string }> }) {
  const { address } = await context.params;
  if (!address) return NextResponse.json({ error: "Missing address path parameter" }, { status: 400 });

  const heliusApiKey = process.env.HELIUS_API_KEY;
  if (!heliusApiKey) return NextResponse.json({ error: "Missing HELIUS_API_KEY" }, { status: 500 });

  try {
    const transactions = await fetchHeliusTransactions(address, heliusApiKey);
    const metrics = calculateHeliusMetrics(transactions);
    const persisted = await saveProjectMetrics(address, metrics);

    return NextResponse.json({
      address,
      metrics,
      persisted,
      transaction_count: transactions.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message, address }, { status: 500 });
  }
}
