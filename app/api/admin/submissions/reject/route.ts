import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing submission ID.' }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    // Update status in submitted_projects to 'rejected'
    const { error: updateError } = await supabase
      .from('submitted_projects')
      .update({ submission_status: 'rejected' })
      .eq('id', id)

    if (updateError) {
      console.error('[TRÆCERA] Error rejecting submission:', updateError)
      return NextResponse.json(
        { error: updateError.message || 'Failed to reject project submission.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[TRÆCERA] Reject submissions internal error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error.' },
      { status: 500 }
    )
  }
}
