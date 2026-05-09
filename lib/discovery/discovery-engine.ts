import { getSupabaseAdminClient } from "../supabase-server";
import * as cheerio from "cheerio";

export interface DiscoveredProject {
  name: string;
  description?: string;
  website?: string;
  github_url?: string;
  logo?: string;
  source: string;
  country?: string;
  category_hint?: string;
}

const AFRICAN_COUNTRIES = [
  "Nigeria", "Kenya", "Ghana", "South Africa", 
  "Egypt", "Ethiopia", "Rwanda", "Senegal", "Africa"
];

// SOURCE 1 — Superteam Earn Scraper
export async function fetchSuperteamProjects(): Promise<DiscoveredProject[]> {
  const projects: DiscoveredProject[] = [];
  try {
    const regions = ["nigeria", "kenya", "ghana"];
    for (const region of regions) {
      const res = await fetch(`https://earn.superteam.fun/api/listings?category=project&region=${region}&limit=50`);
      if (!res.ok) continue;
      
      const data = await res.json();
      const listings = data?.listings || data || [];
      
      for (const item of listings) {
        if (!item.title) continue;
        
        const project: DiscoveredProject = {
          name: item.title,
          description: item.description,
          logo: item.ogImage || item.logo,
          source: 'superteam_earn',
          country: region,
          category_hint: Array.isArray(item.skills) ? item.skills.join(", ") : undefined
        };
        
        if (item.slug) {
           try {
              const pageRes = await fetch(`https://earn.superteam.fun/listings/${item.slug}`);
              if (pageRes.ok) {
                 const html = await pageRes.text();
                 const $ = cheerio.load(html);
                 
                 $("a").each((_, el) => {
                   const href = $(el).attr("href");
                   if (!href) return;
                   const lhref = href.toLowerCase();
                   
                   if (!project.website && !lhref.includes("twitter.com") && !lhref.includes("x.com") && !lhref.includes("github.com") && lhref.startsWith("http")) {
                      project.website = href;
                   }
                   if (!project.github_url && lhref.includes("github.com")) {
                      project.github_url = href;
                   }
                 });
              }
           } catch(e) {
             console.warn(`[fetchSuperteamProjects] Failed to fetch slug page for ${item.slug}`);
           }
        }
        projects.push(project);
      }
    }
  } catch (err) {
    console.error("[fetchSuperteamProjects] Error:", err);
  }
  return projects;
}

// SOURCE 2 — DoraHacks Scraper  
export async function fetchDoraHacksProjects(): Promise<DiscoveredProject[]> {
  const projects: DiscoveredProject[] = [];
  try {
    const res = await fetch(`https://dorahacks.io/api/hackathon/buidl/list?tags=solana&limit=50`);
    if (res.ok) {
       const data = await res.json();
       const list = data?.data?.list || data?.list || [];
       
       for (const item of list) {
          const loc = (item.team_location || "").toLowerCase();
          const isAfrican = AFRICAN_COUNTRIES.some(c => loc.includes(c.toLowerCase()));
          
          if (isAfrican) {
             projects.push({
               name: item.name || item.title,
               description: item.description || item.summary,
               github_url: item.github_url || item.github,
               website: item.website || item.url,
               source: 'dorahacks',
               country: item.team_location
             });
          }
       }
    }
  } catch (err) {
    console.error("[fetchDoraHacksProjects] Error:", err);
  }
  return projects;
}

// SOURCE 3 — GitHub African Solana Developer Search
export async function fetchGitHubAfrican(): Promise<DiscoveredProject[]> {
  const projects: DiscoveredProject[] = [];
  const token = process.env.GITHUB_TOKEN;
  
  if (!token) {
    console.warn("[fetchGitHubAfrican] Missing GITHUB_TOKEN, skipping.");
    return projects;
  }
  
  const headers = { 
    Authorization: `Bearer ${token}`, 
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "træcera-discovery-engine"
  };
  
  const skipKeywords = ['tutorial', 'example', 'demo', 'test', 'practice', 'counter', 'escrow', 'basic', 'template', '.github'];

  try {
    const processRepo = (repo: any) => {
      if (!repo) return;
      const name = (repo.name || "").toLowerCase();
      const desc = (repo.description || "").toLowerCase();
      
      // Skip if name contains bad keywords
      if (skipKeywords.some(kw => name.includes(kw))) return;
      
      // Skip if stars = 0 AND forks = 0 (likely abandoned or practice)
      if (repo.stargazers_count === 0 && repo.forks_count === 0) return;
      
      // Only keep if has real website OR description mentions a real product
      if (repo.homepage || desc.length > 20) {
        projects.push({
          name: repo.name,
          description: repo.description,
          website: repo.homepage,
          github_url: repo.html_url,
          source: 'github_search'
        });
      }
    };

    // QUERY 1: Search for Solana orgs in Africa
    const orgRes = await fetch(`https://api.github.com/search/users?q=location:Nigeria+type:org+solana&per_page=20`, { headers });
    if (orgRes.ok) {
      const orgData = await orgRes.json();
      for (const org of orgData?.items || []) {
        const reposRes = await fetch(`https://api.github.com/users/${org.login}/repos?per_page=10`, { headers });
        if (reposRes.ok) {
          const repos = await reposRes.json();
          for (const repo of repos) {
             processRepo(repo);
          }
        }
      }
    }

    // QUERIES 2, 3, 4: Repository searches
    const repoEndpoints = [
      "https://api.github.com/search/repositories?q=solana+topic:solana+user:location:Nigeria+stars:>2&sort=stars&per_page=20",
      "https://api.github.com/search/repositories?q=solana+africa+language:typescript&sort=updated&per_page=20",
      "https://api.github.com/search/repositories?q=solana+nigeria+language:typescript&sort=updated&per_page=20"
    ];

    for (const endpoint of repoEndpoints) {
      const res = await fetch(endpoint, { headers });
      if (!res.ok) continue;
      const data = await res.json();
      for (const repo of data?.items || []) {
        processRepo(repo);
      }
    }
    
  } catch (err) {
    console.error("[fetchGitHubAfrican] Error:", err);
  }
  return projects;
}

// SOURCE 4 — Devfolio Search
export async function fetchDevfolioProjects(): Promise<DiscoveredProject[]> {
  const projects: DiscoveredProject[] = [];
  try {
    const res = await fetch(`https://devfolio.co/api/search/projects?q=solana&hackathon=renaissance,hyperdrive`);
    if (res.ok) {
       const data = await res.json();
       const hits = data?.hits || data?.projects || [];
       
       for (const hit of hits) {
          const loc = (hit.team?.country || "").toLowerCase();
          const isAfrican = AFRICAN_COUNTRIES.some(c => loc.includes(c.toLowerCase()));
          
          if (isAfrican) {
             projects.push({
               name: hit.name,
               description: hit.tagline || hit.description,
               website: hit.links?.website,
               github_url: hit.links?.github,
               source: 'devfolio',
               country: hit.team?.country
             });
          }
       }
    }
  } catch(err) {
     console.error("[fetchDevfolioProjects] Error:", err);
  }
  return projects;
}

// MAIN ORCHESTRATOR
export async function runDiscoveryEngine(): Promise<{
  total_found: number
  by_source: Record<string, number>
  new_projects: number
  already_known: number
}> {
   const stats = {
     total_found: 0,
     by_source: { superteam_earn: 0, dorahacks: 0, github_search: 0, devfolio: 0 } as Record<string, number>,
     new_projects: 0,
     already_known: 0
   };

   // 1. Run all 4 sources in parallel using Promise.allSettled
   console.log("[runDiscoveryEngine] Starting discovery sequence across 4 providers...");
   const results = await Promise.allSettled([
     fetchSuperteamProjects(),
     fetchDoraHacksProjects(),
     fetchGitHubAfrican(),
     fetchDevfolioProjects()
   ]);

   const allProjects: DiscoveredProject[] = [];
   const sourceNames = ['superteam_earn', 'dorahacks', 'github_search', 'devfolio'];

   results.forEach((res, idx) => {
      const src = sourceNames[idx];
      if (res.status === 'fulfilled') {
         allProjects.push(...res.value);
         stats.by_source[src] = res.value.length;
         console.log(`[runDiscoveryEngine] ${src} yielded ${res.value.length} projects.`);
      } else {
         console.error(`[runDiscoveryEngine] Source ${src} failed`, res.reason);
      }
   });

   stats.total_found = allProjects.length;
   
   // 2. Deduplicate by project name (fuzzy match — ignore case)
   const uniqueProjectsMap = new Map<string, DiscoveredProject>();
   for (const p of allProjects) {
      if (!p.name) continue;
      const key = p.name.trim().toLowerCase();
      if (!uniqueProjectsMap.has(key)) {
         uniqueProjectsMap.set(key, p);
      }
   }
   
   const deduplicated = Array.from(uniqueProjectsMap.values());
   
   // 3. For each NEW project not already in Supabase
   const supabase = getSupabaseAdminClient();
   
   // Fetch all existing names from discovered_projects
   const { data: existingRecords, error: fetchError } = await supabase
     .from('discovered_projects')
     .select('name');
     
   if (fetchError) {
     console.error("[runDiscoveryEngine] Failed to fetch existing records", fetchError);
   }
     
   const existingNames = new Set((existingRecords || []).map(r => r.name.trim().toLowerCase()));

   for (const proj of deduplicated) {
      const key = proj.name.trim().toLowerCase();
      
      // DEDUPLICATION LOGIC
      if (existingNames.has(key)) {
         stats.already_known++;
      } else {
         stats.new_projects++;
         existingNames.add(key); // Add to local cache to prevent duplicates within this batch
         
         // Insert into discovered_projects
         const { error: insertError } = await supabase.from('discovered_projects').insert({
            name: proj.name,
            description: proj.description,
            website: proj.website,
            github_url: proj.github_url,
            logo: proj.logo,
            source: proj.source,
            country: proj.country,
            category_hint: proj.category_hint,
            review_status: 'pending' // Queued for enrichment
         });
         
         if (insertError) {
           console.error(`[runDiscoveryEngine] Failed to insert ${proj.name}`, insertError);
         } else {
           console.log(`[runDiscoveryEngine] New project discovered: ${proj.name} [${proj.source}]`);
           // In a full background worker setup, you would queue enrichProject() here.
         }
      }
   }

   console.log("[runDiscoveryEngine] Discovery complete!", stats);
   return stats;
}
