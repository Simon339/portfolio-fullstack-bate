
import ProjectDetailsClient from "@/components/Dashboard/ProjectDetails";
import { fetchProjectById } from "@/server/data/projectactions";
import { notFound } from "next/navigation";

interface ProjectDetailsPageProps {
  params: { id: string };
}

export default async function ProjectDetailsPage({ params }: ProjectDetailsPageProps) {
  const { id } = params;

  // Fetch the project data
  const result = await fetchProjectById(id);


  if (!result.success || !result.data) {
    notFound()
  }

  return <ProjectDetailsClient project={result.data} />
  
}
