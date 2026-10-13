'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Pencil, Search } from 'lucide-react'

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

export default function ProjectsClient({ projects }: { projects: AdminProjectListItem[] }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return projects
    return projects.filter((p) => p.name.toLowerCase().includes(q))
  }, [projects, query])

  return (
    <div className="space-y-6">
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
                    No projects match your search.
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
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 hover:bg-violet-600 hover:text-white px-3 py-2 text-xs font-semibold transition-all"
                      >
                        <Pencil size={12} />
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-zinc-500 font-mono">
        Showing {filtered.length} of {projects.length} projects
      </p>
    </div>
  )
}
