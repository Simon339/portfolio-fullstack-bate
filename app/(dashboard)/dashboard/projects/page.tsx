"use client"

import ProjectTable from "@/components/Dashboard/ProjectTable"

const Page = () => {
  return (
    <section className="rounded-xl bg-gray-50 shadow-md px-4 overflow-hidden min-h-screen flex flex-col">
      <div className="border-b border-[#acc2ef] mb-6 py-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-800">Projects</h1>
          <p className="text-gray-600">Manage Your Projects</p>
          
        </div>
      </div>

      <div className="flex-1 flex">
        <ProjectTable />
      </div>
    </section>
  )
}

export default Page

