'use client'

import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'

export default function AdminNavbar() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  if (pathname === '/admin/login') {
    return null
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/admin/login')
      router.refresh()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#08080a]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Left Side: Brand */}
        <Link href="/admin" className="flex items-center gap-2 group">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500"></span>
          </span>
          <span className="text-lg font-bold tracking-tight text-white group-hover:text-violet-400 transition-colors font-display">
            TRÆCERA <span className="font-sans text-xs font-semibold text-zinc-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full ml-1.5">Admin</span>
          </span>
        </Link>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="hidden sm:inline-flex items-center text-xs font-semibold text-zinc-400 hover:text-white uppercase tracking-wider font-mono transition-colors mr-2"
          >
            Ecosystem Site →
          </Link>
          
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
          >
            <LogOut size={14} className="text-zinc-400 group-hover:text-white" />
            Sign Out
          </button>
        </div>
      </div>
    </header>
  )
}
