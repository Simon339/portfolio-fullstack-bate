/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Filter, ChevronLeft, ChevronRight, Clock, User, Activity, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { exportLogs, fetchLogs } from "@/server/actions/audit-log"

type LogEntry = {
  id: string
  timestamp: string
  userId: string | null
  action: string
  details: string | null
  tableName?: string
  recordId?: string
  ipAddress: string | null
  userAgent: string | null
}

const Report = () => {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterUser, setFilterUser] = useState("")
  const [filterAction, setFilterAction] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadLogs()
  }, [currentPage, filterUser, filterAction])

  const loadLogs = async () => {
    setIsLoading(true)
    try {
      const result = await fetchLogs(currentPage, filterUser, filterAction)
      if (result && result.logs) {
        setLogs(result.logs)
        setTotalPages(result.totalPages)
      } else {
        setLogs([])
        setTotalPages(1)
      }
    } catch{
      setLogs([])
      setTotalPages(1)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async (format: "pdf" | "json" | "csv") => {
    try {
      if (format === "pdf") {
        // Dynamically import jsPDF only when needed
        const jsPDFModule = await import("jspdf")
        const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF

        // Create a new document
        const doc = new jsPDF()

        // Add title
        doc.setFontSize(16)
        doc.text("Audit Logs Report", 14, 20)

        // Add filters info
        doc.setFontSize(10)
        doc.text(`User Filter: ${filterUser || "None"}`, 14, 30)
        doc.text(`Action Filter: ${filterAction}`, 14, 35)
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 40)

        // Add table headers
        doc.setFontSize(10)
        doc.text("Timestamp", 14, 50)
        doc.text("User ID", 60, 50)
        doc.text("Action", 100, 50)
        doc.text("IP Address", 140, 50)
        doc.text("Details", 180, 50)

        // Add table rows
        let y = 55
        logs.forEach((log, index) => {
          if (y > 280) {
            doc.addPage()
            y = 20

            // Add headers on new page
            doc.text("Timestamp", 14, y)
            doc.text("User ID", 60, y)
            doc.text("Action", 100, y)
            doc.text("IP Address", 140, y)
            doc.text("Details", 180, y)
            y += 5
          }

          const timestamp = new Date(log.timestamp).toLocaleString()
          doc.text(timestamp, 14, y)
          doc.text(log.userId?.substring(0, 10) || "N/A", 60, y)
          doc.text(log.action, 100, y)
          doc.text(log.ipAddress?.substring(0, 15) || "N/A", 140, y)

          // Truncate details to avoid overflow
          const details = log.details
            ? log.details.length > 20
              ? log.details.substring(0, 20) + "..."
              : log.details
            : "N/A"
          doc.text(details, 180, y)

          y += 5
        })

        // Save the PDF
        doc.save("audit-logs.pdf")
      } else {
        // Handle JSON and CSV exports using the server action
        const blob = await exportLogs(format, filterUser, filterAction)
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `audit_logs.${format}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    } catch {
      alert("Failed to export logs. Please try again.");
    }
  }

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "create":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
      case "update":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
      case "delete":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
    }
  }

  return (
    <Card className="w-full mx-auto bg-transparent border-none text-gray-800">
      <CardHeader>
        <CardTitle className="text-center text-xl font-bold">Audit Logs</CardTitle>
        <CardDescription className="text-center text-gray-600">View and manage system audit logs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-1 gap-3">
            <div className="relative flex-1">
              <User size={20} className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 " />
              <Input
                placeholder="Filter by user ID..."
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="max-w-sm pl-9 text-gray-600 bg-[#fff] hover:border-[#acc2ef]"
              />
            </div>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-[140px] text-gray-800 bg-[#fff] hover:border-[#acc2ef]">
                <Activity className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={loadLogs}
              variant="secondary"
              className="text-gray-800 hover:text-white hover:bg-black-200 border-[#acc2ef] bg-transparent"
            >
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>

            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="ml-auto hover:text-white hover:bg-black-200 border-[#acc2ef] bg-transparent"
                  >
                    <Download className="mr-2 h-4 w-4" /> Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport("pdf")}>Export as PDF</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("json")}>Export as JSON</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("csv")}>Export as CSV</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="flex-grow p-2 rounded-2xl border border-gray-200 text-gray-800 bg-white">
          <Table className="w-full h-full rounded-2xl border-[#acc2ef]">
            <TableHeader className="border-r-1 border-[#acc2ef] border-b text-gray-800 hover:bg-gray-300 rounded-md">
              <TableRow className="bg-white border-r-1 border-[#acc2ef] text-gray-800 hover:bg-gray-300 hover:rounded-2xl">
                <TableHead className="w-[200px] text-gray-800 font-semibold hover:bg-gray-300">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Timestamp
                  </div>
                </TableHead>
                <TableHead className="text-gray-800 font-semibold hover:bg-gray-300">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" /> User ID
                  </div>
                </TableHead>
                <TableHead className="text-gray-800 font-semibold hover:bg-gray-300">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" /> Action
                  </div>
                </TableHead>
                <TableHead className="text-gray-800 font-semibold hover:bg-gray-300">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4" /> IP Address
                  </div>
                </TableHead>
                <TableHead className="text-gray-800 font-semibold hover:bg-gray-300">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4" /> Details
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="hover:bg-gray-300 hover:rounded-2xl rounded-md">
              {logs && logs.length > 0 ? (
                logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-gray-300 hover:rounded-2xl border-b-0 rounded-md ">
                    <TableCell className="font-medium">{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{log.userId || "N/A"}</TableCell>
                    <TableCell>
                      <Badge className={`${getActionBadgeColor(log.action)}`}>{log.action}</Badge>
                    </TableCell>
                    <TableCell className="max-w-md truncate">{log.ipAddress || "N/A"}</TableCell>
                    <TableCell className="max-w-md truncate">{log.details || "N/A"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-[400px] w-full text-center">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full w-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full w-full">
                        <Info className="h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-gray-500 text-lg">No data available</p>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="text-gray-600 hover:text-white hover:bg-black-200 border-[#acc2ef] bg-transparent"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="text-gray-600 hover:text-white hover:bg-black-200 border-[#acc2ef] bg-transparent"
          >
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default Report

