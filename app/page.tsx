import App from "@/src/App";
import { getAllProjects } from "@/lib/projects";
import { mapSupabaseProjectRow, type Project } from "@/src/data/projects";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let initialProjects: Project[] = [];

  try {
    const rows = await getAllProjects();
    initialProjects =
      rows?.map((row) => mapSupabaseProjectRow(row as Record<string, unknown>)) ?? [];
  } catch (err) {
    console.error("[TRÆCERA] Supabase getAllProjects failed:", err);
  }

  return <App initialProjects={initialProjects} />;
}
