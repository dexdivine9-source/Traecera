import * as dotenv from 'dotenv';
import { createClient } from "@supabase/supabase-js";
dotenv.config({ path: '.env.local' });

async function deleteFake() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) throw new Error("Missing Supabase env vars");
  
  const supabase = createClient(url, key);
  
  const { error } = await supabase
    .from("discovered_projects")
    .delete()
    .eq("source", "github_search");
    
  if (error) {
    console.error("Failed to delete", error);
  } else {
    console.log("Successfully deleted old github_search projects!");
  }
}

deleteFake();
