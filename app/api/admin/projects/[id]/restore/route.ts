import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin/require-admin'
import { getSupabaseAdminClient } from '@/lib/supabase-server'

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { response: unauthorized } = await requireAdminSession()
  if (unauthorized) return unauthorized

  try {
    const { id } = await context.params
    if (!id) {
      return NextResponse.json({ error: 'Missing project id.' }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    // 1. Fetch current project
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('id, name, slug, deleted_at')
      .eq('id', id)
      .maybeSingle()

    if (fetchError) {
      console.error('[TRÆCERA] Error fetching project for restore:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
    }

    if (!project.deleted_at) {
      return NextResponse.json({ error: 'Project is already active (not in trash).' }, { status: 400 })
    }

    // 2. Restore by setting deleted_at = null
    const { error: restoreError } = await supabase
      .from('projects')
      .update({ deleted_at: null })
      .eq('id', id)

    if (restoreError) {
      console.error('[TRÆCERA] Failed to restore project:', restoreError)
      return NextResponse.json({ error: restoreError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      restored: true,
      id: project.id,
      name: project.name,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error.'
    console.error('[TRÆCERA] Restore project internal error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
