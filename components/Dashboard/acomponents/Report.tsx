/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Filter, ChevronLeft, ChevronRight, Clock, User, Activity, Globe, Search, RefreshCw, MoreVertical, Eye, Calendar, Shield, Hash, Plus, Trash2, Edit, FileText, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { exportLogs, fetchLogs } from "@/server/actions/audit-log"
import { cn } from "@/lib/utils"

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
  const [timeFilter, setTimeFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [exportLoading, setExportLoading] = useState<"pdf" | "json" | "csv" | null>(null)

  const loadLogs = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await fetchLogs(currentPage, filterUser, filterAction)
      if (result?.logs) {
        setLogs(result.logs)
        setTotalPages(result.totalPages)
      } else {
        setLogs([])
        setTotalPages(1)
      }
    } catch (error) {
      setLogs([])
      setTotalPages(1)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, filterUser, filterAction])

  useEffect(() => {
    loadLogs()
  }, [currentPage, filterUser, filterAction, timeFilter, loadLogs])

  const handleExport = async (format: "pdf" | "json" | "csv") => {
    setExportLoading(format)
    try {
      if (format === "pdf") {
        const jsPDFModule = await import("jspdf")
        const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF
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
        logs.forEach((log) => {
          if (y > 280) {
            doc.addPage()
            y = 20
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

          const details = log.details
            ? log.details.length > 20
              ? log.details.substring(0, 20) + "..."
              : log.details
            : "N/A"
          doc.text(details, 180, y)

          y += 5
        })

        doc.save("audit-logs.pdf")
      } else {
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
    } catch (error) {
      alert("Failed to export logs. Please try again.")
    } finally {
      setExportLoading(null)
    }
  }

  const getActionConfig = (action: string) => {
    switch (action.toLowerCase()) {
      case "create":
        return {
          color: "bg-green-50 text-green-700 border-green-200",
          icon: <Plus className="h-3 w-3 mr-1" />
        }
      case "update":
        return {
          color: "bg-blue-50 text-blue-700 border-blue-200",
          icon: <Edit className="h-3 w-3 mr-1" />
        }
      case "delete":
        return {
          color: "bg-red-50 text-red-700 border-red-200",
          icon: <Trash2 className="h-3 w-3 mr-1" />
        }
      case "login":
        return {
          color: "bg-purple-50 text-purple-700 border-purple-200",
          icon: <Shield className="h-3 w-3 mr-1" />
        }
      default:
        return {
          color: "bg-gray-50 text-gray-700 border-gray-200",
          icon: <Activity className="h-3 w-3 mr-1" />
        }
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const formatRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return "Just now"
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays < 7) return `${diffDays}d ago`
      return date.toLocaleDateString()
    } catch {
      return dateString
    }
  }

  const resetFilters = () => {
    setFilterUser("")
    setFilterAction("all")
    setTimeFilter("all")
    setCurrentPage(1)
  }

  const openLogDetails = (log: LogEntry) => {
    setSelectedLog(log)
    setIsDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Card className="w-full mx-auto border-0 shadow-sm bg-white">
        <CardHeader className="border-b border-gray-100 pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-semibold text-gray-900">Audit Logs</CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Monitor and track system activities and user actions
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={resetFilters}
                size="sm"
                className="border-gray-200 hover:bg-gray-50 bg-gray-50 text-gray-700"
              >
                Reset Filters
              </Button>
              <Button
                onClick={loadLogs}
                size="icon"
                className="h-9 w-9 border-gray-200 hover:bg-gray-50"
                disabled={isLoading}
              >
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-gray-100 shadow-sm">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Logs</p>
                    <p className="text-2xl font-semibold text-gray-900">{logs.length}</p>
                  </div>
                  <div className="h-12 w-12 bg-gray-50 rounded-lg flex items-center justify-center">
                    <Hash className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border border-gray-100 shadow-sm">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Create Actions</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {logs.filter(l => l.action?.toLowerCase() === 'create').length}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <Plus className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border border-gray-100 shadow-sm">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Delete Actions</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {logs.filter(l => l.action?.toLowerCase() === 'delete').length}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-red-50 rounded-lg flex items-center justify-center">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border border-gray-100 shadow-sm">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Update Actions</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {logs.filter(l => l.action?.toLowerCase() === 'update').length}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Edit className="h-3 w-3 text-blue-600" />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters Section */}
          <Card className="border border-gray-100 shadow-sm">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-end gap-6">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Search User</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Enter user ID..."
                        value={filterUser}
                        onChange={(e) => setFilterUser(e.target.value)}
                        className="pl-9 border-gray-200 focus:border-gray-300 text-gray-700 bg-gray-50"
                        onKeyDown={(e) => e.key === 'Enter' && loadLogs()}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium bg-gray-50 text-gray-700">Action Type</label>
                    <Select value={filterAction} onValueChange={setFilterAction}>
                      <SelectTrigger className="border-gray-200 bg-gray-50 text-gray-700">
                        <SelectValue placeholder="All Actions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Actions</SelectItem>
                        <SelectItem value="create">Create</SelectItem>
                        <SelectItem value="update">Update</SelectItem>
                        <SelectItem value="delete">Delete</SelectItem>
                        <SelectItem value="login">Login</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Time Range
                    </label>
                    <Tabs value={timeFilter} onValueChange={setTimeFilter} className="w-full">
                      <TabsList className="grid grid-cols-4 h-9 bg-gray-100 border border-gray-300 rounded-lg p-1">
                        <TabsTrigger
                          value="24h"
                          className="text-xs data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:text-gray-900 text-gray-600"
                        >
                          24h
                        </TabsTrigger>
                        <TabsTrigger
                          value="7d"
                          className="text-xs data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:text-gray-900 text-gray-600"
                        >
                          7d
                        </TabsTrigger>
                        <TabsTrigger
                          value="30d"
                          className="text-xs data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:text-gray-900 text-gray-600"
                        >
                          30d
                        </TabsTrigger>
                        <TabsTrigger
                          value="all"
                          className="text-xs data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:text-gray-900 text-gray-600"
                        >
                          All
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={loadLogs}
                    disabled={isLoading}
                    className="bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200"
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    {isLoading ? "Loading..." : "Apply Filters"}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        disabled={isLoading || logs.length === 0}
                        className="border-gray-200 bg-white text-gray-900 hover:bg-gray-50 hover:text-gray-900"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        {exportLoading ? `Exporting ${exportLoading.toUpperCase()}...` : "Export"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={() => handleExport("pdf")}
                        disabled={exportLoading !== null}
                        className="cursor-pointer"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        PDF Report
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExport("json")}
                        disabled={exportLoading !== null}
                        className="cursor-pointer"
                      >
                        Export as JSON
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExport("csv")}
                        disabled={exportLoading !== null}
                        className="cursor-pointer"
                      >
                        Export as CSV
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </Card>

          {/* Table Section */}
          <Card className="border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader className="bg-gray-50">
                  <TableRow className="border-b border-gray-100 hover:bg-transparent">
                    <TableHead className="text-gray-700 font-semibold py-4 w-[180px]">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Timestamp</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold py-3 w-[200px]">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>User</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold py-4 w-[120px]">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        <span>Action</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold py-4 w-[150px]">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>IP Address</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold py-4 min-w-[200px] max-w-[300px]">
                      Details
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold py-4 w-[100px] text-center">
                      View
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="border-b border-gray-100 last:border-0">
                        <TableCell className="py-4"><Skeleton className="h-4 w-full" /></TableCell>
                        <TableCell className="py-3"><Skeleton className="h-4 w-full" /></TableCell>
                        <TableCell className="py-4"><Skeleton className="h-4 w-full" /></TableCell>
                        <TableCell className="py-4"><Skeleton className="h-4 w-full" /></TableCell>
                        <TableCell className="py-4"><Skeleton className="h-4 w-full" /></TableCell>
                        <TableCell className="py-4"><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : logs.length > 0 ? (
                    logs.map((log) => {
                      const config = getActionConfig(log.action)
                      return (
                        <TableRow
                          key={log.id}
                          className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50"
                        >
                          <TableCell className="py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900">
                                {formatRelativeTime(log.timestamp)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDate(log.timestamp)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 max-w-[200px]">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-semibold text-gray-700">
                                  {(log.userId || 'S').charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium text-gray-900 truncate">
                                  {log.userId || 'System'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {log.userId ? 'User' : 'System Action'}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 whitespace-nowrap">
                            <Badge
                              variant="outline"
                              className={cn("px-3 py-1 rounded-full border font-medium", config.color)}
                            >
                              {config.icon}
                              <span className="capitalize">{log.action}</span>
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 max-w-[150px]">
                            <div className="font-mono text-sm text-gray-700 truncate">
                              {log.ipAddress || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell className="py-4 max-w-[250px]">
                            <div className="group relative">
                              <p className="text-gray-700 truncate">
                                {log.details || 'No details provided'}
                              </p>
                              {log.details && log.details.length > 50 && (
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg p-2 z-50 max-w-xs break-words whitespace-normal">
                                  {log.details}
                                  <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-4 text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 border-gray-200 bg-white hover:bg-gray-50"
                              onClick={() => openLogDetails(log)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <AlertCircle className="h-8 w-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
                          <p className="text-gray-500 max-w-md">
                            Try adjusting your filters or check back later for new audit logs.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Pagination */}
          {logs.length > 0 && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <div className="text-sm text-gray-600">
                Showing page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || isLoading}
                  className="border-gray-200 bg-white hover:bg-gray-50 text-gray-900"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        disabled={isLoading}
                        className={cn(
                          "h-9 w-9",
                          currentPage === pageNum
                            ? "bg-gray-100 text-gray-900 hover:bg-gray-200 border-gray-200"
                            : "border-gray-200 bg-white hover:bg-gray-50"
                        )}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                  {totalPages > 3 && (
                    <span className="px-2 text-gray-400">...</span>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || isLoading}
                  className="border-gray-200 bg-white hover:bg-gray-50 text-gray-900"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Log Details</DialogTitle>
            <DialogDescription>
              Complete information for audit log entry
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Timestamp</h4>
                  <p className="text-gray-900">{formatDate(selectedLog.timestamp)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">User ID</h4>
                  <p className="text-gray-900 truncate">{selectedLog.userId || 'System'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Action</h4>
                  <Badge
                    variant="outline"
                    className={cn("px-3 py-1", getActionConfig(selectedLog.action).color)}
                  >
                    {getActionConfig(selectedLog.action).icon}
                    <span className="capitalize ml-1">{selectedLog.action}</span>
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">IP Address</h4>
                  <p className="text-gray-900 font-mono text-sm truncate">{selectedLog.ipAddress || 'N/A'}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Details</h4>
                <div className="bg-gray-50 rounded-lg p-4 max-h-[200px] overflow-y-auto">
                  <p className="text-gray-900 whitespace-pre-wrap break-words">
                    {selectedLog.details || 'No additional details available'}
                  </p>
                </div>
              </div>

              {(selectedLog.tableName || selectedLog.recordId) && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Table Information</h4>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm">
                    {selectedLog.tableName && (
                      <div>
                        <span className="text-gray-500">Table:</span>
                        <span className="ml-2 text-gray-900 font-medium">{selectedLog.tableName}</span>
                      </div>
                    )}
                    {selectedLog.recordId && (
                      <div>
                        <span className="text-gray-500">Record ID:</span>
                        <span className="ml-2 text-gray-900 font-mono truncate">{selectedLog.recordId}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedLog.userAgent && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">User Agent</h4>
                  <div className="bg-gray-50 rounded-lg p-3 max-h-[100px] overflow-y-auto">
                    <p className="text-gray-900 text-sm font-mono break-all">
                      {selectedLog.userAgent}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-gray-200 hover:bg-gray-50"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    if (selectedLog.userId) {
                      setFilterUser(selectedLog.userId)
                      setIsDialogOpen(false)
                    }
                  }}
                  className="bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200"
                  disabled={!selectedLog.userId}
                >
                  Filter by this User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Report