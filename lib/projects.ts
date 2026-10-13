import { supabase } from './supabase'

// Get all projects (active only)
export async function getAllProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('Full Supabase error:', 
      JSON.stringify(error, Object.getOwnPropertyNames(error))
    )
    throw error
  }

  console.log('Projects fetched:', data?.length)
  return data
}

// Get single project by slug (active only)
export async function getProjectBySlug(slug: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .is('deleted_at', null)
    .single()
  
  if (error) throw error
  return data
}

// Get projects by category (active only)
export async function getProjectsByCategory(category: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('category', category)
    .is('deleted_at', null)

  if (error) throw error
  return data
}

// Get Institutional-tier projects (admin-curated: directory_tier = 'institutional', active only)
export async function getInstitutionalProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('directory_tier', 'institutional')
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Full Supabase error:',
      JSON.stringify(error, Object.getOwnPropertyNames(error))
    )
    throw error
  }

  return data
}

// Get Innovation-tier projects (default tier: directory_tier = 'innovation', active only)
export async function getInnovationProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('directory_tier', 'innovation')
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Full Supabase error:',
      JSON.stringify(error, Object.getOwnPropertyNames(error))
    )
    throw error
  }

  return data
}

// Get metrics snapshots for a project ordered by snapshot_date (active history)
export async function getProjectSnapshots(projectId: string) {
  const { data, error } = await supabase
    .from('project_metrics_snapshots')
    .select('*')
    .eq('project_id', projectId)
    .order('snapshot_date', { ascending: true })

  if (error) {
    console.error('[TRÆCERA] Error fetching project snapshots:', error)
    return []
  }

  return data ?? []
}
