import { createClient } from '@/lib/supabase/server'
import SubmissionsClient from './submissions-client'

export const dynamic = 'force-dynamic'

export default async function SubmissionsReviewPage() {
  const supabase = await createClient()

  // Fetch all submissions from submitted_projects ordered by submitted_at DESC
  const { data: submissions, error } = await supabase
    .from('submitted_projects')
    .select('*')
    .order('submitted_at', { ascending: false })

  if (error) {
    console.error('[TRÆCERA] Error fetching project submissions:', error)
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 font-display">Submissions Review Panel</h1>
        <p className="text-zinc-400 text-sm">Verify project data, examine Solana program IDs, and approve or reject submissions in real-time.</p>
      </div>

      <SubmissionsClient submissions={submissions || []} />
    </div>
  )
}
