import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ProjectsClient from './projects-client'

export const dynamic = 'force-dynamic'

export default async function AdminProjectsPage() {
  const supabase = await createClient()

  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, name, slug, category, status, country, verification_status, is_active')
    .order('name', { ascending: true })

  if (error) {
    console.error('[TRÆCERA] Error fetching projects for admin list:', error)
  }

  return (
    <div className="space-y-10">
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
          Search and edit existing listings in the TRÆCERA directory.
        </p>
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
