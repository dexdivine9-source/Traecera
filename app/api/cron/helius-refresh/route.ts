import { NextResponse } from "next/server";
import { calculateHeliusMetrics, fetchHeliusTransactions } from "@/lib/helius";
import { listProgramAddresses, saveProjectMetrics } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const expectedSecret = process.env.CRON_SECRET;
  if (expectedSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const heliusApiKey = process.env.HELIUS_API_KEY;
  if (!heliusApiKey) return NextResponse.json({ error: "Missing HELIUS_API_KEY" }, { status: 500 });

  try {
    const addresses = await listProgramAddresses();
    const failures: Array<{ address: string; reason: string }> = [];
    let updated = 0;

    for (const address of addresses) {
      try {
        const transactions = await fetchHeliusTransactions(address, heliusApiKey);
        const metrics = calculateHeliusMetrics(transactions);
        await saveProjectMetrics(address, metrics);
        updated += 1;
      } catch (error) {
        failures.push({
          address,
          reason: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      total: addresses.length,
      updated,
      failed: failures.length,
      failures,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
