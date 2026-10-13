'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, Loader2, Save, Trash2, AlertTriangle } from 'lucide-react'
import {
  DATA_SOURCES,
  PROJECT_CATEGORIES,
  PROJECT_STATUSES,
  VERIFICATION_STATUSES,
  type EditableProjectPayload,
} from '@/lib/admin/project-fields'

type ProjectEditFormProps = {
  projectId: string
  initial: EditableProjectPayload
}

const inputClass =
  'w-full bg-[#050506] border border-white/10 text-white rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all px-4 py-3 placeholder:text-zinc-600 text-sm'

const labelClass = 'text-xs font-semibold text-zinc-300 uppercase tracking-wider block mb-2'

export default function ProjectEditForm({ projectId, initial }: ProjectEditFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<EditableProjectPayload>(initial)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showTrashModal, setShowTrashModal] = useState(false)
  const [trashing, setTrashing] = useState(false)
  const [trashError, setTrashError] = useState<string | null>(null)

  const handleTrashProject = async () => {
    setTrashing(true)
    setTrashError(null)

    try {
      const res = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to move project to trash.')
      }

      router.push('/admin/projects')
      router.refresh()
    } catch (err) {
      setTrashError(err instanceof Error ? err.message : 'Failed to move project to trash.')
    } finally {
      setTrashing(false)
    }
  }

  const setField = <K extends keyof EditableProjectPayload>(key: K, value: EditableProjectPayload[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSuccess(null)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccess(null)
    setError(null)

    try {
      const payload = {
        ...form,
        about_updated:
          form.about && !form.about_updated
            ? new Date().toISOString().slice(0, 10)
            : form.about_updated,
      }

      const res = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data?.error || `Save failed (${res.status}).`)
        return
      }

      setForm(payload)
      setSuccess('Project updated successfully.')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm">
          <AlertCircle className="shrink-0 mt-0.5" size={16} />
          <div>
            <span className="font-semibold">Save failed: </span>
            {error}
          </div>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm">
          <CheckCircle2 className="shrink-0 mt-0.5" size={16} />
          <div>{success}</div>
        </div>
      )}

      <section className="bg-[#0c0c0f]/60 border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
        <h2 className="text-lg font-bold text-white font-display border-b border-white/5 pb-3">
          Core details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className={labelClass}>Name</label>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Slug</label>
            <input
              className={inputClass}
              value={form.slug}
              onChange={(e) => setField('slug', e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Country</label>
            <input
              className={inputClass}
              value={form.country ?? ''}
              onChange={(e) => setField('country', e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea
              className={`${inputClass} min-h-[100px] resize-y`}
              value={form.description ?? ''}
              onChange={(e) => setField('description', e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Logo URL / path</label>
            <input
              className={inputClass}
              value={form.logo ?? ''}
              onChange={(e) => setField('logo', e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="bg-[#0c0c0f]/60 border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
        <h2 className="text-lg font-bold text-white font-display border-b border-white/5 pb-3">
          About
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className={labelClass}>About (markdown)</label>
            <textarea
              className={`${inputClass} min-h-[180px] resize-y font-mono text-xs leading-relaxed`}
              value={form.about ?? ''}
              onChange={(e) => setField('about', e.target.value)}
              placeholder={'## Overview\n\n**Nectar** is...\n\n- Point one\n- Point two'}
            />
          </div>
          <div>
            <label className={labelClass}>About updated</label>
            <input
              type="date"
              className={inputClass}
              value={form.about_updated ?? ''}
              onChange={(e) => setField('about_updated', e.target.value || null)}
            />
          </div>
        </div>
      </section>

      <section className="bg-[#0c0c0f]/60 border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
        <h2 className="text-lg font-bold text-white font-display border-b border-white/5 pb-3">
          Classification
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Category</label>
            <select
              className={inputClass}
              value={form.category ?? ''}
              onChange={(e) => setField('category', e.target.value || null)}
            >
              <option value="">Select category</option>
              {PROJECT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select
              className={inputClass}
              value={form.status ?? ''}
              onChange={(e) => setField('status', e.target.value || null)}
            >
              <option value="">Select status</option>
              {PROJECT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Data source</label>
            <select
              className={inputClass}
              value={form.data_source ?? ''}
              onChange={(e) => setField('data_source', e.target.value || null)}
            >
              <option value="">Select data source</option>
              {DATA_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Verification status</label>
            <select
              className={inputClass}
              value={form.verification_status ?? ''}
              onChange={(e) => setField('verification_status', e.target.value || null)}
            >
              <option value="">Select verification status</option>
              {VERIFICATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="bg-[#0c0c0f]/60 border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
        <h2 className="text-lg font-bold text-white font-display border-b border-white/5 pb-3">
          Links & addresses
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Website</label>
            <input
              className={inputClass}
              value={form.website ?? ''}
              onChange={(e) => setField('website', e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>X / Twitter link</label>
            <input
              className={inputClass}
              value={form.x_link ?? ''}
              onChange={(e) => setField('x_link', e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>GitHub URL</label>
            <input
              className={inputClass}
              value={form.github_url ?? ''}
              onChange={(e) => setField('github_url', e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Program address</label>
            <input
              className={`${inputClass} font-mono`}
              value={form.program_address ?? ''}
              onChange={(e) => setField('program_address', e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Wallet address</label>
            <input
              className={`${inputClass} font-mono`}
              value={form.wallet_address ?? ''}
              onChange={(e) => setField('wallet_address', e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="bg-[#0c0c0f]/60 border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
        <h2 className="text-lg font-bold text-white font-display border-b border-white/5 pb-3">
          Flags
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(
            [
              ['social_verified', 'Social verified'],
              ['ecosystem_verified', 'Ecosystem verified'],
              ['is_doxxed', 'Is doxxed'],
              ['has_audit', 'Has audit'],
              ['is_active', 'Is active'],
            ] as const
          ).map(([key, label]) => (
            <label
              key={key}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 cursor-pointer hover:border-violet-500/30 transition-colors"
            >
              <input
                type="checkbox"
                checked={Boolean(form[key])}
                onChange={(e) => setField(key, e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-black text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm text-zinc-200">{label}</span>
            </label>
          ))}
        </div>
      </section>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/5">
        <button
          type="button"
          onClick={() => {
            setTrashError(null)
            setShowTrashModal(true)
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600/10 border border-rose-500/20 text-rose-400 hover:bg-rose-600 hover:text-white px-5 py-3 text-sm font-semibold transition-all cursor-pointer"
        >
          <Trash2 size={16} />
          Move to trash
        </button>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:cursor-not-allowed text-white px-6 py-3 text-sm font-semibold transition-all shadow-[0_0_20px_rgba(139,92,246,0.15)] cursor-pointer"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      {/* Confirmation Modal for Moving to Trash */}
      {showTrashModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d0d12] p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Move to Trash?</h3>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed">
              Move <span className="font-semibold text-white">&quot;{initial.name}&quot;</span> to trash? It will disappear from the website.
            </p>

            <p className="text-xs text-zinc-500">
              This is a soft delete. The project will be hidden from the home page, rankings, public profiles, and API routes. You can restore it anytime from the Trash page.
            </p>

            {trashError && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 p-3 text-xs">
                {trashError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={trashing}
                onClick={() => setShowTrashModal(false)}
                className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs font-semibold text-zinc-300 transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={trashing}
                onClick={handleTrashProject}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {trashing && <Loader2 size={14} className="animate-spin" />}
                Confirm Move to Trash
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
