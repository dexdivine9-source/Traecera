import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import TrashClient from './trash-client'

export const dynamic = 'force-dynamic'

export default async function AdminTrashPage() {
  const supabase = await createClient()

  const { data: trashedProjects, error } = await supabase
    .from('projects')
    .select('id, name, slug, category, status, country, deleted_at')
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false })

  if (error) {
    console.error('[TRÆCERA] Error fetching trashed projects:', error)
  }

  return (
    <div className="space-y-10">
      <div>
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-semibold mb-4"
        >
          <ArrowLeft size={16} /> Back to Projects
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 font-display flex items-center gap-3">
          Project Trash
          {(trashedProjects?.length ?? 0) > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {trashedProjects?.length}
            </span>
          )}
        </h1>
        <p className="text-zinc-400 text-sm">
          Soft-deleted projects hidden from the public directory. Restore them back to active status or delete them permanently.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 p-4 text-sm">
          Failed to load trashed projects: {error.message}
        </div>
      ) : (
        <TrashClient initialProjects={trashedProjects || []} />
      )}
    </div>
  )
}
