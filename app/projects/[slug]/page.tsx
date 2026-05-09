import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getProjectBySlug, getProjectsByCategory } from '@/lib/projects'
import { ExternalLink, Twitter, Activity, Globe, MapPin, CheckCircle, Users, BarChart3, TrendingUp, Zap, Clock, ShieldCheck, Database } from 'lucide-react'

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

// Formatters
function formatMoney(value: number | null | undefined) {
  if (!value || value === 0) return "Data Pending";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number | null | undefined) {
  if (!value || value === 0) return "Data Pending";
  return new Intl.NumberFormat("en-US").format(value);
}

function formatPercent(value: number | null | undefined) {
  if (!value || value === 0) return "Data Pending";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function getStatusBadge(stage: string | null) {
  const s = (stage || "").toLowerCase();
  if (s.includes('live')) {
    return <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>Live</span>;
  }
  if (s.includes('beta')) {
    return <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-medium text-yellow-400 border border-yellow-500/20"><span className="h-1.5 w-1.5 rounded-full bg-yellow-500"></span>Beta</span>;
  }
  return <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-500/10 px-2.5 py-0.5 text-xs font-medium text-zinc-400 border border-zinc-500/20"><span className="h-1.5 w-1.5 rounded-full bg-zinc-500"></span>Coming Soon</span>;
}

function getDataSourceBadge(source: string | null) {
  switch (source) {
    case 'onchain_verified':
      return <span className="text-[10px] font-bold tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">VERIFIED</span>;
    case 'reported':
      return <span className="text-[10px] font-bold tracking-wider text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">REPORTED</span>;
    default:
      return <span className="text-[10px] font-bold tracking-wider text-zinc-400 bg-zinc-400/10 px-2 py-0.5 rounded border border-zinc-400/20">ESTIMATED</span>;
  }
}

export default async function ProjectProfile({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug).catch(() => null);
  
  if (!project) {
    notFound();
  }

  const category = project.category || "DeFi";
  let relatedProjects = [];
  try {
    const allRelated = await getProjectsByCategory(category);
    relatedProjects = allRelated.filter(p => p.slug !== project.slug).slice(0, 3);
  } catch (e) {
    console.error("Failed to fetch related projects");
  }

  const logoUrl = project.logo || project.logo_url || "https://avatar.vercel.sh/" + project.name;
  const description = project.full_description || project.short_description || project.description || "No description available.";
  const country = project.country || "Nigeria";

  return (
    <div className="min-h-screen bg-black text-white pb-20 selection:bg-purple-500/30">
      
      {/* SECTION 1 — Project Header */}
      <header className="relative border-b border-white/5 bg-zinc-950 pt-24 pb-16">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none" />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-start gap-8">
            <div className="flex-shrink-0 relative h-24 w-24 md:h-32 md:w-32 rounded-full overflow-hidden border border-white/10 bg-zinc-900 shadow-xl shadow-purple-900/20">
              <img src={logoUrl} alt={project.name} className="h-full w-full object-cover" />
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">{project.name}</h1>
                {project.ecosystem_verified && (
                  <span className="flex items-center gap-1 text-sm font-medium text-blue-400 bg-blue-400/10 px-2.5 py-1 rounded-full border border-blue-400/20">
                    <ShieldCheck className="h-4 w-4" /> Ecosystem Verified
                  </span>
                )}
                {project.social_verified && (
                  <span className="flex items-center gap-1 text-sm font-medium text-purple-400 bg-purple-400/10 px-2.5 py-1 rounded-full border border-purple-400/20">
                    <CheckCircle className="h-4 w-4" /> Social Verified
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-4 text-sm">
                <span className="inline-flex items-center rounded-md bg-purple-500/10 px-2.5 py-1 font-medium text-purple-400 border border-purple-500/20">
                  {category}
                </span>
                {getStatusBadge(project.stage || project.status)}
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <MapPin className="h-4 w-4" /> 🇳🇬 {country}
                </span>
              </div>

              <p className="mt-6 text-lg text-zinc-300 max-w-3xl leading-relaxed">
                {description}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                {project.website && (
                  <a href={project.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200">
                    <Globe className="h-4 w-4" /> Visit Website
                  </a>
                )}
                {project.x_link && (
                  <a href={project.x_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800">
                    <Twitter className="h-4 w-4" /> Follow on X
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* SECTION 2 — Intelligence Pillars */}
      <main className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-semibold mb-8 text-white flex items-center gap-2">
          <Database className="h-6 w-6 text-purple-400" /> Intelligence Pillars
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Advanced Analytics */}
          <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-6 flex flex-col hover:border-purple-500/30 transition-colors">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-medium text-white">Advanced Analytics</h3>
            </div>
            
            <div className="space-y-6 flex-1">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm text-zinc-400 flex items-center gap-1.5"><Users className="h-4 w-4" /> Active Users</p>
                  {getDataSourceBadge(project.data_source)}
                </div>
                <p className="text-2xl font-semibold text-white">{formatNumber(project.active_users)}</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm text-zinc-400 flex items-center gap-1.5"><Activity className="h-4 w-4" /> Transaction Volume</p>
                  {getDataSourceBadge(project.data_source)}
                </div>
                <p className="text-2xl font-semibold text-white">{formatMoney(project.transaction_volume)}</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm text-zinc-400 flex items-center gap-1.5"><Zap className="h-4 w-4" /> Volume 24h</p>
                  {getDataSourceBadge(project.data_source)}
                </div>
                <p className="text-2xl font-semibold text-white">{formatMoney(project.volume_24h)}</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm text-zinc-400 flex items-center gap-1.5"><TrendingUp className="h-4 w-4" /> Growth 30D</p>
                  {getDataSourceBadge(project.data_source)}
                </div>
                <p className={`text-2xl font-semibold ${!project.growth_percent || project.growth_percent === 0 ? 'text-zinc-400 text-base font-normal mt-1' : project.growth_percent > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatPercent(project.growth_percent)}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Project Intelligence */}
          <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-6 flex flex-col hover:border-purple-500/30 transition-colors">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Globe className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-medium text-white">Project Intelligence</h3>
            </div>
            
            <div className="space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-white/5">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Category</p>
                  <p className="text-sm font-medium text-zinc-200">{category}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Status</p>
                  <p className="text-sm font-medium text-zinc-200">{project.stage || project.status || "Unknown"}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-white/5">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Location</p>
                  <p className="text-sm font-medium text-zinc-200">{country}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Data Source</p>
                  <p className="text-sm font-medium text-zinc-200 capitalize">{(project.data_source || 'mock').replace('_', ' ')}</p>
                </div>
              </div>

              <div className="pb-4 border-b border-white/5">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Team Details</p>
                <div className="text-sm text-zinc-300">
                  {project.team_members && Array.isArray(project.team_members) && project.team_members.length > 0 ? (
                    <div className="flex -space-x-2">
                      {project.team_members.map((member: any, i: number) => (
                         member.avatar_url ? <img key={i} src={member.avatar_url} alt="Team" className="w-8 h-8 rounded-full border-2 border-zinc-900" title={member.name || member.username} /> : null
                      ))}
                      <span className="w-8 h-8 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 z-10">+{project.team_members.length}</span>
                    </div>
                  ) : (
                    "Team data coming soon"
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Funding Info</p>
                <p className="text-sm font-medium text-zinc-300">{project.funding_info || "Not disclosed"}</p>
              </div>
            </div>
          </div>

          {/* Card 3: Tracking & Monitoring */}
          <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-6 flex flex-col hover:border-purple-500/30 transition-colors">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Activity className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-medium text-white">Tracking & Monitoring</h3>
            </div>
            
            <div className="space-y-6 flex-1">
              <div>
                <p className="text-sm text-zinc-400 mb-1">Last Updated</p>
                <div className="flex items-center gap-2 text-white font-medium">
                  <Clock className="h-4 w-4 text-zinc-500" />
                  {project.metrics_updated_at || project.updated_at ? new Date(project.metrics_updated_at || project.updated_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' }) : "Pending"}
                </div>
              </div>

              <div>
                <p className="text-sm text-zinc-400 mb-1">Tracking Mode</p>
                <div className="inline-flex items-center gap-2 bg-zinc-950 px-3 py-2 rounded-lg border border-white/5 mt-1 w-full">
                  {project.tracking_mode === 'program' ? (
                     <><div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div> <span className="text-sm text-zinc-200">On-chain Program Tracked</span></>
                  ) : project.tracking_mode === 'wallet' ? (
                     <><div className="h-2 w-2 rounded-full bg-yellow-500"></div> <span className="text-sm text-zinc-200">Wallet Tracked</span></>
                  ) : (
                     <><div className="h-2 w-2 rounded-full bg-zinc-500"></div> <span className="text-sm text-zinc-400">Tracking Setup Pending</span></>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-zinc-400 mb-2">Network Activity</p>
                <div className="h-24 w-full bg-zinc-950 rounded-lg border border-white/5 flex items-center justify-center overflow-hidden relative">
                   <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
                   <span className="text-xs text-zinc-600 font-mono relative z-10">Activity Graph Placeholder</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* SECTION 3 — Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-12 border-t border-white/5">
          <h2 className="text-2xl font-semibold mb-6 text-white">Related in {category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {relatedProjects.map((rp) => {
              const rpLogo = rp.logo || rp.logo_url || "https://avatar.vercel.sh/" + rp.name;
              return (
                <Link href={`/projects/${rp.slug}`} key={rp.slug} className="group rounded-xl border border-white/5 bg-zinc-900/30 p-4 flex items-center gap-4 hover:bg-zinc-900/80 hover:border-purple-500/30 transition-all">
                  <img src={rpLogo} alt={rp.name} className="h-12 w-12 rounded-full border border-white/10" />
                  <div>
                    <h4 className="font-medium text-white group-hover:text-purple-400 transition-colors">{rp.name}</h4>
                    <div className="mt-1">{getStatusBadge(rp.stage || rp.status)}</div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
