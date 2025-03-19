/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, FileJson, FileSpreadsheet, FileText, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import type { Project } from "./ProjectTable"
import { exportProjects } from "@/server/data/projectactions"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface ExportButtonProps {
    projects: Project[]
    selectedProjects?: Project[]
  }
  
  export default function ExportButton({ projects, selectedProjects }: ExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false)
  
    const handleExport = async (format: "csv" | "json" | "pdf") => {
      try {
        setIsExporting(true)
        const dataToExport = selectedProjects && selectedProjects.length > 0 ? selectedProjects : projects
  
        if (dataToExport.length === 0) {
          toast.error("No projects to export")
          return
        }
  
        // Show a message indicating what's being exported
        const exportMessage =
          selectedProjects && selectedProjects.length > 0
            ? `Exporting ${selectedProjects.length} selected project${selectedProjects.length > 1 ? "s" : ""}...`
            : `Exporting all ${projects.length} project${projects.length > 1 ? "s" : ""}...`
  
        toast.info(exportMessage)
  
        const result = await exportProjects(dataToExport, format)
  
        if (result.success) {
          if (format === "pdf") {
            // Generate PDF on the client side
            generatePDF(JSON.parse(result.data || ""), result.filename || "projects-export.pdf")
          } else {
            // Create a download link and trigger it for CSV and JSON
            const url = window.URL.createObjectURL(new Blob([result.data || ""], { type: result.contentType }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", result.filename || `projects-export.${format}`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
          }
  
          const successMessage =
            selectedProjects && selectedProjects.length > 0
              ? `${selectedProjects.length} selected project${selectedProjects.length > 1 ? "s" : ""} exported as ${format.toUpperCase()}`
              : `All projects exported as ${format.toUpperCase()}`
  
          toast.success(successMessage)
        } else {
          toast.error(result.error || "Failed to export projects")
        }
      } catch (error) {
        console.error("Export error:", error)
        toast.error("An error occurred during export")
      } finally {
        setIsExporting(false)
      }
    }
  
    // Generate PDF on the client side
    const generatePDF = (data: any, filename: string) => {
      const { title, timestamp, count, projects } = data
  
      // Create a new PDF document
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })
  
      // Define footer function to be used on all pages
      const addFooter = (pageNumber: number, totalPages: number) => {
        // Save the current state
        const currentFontSize = doc.getFontSize()
        const currentTextColor = doc.getTextColor()
  
        // Set footer style
        doc.setFontSize(8)
        doc.setTextColor(127, 140, 141) // Light gray
  
        // Clear any existing content in the footer area
        doc.setFillColor(255, 255, 255) // White
        doc.rect(10, 285, 190, 10, "F") // Create a white rectangle to clear the area
  
        // Add footer text
        doc.text(`Page ${pageNumber} of ${totalPages}`, 14, 290)
        doc.text("Generated with Project Management System", 105, 290, { align: "center" })
  
        // Restore the previous state
        doc.setFontSize(currentFontSize)
        doc.setTextColor(currentTextColor)
      }
  
      // Add title
      doc.setFontSize(20)
      doc.setTextColor(44, 62, 80) // Dark blue-gray color
      doc.text("Projects Export", 14, 20)
  
      // Add timestamp
      doc.setFontSize(10)
      doc.setTextColor(127, 140, 141) // Light gray
      const formattedTimestamp = new Date(timestamp).toLocaleString()
      doc.text(`Generated: ${formattedTimestamp}`, 14, 26)
  
      // Add count
      doc.setFontSize(12)
      doc.setTextColor(52, 73, 94) // Slate blue
      doc.text(`Total Projects: ${count}`, 14, 32)
  
      // Add horizontal line
      doc.setDrawColor(236, 240, 241) // Very light gray
      doc.setLineWidth(0.5)
      doc.line(14, 35, 196, 35)
  
      // Prepare table data for overview
      const tableData = projects.map((project: any, index: number) => [
        (index + 1).toString(),
        project.name,
        project.category,
        project.description.length > 40 ? project.description.substring(0, 40) + "..." : project.description,
        project.techStacks.join(", "),
      ])
  
      // Add overview table
      autoTable(doc, {
        startY: 40,
        head: [["#", "Name", "Category", "Description", "Tech Stack"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [41, 128, 185], // Blue
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250], // Very light blue
        },
        margin: { top: 40, right: 14, bottom: 20, left: 14 },
        styles: {
          font: "helvetica",
          overflow: "linebreak",
          cellPadding: 5,
        },
        columnStyles: {
          0: { cellWidth: 10 }, // # column
          1: { cellWidth: 40 }, // Name column
          2: { cellWidth: 30 }, // Category column
          3: { cellWidth: 60 }, // Description column
          4: { cellWidth: 50 }, // Tech Stack column
        },
      })
  
      // Add footer to the first page
      addFooter(1, projects.length + 1)
  
      // Add detailed project pages
      projects.forEach((project: any, index: number) => {
        // Add a new page for each project
        doc.addPage()
  
        // Project title
        doc.setFontSize(18)
        doc.setTextColor(44, 62, 80) // Dark blue-gray color
        doc.text(project.name, 14, 20)
  
        // Project category
        doc.setFontSize(10)
        doc.setTextColor(127, 140, 141) // Light gray
        doc.text(`Category: ${project.category}`, 14, 28)
  
        // Add horizontal line
        doc.setDrawColor(236, 240, 241) // Very light gray
        doc.setLineWidth(0.5)
        doc.line(14, 30, 196, 30)
  
        // Description section
        doc.setFontSize(14)
        doc.setTextColor(41, 128, 185) // Blue
        doc.text("Description", 14, 38)
  
        doc.setFontSize(10)
        doc.setTextColor(52, 73, 94) // Dark slate
        const descriptionLines = doc.splitTextToSize(project.description, 180)
        doc.text(descriptionLines, 14, 45)
  
        let currentY = 45 + descriptionLines.length * 5 + 10
  
        // Technologies section
        doc.setFontSize(14)
        doc.setTextColor(41, 128, 185) // Blue
        doc.text("Technologies", 14, currentY)
        currentY += 7
  
        doc.setFontSize(10)
        doc.setTextColor(52, 73, 94) // Dark slate
  
        if (project.techStacks && project.techStacks.length > 0) {
          project.techStacks.forEach((tech: string) => {
            doc.text(`• ${tech}`, 14, currentY)
            currentY += 5
          })
        } else {
          doc.text("No technologies specified", 14, currentY)
          currentY += 5
        }
  
        currentY += 5
  
        // Features section
        doc.setFontSize(14)
        doc.setTextColor(41, 128, 185) // Blue
        doc.text("Features", 14, currentY)
        currentY += 7
  
        doc.setFontSize(10)
        doc.setTextColor(52, 73, 94) // Dark slate
  
        if (project.features && project.features.length > 0) {
          project.features.forEach((feature: any) => {
            doc.setFont("helvetica", "bold")
            doc.text(`• ${feature.name}`, 14, currentY)
            currentY += 5
  
            if (feature.description) {
              doc.setFont("helvetica", "normal")
              const featureDescLines = doc.splitTextToSize(feature.description, 175)
              doc.text(featureDescLines, 18, currentY)
              currentY += featureDescLines.length * 5
            }
  
            currentY += 2
          })
        } else {
          doc.text("No features specified", 14, currentY)
          currentY += 5
        }
  
        // Demo URL if available
        if (project.demoUrl) {
          currentY += 5
          doc.setFontSize(14)
          doc.setTextColor(41, 128, 185) // Blue
          doc.text("Demo URL", 14, currentY)
          currentY += 7
  
          doc.setFontSize(10)
          doc.setTextColor(52, 73, 94) // Dark slate
          doc.text(project.demoUrl, 14, currentY)
        }
  
        // Add footer to each project page
        addFooter(index + 2, projects.length + 1 )
      })
  
      // Save the PDF
      doc.save(filename)
    }
  
    // Determine button text based on selection
    const getButtonText = () => {
      if (isExporting) {
        return (
          <>
            <div className="size-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            Exporting...
          </>
        )
      }
  
      if (selectedProjects && selectedProjects.length > 0) {
        return (
          <>
            <Download className="size-4 mr-2" />
            Export Selected ({selectedProjects.length})
            <ChevronDown className="ml-2 h-4 w-4" />
          </>
        )
      }
  
      return (
        <>
          <Download className="size-4 mr-2" />
          Export All
          <ChevronDown className="ml-2 h-4 w-4" />
        </>
      )
    }
  
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="border-[#acc2ef] bg-white hover:bg-muted/10"
            disabled={isExporting}
          >
            {getButtonText()}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px]">
          <DropdownMenuItem onClick={() => handleExport("csv")} className="cursor-pointer">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            <span>Export as CSV</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport("json")} className="cursor-pointer">
            <FileJson className="mr-2 h-4 w-4" />
            <span>Export as JSON</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport("pdf")} className="cursor-pointer">
            <FileText className="mr-2 h-4 w-4" />
            <span>Export as PDF</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }