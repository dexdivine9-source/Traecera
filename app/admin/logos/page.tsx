'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Check, Loader2 } from 'lucide-react';

export default function AdminLogosPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // We'll store input state and loading state per project slug
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Record<string, 'idle' | 'loading' | 'success' | 'error'>>({});

  useEffect(() => {
    async function loadProjects() {
      // Fetch all projects to find which ones need logo updates
      const { data } = await supabase
        .from('projects')
        .select('name, slug, logo')
        .order('name');
      
      if (data) {
        // Filter projects where logo is unavatar or null/empty
        const needsLogo = data.filter(p => !p.logo || p.logo.includes('unavatar'));
        setProjects(needsLogo);
      }
      setLoading(false);
    }
    loadProjects();
  }, []);

  const handleSave = async (slug: string) => {
    const url = inputs[slug];
    if (!url) return;

    setStatus(prev => ({ ...prev, [slug]: 'loading' }));

    try {
      const res = await fetch('/api/admin/upload-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, image_url: url }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setStatus(prev => ({ ...prev, [slug]: 'success' }));
      } else {
        setStatus(prev => ({ ...prev, [slug]: 'error' }));
        alert(json.error || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
      setStatus(prev => ({ ...prev, [slug]: 'error' }));
      alert("Network error. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] p-10 flex items-center justify-center">
        <Loader2 size={32} className="text-brand-purple animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] p-10 text-white font-sans">
      <h1 className="text-3xl font-bold mb-2">Fix Missing / Broken Logos</h1>
      <p className="text-slate-400 mb-8">Internal tool to download external logos, convert to buffer, and save to /public/projects/</p>
      
      <div className="max-w-4xl space-y-4">
        {projects.length === 0 ? (
          <div className="text-emerald-400 p-6 glass-card rounded-xl border border-emerald-500/20 bg-emerald-500/5">
            All projects have valid local logos!
          </div>
        ) : (
          projects.map(p => (
            <div key={p.slug} className="glass-card p-5 flex items-center justify-between border border-white/10 rounded-xl bg-white/5 shadow-lg">
              <div className="flex-1">
                <div className="font-bold text-lg text-white mb-1">{p.name}</div>
                <div className="text-sm text-slate-400 font-mono mb-2">{p.slug}</div>
                <div className="text-xs text-rose-400 truncate max-w-sm bg-rose-500/10 px-2 py-1 rounded inline-block">
                  Current: {p.logo || 'NULL'}
                </div>
              </div>
              
              <div className="flex items-center gap-3 flex-1 justify-end ml-4">
                {status[p.slug] === 'success' ? (
                  <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-400/10 px-4 py-2.5 rounded-lg">
                    <Check size={18} /> Saved successfully
                  </div>
                ) : (
                  <>
                    <input 
                      type="url" 
                      placeholder="Paste image URL here..." 
                      className="bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm w-72 focus:outline-none focus:border-brand-purple text-white placeholder-slate-500"
                      value={inputs[p.slug] || ''}
                      onChange={e => setInputs(prev => ({ ...prev, [p.slug]: e.target.value }))}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && inputs[p.slug]) handleSave(p.slug);
                      }}
                    />
                    <button 
                      onClick={() => handleSave(p.slug)}
                      disabled={status[p.slug] === 'loading' || !inputs[p.slug]}
                      className="bg-brand-purple hover:bg-brand-purple/80 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center min-w-[120px]"
                    >
                      {status[p.slug] === 'loading' ? <Loader2 size={16} className="animate-spin" /> : 'Save Logo'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
