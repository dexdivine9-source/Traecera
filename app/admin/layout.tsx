import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import AdminNavbar from './admin-navbar'

export const metadata: Metadata = {
  title: 'TRÆCERA Admin Dashboard',
  description: 'Manage verified projects and submissions for the African Solana ecosystem.',
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans flex flex-col">
      <AdminNavbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10">
        {children}
      </main>
    </div>
  )
}
