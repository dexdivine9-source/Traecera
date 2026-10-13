import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/** Ensures the request has a logged-in Supabase user. Does not use the service role. */
export async function requireAdminSession() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      user: null,
      response: NextResponse.json({ error: 'Unauthorized. Admin login required.' }, { status: 401 }),
    }
  }

  return { user, response: null }
}
