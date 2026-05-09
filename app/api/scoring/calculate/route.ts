import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calculateTraeceraScore } from '@/lib/scoring/traecera-score';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
  // Validate cron secret to prevent unauthorized access
  const cronSecret = req.headers.get('x-cron-secret');
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Fetch all projects
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*');

    if (error || !projects) {
      throw new Error(error?.message || 'Failed to fetch projects from Supabase');
    }

    if (projects.length === 0) {
      return NextResponse.json({ message: 'No projects to score' });
    }

    let totalScore = 0;
    let highest = { name: '', score: -1 };
    let lowest = { name: '', score: 101 };

    // 2. Run calculateTraeceraScore() for each
    for (const project of projects) {
      const score = calculateTraeceraScore(project);
      
      totalScore += score.total;
      
      if (score.total > highest.score) {
        highest = { name: project.name, score: score.total };
      }
      if (score.total < lowest.score) {
        lowest = { name: project.name, score: score.total };
      }

      // 3. Update each project in Supabase
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          traecera_score: score.total,
          score_breakdown: score.breakdown,
          score_calculated_at: new Date().toISOString()
        })
        .eq('id', project.id);

      if (updateError) {
        console.error(`Failed to update project ${project.name}:`, updateError);
      }
    }

    const average_score = Math.round((totalScore / projects.length) * 10) / 10;

    // 4. Return summary
    return NextResponse.json({
      projects_scored: projects.length,
      average_score,
      highest,
      lowest
    });

  } catch (error: any) {
    console.error('Scoring error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
