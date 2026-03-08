"use client"

import {  autoSeedAllData, checkExistingData, clearAllData  } from "@/server/data/projectactions"
import { useState } from "react"
import ProjectForm from '@/components/Dashboard/forms/ProjectForm'

const page = () => {
    return (
        <section className="rounded-xl bg-gray-50 shadow-md px-4 overflow-hidden min-h-screen flex flex-col">
            <div className="border-b border-[#acc2ef] mb-6 py-4">
                <div className="text-center">
                    <h1 className="text-xl font-semibold text-gray-800">Create New Project</h1>
                </div>
                <AutoSeedButton />
            </div>

            <ProjectForm />
        </section>
    )
}


export function AutoSeedButton() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{
    type: "idle" | "success" | "error" | "info"
    message: string
    details?: any
  }>({ type: "idle", message: "" })

  const handleAutoSeed = async () => {
    setLoading(true)
    setStatus({ type: "idle", message: "Starting auto-seeding process..." })
    
    try {
      // First check if there's existing data
      const existingData = await checkExistingData()
      
      if (existingData.hasData) {
        if (!confirm(`Found existing data: ${existingData.projects} projects, ${existingData.categories} categories, ${existingData.techstacks} tech stacks. Do you want to proceed? This might create duplicates.`)) {
          setLoading(false)
          setStatus({ type: "info", message: "Auto-seeding cancelled by user" })
          return
        }
      }
      
      const result = await autoSeedAllData()
      
      if (result.success) {
        setStatus({
          type: "success",
          message: result.message,
          details: result.summary
        })
      } else {
        setStatus({
          type: "error",
          message: result.message,
          details: result.error
        })
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "Failed to auto-seed data",
        details: error instanceof Error ? error.message : String(error)
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to clear ALL data? This action cannot be undone.")) {
      return
    }
    
    setLoading(true)
    setStatus({ type: "idle", message: "Clearing all data..." })
    
    try {
      const result = await clearAllData()
      
      if (result.success) {
        setStatus({
          type: "success",
          message: result.message
        })
      } else {
        setStatus({
          type: "error",
          message: result.message,
          details: result.error
        })
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "Failed to clear data",
        details: error instanceof Error ? error.message : String(error)
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={handleAutoSeed}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Auto-Seed All Projects"}
          </button>
          
          <button
            onClick={handleClearAll}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear All Data
          </button>
        </div>
        
        {status.message && (
          <div className={`p-3 rounded ${
            status.type === "success" ? "bg-green-50 text-green-800 border border-green-200" :
            status.type === "error" ? "bg-red-50 text-red-800 border border-red-200" :
            "bg-blue-50 text-blue-800 border border-blue-200"
          }`}>
            <p className="font-medium">{status.message}</p>
            
            {status.details && (
              <div className="mt-2 text-sm">
                {typeof status.details === "string" ? (
                  <p>{status.details}</p>
                ) : (
                  <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">
                    {JSON.stringify(status.details, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default page