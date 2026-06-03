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

    // 1. Fetch submission record from submitted_projects
    const { data: submission, error: fetchError } = await supabase
      .from('submitted_projects')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !submission) {
      console.error('[TRÆCERA] Error fetching submission for approval:', fetchError)
      return NextResponse.json(
        { error: fetchError?.message || 'Submission record not found.' },
        { status: 404 }
      )
    }

    // 2. Auto-generate URL slug from name: lowercase, spaces/special characters to hyphens
    const slug = submission.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // 3. Copy submission into active projects table
    const { error: insertError } = await supabase
      .from('projects')
      .insert({
        name: submission.name,
        slug,
        description: submission.description,
        category: submission.category,
        status: submission.status,
        country: submission.country,
        website: submission.website,
        x_link: submission.x_link,
        github_url: submission.github_url,
        program_address: submission.program_address,
        wallet_address: submission.wallet_address,
        team_lead_name: submission.team_lead_name,
        team_lead_twitter: submission.team_lead_twitter,
        is_doxxed: Boolean(submission.is_doxxed),
        has_audit: Boolean(submission.has_audit),
        verification_status: 'pending',
        data_source: 'reported',
        social_verified: false,
        is_active: true,
      })

    if (insertError) {
      console.error('[TRÆCERA] Error copying submission to projects:', insertError)
      return NextResponse.json(
        { error: insertError.message || 'Failed to create project listing from submission.' },
        { status: 500 }
      )
    }

    // 4. Update status in submitted_projects to 'approved'
    const { error: updateError } = await supabase
      .from('submitted_projects')
      .update({ submission_status: 'approved' })
      .eq('id', id)

    if (updateError) {
      console.error('[TRÆCERA] Error updating submission status:', updateError)
      return NextResponse.json(
        { error: updateError.message || 'Project created but failed to update submission queue status.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[TRÆCERA] Approve submissions internal error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error.' },
      { status: 500 }
    )
  }
}
