import { notFound } from "next/navigation";
import ProjectCard from "@/components/ProjectCard";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = getSupabaseServerClient();

  const { data: project, error } = await supabase
    .from(process.env.SUPABASE_PROJECTS_TABLE ?? "projects")
    .select("name, description, transaction_volume, active_users, volume_24h, growth_percent, metrics_updated_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !project) notFound();

  return (
    <main className="mx-auto max-w-4xl p-6">
      <ProjectCard project={project} />
    </main>
  );
}
