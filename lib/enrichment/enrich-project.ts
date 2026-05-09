import { GoogleGenerativeAI } from "@google/generative-ai";
import * as cheerio from "cheerio";
import { getSupabaseAdminClient } from "../supabase-server";

export interface EnrichedProjectData {
  logo?: string | null;
  x_link?: string | null;
  x_handle?: string | null;
  discord_link?: string | null;
  github_url?: string | null;
  short_description?: string | null;
  full_description?: string | null;
  target_users?: string | null;
  problem_solved?: string | null;
  category?: string | null;
  stage?: string | null;
  team_members?: any[] | null;
  enrichment_status: "complete" | "failed";
  enriched_at: string;
}

export async function enrichProject(project: {
  name: string;
  website?: string;
  github_url?: string;
}) {
  const data: EnrichedProjectData = {
    enrichment_status: "complete",
    enriched_at: new Date().toISOString(),
  };

  let githubUrl = project.github_url;

  // STEP 1 — Logo & Social Links from Website
  if (project.website) {
    try {
      console.log(`[enrichProject] Step 1: Fetching website data for ${project.name} (${project.website})`);
      const response = await fetch(project.website, {
        headers: { "User-Agent": "træcera-bot/1.0" },
      });
      
      if (response.ok) {
        const html = await response.text();
        const $ = cheerio.load(html);

        data.logo = $('meta[property="og:image"]').attr("content") || null;
        
        const fallbackDescription = $('meta[property="og:description"]').attr("content");
        if (fallbackDescription) {
          data.full_description = fallbackDescription;
        }

        $("a").each((_, el) => {
          const href = $(el).attr("href");
          if (!href) return;
          
          const lowerHref = href.toLowerCase();
          if (lowerHref.includes("twitter.com") || lowerHref.includes("x.com")) {
            if (!data.x_link) data.x_link = href;
          } else if (lowerHref.includes("discord.gg") || lowerHref.includes("discord.com/invite")) {
            if (!data.discord_link) data.discord_link = href;
          } else if (lowerHref.includes("github.com") && !lowerHref.includes("github.com/share")) {
            if (!githubUrl) githubUrl = href;
          }
        });
        console.log(`[enrichProject] Step 1: Extracted website data successfully.`);
      } else {
        console.warn(`[enrichProject] Step 1: Website returned status ${response.status}`);
      }
    } catch (err) {
      console.error(`[enrichProject] Step 1: Failed to fetch website for ${project.name}`, err);
    }
  }

  data.github_url = githubUrl;

  // STEP 4 - X/Twitter Profile Data
  if (data.x_link) {
    try {
      const url = new URL(data.x_link);
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length > 0) {
        data.x_handle = parts[0]; // e.g. /tracera_app -> tracera_app
      }
    } catch (e) {
      console.error(`[enrichProject] Step 4: Failed to parse x_link`, e);
    }
  }

  // STEP 2 & 3 — GitHub Data Extraction
  if (githubUrl) {
    try {
      const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (match) {
        const [, owner, repo] = match;
        const cleanRepo = repo.replace(".git", "");
        
        console.log(`[enrichProject] Found GitHub repo: ${owner}/${cleanRepo}`);
        
        const ghHeaders: Record<string, string> = {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "træcera-enrichment-bot"
        };
        
        if (process.env.GITHUB_TOKEN) {
          ghHeaders.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
        }

        // STEP 2: Full Description from GitHub README
        try {
          const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}/readme`, {
            headers: ghHeaders,
          });
          
          if (readmeRes.ok) {
            const readmeJson = await readmeRes.json();
            const readmeContent = Buffer.from(readmeJson.content, "base64").toString("utf-8");

            // Send to Gemini API
            if (process.env.GEMINI_API_KEY) {
              console.log(`[enrichProject] Step 2: Calling Gemini API for ${project.name}`);
              const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
              const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
              
              const prompt = `You are analyzing an African Web3 project for an intelligence platform called træcera.
              
From this README, extract and return JSON only:
{
  "short_description": "string (max 160 chars, what it does)",
  "full_description": "string (max 500 chars, detailed)",
  "target_users": "string (who uses this)",
  "problem_solved": "string (what problem it solves)",
  "category": "one of [Payments, DeFi, Gaming, Infrastructure, RWA, Prediction Markets, Other]",
  "stage": "one of [Live, Beta, Coming Soon]"
}

README content: ${readmeContent.substring(0, 30000)} /* Truncating just to be safe */`;

              const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                  responseMimeType: "application/json",
                },
              });

              const text = result.response.text();
              const parsed = JSON.parse(text);
              
              data.short_description = parsed.short_description;
              data.full_description = parsed.full_description;
              data.target_users = parsed.target_users;
              data.problem_solved = parsed.problem_solved;
              data.category = parsed.category;
              data.stage = parsed.stage;
              console.log(`[enrichProject] Step 2: Gemini summarized README successfully.`);
            } else {
               console.warn(`[enrichProject] Step 2: Missing GEMINI_API_KEY. Skipping Gemini summarization.`);
            }
          } else {
            console.warn(`[enrichProject] Step 2: GitHub README fetch returned status ${readmeRes.status}`);
          }
        } catch (err) {
          console.error(`[enrichProject] Step 2: Failed README/Gemini flow for ${project.name}`, err);
        }

        // STEP 3: Team Members from GitHub
        try {
          console.log(`[enrichProject] Step 3: Fetching GitHub contributors for ${project.name}`);
          const contribRes = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}/contributors?per_page=5`, {
            headers: ghHeaders,
          });
          
          if (contribRes.ok) {
            const contributors = await contribRes.json();
            const teamMembers = [];
            
            for (const c of contributors) {
              if (c.type === "User") {
                const userRes = await fetch(`https://api.github.com/users/${c.login}`, { headers: ghHeaders });
                if (userRes.ok) {
                  const user = await userRes.json();
                  teamMembers.push({
                    username: c.login,
                    avatar_url: c.avatar_url,
                    contributions: c.contributions,
                    name: user.name,
                    bio: user.bio,
                    location: user.location,
                    twitter_username: user.twitter_username,
                  });
                }
              }
            }
            data.team_members = teamMembers;
            console.log(`[enrichProject] Step 3: Extracted ${teamMembers.length} contributors.`);
          } else {
            console.warn(`[enrichProject] Step 3: GitHub contributors fetch returned status ${contribRes.status}`);
          }
        } catch (err) {
          console.error(`[enrichProject] Step 3: Failed to fetch contributors for ${project.name}`, err);
        }
      }
    } catch (err) {
      console.error(`[enrichProject] GitHub fetch generic error for ${project.name}`, err);
    }
  }

  // STEP 5 — Store everything in Supabase
  try {
    console.log(`[enrichProject] Step 5: Storing data in Supabase...`);
    const supabase = getSupabaseAdminClient();
    const projectsTable = process.env.SUPABASE_PROJECTS_TABLE ?? "projects";
    
    // Check if project exists to decide between update and insert
    const { data: existingProject, error: checkError } = await supabase
      .from(projectsTable)
      .select('id')
      .eq('name', project.name)
      .maybeSingle();
      
    if (checkError) {
      console.error(`[enrichProject] Step 5: Error checking for existing project`, checkError);
    }

    const payload = {
      name: project.name,
      website: project.website,
      github_url: data.github_url,
      logo: data.logo,
      x_link: data.x_link,
      x_handle: data.x_handle,
      discord_link: data.discord_link,
      short_description: data.short_description,
      full_description: data.full_description,
      target_users: data.target_users,
      problem_solved: data.problem_solved,
      category: data.category,
      stage: data.stage,
      team_members: data.team_members,
      enrichment_status: data.enrichment_status,
      enriched_at: data.enriched_at,
    };

    if (existingProject) {
      // Update existing
      const { error: updateError } = await supabase
        .from(projectsTable)
        .update(payload)
        .eq('id', existingProject.id);
        
      if (updateError) {
        console.error(`[enrichProject] Step 5: Failed to update projects table`, updateError);
      } else {
        console.log(`[enrichProject] Step 5: Updated projects table for ${project.name}`);
      }
    } else {
      // Insert new
      const { error: insertError } = await supabase
        .from(projectsTable)
        .insert([payload]);
        
      if (insertError) {
        console.error(`[enrichProject] Step 5: Failed to insert into projects table`, insertError);
      } else {
        console.log(`[enrichProject] Step 5: Inserted into projects table for ${project.name}`);
      }
    }

    // Update discovered_projects table
    const { error: discoverError } = await supabase
      .from("discovered_projects")
      .update({ review_status: "enriched" })
      .eq("name", project.name);
      
    if (discoverError) {
      console.error(`[enrichProject] Step 5: Failed to update discovered_projects table`, discoverError);
    } else {
      console.log(`[enrichProject] Step 5: Updated discovered_projects table for ${project.name}`);
    }

  } catch (err) {
    console.error(`[enrichProject] Step 5: Supabase generic error for ${project.name}`, err);
  }

  console.log(`[enrichProject] Enrichment complete for ${project.name}!`);
  return data;
}
