/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client"

import { useState, useEffect } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronLeft, ChevronRight, Edit, Eye, Plus, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
import { deleteProject, fetchProject } from "@/server/data/projectactions"
import DeleteConfirmationModal from "./modals/DeleteProjectModal"
import Link from "next/link"
import ExportButton from "./export-button"

export type Project = {
  id: string
  name: string
  image: string
  category: { id: string; name: string }
  techstacks: Array<{ id: string; name: string; image: string }>
  description: string
  demo: string
  features: Array<{ name: string; description: string }>
}

interface FetchProjectResponse {
  success: boolean
  data?: Project[]
  error?: string
}

const ProjectTable = () => {
  const [loading, setLoading] = useState<boolean>(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [error, setError] = useState<string | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const rowsPerPage = 10
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const result: FetchProjectResponse = await fetchProject()
      if (result.success && result.data) {
        const formattedProjects = result.data.map((project) => ({
          ...project,
          techstack: project.techstacks.map((tech) => tech.name).join(", ") || "",
        }))
        setProjects(formattedProjects)
      } else {
        setError(result.error || "Failed to fetch projects. Please try again later.")
        toast.error("Failed to fetch projects")
      }
    } catch (err) {
      setError("Failed to fetch projects. Please try again later.")
      toast.error("Failed to fetch projects")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project)
    setDeleteModalOpen(true)
  }

  const handleBulkDeleteClick = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    if (selectedRows.length === 0) {
      toast.error("No projects selected")
      return
    }
    setBulkDeleteModalOpen(true)
  }

  const handleDeleteProject = async () => {
    if (!projectToDelete) return

    try {
      const result = await deleteProject(projectToDelete.id)
      if (result.success) {
        setProjects(projects.filter((p) => p.id !== projectToDelete.id))
        toast.success("Project deleted successfully")
      } else {
        toast.error(result.error || "Failed to delete project")
      }
    } catch (error) {
      console.error("Error during deletion:", error)
      toast.error("An error occurred while deleting the project")
    } finally {
      setDeleteModalOpen(false)
    }
  }

  const handleBulkDelete = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    if (selectedRows.length === 0) return

    try {
      const deletePromises = selectedRows.map((row) => deleteProject((row.original as Project).id))
      const results = await Promise.all(deletePromises)

      const successCount = results.filter((r) => r.success).length
      const failCount = results.length - successCount

      if (successCount > 0) {
        const selectedIds = selectedRows.map((row) => (row.original as Project).id)
        setProjects(projects.filter((p) => !selectedIds.includes(p.id)))
        setRowSelection({})
        toast.success(`${successCount} project(s) deleted successfully`)
      }

      if (failCount > 0) {
        toast.error(`Failed to delete ${failCount} project(s)`)
      }
    } catch (error) {
      console.error("Error during bulk deletion:", error)
      toast.error("An error occurred while deleting projects")
    } finally {
      setBulkDeleteModalOpen(false)
    }
  }

  // Get selected projects for export
  const getSelectedProjects = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    return selectedRows.map((row) => row.original as Project)
  }

  const columns: ColumnDef<Project>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => {
        const imageValue = row.getValue("image") as string
        return (
          <div className="flex items-center justify-center">
            <div className="h-10 w-10 overflow-hidden rounded-md border bg-muted">
              {imageValue ? (
                <img
                  src={imageValue || "/placeholder.svg"}
                  alt={`${row.getValue("name")} thumbnail`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=40&width=40"
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                  <span className="sr-only">No image</span>
                </div>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            <span>Name</span>
            <ArrowUpDown className="ml-1 size-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            <span>Category</span>
            <ArrowUpDown className="ml-1 size-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        const category = row.getValue("category") as { id: string; name: string }
        return (
          <div className="capitalize">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {category?.name || "Uncategorized"}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "techstacks",
      header: "Tech Stack",
      cell: ({ row }) => {
        const techStacks = row.original.techstacks || []

        if (techStacks.length === 0) {
          return <span className="text-muted-foreground text-xs">No technologies</span>
        }

        // Limit to first 4 tech stacks
        const displayTechs = techStacks.slice(0, 2)
        const remainingCount = techStacks.length - 2

        return (
          <div className="flex -space-x-2">
            {displayTechs.map((tech, index) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-gray-800 shadow-sm overflow-hidden border border-[#acc2ef]">
                      {tech.image ? (
                        <img
                          src={tech.image || "/placeholder.svg"}
                          alt={tech.name}
                          className="h-5 w-5 object-contain"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=20&width=20"
                          }}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-800 text-xs font-bold">
                          {tech.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{tech.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}

            {remainingCount > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-gray-800 text-xs font-bold shadow-sm border border-[#acc2ef]">
                      +{remainingCount}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="max-w-[200px]">
                      {techStacks.slice(4).map((tech, i) => (
                        <div key={i} className="text-sm">
                          {tech.name}
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string
        return (
          <div className="max-w-[200px] truncate text-sm" title={description}>
            {description || <span className="text-muted-foreground text-xs">No description</span>}
          </div>
        )
      },
    },
    {
      accessorKey: "features",
      header: "Features",
      cell: ({ row }) => {
        const features = row.getValue("features") as Array<{ name: string; description: string }>

        if (!features || features.length === 0) {
          return <span className="text-muted-foreground text-xs">No features</span>
        }

        // Only show the first 3 features
        const displayFeatures = features.slice(0, 2)
        const remainingCount = features.length - 3

        return (
          <div className="flex flex-col gap-1 max-w-[200px]">
            {displayFeatures.map((feature, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-xs font-medium truncate"
                title={feature.name}
              >
                {feature.name}
              </span>
            ))}
            {remainingCount > 0 && <span className="text-xs text-muted-foreground">+{remainingCount} more</span>}
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const project = row.original
        return (
          <div className="flex items-center justify-end gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={`/dashboard/projects/${project.id}`}>
                    <Button variant="ghost" size="icon" className="size-8">
                      <Eye className="size-4" />
                      <span className="sr-only">View project</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View project</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={`/dashboard/projects/edit/${project.id}`}>
                    <Button variant="ghost" size="icon" className="size-8 border-[#acc2ef] text-gray-700">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit project</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit project</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleDeleteClick(project)}
                  >
                    <Trash2 className="size-4" />
                    <span className="sr-only">Delete project</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete project</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: projects,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex,
        pageSize: rowsPerPage,
      },
    },
    manualPagination: false,
    pageCount: Math.ceil(projects.length / rowsPerPage),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        setPageIndex(updater({ pageIndex, pageSize: rowsPerPage }).pageIndex)
      }
    },
  })

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-72">
          <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={(columnFilters.find((filter) => filter.id === "name")?.value as string) || ""}
            onChange={(e) => setColumnFilters([{ id: "name", value: e.target.value }])}
            className="pl-8 text-gray-600 bg-white border-[#acc2ef] hover:border-primary focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          {/* Export Button */}
          <ExportButton
            projects={projects}
            selectedProjects={table.getFilteredSelectedRowModel().rows.length > 0 ? getSelectedProjects() : undefined}
          />

          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-[#acc2ef] bg-white hover:bg-destructive/10 hover:text-destructive"
                    onClick={handleBulkDeleteClick}
                  >
                    <Trash2 className="size-4 mr-1" />
                    Delete Selected
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete selected projects</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Link href="/dashboard/projects/add">
            <Button
              variant="ghost"
              size="icon"
              className="bg-gray-50 hover:bg-primary/90 hover:text-white font-medium rounded-full border-[#acc2ef]"
            >
              <Plus className="h-4 w-4 mr-1" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-md border border-[#acc2ef] flex-1 flex flex-col overflow-hidden shadow-sm bg-white">
        <div className="flex-1 overflow-auto">
          <Table className="w-full h-full">
            <TableHeader className="bg-muted/5 sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b border-[#acc2ef] hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-gray-800 font-medium py-3 text-sm">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="h-full">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-96 text-center">
                    <div className="flex items-center justify-center">
                      <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      <span className="ml-2">Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-b border-[#acc2ef] hover:bg-gray-50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                Array.from({ length: 10 }).map((_, index) => (
                  <TableRow key={index} className="border-b border-[#acc2ef] hover:bg-gray-50">
                    {columns.map((column, cellIndex) => (
                      <TableCell key={cellIndex} className="py-2">
                        {column.id === "select" ? (
                          <Checkbox disabled />
                        ) : column.id === "image" ? (
                          <div className="flex items-center justify-center">
                            <div className="h-10 w-10 rounded-md bg-muted/40"></div>
                          </div>
                        ) : column.id === "techstacks" ? (
                          <div className="flex gap-1">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <div key={i} className="h-8 w-8 rounded-full bg-muted/40"></div>
                            ))}
                          </div>
                        ) : column.id === "actions" ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" className="size-8" disabled>
                              <Eye className="size-4 text-muted-foreground/40" />
                            </Button>
                            <Button variant="ghost" size="icon" className="size-8" disabled>
                              <Edit className="size-4 text-muted-foreground/40" />
                            </Button>
                            <Button variant="ghost" size="icon" className="size-8" disabled>
                              <Trash2 className="size-4 text-muted-foreground/40" />
                            </Button>
                          </div>
                        ) : (
                          <div className="h-4 w-24 animate-pulse rounded bg-muted/40"></div>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="border-[#acc2ef] bg-white hover:bg-muted/10"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="size-4 mr-1" />
            Previous
          </Button>
          <div className="text-sm font-medium bg-muted/10 px-3 py-1 rounded-md">
            Page {pageIndex + 1} of {Math.max(1, Math.ceil(projects.length / rowsPerPage))}
          </div>
          <Button
            variant="outline"
            className="border-[#acc2ef] bg-white hover:bg-muted/10"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="size-4 ml-1" />
          </Button>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        description="Are you sure you want to delete this project?"
        itemName={projectToDelete?.name}
      />

      <DeleteConfirmationModal
        isOpen={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        onConfirm={handleBulkDelete}
        title="Delete Multiple Projects"
        description={`Are you sure you want to delete ${table.getFilteredSelectedRowModel().rows.length} selected projects?`}
      />
    </div>
  )
}

export default ProjectTable

