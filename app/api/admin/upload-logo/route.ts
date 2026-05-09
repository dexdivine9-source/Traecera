import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Initialize Supabase admin client to bypass RLS for updating the DB
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, image_url } = body;

    if (!slug || !image_url) {
      return NextResponse.json({ error: "Missing slug or image_url" }, { status: 400 });
    }

    // 1. Fetch the image from the provided URL
    let imageResponse;
    try {
      imageResponse = await fetch(image_url);
      if (!imageResponse.ok) {
        throw new Error(`HTTP error! status: ${imageResponse.status}`);
      }
    } catch (e) {
      console.error("Fetch image error:", e);
      return NextResponse.json({ error: "Failed to fetch image" }, { status: 400 });
    }

    // 2. Convert it to a buffer
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Save it to /public/projects/{slug}.png
    const projectsDir = path.join(process.cwd(), 'public', 'projects');
    if (!fs.existsSync(projectsDir)) {
      fs.mkdirSync(projectsDir, { recursive: true });
    }
    
    const filePath = path.join(projectsDir, `${slug}.png`);
    try {
      fs.writeFileSync(filePath, buffer);
    } catch (e) {
      console.error("Save image error:", e);
      return NextResponse.json({ error: "Failed to save image" }, { status: 500 });
    }

    // 4. Update the Supabase projects table
    const dbPath = `/projects/${slug}.png`;
    const { error: updateError } = await supabase
      .from('projects')
      .update({ logo: dbPath })
      .eq('slug', slug);

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return NextResponse.json({ error: "Failed to update database" }, { status: 500 });
    }

    // 5. Return success response
    return NextResponse.json({ success: true, path: dbPath });

  } catch (error) {
    console.error("Upload logo internal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
