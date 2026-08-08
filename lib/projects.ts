import { supabase } from './supabase'

// Get all projects
export async function getAllProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
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

// Get single project by slug
export async function getProjectBySlug(slug: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) throw error
  return data
}

// Get projects by category
export async function getProjectsByCategory(category: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('category', category)

  if (error) throw error
  return data
}

// Get Institutional-tier projects (admin-curated: directory_tier = 'institutional')
export async function getInstitutionalProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('directory_tier', 'institutional')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Full Supabase error:',
      JSON.stringify(error, Object.getOwnPropertyNames(error))
    )
    throw error
  }

  return data
}

// Get Innovation-tier projects (default tier: directory_tier = 'innovation')
export async function getInnovationProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('directory_tier', 'innovation')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Full Supabase error:',
      JSON.stringify(error, Object.getOwnPropertyNames(error))
    )
    throw error
  }

  return data
}
