'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Check, 
  X, 
  Clock, 
  ShieldAlert, 
  ExternalLink, 
  Twitter, 
  Globe2, 
  User, 
  Calendar, 
  Lock, 
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react'

interface Submission {
  id: string
  name: string
  description: string | null
  category: string | null
  status: string | null
  country: string | null
  website: string | null
  x_link: string
  github_url: string | null
  program_address: string | null
  wallet_address: string | null
  team_lead_name: string
  team_lead_twitter: string | null
  is_doxxed: boolean
  has_audit: boolean
  submission_status: 'pending' | 'approved' | 'rejected'
  submitted_at: string
}

interface SubmissionsClientProps {
  submissions: Submission[]
}

type TabType = 'all' | 'pending' | 'approved' | 'rejected'

export default function SubmissionsClient({ submissions }: SubmissionsClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Filter submissions by tab status
  const filteredSubmissions = submissions.filter((item) => {
    if (activeTab === 'all') return true
    return item.submission_status === activeTab
  })

  // Action count badges
  const counts = {
    all: submissions.length,
    pending: submissions.filter((s) => s.submission_status === 'pending').length,
    approved: submissions.filter((s) => s.submission_status === 'approved').length,
    rejected: submissions.filter((s) => s.submission_status === 'rejected').length,
  }

  const handleApprove = async (id: string) => {
    if (processingId) return
    setProcessingId(id)
    setError(null)

    try {
      const res = await fetch('/api/admin/submissions/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to approve project.')
      }

      router.refresh()
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Failed to approve submission.')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (id: string) => {
    if (processingId) return
    setProcessingId(id)
    setError(null)

    try {
      const res = await fetch('/api/admin/submissions/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reject project.')
      }

      router.refresh()
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Failed to reject submission.')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <AlertCircle className="shrink-0 mt-0.5" size={16} />
          <div>
            <span className="font-semibold">Review panel error: </span>
            {error}
          </div>
        </div>
      )}

      {/* Tabs list */}
      <div className="flex flex-wrap items-center border-b border-white/5 pb-px gap-1">
        {(['all', 'pending', 'approved', 'rejected'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-semibold tracking-wide border-b-2 capitalize transition-all relative cursor-pointer ${
              activeTab === tab
                ? 'border-violet-500 text-white font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab}
            <span className={`ml-2 text-xs font-mono px-1.5 py-0.5 rounded-full ${
              activeTab === tab 
                ? 'bg-violet-500/20 text-violet-400' 
                : 'bg-zinc-800 text-zinc-500'
            }`}>
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Grid listing submissions */}
      <div className="grid grid-cols-1 gap-6">
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-20 bg-[#0c0c0f]/40 border border-white/5 rounded-2xl">
            <Clock className="mx-auto text-zinc-600 mb-4" size={36} />
            <h3 className="text-white font-bold text-lg mb-1">Queue is Empty</h3>
            <p className="text-zinc-500 text-sm">No submissions matching the &quot;{activeTab}&quot; filter were found.</p>
          </div>
        ) : (
          filteredSubmissions.map((item) => (
            <div
              key={item.id}
              className={`bg-[#0c0c0f]/60 border border-white/5 backdrop-blur-md rounded-2xl shadow-xl p-6 transition-all relative overflow-hidden ${
                item.submission_status === 'pending'
                  ? 'border-l-4 border-l-amber-500'
                  : item.submission_status === 'approved'
                  ? 'border-l-4 border-l-emerald-500'
                  : 'border-l-4 border-l-rose-500'
              }`}
            >
              {/* Radial gradient backing for pending items */}
              {item.submission_status === 'pending' && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl pointer-events-none rounded-full" />
              )}

              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                {/* Main Card Content */}
                <div className="flex-1 space-y-4">
                  {/* Top line Name + Badges */}
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-bold text-white font-display">{item.name}</h3>
                    {item.category && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md border border-white/5">
                        {item.category}
                      </span>
                    )}
                    {item.status && (
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        item.status === 'Live' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : item.status === 'Beta' 
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {item.status}
                      </span>
                    )}
                    {item.country && (
                      <span className="flex items-center gap-1 text-xs text-zinc-400 font-medium">
                        <Globe2 size={12} /> {item.country}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-zinc-300 text-sm leading-relaxed max-w-3xl">
                    {item.description || <span className="text-zinc-600 italic">No description provided.</span>}
                  </p>

                  {/* Technical & Team Specs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6 text-sm text-zinc-400 pt-2 border-t border-[rgba(255,255,255,0.03)]">
                    {/* Team Lead */}
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-violet-400" />
                      <span>
                        Lead: <strong className="text-white font-medium">{item.team_lead_name}</strong>
                        {item.team_lead_twitter && (
                          <a
                            href={item.team_lead_twitter}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-violet-400 hover:underline ml-1 font-mono"
                          >
                            @{item.team_lead_twitter.replace(/.*twitter\.com\//, '').replace(/.*x\.com\//, '')}
                          </a>
                        )}
                      </span>
                    </div>

                    {/* Doxxed Badge */}
                    <div className="flex items-center gap-2">
                      <Lock size={14} className="text-violet-400" />
                      <span>
                        Doxxed:{' '}
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                          item.is_doxxed 
                            ? 'text-emerald-400 bg-emerald-400/10' 
                            : 'text-zinc-500 bg-zinc-800/40'
                        }`}>
                          {item.is_doxxed ? 'YES' : 'NO'}
                        </span>
                      </span>
                    </div>

                    {/* Audited Badge */}
                    <div className="flex items-center gap-2">
                      <ShieldAlert size={14} className="text-violet-400" />
                      <span>
                        Audited:{' '}
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                          item.has_audit 
                            ? 'text-emerald-400 bg-emerald-400/10' 
                            : 'text-zinc-500 bg-zinc-800/40'
                        }`}>
                          {item.has_audit ? 'YES' : 'NO'}
                        </span>
                      </span>
                    </div>

                    {/* Date Submitted */}
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-violet-400" />
                      <span>Submitted: <strong className="text-zinc-300 font-mono text-xs">{new Date(item.submitted_at).toLocaleDateString()}</strong></span>
                    </div>

                    {/* Program ID */}
                    {item.program_address && (
                      <div className="flex items-center gap-2 md:col-span-2">
                        <FileText size={14} className="text-violet-400" />
                        <span className="truncate w-full font-mono text-xs" title={item.program_address}>
                          Program: <strong className="text-zinc-300 select-all">{item.program_address}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Clicks & Links */}
                  <div className="flex flex-wrap gap-4 pt-2">
                    <a
                      href={item.x_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white font-mono uppercase tracking-wider transition-colors"
                    >
                      <Twitter size={12} className="text-blue-400" /> Twitter/X Profile <ExternalLink size={10} />
                    </a>
                    {item.website && (
                      <a
                        href={item.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white font-mono uppercase tracking-wider transition-colors"
                      >
                        <Globe2 size={12} className="text-violet-400" /> Website Link <ExternalLink size={10} />
                      </a>
                    )}
                    {item.github_url && (
                      <a
                        href={item.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white font-mono uppercase tracking-wider transition-colors"
                      >
                        GitHub repo <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Queue Action Buttons */}
                {item.submission_status === 'pending' && (
                  <div className="flex lg:flex-col items-center justify-end gap-3 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-white/5 lg:self-stretch">
                    <button
                      onClick={() => handleApprove(item.id)}
                      disabled={processingId !== null}
                      className="flex-1 lg:flex-none justify-center inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-3 text-sm font-semibold transition-all duration-200 shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer min-w-[120px]"
                    >
                      {processingId === item.id ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <>
                          <Check size={16} /> Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleReject(item.id)}
                      disabled={processingId !== null}
                      className="flex-1 lg:flex-none justify-center inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-3 text-sm font-semibold transition-all duration-200 shadow-[0_0_15px_rgba(244,63,94,0.15)] hover:shadow-[0_0_20px_rgba(244,63,94,0.3)] cursor-pointer min-w-[120px]"
                    >
                      {processingId === item.id ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <>
                          <X size={16} /> Reject
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Display status label directly if already approved/rejected */}
                {item.submission_status !== 'pending' && (
                  <div className="flex items-center lg:self-stretch justify-end">
                    <span className={`text-[10px] font-bold tracking-widest uppercase border px-3 py-1.5 rounded-full select-none font-mono ${
                      item.submission_status === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {item.submission_status}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
