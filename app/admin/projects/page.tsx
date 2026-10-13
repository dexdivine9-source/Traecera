import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ProjectsClient from './projects-client'

export const dynamic = 'force-dynamic'

export default async function AdminProjectsPage() {
  const supabase = await createClient()

  const [{ data: projects, error }, { count: trashCount }] = await Promise.all([
    supabase
      .from('projects')
      .select('id, name, slug, category, status, country, verification_status, is_active')
      .is('deleted_at', null)
      .order('name', { ascending: true }),
    supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .not('deleted_at', 'is', null),
  ])

  if (error) {
    console.error('[TRÆCERA] Error fetching projects for admin list:', error)
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-semibold mb-4"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 font-display">
            Manage Projects
          </h1>
          <p className="text-zinc-400 text-sm">
            Search and edit active listings in the TRÆCERA directory.
          </p>
        </div>

        <Link
          href="/admin/trash"
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 border border-white/10 hover:border-rose-500/30 text-zinc-300 hover:text-white px-4 py-2.5 text-xs font-semibold transition-all self-start sm:self-auto"
        >
          <span>View Trash</span>
          {(trashCount ?? 0) > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {trashCount}
            </span>
          )}
        </Link>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 p-4 text-sm">
          Failed to load projects: {error.message}
        </div>
      ) : (
        <ProjectsClient projects={projects || []} />
      )}
    </div>
  )
}
