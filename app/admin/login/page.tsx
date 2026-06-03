'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Lock, Mail, Loader2, AlertCircle, Fingerprint } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        setLoading(false)
      } else {
        router.push('/admin')
        router.refresh()
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#050505] flex items-center justify-center p-6 overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex justify-center items-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mb-4 shadow-xl relative overflow-hidden group">
            <Fingerprint className="text-violet-400 group-hover:scale-110 transition-transform duration-300" size={28} />
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/20 to-fuchsia-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2 font-display">TRÆCERA Portal</h1>
          <p className="text-sm text-zinc-400">Security Access Gateway for Administrators</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0c0c0e]/80 border border-white/5 backdrop-blur-2xl rounded-2xl p-8 shadow-2xl relative">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm animate-in fade-in slide-in-from-top-2 duration-200">
                <AlertCircle className="shrink-0 mt-0.5" size={16} />
                <div>
                  <span className="font-semibold">Authentication failed: </span>
                  {error}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@traecera.com"
                  className="w-full bg-[#050506] border border-white/10 text-white rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all px-4 py-3.5 pl-12 placeholder:text-zinc-600 text-sm font-sans"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-[#050506] border border-white/10 text-white rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all px-4 py-3.5 pl-12 placeholder:text-zinc-600 text-sm font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative flex items-center justify-center px-4 py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.15)] hover:shadow-[0_0_25px_rgba(139,92,246,0.3)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="animate-spin mr-2" size={18} />
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>
        </div>

        {/* Footer info link */}
        <div className="text-center mt-8">
          <a
            href="/"
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-widest font-mono"
          >
            ← Back to Ecosystem overview
          </a>
        </div>
      </div>
    </div>
  )
}
