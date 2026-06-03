import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      name,
      description,
      category,
      status,
      country,
      website,
      x_link,
      github_url,
      program_address,
      wallet_address,
      team_lead_name,
      team_lead_twitter,
      is_doxxed,
      has_audit,
    } = body

    // 1. Validate required fields
    if (!name || !team_lead_name || !x_link) {
      return NextResponse.json(
        { error: 'Missing required fields. Project Name, Team Lead Name, and Twitter/X Link are required.' },
        { status: 400 }
      )
    }

    // 2. Initialize Supabase Admin client to bypass RLS for inserting reviews
    const supabase = getSupabaseAdminClient()

    // 3. Insert record into submitted_projects
    const { error: insertError } = await supabase
      .from('submitted_projects')
      .insert({
        name,
        description: description || null,
        category: category || null,
        status: status || null,
        country: country || null,
        website: website || null,
        x_link,
        github_url: github_url || null,
        program_address: program_address || null,
        wallet_address: wallet_address || null,
        team_lead_name,
        team_lead_twitter: team_lead_twitter || null,
        is_doxxed: Boolean(is_doxxed),
        has_audit: Boolean(has_audit),
        submission_status: 'pending',
      })

    if (insertError) {
      console.error('[TRÆCERA] Database submission insert error:', insertError)
      return NextResponse.json(
        { error: insertError.message || 'Failed to save project submission.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[TRÆCERA] Project submission internal error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error.' },
      { status: 500 }
    )
  }
}
