import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin/require-admin'
import { validateEditableProjectPayload } from '@/lib/admin/project-fields'
import { getSupabaseAdminClient } from '@/lib/supabase-server'
import fs from 'fs'
import path from 'path'

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

    // Strip virtual/non-existent columns before updating database table
    const { product_verified, onchain_verified, ...dbPayload } = validated.data

    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from('projects')
      .update(dbPayload)
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

export async function DELETE(
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

    const url = new URL(req.url)
    const isPermanent = url.searchParams.get('permanent') === 'true'
    const supabase = getSupabaseAdminClient()

    // 1. Fetch current project record
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('id, name, slug, deleted_at')
      .eq('id', id)
      .maybeSingle()

    if (fetchError) {
      console.error('[TRÆCERA] Error fetching project for deletion:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
    }

    // --- Soft Delete ---
    if (!isPermanent) {
      const { error: updateError } = await supabase
        .from('projects')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (updateError) {
        console.error('[TRÆCERA] Failed to soft-delete project:', updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        softDeleted: true,
        id: project.id,
        name: project.name,
      })
    }

    // --- Permanent Delete ---
    // Require confirmation slug in body
    let confirmationSlug = ''
    try {
      const body = await req.json()
      confirmationSlug = typeof body.slug === 'string' ? body.slug.trim() : ''
    } catch {
      confirmationSlug = ''
    }

    if (confirmationSlug !== project.slug) {
      return NextResponse.json(
        {
          error: `Slug confirmation mismatch. Expected "${project.slug}", received "${confirmationSlug}".`,
        },
        { status: 400 }
      )
    }

    // Check and clean up related records in other tables
    // 1. project_metrics_snapshots (references projects(id))
    const { error: snapshotError } = await supabase
      .from('project_metrics_snapshots')
      .delete()
      .eq('project_id', id)

    if (snapshotError) {
      console.warn('[TRÆCERA] Warning deleting snapshots for project:', snapshotError)
    }

    // 2. Remove locally cached logo file if present (fail-safe for read-only/serverless filesystems)
    try {
      if (project.slug) {
        const logoPath = path.join(process.cwd(), 'public', 'projects', `${project.slug}.png`)
        if (fs.existsSync(logoPath)) {
          fs.unlinkSync(logoPath)
        }
      }
    } catch (e) {
      console.warn('[TRÆCERA] Non-fatal warning unlinking project logo file:', e)
    }

    // 3. Delete row from projects table
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('[TRÆCERA] Failed to permanently delete project:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      permanentlyDeleted: true,
      id: project.id,
      name: project.name,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error.'
    console.error('[TRÆCERA] Delete project internal error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
