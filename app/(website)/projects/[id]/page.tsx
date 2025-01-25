"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { projectsData } from "@/data"; // Assuming projectsData is a static import
import ProjectDetails from "@/components/Website/ProjectDetails";

interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  iconLists: string[];
  link: string;
  img: string;
  iconlists?: undefined;
  features: string[];
  Features?: undefined;
}

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const projectId = Number(params.id);
    const foundProject = projectsData.find((item) => item.id === projectId);
    setProject(foundProject || null);
  }, [params.id]);

  const handleBack = () => {
    router.back();
  };

  if (!project) {
    return (
      <section className="rounded-xl text-white shadow-md mt-4 px-4 overflow-hidden min-h-screen flex flex-col">
        <div className="flex items-center justify-between p-2 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <Button onClick={handleBack} variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="items-center mb-10">
          <div className="flex flex-col items-center">
            <h2 className="text-xl text-center">Project not found</h2>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl text-white shadow-md mt-4 px-4 overflow-hidden min-h-screen flex flex-col">
      <div className="flex items-center justify-between p-2 mt-7 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <Button onClick={handleBack} variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4 text-slate-400" />
          </Button>
        </div>
      </div>

        <ProjectDetails project={project} />
    </section>
  );
};

export default Page;
