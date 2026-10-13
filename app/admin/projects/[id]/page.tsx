import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { EditableProjectPayload } from '@/lib/admin/project-fields'
import ProjectEditForm from './project-edit-form'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ id: string }>
}

const SELECT_FIELDS = `
  id,
  name,
  slug,
  description,
  logo,
  country,
  category,
  status,
  website,
  x_link,
  github_url,
  program_address,
  wallet_address,
  data_source,
  verification_status,
  social_verified,
  product_verified,
  ecosystem_verified,
  onchain_verified,
  is_doxxed,
  has_audit,
  is_active,
  about,
  about_updated
`

function toFormPayload(row: Record<string, unknown>): EditableProjectPayload {
  return {
    name: typeof row.name === 'string' ? row.name : '',
    slug: typeof row.slug === 'string' ? row.slug : '',
    description: typeof row.description === 'string' ? row.description : null,
    logo: typeof row.logo === 'string' ? row.logo : null,
    country: typeof row.country === 'string' ? row.country : null,
    category: typeof row.category === 'string' ? row.category : null,
    status: typeof row.status === 'string' ? row.status : null,
    website: typeof row.website === 'string' ? row.website : null,
    x_link: typeof row.x_link === 'string' ? row.x_link : null,
    github_url: typeof row.github_url === 'string' ? row.github_url : null,
    program_address: typeof row.program_address === 'string' ? row.program_address : null,
    wallet_address: typeof row.wallet_address === 'string' ? row.wallet_address : null,
    data_source: typeof row.data_source === 'string' ? row.data_source : null,
    verification_status:
      typeof row.verification_status === 'string' ? row.verification_status : null,
    social_verified: Boolean(row.social_verified),
    product_verified: Boolean(row.product_verified),
    ecosystem_verified: Boolean(row.ecosystem_verified),
    onchain_verified: Boolean(row.onchain_verified),
    is_doxxed: Boolean(row.is_doxxed),
    has_audit: Boolean(row.has_audit),
    is_active: row.is_active == null ? true : Boolean(row.is_active),
    about: typeof row.about === 'string' ? row.about : null,
    about_updated: typeof row.about_updated === 'string' ? row.about_updated.slice(0, 10) : null,
  }
}

export default async function AdminProjectEditPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project, error } = await supabase
    .from('projects')
    .select(SELECT_FIELDS)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('[TRÆCERA] Error fetching project for edit:', error)
  }

  if (!project) notFound()

  return (
    <div className="space-y-10">
      <div>
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-semibold mb-4"
        >
          <ArrowLeft size={16} /> Back to Projects
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 font-display">
          Edit Project
        </h1>
        <p className="text-zinc-400 text-sm">
          Update listing metadata for{' '}
          <span className="text-violet-300 font-semibold">{project.name}</span>
        </p>
      </div>

      <ProjectEditForm projectId={project.id} initial={toFormPayload(project)} />
    </div>
  )
}
