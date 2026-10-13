import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin/require-admin'
import { validateEditableProjectPayload } from '@/lib/admin/project-fields'
import { getSupabaseAdminClient } from '@/lib/supabase-server'

export async function PATCH(
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

    const body = (await req.json()) as Record<string, unknown>
    const validated = validateEditableProjectPayload(body)
    if (validated.error || !validated.data) {
      return NextResponse.json({ error: validated.error || 'Invalid payload.' }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from('projects')
      .update(validated.data)
      .eq('id', id)
      .select('id')
      .maybeSingle()

    if (error) {
      console.error('[TRÆCERA] Failed to update project:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to update project.' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error.'
    console.error('[TRÆCERA] Update project internal error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
