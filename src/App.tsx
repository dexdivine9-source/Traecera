"use client";

import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Activity, 
  ExternalLink, 
  ArrowLeft,
  ArrowRight,
  Search,
  Globe2,
  ChevronRight,
  Filter,
  LayoutGrid,
  List,
  ShieldCheck,
  Menu,
  Fingerprint
} from 'lucide-react';
import ProjectLogo from '@/components/ProjectLogo';
import { Project } from './data/projects';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './components/Sidebar';
import { MethodologySection } from './components/MethodologySection';
import { Navbar } from './components/Navbar';

export function getScoreBadgeColor(score: number | undefined) {
  if (score === undefined) return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  if (score >= 80) return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
  if (score >= 60) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  if (score >= 40) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
}
type ViewState = 
  | { name: 'home' }
  | { name: 'leaderboard' }
  | { name: 'project', id: string }
  | { name: 'signup' }
  | { name: 'submit' };

// -----------------------------------------
// Custom Logo Icon (Isometric Cube)
// -----------------------------------------
const LogoIcon = ({ className = "", size = 24 }: { className?: string, size?: number }) => (
  <img src="/logo.png" width={size} height={size} className={`object-contain ${className}`} alt="TRÆCERA Logo" />
);

export default function App({ initialProjects }: { initialProjects: Project[] }) {
  const projects = initialProjects;
  const [view, setView] = useState<ViewState>({ name: 'home' });

  // ── Sidebar state ──
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  // Navigation handlers
  const goHome = () => setView({ name: 'home' });
  const goLeaderboard = () => setView({ name: 'leaderboard' });
  const goProject = (id: string) => setView({ name: 'project', id });
  const goSignup = () => setView({ name: 'signup' });
  const goSubmit = () => setView({ name: 'submit' });

  const handleSidebarNavigate = (target: 'home' | 'leaderboard') => {
    if (target === 'home') goHome();
    else goLeaderboard();
  };

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'layout-collapsed' : ''}`}>
      {/* Sidebar */}
      <Sidebar
        projects={projects}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        onNavigate={handleSidebarNavigate}
        activeView={view.name}
        onSignup={goSignup}
      />

      {/* Main Content */}
      <main className="app-main-content selection:bg-[#14F195]/30">
        <AnimatePresence mode="wait">
          {view.name === 'home' && (
            <HomeView 
              key="home" 
              projects={projects}
              onExplore={goLeaderboard} 
              onProjectClick={goProject} 
              onSignup={goSignup} 
              onSubmit={goSubmit} 
              onOpenMenu={() => setMobileOpen(true)}
            />
          )}
          {view.name === 'leaderboard' && (
            <LeaderboardView
              key="leaderboard"
              projects={projects}
              onHome={goHome}
              onProjectClick={goProject}
              onSubmit={goSubmit}
              externalCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              onOpenMenu={() => setMobileOpen(true)}
            />
          )}
          {view.name === 'project' && (
            <ProjectDetailView 
              key={`project-${view.id}`} 
              projects={projects}
              projectId={view.id} 
              onBack={goLeaderboard} 
              onHome={goHome} 
              onSubmit={goSubmit} 
              onOpenMenu={() => setMobileOpen(true)}
            />
          )}
          {view.name === 'signup' && (
            <SignupView key="signup" onClose={goHome} />
          )}
          {view.name === 'submit' && (
            <SubmitProjectView key="submit" onClose={goHome} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// -----------------------------------------
// Signup View
// -----------------------------------------
function SignupView({ onClose }: { key?: React.Key; onClose: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full h-full min-h-[100dvh] bg-[#0a0a0f] flex flex-col items-center justify-center p-6 relative overflow-y-auto"
    >
      <button onClick={onClose} className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold cursor-pointer">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="w-full max-w-md glass-card p-10 flex flex-col items-center bg-[#080808]/80 backdrop-blur-3xl border border-white/5 shadow-2xl relative mx-auto my-auto mt-20 md:mt-auto">
        <div className="flex items-center justify-center select-none mb-8">
          <LogoIcon className="" size={120} />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Create an account</h2>
        <p className="text-[#9CA3AF] text-center mb-10 leading-relaxed">Join the unified index of African-built products on the Solana frontier.</p>

        <div className="w-full flex gap-4 flex-col mb-8">
          <button className="w-full relative flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-black py-3.5 px-4 rounded-xl font-semibold transition-colors">
            <svg className="w-5 h-5 absolute left-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
          
          <button className="w-full relative flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-black py-3.5 px-4 rounded-xl font-semibold transition-colors">
            <svg className="w-5 h-5 absolute left-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.35-4.14-4.5-5.9-9.98-4.56-14.86 1.04-3.79 3.8-6.12 7.03-6.12 1.37 0 2.8.52 3.88.52 1.04 0 2.58-.69 4.14-.69 3.03 0 5.48 2.06 6.35 4.88-5.32 2.34-4.22 8.78.3 10.4-1.07 2.76-2.58 5.62-4.76 7.82zm-4.66-20.28c-.02 1.84.86 3.52 2.13 4.67-1.48 1.16-3.4 1.16-4.8.1-1.33-1.08-2.27-2.88-2.04-4.74 1.76.01 3.46 1 4.71 0z"/>
            </svg>
            Continue with Apple
          </button>
        </div>

        <div className="w-full flex items-center gap-4 mb-8">
          <div className="h-px bg-white/10 flex-1"></div>
          <span className="text-[#9CA3AF] text-sm font-medium uppercase tracking-wider">or</span>
          <div className="h-px bg-white/10 flex-1"></div>
        </div>

        <button className="w-full btn-secondary py-4 w-full flex items-center justify-center gap-3 hover:bg-[#14F195]/10 hover:text-white transition-all hover:border-[#14F195]/30 group text-[#14F195] font-semibold">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
             <path d="M4.098 7.373L21.353 3.65A1.365 1.365 0 0123 5v.232c0 .412-.187.802-.513 1.064L5.23 15.11a1.365 1.365 0 01-1.647 1.352L1 16.23" />
             <path d="M19.902 16.627l-17.255 3.723A1.365 1.365 0 011 19v-.232c0-.412.187-.802.513-1.064l17.257-8.814a1.365 1.365 0 011.647-1.352L23 7.77" />
          </svg>
          Sign up with your Solflare wallet
        </button>
      </div>
    </motion.div>
  );
}

// -----------------------------------------
// Home View
// -----------------------------------------
function HomeView({ projects, onExplore, onProjectClick, onSignup, onSubmit, onOpenMenu }: { projects: Project[]; key?: React.Key; onExplore: () => void; onProjectClick: (id: string) => void; onSignup: () => void; onSubmit: () => void; onOpenMenu: () => void }) {
  const topProjects = [...projects]
    .sort((a, b) => {
      const scoreA = a.traecera_score ?? 0;
      const scoreB = b.traecera_score ?? 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return b.trending_score - a.trending_score;
    })
    .slice(0, 5);
  
  const trendingProjects = [...projects]
    .sort((a, b) => b.metrics.growth_percent - a.metrics.growth_percent)
    .filter(p => !topProjects.find(tp => tp.id === p.id))
    .slice(0, 6);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full min-h-[100dvh] bg-[#0a0a0f] overflow-y-auto overflow-x-hidden pb-24"
    >
      {/* Header/Nav */}
      <Navbar 
        onExplore={onExplore} 
        onSubmit={onSubmit} 
        onOpenMenu={onOpenMenu} 
        LogoIcon={LogoIcon} 
      />

      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto px-6 pt-12 pb-20 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-purple/20 blur-[120px] rounded-full pointer-events-none -z-10" />
        
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8">
          <span className="w-2 h-2 rounded-full bg-[#3b82f6] shadow-[0_0_8px_#3b82f6]"></span>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mt-0.5">
            Indexing 140+ African Solana Projects
          </span>
        </div>

        <h1 className="text-heading-1 text-white mb-6">
          Track the Rise of <span className="text-gradient">Solana in Africa</span>
        </h1>
        <p className="text-body-large mb-10 max-w-2xl mx-auto">
          Live data. Real products. One ecosystem. The fastest way to discover, track, and analyze African projects building on the frontier.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="btn-white flex items-center justify-center gap-2" onClick={onExplore}>
             Explore Rankings <ArrowRight size={18} className="text-black" />
          </button>
          <button 
             className="btn-secondary flex items-center justify-center px-8 text-base"
             onClick={() => document.getElementById('methodology')?.scrollIntoView({ behavior: 'smooth' })}
          >
             View Methodology
          </button>
        </div>
      </section>

      {/* Methodology Features */}
      <MethodologySection />

      {/* Top Leaderboard Preview */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <h2 className="text-heading-2 text-white">Ecosystem Leaders</h2>
            <p className="text-body mt-2">Top 5 projects by activity and growth.</p>
          </div>
          <button className="text-brand-purple hover:text-brand-pink transition-colors text-sm font-semibold flex items-center gap-1" onClick={onExplore}>
            View Leaderboard <ChevronRight size={16} />
          </button>
        </div>
        
        <div className="overflow-x-auto pb-4">
          <table className="table-glass min-w-[700px]">
            <thead>
              <tr>
                <th className="w-16 text-center">Rank</th>
                <th>Project</th>
                <th className="text-right">Category</th>
                <th className="text-right">Growth (30d)</th>
              </tr>
            </thead>
            <tbody>
              {topProjects.map((proj, idx) => (
                <tr key={proj.id} className="row-glass cursor-pointer" onClick={() => onProjectClick(proj.id)}>
                  <td className="text-center">
                    <span className="text-mono-small text-slate-400 font-bold">#{String(idx + 1).padStart(2, '0')}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <ProjectLogo src={proj.logo} name={proj.name} category={proj.category} width={48} height={48} className="rounded-xl" />
                      </div>
                      <div>
                        <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
                          {proj.name}
                          {idx < 3 && <ShieldCheck size={14} className="text-blue-400 fill-blue-400/10" />}
                        </div>
                        <span className={`badge ${
                          proj.status === 'Live' ? 'badge-live' : 
                          proj.status === 'Beta' ? 'badge-beta' : 'badge-coming-soon'
                        }`}>
                          {proj.status}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="text-right">
                    <span className="text-slate-300 text-sm">{proj.category}</span>
                  </td>
                  <td className="text-right">
                    {proj.metrics.growth_percent ? (
                      <div className={`inline-flex items-center gap-1 font-mono font-medium ${proj.metrics.growth_percent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {proj.metrics.growth_percent >= 0 ? '+' : ''}{proj.metrics.growth_percent}% <TrendingUp size={14} className={proj.metrics.growth_percent < 0 ? 'rotate-180' : ''} />
                      </div>
                    ) : (
                      <span className="text-slate-500 font-mono">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Trending Projects Section */}
      <section id="trending" className="max-w-5xl mx-auto px-6 py-16 scroll-mt-20">
        <h2 className="text-heading-2 text-white mb-2">Trending Projects</h2>
        <p className="text-body mb-8">Fastest growing applications this week.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-blue/10 blur-[100px] rounded-full pointer-events-none -z-10" />
          
          {trendingProjects.map((proj, idx) => (
            <ProjectCard key={proj.id} project={proj} onClick={() => onProjectClick(proj.id)} verified={topProjects.some(tp => tp.id === proj.id && topProjects.indexOf(tp) < 3)} />
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <SubmissionCTA onSubmit={onSubmit} />
      
      {/* Footer */}
      <Footer />

    </motion.div>
  );
}

// -----------------------------------------
// Leaderboard View
// -----------------------------------------
function LeaderboardView({ projects, onHome, onProjectClick, onSubmit, externalCategory, onCategoryChange, onOpenMenu }: { projects: Project[]; key?: React.Key; onHome: () => void; onProjectClick: (id: string) => void; onSubmit: () => void; externalCategory?: string; onCategoryChange?: (cat: string) => void; onOpenMenu: () => void }) {
  // Use external category from sidebar if provided, otherwise local state
  const [localFilterCat, setLocalFilterCat] = useState<string>('All');
  const filterCat = externalCategory ?? localFilterCat;
  const setFilterCat = (cat: string) => {
    setLocalFilterCat(cat);
    if (onCategoryChange) onCategoryChange(cat);
  };

  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterCountry, setFilterCountry] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const categories = ['All', ...Array.from(new Set(projects.map(p => p.category)))];
  const statuses = ['All', 'Live', 'Beta', 'Coming Soon'];
  const countries = ['All', ...Array.from(new Set(projects.map(p => p.country)))];

  const filteredData = useMemo(() => {
    return projects.filter(p => {
      const matchCat = filterCat === 'All' || p.category === filterCat;
      const matchStatus = filterStatus === 'All' || p.status === filterStatus;
      const matchCountry = filterCountry === 'All' || p.country === filterCountry;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchStatus && matchCountry && matchSearch;
    }).sort((a, b) => {
      const scoreA = a.traecera_score ?? 0;
      const scoreB = b.traecera_score ?? 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return b.trending_score - a.trending_score;
    });
  }, [projects, filterCat, filterStatus, filterCountry, search]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full min-h-[100dvh] bg-[#0a0a0f] overflow-y-auto overflow-x-hidden pb-12"
    >
      <div className="max-w-6xl mx-auto px-6 py-10">
        
        {/* Header / Nav */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <button onClick={onHome} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold mb-4 cursor-pointer">
              <ArrowLeft size={16} /> Back to Overview
            </button>
            <h1 className="text-heading-2 text-white mb-2">Ecosystem Rankings</h1>
            <p className="text-body flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Database • Updated {Math.floor(Math.random() * 5) + 1} mins ago
            </p>
          </div>
          
          {/* Filters Area */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 glass-card !p-1 !rounded-full border-[rgba(255,255,255,0.08)]">
              <button 
                onClick={() => setViewMode('table')} 
                className={`p-1.5 rounded-full transition-colors ${viewMode === 'table' ? 'bg-[rgba(255,255,255,0.1)] text-white' : 'text-slate-500 hover:text-white'}`}
              >
                <List size={16} />
              </button>
              <button 
                onClick={() => setViewMode('grid')} 
                className={`p-1.5 rounded-full transition-colors ${viewMode === 'grid' ? 'bg-[rgba(255,255,255,0.1)] text-white' : 'text-slate-500 hover:text-white'}`}
              >
                <LayoutGrid size={16} />
              </button>
            </div>

            <div className="relative glass-card !py-2 !px-4 !rounded-full flex items-center border-[rgba(255,255,255,0.08)]">
              <Search size={16} className="text-slate-400 mr-2 shrink-0" />
              <input 
                type="text" 
                placeholder="Search projects..."
                className="bg-transparent border-none outline-none text-sm w-32 focus:w-48 transition-all text-white placeholder-slate-500"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            
            <select 
              value={filterCat} 
              onChange={(e)=>setFilterCat(e.target.value)}
              className="glass-card !bg-transparent text-sm !py-2 !px-4 !rounded-full appearance-none outline-none cursor-pointer border-[rgba(255,255,255,0.08)] text-white"
            >
              {categories.map(c => <option key={c} value={c} className="bg-[#0a0a0f]">{c}</option>)}
            </select>
            
            <button
              className="sidebar-mobile-trigger flex lg:hidden items-center justify-center"
              onClick={onOpenMenu}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
          </div>
        </header>

        {/* Leaderboard Data */}
        {filteredData.length === 0 ? (
          <div className="glass-card py-20 text-center flex flex-col items-center justify-center">
            <Filter className="text-slate-600 mb-4" size={32} />
            <p className="text-body mb-4">No projects match your current filters.</p>
            <button className="btn-secondary" onClick={() => { setFilterCat('All'); setFilterStatus('All'); setFilterCountry('All'); setSearch(''); }}>Clear Filters</button>
          </div>
        ) : viewMode === 'table' ? (
          <div className="overflow-x-auto pb-4">
            <table className="table-glass min-w-[900px]">
              <thead>
                <tr>
                  <th className="w-16 text-center">Rank</th>
                  <th>Project</th>
                  <th>Score</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th className="text-right">Growth ( 24 hrs )</th>
                  <th className="text-right">Growth (30d)</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredData.map((project, idx) => (
                    <motion.tr
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: idx > 10 ? 0 : idx * 0.05 }}
                      key={project.id}
                      onClick={() => onProjectClick(project.id)}
                      className="row-glass cursor-pointer"
                    >
                      <td className="text-center">
                        <span className="text-mono-small text-slate-400 font-bold">#{String(idx + 1).padStart(2, '0')}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 relative">
                            <ProjectLogo src={project.logo} name={project.name} category={project.category} width={48} height={48} className="rounded-xl border border-white/5" />
                          </div>
                          <div>
                            <div className="font-semibold text-white mb-1 leading-tight flex items-center gap-1.5">
                              {project.name}
                              {idx < 3 && <ShieldCheck size={14} className="text-blue-400 fill-blue-400/10" />}
                            </div>
                            <span className={`badge ${
                              project.status === 'Live' ? 'badge-live' : 
                              project.status === 'Beta' ? 'badge-beta' : 'badge-coming-soon'
                            }`}>
                              {project.status}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        {project.traecera_score !== undefined ? (
                          <span className={`px-2 py-1 rounded text-xs font-bold border ${getScoreBadgeColor(project.traecera_score)}`}>
                            {project.traecera_score.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-mono">—</span>
                        )}
                      </td>
                      <td>
                        <span className="text-slate-300 text-sm whitespace-nowrap">{project.category}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5 text-slate-400 text-sm whitespace-nowrap">
                          <Globe2 size={14} /> {project.country}
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="text-white font-mono">{project.metrics.volume_24h ? `+${project.metrics.volume_24h.toLocaleString()}%` : <span className="text-slate-500">—</span>}</div>
                      </td>
                      <td className="text-right">
                        {project.metrics.growth_percent ? (
                          <div className={`inline-flex items-center gap-1 font-mono font-medium ${project.metrics.growth_percent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {project.metrics.growth_percent >= 0 ? '+' : ''}{project.metrics.growth_percent}% 
                            <TrendingUp size={14} className={project.metrics.growth_percent < 0 ? 'rotate-180' : ''} />
                          </div>
                        ) : (
                          <span className="text-slate-500 font-mono">—</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredData.map((project, idx) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: idx > 10 ? 0 : idx * 0.05 }}
                  key={project.id}
                >
                  <ProjectCard project={project} onClick={() => onProjectClick(project.id)} verified={idx < 3} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <SubmissionCTA onSubmit={onSubmit} />
      <Footer />
    </motion.div>
  );
}

// -----------------------------------------
// Project Detail View
// -----------------------------------------
function ProjectDetailView({ projects, projectId, onBack, onHome, onSubmit, onOpenMenu }: { projects: Project[]; key?: React.Key; projectId: string; onBack: () => void; onHome: () => void; onSubmit: () => void; onOpenMenu: () => void }) {
  const project = projects.find(p => p.id === projectId);
  
  if (!project) return <div>Project not found</div>;

  const chartData = useMemo(() => {
    let base = project.metrics.active_users * 0.4;
    const data = [];
    const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    for(let i = 0; i < 6; i++) {
       base = base * (1 + (Math.random() * 0.2 + 0.05));
       data.push({ 
         name: months[i], 
         users: Math.floor(base), 
         volume: Math.floor(base * 350)
       });
    }
    data[5] = { name: 'Apr', users: project.metrics.active_users, volume: project.metrics.transaction_volume };
    return data;
  }, [project]);

  const isVerified = useMemo(() => {
    return [...projects]
      .sort((a, b) => b.trending_score - a.trending_score)
      .slice(0, 3)
      .some(p => p.id === project.id);
  }, [projects, project.id]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full h-full min-h-[100dvh] bg-[#0a0a0f] overflow-y-auto overflow-x-hidden pb-24"
    >
      <div className="max-w-6xl mx-auto px-6 py-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold mb-6 cursor-pointer">
              <ArrowLeft size={16} /> Back to Rankings
            </button>
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0">
                <ProjectLogo src={project.logo} name={project.name} category={project.category} width={80} height={80} className="rounded-2xl border border-white/10 shadow-xl" />
              </div>
              <div>
                <h1 className="text-heading-1 text-white mb-2 leading-tight flex items-center gap-3">
                  {project.name}
                  {isVerified && <ShieldCheck size={28} className="text-blue-400 fill-blue-400/10" />}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`badge ${
                    project.status === 'Live' ? 'badge-live' : 
                    project.status === 'Beta' ? 'badge-beta' : 'badge-coming-soon'
                  }`}>
                    {project.status}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400 text-sm font-medium">
                    <Globe2 size={16} /> {project.country}
                  </span>
                  <span className="text-slate-500 text-sm md:ml-2 hidden sm:inline-block">•</span>
                  <span className="text-slate-400 text-sm font-medium">{project.category}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
             <a href={project.x_link} target="_blank" rel="noreferrer" className="btn-secondary flex-1 md:flex-none justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"/></svg>
               Follow
             </a>
             <button className="btn-primary flex-1 md:flex-none justify-center">
               Visit App <ExternalLink size={16} />
             </button>
             <button
               className="sidebar-mobile-trigger flex lg:hidden items-center justify-center"
               onClick={onOpenMenu}
               aria-label="Open navigation"
             >
               <Menu size={20} />
             </button>
          </div>
        </header>

        <p className="text-body-large max-w-3xl mb-12">
          {project.description}
        </p>

        {/* Metrics Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="glass-card p-6">
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-brand-blue" /> Growth ( 24 hrs )
            </div>
            <div className="text-3xl font-bold text-white font-mono">
              {project.metrics.volume_24h ? `+${project.metrics.volume_24h.toLocaleString()}%` : <span className="text-slate-500">—</span>}
            </div>
          </div>
          
          <div className="glass-card p-6">
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Activity size={16} className="text-brand-purple" /> Volume (30d)
            </div>
            <div className="text-3xl font-bold text-white font-mono">
              {project.metrics.transaction_volume ? `$${(project.metrics.transaction_volume / 1000000).toFixed(2)}M` : <span className="text-slate-500">—</span>}
            </div>
          </div>

          <div className="glass-card p-6 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 rounded-full ${project.metrics.growth_percent >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4 relative z-10">
              <TrendingUp size={16} className={project.metrics.growth_percent >= 0 ? 'text-emerald-400' : 'text-rose-400'} /> Growth (30d)
            </div>
            {project.metrics.growth_percent ? (
              <div className={`text-3xl font-bold font-mono relative z-10 ${project.metrics.growth_percent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {project.metrics.growth_percent >= 0 ? '+' : ''}{project.metrics.growth_percent}%
              </div>
            ) : (
              <div className="text-3xl font-bold font-mono relative z-10 text-slate-500">—</div>
            )}
          </div>

          <div className="glass-card p-6">
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
              Network
            </div>
            <div className="mt-2">
              <span className={`badge ${
                project.metrics.onchain_activity === 'High' ? 'badge-activity-high scale-110 origin-left' : 'badge-trending scale-110 origin-left'
              }`}>
                {project.metrics.onchain_activity} Activity
              </span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 h-[400px] flex flex-col">
             <div className="flex justify-between items-center w-full mb-6 relative z-10">
               <h3 className="text-heading-3 text-white">Active Users (6 Mo)</h3>
               <span className="badge badge-trending">MoM Growth</span>
             </div>
            
            <div className="flex-1 min-h-0 w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14F195" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#14F195" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9CA3AF" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    padding={{ left: 20, right: 20 }}
                  />
                  <YAxis 
                    stroke="#9CA3AF" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(10, 10, 15, 0.9)', 
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                      backdropFilter: 'blur(8px)'
                    }} 
                    itemStyle={{ color: '#14F195', fontWeight: 'bold' }}
                    labelStyle={{ color: '#9CA3AF', marginBottom: '4px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#14F195" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorUsers)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Chart ambient glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-emerald-500/5 blur-[100px] pointer-events-none rounded-full" />
          </div>

          <div className="glass-card p-6 h-[400px] flex flex-col">
             <div className="flex justify-between items-center w-full mb-6 relative z-10">
               <h3 className="text-heading-3 text-white">Transaction Volume</h3>
               <span className="badge">USD (Equivalent)</span>
             </div>
            
            <div className="flex-1 min-h-0 w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9945FF" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#9945FF" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9CA3AF" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    padding={{ left: 20, right: 20 }}
                  />
                  <YAxis 
                    stroke="#9CA3AF" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `$${value >= 1000000 ? (value/1000000).toFixed(1) + 'M' : value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(10, 10, 15, 0.9)', 
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                      backdropFilter: 'blur(8px)'
                    }} 
                    itemStyle={{ color: '#9945FF', fontWeight: 'bold' }}
                    labelStyle={{ color: '#9CA3AF', marginBottom: '4px' }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Volume']}
                  />
                  <Area 
                    type="stepAfter" 
                    dataKey="volume" 
                    stroke="#9945FF" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorVol)" 
                    animationDuration={1500}
                    animationBegin={300}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Chart ambient glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-brand-purple/5 blur-[100px] pointer-events-none rounded-full" />
          </div>
        </div>

      </div>

      <SubmissionCTA onSubmit={onSubmit} />
      <Footer />
    </motion.div>
  );
}

// -----------------------------------------
// Project Card (Reusable Component)
// -----------------------------------------
export function ProjectCard({ project, onClick, verified }: { project: Project; onClick: () => void; verified?: boolean; key?: React.Key }) {
  return (
    <div 
      className="glass-card p-6 flex flex-col h-full group cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex-shrink-0 relative">
          <ProjectLogo 
            src={project.logo} 
            name={project.name} 
            category={project.category} 
            width={56} 
            height={56} 
            className="rounded-xl group-hover:-translate-y-1 transition-transform border border-white/5" 
          />
        </div>
        <div className="flex items-center gap-2">
          {project.traecera_score !== undefined && (
            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getScoreBadgeColor(project.traecera_score)}`}>
              {project.traecera_score.toFixed(1)}
            </span>
          )}
          <span className={`badge shrink-0 ${
            project.status === 'Live' ? 'badge-live' : 
            project.status === 'Beta' ? 'badge-beta' : 'badge-coming-soon'
          }`}>
            {project.status}
          </span>
        </div>
      </div>
      
      <h3 className="text-heading-3 text-white mb-2 flex items-center gap-2">
        {project.name}
        {verified && <ShieldCheck size={16} className="text-blue-400 fill-blue-400/10" />}
      </h3>
      <p className="text-body text-sm line-clamp-2 mb-6 flex-1">
        {project.description}
      </p>
      
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[rgba(255,255,255,0.05)] mb-6 mt-auto">
        <div>
          <div className="text-xs text-slate-400 font-mono uppercase tracking-wider mb-1">Users</div>
          <div className="text-sm font-bold text-white">{project.metrics.active_users ? project.metrics.active_users.toLocaleString() : <span className="text-slate-500">—</span>}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 font-mono uppercase tracking-wider mb-1">Growth</div>
          {project.metrics.growth_percent ? (
            <div className={`text-sm font-bold flex items-center gap-1 ${project.metrics.growth_percent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {project.metrics.growth_percent >= 0 ? '+' : ''}{project.metrics.growth_percent}% 
              <TrendingUp size={14} className={project.metrics.growth_percent < 0 ? 'rotate-180' : ''} />
            </div>
          ) : (
            <span className="text-sm font-bold text-slate-500">—</span>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Act:</span>
          <span className={`badge ${
            project.metrics.onchain_activity === 'High' ? 'badge-activity-high' : 'badge-trending'
          }`}>
            {project.metrics.onchain_activity}
          </span>
        </div>
        <button className="text-xs font-semibold text-brand-purple hover:text-brand-pink transition-colors flex items-center gap-1" onClick={(e) => { e.stopPropagation(); onClick(); }}>
          View Details <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

// -----------------------------------------
// Layout Components
// -----------------------------------------

function SubmissionCTA({ onSubmit }: { onSubmit: () => void }) {
  return (
    <section className="py-24 px-6 border-y border-[rgba(255,255,255,0.05)] bg-[#050505] flex flex-col items-center text-center mt-12 w-full">
      <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 font-display">Building on Solana in Africa?</h2>
      <p className="text-[#9CA3AF] max-w-2xl text-lg mb-10 leading-relaxed font-sans">
        Get your project indexed on Træcera to build trust with local users and global investors. Verification is free for open-source protocols.
      </p>
      <button className="btn-white" onClick={onSubmit}>
        Submit Project
      </button>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#050505] pt-16 pb-12 px-6 border-t border-[rgba(255,255,255,0.05)] text-sm text-[#9CA3AF] w-full">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <div className="flex items-center mb-4 text-white font-bold text-lg">
            <LogoIcon className="" size={32} />
          </div>
          <p className="mb-8 font-sans">
            The Intelligence Layer For<br/>Africa Solana Ecosystem.
          </p>
          <div className="text-[10px] uppercase tracking-wider text-[#4B5563] font-mono font-bold">
            © 2026 TRÆCERA ANALYTICS
          </div>
        </div>
        
        <div>
          <h4 className="text-white font-bold uppercase tracking-wider text-[10px] mb-6 font-mono">Platform</h4>
          <ul className="space-y-4 font-sans text-sm">
            <li><a href="#" className="hover:text-white transition-colors block">Rankings</a></li>
            <li><a href="#" className="hover:text-white transition-colors block">Methodology</a></li>
            <li><a href="#" className="hover:text-white transition-colors block">API Access</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-bold uppercase tracking-wider text-[10px] mb-6 font-mono">Connect</h4>
          <ul className="space-y-4 font-sans text-sm">
            <li><a href="#" className="hover:text-white transition-colors block">Twitter / X</a></li>
            <li><a href="#" className="hover:text-white transition-colors block">Discord</a></li>
            <li><a href="#" className="hover:text-white transition-colors block">Contact</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

// -----------------------------------------
// Submit Project View
// -----------------------------------------
function SubmitProjectView({ onClose }: { key?: React.Key; onClose: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full h-full min-h-[100dvh] bg-[#0a0a0f] overflow-y-auto overflow-x-hidden pb-24 relative"
    >
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-purple/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <button onClick={onClose} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold mb-12 cursor-pointer">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="text-center mb-16 relative">
          <div className="inline-flex justify-center items-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6 shadow-2xl relative">
             <Fingerprint className="text-brand-purple" size={32} />
             <div className="absolute inset-0 bg-brand-purple/20 blur-xl rounded-2xl -z-10" />
          </div>
          <h1 className="text-heading-1 text-white mb-4">Get Your Project Indexed on Træcera</h1>
          <p className="text-body-large text-slate-400 max-w-xl mx-auto leading-relaxed">
            Build trust with local users and global investors. Verification is free for open-source protocols.
          </p>
        </div>

        <form className="glass-card p-8 md:p-12 border border-white/5 bg-[#080808]/80 backdrop-blur-3xl shadow-2xl" onSubmit={e => e.preventDefault()}>
          <div className="space-y-12">
            
            {/* Section 1: Basic Info */}
            <div>
              <h3 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-3">1. Basic Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-300">Project Name</label>
                  <input type="text" className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-purple focus:bg-[#0f0f16] transition-all" placeholder="e.g., UseSara" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-300">Short Description</label>
                  <textarea className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-purple focus:bg-[#0f0f16] transition-all min-h-[80px] resize-none" placeholder="1-2 lines summarizing the project's core value..."></textarea>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">Category</label>
                  <div className="relative">
                    <select className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-purple transition-colors appearance-none cursor-pointer">
                      <option value="" disabled selected>Select category</option>
                      <option value="Payments">Payments</option>
                      <option value="DeFi">DeFi</option>
                      <option value="Gaming">Gaming</option>
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="RWA">RWA</option>
                      <option value="Prediction Markets">Prediction Markets</option>
                    </select>
                    <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 rotate-90 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">Status</label>
                  <div className="relative">
                    <select className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-purple transition-colors appearance-none cursor-pointer">
                      <option value="" disabled selected>Select status</option>
                      <option value="Live">Live</option>
                      <option value="Beta">Beta</option>
                      <option value="Coming Soon">Coming Soon</option>
                    </select>
                    <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 rotate-90 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Location */}
            <div>
              <h3 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-3">2. Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">Country</label>
                  <div className="relative">
                    <select className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-purple transition-colors appearance-none cursor-pointer">
                      <option value="" disabled selected>Select African country</option>
                      <option value="Nigeria">Nigeria</option>
                      <option value="Kenya">Kenya</option>
                      <option value="South Africa">South Africa</option>
                      <option value="Ghana">Ghana</option>
                      <option value="Rwanda">Rwanda</option>
                      <option value="Egypt">Egypt</option>
                      <option value="Other">Other</option>
                    </select>
                    <Globe2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Links */}
            <div>
              <h3 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-3">3. Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">Website URL</label>
                  <input type="url" className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-purple focus:bg-[#0f0f16] transition-all" placeholder="https://" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">Twitter/X Link</label>
                  <input type="url" className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-purple focus:bg-[#0f0f16] transition-all" placeholder="https://x.com/..." />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-300 line-clamp-1 flex items-center gap-2">Documentation Link <span className="text-slate-500 font-normal">(Optional)</span></label>
                  <input type="url" className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-purple focus:bg-[#0f0f16] transition-all" placeholder="https://" />
                </div>
              </div>
            </div>

            {/* Section 4: Solana Integration */}
            <div>
              <div className="mb-6 border-b border-white/5 pb-3 flex items-center justify-between">
                 <h3 className="text-lg font-bold text-white">4. Solana Integration</h3>
                 <span className="bg-brand-purple/20 text-brand-purple text-[10px] px-2 py-1 tracking-widest rounded uppercase font-bold border border-brand-purple/30">Important</span>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">Contract Address(es)</label>
                  <textarea className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-purple focus:bg-[#0f0f16] transition-all min-h-[80px] font-mono text-sm resize-none" placeholder="Paste Solana program IDs..."></textarea>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">How does the product use Solana?</label>
                  <textarea className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-purple focus:bg-[#0f0f16] transition-all min-h-[100px] resize-none" placeholder="e.g., We use Solana for instant cross-border stablecoin settlement..."></textarea>
                </div>
              </div>
            </div>

            {/* Section 5: Metrics */}
            <div>
              <h3 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-3 flex items-center gap-2">5. Metrics <span className="text-slate-500 font-normal text-sm">(Optional but encouraged)</span></h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">Estimated Active Users</label>
                  <input type="number" className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-purple focus:bg-[#0f0f16] transition-all font-mono" placeholder="e.g., 5000" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">Estimated Tx Volume (USD)</label>
                  <input type="number" className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-purple focus:bg-[#0f0f16] transition-all font-mono" placeholder="e.g., 100000" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-300">Stage of Growth</label>
                  <div className="relative">
                    <select className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-purple transition-colors appearance-none cursor-pointer">
                      <option value="" disabled selected>Select growth stage</option>
                      <option value="Idea/Pre-product">Idea / Pre-product</option>
                      <option value="Early Traction (<1k users)">Early Traction (&lt;1k users)</option>
                      <option value="Scaling (1k - 10k users)">Scaling (1k - 10k users)</option>
                      <option value="Growth (10k+ users)">Growth (10k+ users)</option>
                    </select>
                    <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 rotate-90 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 6: Verification */}
            <div>
              <h3 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-3">6. Verification</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-300 block">Is the project open-source?</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-5 h-5 rounded-full border border-white/20 bg-[#0a0a0f] flex items-center justify-center group-hover:border-brand-purple transition-colors">
                        <input type="radio" name="opensource" className="hidden peer" />
                        <div className="w-2.5 h-2.5 rounded-full bg-brand-purple scale-0 peer-checked:scale-100 transition-transform" />
                      </div>
                      <span className="text-white">Yes</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-5 h-5 rounded-full border border-white/20 bg-[#0a0a0f] flex items-center justify-center group-hover:border-brand-purple transition-colors">
                        <input type="radio" name="opensource" className="hidden peer" />
                        <div className="w-2.5 h-2.5 rounded-full bg-brand-purple scale-0 peer-checked:scale-100 transition-transform" />
                      </div>
                      <span className="text-white">No</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">GitHub Link <span className="text-slate-500 font-normal">(If available)</span></label>
                  <input type="url" className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-purple focus:bg-[#0f0f16] transition-all" placeholder="https://github.com/..." />
                </div>
              </div>
            </div>

          </div>

          <div className="mt-14 pt-8 border-t border-white/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10 bg-brand-purple/5 border border-brand-purple/10 rounded-xl p-5">
              <ShieldCheck className="text-brand-purple shrink-0" size={28} />
              <div className="space-y-1">
                 <p className="text-sm text-white font-medium">Projects may be reviewed before appearing on the leaderboard.</p>
                 <p className="text-xs text-slate-400 leading-relaxed">Verified open-source projects receive higher visibility across Træcera.</p>
              </div>
            </div>

            <button className="btn-white w-full py-4 text-base font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">Submit for Review</button>
            <p className="text-center text-xs text-slate-500 mt-4">We typically review submissions within 24–48 hours</p>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
