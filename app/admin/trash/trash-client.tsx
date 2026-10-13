'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, RotateCcw, Trash2, AlertTriangle, Loader2, X, AlertCircle } from 'lucide-react'

export type TrashedProjectItem = {
  id: string
  name: string
  slug: string | null
  category: string | null
  status: string | null
  country: string | null
  deleted_at: string
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  } catch {
    return dateStr
  }
}

export default function TrashClient({
  initialProjects,
}: {
  initialProjects: TrashedProjectItem[]
}) {
  const router = useRouter()
  const [items, setItems] = useState<TrashedProjectItem[]>(initialProjects)
  const [query, setQuery] = useState('')
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Permanent Delete Modal State
  const [projectToDelete, setProjectToDelete] = useState<TrashedProjectItem | null>(null)
  const [typedSlug, setTypedSlug] = useState('')
  const [deletingPermanent, setDeletingPermanent] = useState(false)
  const [permanentError, setPermanentError] = useState<string | null>(null)

  // Empty Trash Modal State
  const [showEmptyTrashModal, setShowEmptyTrashModal] = useState(false)
  const [typedEmptyConfirm, setTypedEmptyConfirm] = useState('')
  const [emptyingTrash, setEmptyingTrash] = useState(false)
  const [emptyTrashError, setEmptyTrashError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.slug && p.slug.toLowerCase().includes(q))
    )
  }, [items, query])

  // --- Handle Restore ---
  const handleRestore = async (project: TrashedProjectItem) => {
    setRestoringId(project.id)
    setErrorMessage(null)

    try {
      const res = await fetch(`/api/admin/projects/${project.id}/restore`, {
        method: 'POST',
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to restore project.')
      }

      setItems((prev) => prev.filter((p) => p.id !== project.id))
      setToastMessage(`Restored "${project.name}" back to active directory.`)
      router.refresh()
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to restore project.')
    } finally {
      setRestoringId(null)
    }
  }

  // --- Handle Permanent Delete ---
  const handleConfirmPermanentDelete = async () => {
    if (!projectToDelete) return
    setDeletingPermanent(true)
    setPermanentError(null)

    try {
      const res = await fetch(`/api/admin/projects/${projectToDelete.id}?permanent=true`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: typedSlug.trim() }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to permanently delete project.')
      }

      setItems((prev) => prev.filter((p) => p.id !== projectToDelete.id))
      setToastMessage(`Permanently deleted "${projectToDelete.name}".`)
      setProjectToDelete(null)
      setTypedSlug('')
      router.refresh()
    } catch (err) {
      setPermanentError(err instanceof Error ? err.message : 'Failed to delete project permanently.')
    } finally {
      setDeletingPermanent(false)
    }
  }

  // --- Handle Empty Trash ---
  const handleConfirmEmptyTrash = async () => {
    setEmptyingTrash(true)
    setEmptyTrashError(null)

    try {
      const res = await fetch('/api/admin/trash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: typedEmptyConfirm.trim() }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to empty trash.')
      }

      setItems([])
      setToastMessage(`Emptied trash (${data.count} projects permanently deleted).`)
      setShowEmptyTrashModal(false)
      setTypedEmptyConfirm('')
      router.refresh()
    } catch (err) {
      setEmptyTrashError(err instanceof Error ? err.message : 'Failed to empty trash.')
    } finally {
      setEmptyingTrash(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 p-4 text-sm flex items-center justify-between">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 p-4 text-sm flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search and Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search trashed projects..."
            className="w-full bg-[#050506] border border-white/10 text-white rounded-xl focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition-all px-4 py-3 pl-11 placeholder:text-zinc-600 text-sm"
          />
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setEmptyTrashError(null)
              setTypedEmptyConfirm('')
              setShowEmptyTrashModal(true)
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600/10 border border-rose-500/20 text-rose-400 hover:bg-rose-600 hover:text-white px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer self-start sm:self-auto"
          >
            <Trash2 size={14} />
            Empty Trash
          </button>
        )}
      </div>

      {/* Trashed Projects Table */}
      <div className="bg-[#0c0c0f]/60 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider font-mono text-zinc-500">
                <th className="px-5 py-4 font-semibold">Project</th>
                <th className="px-5 py-4 font-semibold">Category</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Deleted At</th>
                <th className="px-5 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-zinc-500">
                    {query ? 'No trashed projects match your search.' : 'Trash is empty. No soft-deleted projects.'}
                  </td>
                </tr>
              ) : (
                filtered.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white text-sm">{project.name}</div>
                      <div className="text-xs text-zinc-500 font-mono mt-0.5">
                        {project.slug || project.id}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-zinc-300">{project.category || '—'}</td>
                    <td className="px-5 py-4 text-sm text-zinc-300">{project.status || '—'}</td>
                    <td className="px-5 py-4 text-sm font-mono text-zinc-400">
                      {formatDate(project.deleted_at)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={restoringId === project.id}
                          onClick={() => handleRestore(project)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-600 hover:text-white px-3 py-2 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                        >
                          {restoringId === project.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <RotateCcw size={12} />
                          )}
                          Restore
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setPermanentError(null)
                            setTypedSlug('')
                            setProjectToDelete(project)
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600/10 border border-rose-500/20 text-rose-400 hover:bg-rose-600 hover:text-white px-3 py-2 text-xs font-semibold transition-all cursor-pointer"
                        >
                          <Trash2 size={12} />
                          Delete permanently
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-zinc-500 font-mono">
        Showing {filtered.length} of {items.length} trashed projects
      </p>

      {/* Delete Permanently Modal (Requires typing slug) */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-rose-500/30 bg-[#0d0d12] p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Permanently Delete Project?</h3>
            </div>

            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-300 leading-relaxed flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
              <span>
                <strong>Warning:</strong> This cannot be undone. The project record, historical metrics snapshots, and cached assets for <span className="text-white font-semibold">&quot;{projectToDelete.name}&quot;</span> will be permanently deleted from the database.
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 block">
                To confirm permanent deletion, type the project slug:{' '}
                <span className="font-mono text-rose-400 select-all px-1.5 py-0.5 bg-rose-500/10 rounded border border-rose-500/20">
                  {projectToDelete.slug}
                </span>
              </label>
              <input
                type="text"
                value={typedSlug}
                onChange={(e) => setTypedSlug(e.target.value)}
                placeholder={projectToDelete.slug || ''}
                className="w-full bg-[#050506] border border-white/10 text-white rounded-xl focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none px-4 py-2.5 text-sm font-mono placeholder:text-zinc-600"
              />
            </div>

            {permanentError && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 p-3 text-xs">
                {permanentError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deletingPermanent}
                onClick={() => setProjectToDelete(null)}
                className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs font-semibold text-zinc-300 transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingPermanent || typedSlug.trim() !== (projectToDelete.slug || '')}
                onClick={handleConfirmPermanentDelete}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                {deletingPermanent && <Loader2 size={14} className="animate-spin" />}
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty Trash Modal (Requires typing DELETE ALL) */}
      {showEmptyTrashModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-rose-500/30 bg-[#0d0d12] p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Empty Entire Trash?</h3>
            </div>

            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-300 leading-relaxed flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
              <span>
                <strong>Warning:</strong> This cannot be undone. All <strong>{items.length}</strong> projects in the trash will be permanently erased along with their metrics snapshots.
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 block">
                To confirm, type{' '}
                <span className="font-mono text-rose-400 select-all px-1.5 py-0.5 bg-rose-500/10 rounded border border-rose-500/20">
                  DELETE ALL
                </span>{' '}
                below:
              </label>
              <input
                type="text"
                value={typedEmptyConfirm}
                onChange={(e) => setTypedEmptyConfirm(e.target.value)}
                placeholder="DELETE ALL"
                className="w-full bg-[#050506] border border-white/10 text-white rounded-xl focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none px-4 py-2.5 text-sm font-mono placeholder:text-zinc-600"
              />
            </div>

            {emptyTrashError && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 p-3 text-xs">
                {emptyTrashError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={emptyingTrash}
                onClick={() => setShowEmptyTrashModal(false)}
                className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs font-semibold text-zinc-300 transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={emptyingTrash || typedEmptyConfirm.trim() !== 'DELETE ALL'}
                onClick={handleConfirmEmptyTrash}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                {emptyingTrash && <Loader2 size={14} className="animate-spin" />}
                Confirm Empty Trash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
