import { createClient } from '@/lib/supabase/server'
import { Layers, Clock, ShieldCheck, ArrowRight, Image, Inbox, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Fetch counts in parallel using server-side client
  const [totalRes, pendingRes, verifiedRes] = await Promise.all([
    supabase.from('projects').select('id', { count: 'exact', head: true }),
    supabase.from('submitted_projects').select('id', { count: 'exact', head: true }).eq('submission_status', 'pending'),
    supabase.from('projects').select('id', { count: 'exact', head: true }).eq('verification_status', 'verified'),
  ])

  if (totalRes.error || pendingRes.error || verifiedRes.error) {
    console.error('Error fetching dashboard counts:', {
      totalError: totalRes.error,
      pendingError: pendingRes.error,
      verifiedError: verifiedRes.error,
    })
  }

  const totalProjects = totalRes.count ?? 0
  const pendingSubmissions = pendingRes.count ?? 0
  const verifiedProjects = verifiedRes.count ?? 0

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 font-display">Dashboard Overview</h1>
          <p className="text-zinc-400 text-sm">Real-time statistics and curation controls for the TRÆCERA intelligence layer.</p>
        </div>
        <Link 
          href="/admin/submissions"
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white px-5 py-3 text-sm font-semibold transition-all duration-200 shadow-[0_0_15px_rgba(139,92,246,0.15)] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] shrink-0 cursor-pointer"
        >
          Review Submissions
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Projects Card */}
        <div className="bg-[#0c0c0f]/60 border border-white/5 backdrop-blur-md p-6 rounded-2xl shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/10 transition-colors duration-300" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">Total Projects</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Layers size={18} />
            </div>
          </div>
          <div className="text-4xl font-bold text-white font-mono">{totalProjects}</div>
          <p className="text-xs text-zinc-500 mt-2">Registered in the TRÆCERA directory</p>
        </div>

        {/* Pending Submissions Card */}
        <Link href="/admin/submissions" className="bg-[#0c0c0f]/60 border border-white/5 hover:border-amber-500/20 backdrop-blur-md p-6 rounded-2xl shadow-xl relative overflow-hidden group transition-all duration-300 block cursor-pointer">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-colors duration-300" />
          {pendingSubmissions > 0 && (
            <div className="absolute top-3 left-3 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </div>
          )}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">Pending Reviews</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Clock size={18} />
            </div>
          </div>
          <div className="text-4xl font-bold text-white font-mono">{pendingSubmissions}</div>
          <p className="text-xs text-zinc-500 mt-2">Founders waiting for verification approval</p>
        </Link>

        {/* Verified Projects Card */}
        <div className="bg-[#0c0c0f]/60 border border-white/5 backdrop-blur-md p-6 rounded-2xl shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-300" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">Verified Listings</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="text-4xl font-bold text-white font-mono">{verifiedProjects}</div>
          <p className="text-xs text-zinc-500 mt-2">Passed Level 1-4 validation steps</p>
        </div>
      </div>

      {/* Curation Portals / Actions */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white font-display">Curation Portals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Submissions Portal Card */}
          <Link href="/admin/submissions" className="group">
            <div className="h-full bg-[#0c0c0f]/60 border border-white/5 hover:border-violet-500/20 hover:bg-[#121217]/60 transition-all duration-300 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400">
                    <Inbox size={20} />
                  </div>
                  <h3 className="font-bold text-white group-hover:text-violet-400 transition-colors text-lg">Project Submissions Queue</h3>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                  Review and verify submitted Solana projects built across the African continent. Approve details, inspect programs, and publish them to the active rankings leaderboard.
                </p>
              </div>
              <div className="flex items-center text-xs font-semibold text-violet-400 gap-1.5 font-mono uppercase tracking-wider">
                Manage Queue <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Logo Fixer Card */}
          <Link href="/admin/logos" className="group">
            <div className="h-full bg-[#0c0c0f]/60 border border-white/5 hover:border-fuchsia-500/20 hover:bg-[#121217]/60 transition-all duration-300 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-fuchsia-500/10 text-fuchsia-400">
                    <Image size={20} />
                  </div>
                  <h3 className="font-bold text-white group-hover:text-fuchsia-400 transition-colors text-lg">Logo Resolution Tool</h3>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                  Resolve and fix missing or broken project avatars. Fetch remote avatars (via Twitter or clearbit APIs), download, and cache them locally in the public folder.
                </p>
              </div>
              <div className="flex items-center text-xs font-semibold text-fuchsia-400 gap-1.5 font-mono uppercase tracking-wider">
                Resolve Logos <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
