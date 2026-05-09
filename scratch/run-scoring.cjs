const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase environment variables.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Updated Scoring Algorithm v2
 */
function calculateTraeceraScore(project) {
  // 1. Verification Score (30 points max)
  let verification = 0;
  if (project.ecosystem_verified) verification += 15;
  if (project.social_verified) verification += 8;
  if (project.product_verified) verification += 7;

  // 2. Status Score (15 points max)
  let statusScore = 0;
  if (project.status === 'Live') statusScore = 15;
  else if (project.status === 'Beta') statusScore = 8;
  else if (project.status === 'Coming Soon') statusScore = 3;

  // 3. Data Completeness Score (25 points max)
  let completeness = 0;
  if (project.website) completeness += 8;
  if (project.x_link) completeness += 5;
  
  // Check description length
  if (project.description && project.description.length > 100) completeness += 7;
  
  // Check logo isn't unavatar
  if (project.logo && !project.logo.includes('unavatar')) completeness += 5;

  // 4. On-chain Score (20 points max)
  let onchain = 0;
  if (project.tracking_mode === 'program') onchain = 20;
  else if (project.tracking_mode === 'wallet') onchain = 10;
  
  // On-chain bonus
  if (project.data_source === 'onchain_verified') onchain += 5;
  if (onchain > 20) onchain = 20; // Cap at 20

  // 5. Activity Score (10 points max)
  let activity = 0;
  const users = project.active_users || 0;
  if (users > 1000) activity = 10;
  else if (users > 100) activity = 5;
  else if (users > 0) activity = 2;

  let total = verification + statusScore + completeness + onchain + activity;
  if (total > 100) total = 100;

  total = Math.round(total * 10) / 10;

  return {
    total,
    breakdown: {
      verification,
      status: statusScore,
      completeness,
      onchain,
      activity
    }
  };
}

async function run() {
  console.log("[v2] Fetching projects...");
  const { data: projects, error } = await supabase.from('projects').select('*');

  if (error) {
    console.error("Error fetching projects:", error);
    return;
  }

  console.log(`[v2] Scoring ${projects.length} projects...`);

  let totalScore = 0;
  let highest = { name: '', score: -1 };
  let lowest = { name: '', score: 101 };

  for (const project of projects) {
    const score = calculateTraeceraScore(project);
    totalScore += score.total;
    
    if (score.total > highest.score) {
      highest = { name: project.name, score: score.total };
    }
    if (score.total < lowest.score) {
      lowest = { name: project.name, score: score.total };
    }

    const { error: updateError } = await supabase
      .from('projects')
      .update({
        traecera_score: score.total,
        score_breakdown: score.breakdown,
        score_calculated_at: new Date().toISOString()
      })
      .eq('id', project.id);

    if (updateError) {
      console.error(`Error updating project ${project.name}:`, updateError);
    } else {
      console.log(`Updated ${project.name}: ${score.total}`);
    }
  }

  const average_score = Math.round((totalScore / projects.length) * 10) / 10;
  console.log("\n--- NEW SCORING SUMMARY (v2) ---");
  console.log({
    projects_scored: projects.length,
    average_score,
    highest,
    lowest
  });
}

run();
