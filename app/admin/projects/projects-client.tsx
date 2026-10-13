'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Search, Trash2, Loader2, AlertTriangle, X } from 'lucide-react'

export type AdminProjectListItem = {
  id: string
  name: string
  slug: string | null
  category: string | null
  status: string | null
  country: string | null
  verification_status: string | null
  is_active: boolean | null
}

export default function ProjectsClient({ projects: initialProjects }: { projects: AdminProjectListItem[] }) {
  const router = useRouter()
  const [items, setItems] = useState<AdminProjectListItem[]>(initialProjects)
  const [query, setQuery] = useState('')
  const [projectToTrash, setProjectToTrash] = useState<AdminProjectListItem | null>(null)
  const [trashing, setTrashing] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((p) => p.name.toLowerCase().includes(q))
  }, [items, query])

  const handleConfirmTrash = async () => {
    if (!projectToTrash) return
    setTrashing(true)
    setActionError(null)

    try {
      const res = await fetch(`/api/admin/projects/${projectToTrash.id}`, {
        method: 'DELETE',
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to move project to trash.')
      }

      // Remove from active list
      setItems((prev) => prev.filter((p) => p.id !== projectToTrash.id))
      setToastMessage(`Moved "${projectToTrash.name}" to trash.`)
      setProjectToTrash(null)
      router.refresh()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to move project to trash.')
    } finally {
      setTrashing(false)
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

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects by name..."
          className="w-full bg-[#050506] border border-white/10 text-white rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all px-4 py-3 pl-11 placeholder:text-zinc-600 text-sm"
        />
      </div>

      <div className="bg-[#0c0c0f]/60 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider font-mono text-zinc-500">
                <th className="px-5 py-4 font-semibold">Project</th>
                <th className="px-5 py-4 font-semibold">Category</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Verification</th>
                <th className="px-5 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-zinc-500">
                    {query ? 'No projects match your search.' : 'No active projects in directory.'}
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
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-zinc-300">
                        {project.verification_status || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/projects/${project.id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 hover:bg-violet-600 hover:text-white px-3 py-2 text-xs font-semibold transition-all"
                        >
                          <Pencil size={12} />
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setActionError(null)
                            setProjectToTrash(project)
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600/10 border border-rose-500/20 text-rose-400 hover:bg-rose-600 hover:text-white px-3 py-2 text-xs font-semibold transition-all cursor-pointer"
                        >
                          <Trash2 size={12} />
                          Delete
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
        Showing {filtered.length} of {items.length} active projects
      </p>

      {/* Confirmation Modal for Moving to Trash */}
      {projectToTrash && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d0d12] p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Move to Trash?</h3>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed">
              Move <span className="font-semibold text-white">&quot;{projectToTrash.name}&quot;</span> to trash? It will disappear from the website.
            </p>

            <p className="text-xs text-zinc-500">
              This is a soft delete. The project will be hidden from the home page, rankings, public profiles, and API routes. You can restore it anytime from the Trash page.
            </p>

            {actionError && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 p-3 text-xs">
                {actionError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={trashing}
                onClick={() => setProjectToTrash(null)}
                className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs font-semibold text-zinc-300 transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={trashing}
                onClick={handleConfirmTrash}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {trashing && <Loader2 size={14} className="animate-spin" />}
                Confirm Move to Trash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
