import { runDiscoveryEngine } from '@/lib/discovery/discovery-engine'

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const result = await runDiscoveryEngine()
  return Response.json(result)
}
