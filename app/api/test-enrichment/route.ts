import { enrichProject } from '@/lib/enrichment/enrich-project'

export const dynamic = 'force-dynamic'; // Prevent Next.js from caching this test route

export async function GET() {
  const result = await enrichProject({
    name: "Zypp Protocol",
    website: "https://zypp.fun",
    github_url: "https://github.com/zyppprotocol"
  })
  
  return Response.json(result)
}
