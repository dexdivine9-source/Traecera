'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function AdminNavbar() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [trashCount, setTrashCount] = useState<number>(0)

  if (pathname === '/admin/login') {
    return null
  }

  useEffect(() => {
    async function loadTrashCount() {
      try {
        const { count } = await supabase
          .from('projects')
          .select('id', { count: 'exact', head: true })
          .not('deleted_at', 'is', null)

        if (typeof count === 'number') {
          setTrashCount(count)
        }
      } catch (err) {
        console.error('Error fetching trash count for navbar:', err)
      }
    }

    loadTrashCount()
  }, [pathname])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/admin/login')
      router.refresh()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const navLinks = [
    { href: '/admin', label: 'Dashboard', exact: true },
    { href: '/admin/projects', label: 'Projects', exact: false },
    { href: '/admin/submissions', label: 'Submissions', exact: false },
    { href: '/admin/logos', label: 'Logos', exact: false },
  ]

  const isTrashActive = pathname.startsWith('/admin/trash')

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#08080a]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Left Side: Brand & Links */}
        <div className="flex items-center gap-8">
          <Link href="/admin" className="flex items-center gap-2 group">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500"></span>
            </span>
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-violet-400 transition-colors font-display">
              TRÆCERA{' '}
              <span className="font-sans text-xs font-semibold text-zinc-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full ml-1.5">
                Admin
              </span>
            </span>
          </Link>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = link.exact
                ? pathname === link.href
                : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-white/10 text-white font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}

            {/* Trash Link with Count Badge */}
            <Link
              href="/admin/trash"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isTrashActive
                  ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30'
                  : 'text-zinc-400 hover:text-rose-300 hover:bg-rose-500/10'
              }`}
            >
              <Trash2 size={13} />
              <span>Trash</span>
              {trashCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {trashCount}
                </span>
              )}
            </Link>
          </nav>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-4">
          {/* Mobile Trash Link */}
          <Link
            href="/admin/trash"
            className={`flex md:hidden items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
              isTrashActive
                ? 'bg-rose-500/20 text-rose-300'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Trash2 size={14} />
            {trashCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300">
                {trashCount}
              </span>
            )}
          </Link>

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
