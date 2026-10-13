import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin/require-admin'
import { getSupabaseAdminClient } from '@/lib/supabase-server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const { response: unauthorized } = await requireAdminSession()
  if (unauthorized) return unauthorized

  try {
    const supabase = getSupabaseAdminClient()
    const { count, error } = await supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .not('deleted_at', 'is', null)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ count: count ?? 0 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const { response: unauthorized } = await requireAdminSession()
  if (unauthorized) return unauthorized

  try {
    const body = await req.json().catch(() => ({}))
    const confirmation = typeof body.confirmation === 'string' ? body.confirmation.trim() : ''

    if (confirmation !== 'DELETE ALL') {
      return NextResponse.json(
        { error: 'Confirmation mismatch. Type "DELETE ALL" to empty trash.' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdminClient()

    // 1. Fetch all trashed projects
    const { data: trashed, error: fetchError } = await supabase
      .from('projects')
      .select('id, slug')
      .not('deleted_at', 'is', null)

    if (fetchError) {
      console.error('[TRÆCERA] Failed to fetch trashed projects for empty trash:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!trashed || trashed.length === 0) {
      return NextResponse.json({ success: true, count: 0 })
    }

    const ids = trashed.map((p) => p.id)

    // 2. Clean snapshots
    await supabase.from('project_metrics_snapshots').delete().in('project_id', ids)

    // 3. Clean cached logo files
    for (const p of trashed) {
      if (p.slug) {
        const logoPath = path.join(process.cwd(), 'public', 'projects', `${p.slug}.png`)
        if (fs.existsSync(logoPath)) {
          try {
            fs.unlinkSync(logoPath)
          } catch (e) {
            console.warn('[TRÆCERA] Warning unlinking project logo file:', e)
          }
        }
      }
    }

    // 4. Hard-delete all trashed rows
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .in('id', ids)

    if (deleteError) {
      console.error('[TRÆCERA] Failed to empty trash in Supabase:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, count: ids.length })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error.'
    console.error('[TRÆCERA] Empty trash internal error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
