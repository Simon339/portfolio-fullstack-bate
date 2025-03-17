import ProjectForm from '@/components/Dashboard/forms/ProjectForm'
import React from 'react'

const page = () => {
    return (
        <section className="rounded-xl bg-gray-50 shadow-md px-4 overflow-hidden min-h-screen flex flex-col">
            <div className="border-b border-[#acc2ef] mb-6 py-4">
                <div className="text-center">
                    <h1 className="text-xl font-semibold text-gray-800">Create New Project</h1>
                </div>
            </div>

            <ProjectForm />
        </section>
    )
}

export default page