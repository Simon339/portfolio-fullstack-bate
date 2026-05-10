// This is a server component
import ProjectDetailsClient from "@/components/Dashboard/ProjectDetails";
import { fetchProjectById } from "@/server/data/projectactions";
import Link from "next/link";

interface ProjectDetailsPageProps {
  params: Promise<{ id: string }>;
}

// Server component error page
function ProjectErrorServer() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Not Found</h1>
          <p className="text-gray-600">We couldn't find the project you were looking for.</p>
        </div>

        <div className="space-y-3">
          <Link
            href="/dashboard/projects"
            className="block w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Projects
          </Link>
          
        </div>
      </div>
    </div>
  );
}

export default async function ProjectDetailsPage({ params }: ProjectDetailsPageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const result = await fetchProjectById(id);
  
  if (!result.success || !result.data) {
    return <ProjectErrorServer />;
  }

  return <ProjectDetailsClient project={result.data} />;
}