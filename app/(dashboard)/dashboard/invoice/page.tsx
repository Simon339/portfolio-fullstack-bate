"use client"

import { useEffect, useMemo, useState } from "react"
import { createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type ColumnFiltersState, type SortingState } from "@tanstack/react-table"
import { format } from "date-fns"
import { Search, Filter, ChevronUp, ChevronDown, ChevronsUpDown, FileText, Download, Eye, MoreHorizontal, Calendar, CheckCircle2, Clock, XCircle, RefreshCw, Plus, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import Link from "next/link"
import { getAllServiceInquiry, ServiceInquiryQuotationItems, deleteQuotation } from "@/server/actions/service"
import { PDFHandler } from "@/lib/pdfs"

interface QuotationItem {
  id: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  total: number
}

interface Quotation {
  id: string
  quotationNumber: string
  customerId: string
  customer: {
    id: string
    name: string
    email: string
    companyName: string
    address?: {
      unit?: string
      street: string
      subdivision?: string
      city: string
      province: string
      postalCode: string
    } | string
    phone: string
  }
  date: string
  subtotal: number
  taxRate: number
  tax: number
  total: number
  notes: string
  terms: string
  createdAt: string
  updatedAt: string
  service: string
  items: QuotationItem[]
  hasItems: boolean
  status: 'pending' | 'quoted'
}

const columnHelper = createColumnHelper<Quotation>()

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [refreshing, setRefreshing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteQuotationId, setDeleteQuotationId] = useState<string>("")

  const loadQuotations = async () => {
    try {
      setRefreshing(true)
      const inquiries = await getAllServiceInquiry()
      
      // Fetch quotation items for each inquiry and determine status
      const quotationsData: Quotation[] = await Promise.all(
        inquiries.map(async (inquiry: any) => {
          try {
            const items = await ServiceInquiryQuotationItems(inquiry.id)
            const hasItems = items && items.length > 0
            
            return {
              id: inquiry.id || '',
              quotationNumber: inquiry.quotationNumber || 'QT-000000',
              customerId: inquiry.id || '',
              date: inquiry.createdAt || '',
              subtotal: Number(inquiry.subtotal) || 0,
              taxRate: Number(inquiry.taxRate) || 0,
              tax: (Number(inquiry.subtotal) || 0) * (Number(inquiry.taxRate) || 0) / 100,
              total: Number(inquiry.total) || 0,
              notes: inquiry.notes || '',
              terms: inquiry.terms || '',
              createdAt: inquiry.createdAt || '',
              updatedAt: inquiry.createdAt || '',
              service: inquiry.service || '',
              items: items || [],
              hasItems: hasItems,
              status: hasItems ? 'quoted' : 'pending',
              customer: {
                id: inquiry.id || '',
                name: inquiry.name || '',
                email: inquiry.email || '',
                companyName: inquiry.companyName || '',
                address: inquiry.address || '',
                phone: inquiry.phoneNumber || ''
              }
            }
          } catch (error) {
            console.error(`Error loading items for inquiry ${inquiry.id}:`, error)
            return {
              id: inquiry.id || '',
              quotationNumber: inquiry.quotationNumber || 'QT-000000',
              customerId: inquiry.id || '',
              date: inquiry.createdAt || '',
              subtotal: Number(inquiry.subtotal) || 0,
              taxRate: Number(inquiry.taxRate) || 0,
              tax: 0,
              total: Number(inquiry.total) || 0,
              notes: inquiry.notes || '',
              terms: inquiry.terms || '',
              createdAt: inquiry.createdAt || '',
              updatedAt: inquiry.createdAt || '',
              service: inquiry.service || '',
              items: [],
              hasItems: false,
              status: 'pending',
              customer: {
                id: inquiry.id || '',
                name: inquiry.name || '',
                email: inquiry.email || '',
                companyName: inquiry.companyName || '',
                address: inquiry.address || '',
                phone: inquiry.phoneNumber || ''
              }
            }
          }
        })
      )
      
      setQuotations(quotationsData)
      
    } catch (err: any) {
      toast.error(`Failed to load quotations: ${err.message || 'Unknown error'}`)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadQuotations()
  }, [])

  const filteredData = useMemo(() => {
    let filtered = quotations

    if (searchQuery) {
      filtered = filtered.filter(
        (q) =>
          q.quotationNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.customer?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.customer?.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((q) => q.status === statusFilter)
    }

    return filtered
  }, [quotations, searchQuery, statusFilter])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "quoted":
        return <CheckCircle2 className="h-4 w-4" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-zinc-50/50 text-zinc-800 border-[#acc2ef]"
      case "quoted":
        return "bg-zinc-50/50 text-emerald-800 border-[#acc2ef]"
      default:
        return "bg-zinc-50/50 text-gray-800 border-[#acc2ef]"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "—"
    try {
      return format(new Date(dateString), "MMM d, yyyy")
    } catch {
      return "Invalid date"
    }
  }

  const handleDelete = async (id: string) => {
    if (!quotations) return
    try {
      // Add your delete quotation function here
      await deleteQuotation(id)
      toast.success("Quotation deleted successfully")
      loadQuotations()
    } catch (err) {
      toast.error("Failed to delete quotation")
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

 const handleDownload = async (quotation: Quotation) => {
  try {
    toast.info(`Generating quotation ${quotation.quotationNumber}...`);
    
    // Prepare the data for PDF generation
    const pdfData = {
      quotation,
      customer: quotation.customer,
    };
    
    // Use the PDFHandler to download the quotation
    await PDFHandler.downloadPDF(pdfData);
    
    toast.success(`Quotation ${quotation.quotationNumber} downloaded successfully!`);
    
  } catch (err) {
    toast.error("Failed to download quotation");
  }
};

const handlePrint = async (quotation: Quotation) => {
  if (!quotation) return;
  
  try {
    toast.info(`Opening quotation ${quotation.quotationNumber} for printing...`);
    
    const pdfData = {
      quotation,
      customer: quotation.customer,
    };
    
    await PDFHandler.printPDF(pdfData);
    
    // Update the success message to be clearer
    toast.success(`Quotation ${quotation.quotationNumber} is ready for printing. Check the print dialog or the new tab.`);
  } catch (err: any) {
    
    if (err.message?.includes('Popup blocked')) {
      toast.error(
        <div className="flex flex-col">
          <span>Popup blocked! Please:</span>
          <span>1. Allow popups for this site</span>
          <span>2. Try clicking "Print PDF" again</span>
        </div>
      );
    } else {
      toast.error("Failed to open print dialog");
    }
  }
};

  const columns = [
    columnHelper.accessor("customer", {
      header: () => <div className="text-left font-semibold text-gray-900">Customer</div>,
      cell: (info) => {
        const customer = info.getValue()
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-gray-100">
              <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${customer?.email || customer?.companyName}`} />
              <AvatarFallback className="text-base font-semibold">
                {customer?.companyName
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-gray-900 truncate text-base">{customer?.companyName || "Unknown Customer"}</div>
              <div className="text-gray-500 truncate text-sm">{customer?.email || "No email"}</div>
              <div className="text-gray-500 truncate text-sm">
                Created: {formatDate(info.row.original.createdAt)}
              </div>
            </div>
          </div>
        )
      },
    }),
    columnHelper.accessor("quotationNumber", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-2 font-semibold text-gray-900 hover:bg-gray-50 p-2 rounded w-full justify-start"
        >
          Quote No.
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronsUpDown className="h-4 w-4 opacity-40" />
          )}
        </Button>
      ),
      cell: (info) => <div className="font-medium text-gray-900 text-base">{String(info.getValue())}</div>,
    }),
    columnHelper.accessor("total", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-2 font-semibold text-gray-900 hover:bg-gray-50 p-2 rounded w-full justify-start"
        >
          Amount
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronsUpDown className="h-4 w-4 opacity-40" />
          )}
        </Button>
      ),
      cell: (info) => (
        <div className="text-gray-600 text-base font-medium">
          {formatCurrency(Number(info.getValue()))}
        </div>
      ),
    }),
    columnHelper.accessor("status", {
      header: () => <div className="text-left font-semibold text-gray-900">Status</div>,
      cell: (info) => {
        const status = String(info.getValue())
        const displayNames: Record<string, string> = {
          pending: "Pending",
          quoted: "Quoted",
        }

        return (
          <Badge className={`${getStatusColor(status)} font-medium text-sm px-3 py-1.5 flex items-center gap-1`}>
            {getStatusIcon(status)}
            {displayNames[status] || status}
          </Badge>
        )
      },
    }),
    columnHelper.accessor("createdAt", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-2 font-semibold text-gray-900 hover:bg-gray-50 p-2 rounded w-full justify-start"
        >
          Created Date
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronsUpDown className="h-4 w-4 opacity-40" />
          )}
        </Button>
      ),
      cell: (info) => (
        <div className="text-gray-600 text-base flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          {formatDate(info.row.original.createdAt)}
        </div>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: () => <div className="text-center font-semibold text-gray-900">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                <MoreHorizontal className="h-5 w-5 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild className="text-sm gap-2 py-2.5">
                <Link href={`/dashboard/mails/inquiries/${row.original.id}`} className="w-full flex items-center">
                  <Eye className="h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              {row.original.status === 'quoted' && (
                <>
                  <DropdownMenuItem className="text-sm gap-2 py-2.5" onClick={() => handleDownload(row.original)}>
                    <Download className="h-4 w-4" />
                    Download PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-sm gap-2 py-2.5" onClick={() => handlePrint(row.original)}>
                    <FileText className="h-4 w-4" />
                    Print PDF
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem className="text-sm gap-2 py-2.5" onClick={() => {
                setDeleteQuotationId(row.original.id)
                setIsDeleteDialogOpen(true)
              }}>
                <XCircle className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    }),
  ]

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      columnFilters,
      sorting,
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  // Safe statistics calculation
  const stats = {
    total: quotations.length,
    totalValue: quotations.reduce((sum, q) => sum + q.total, 0),
    pending: quotations.filter((q) => q.status === "pending").length,
    quoted: quotations.filter((q) => q.status === "quoted").length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-gray-50 p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Quotations</h1>
          <p className="text-gray-600 mt-2 text-lg">Manage and track customer quotations</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="bg-transparent border border-[#acc2ef] rounded-full hover:border-blue-500 hover:animate-pulse hover:opacity-95" onClick={() => window.location.href = '/dashboard/invoice/newquotation'}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Clean Stats Layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        <div className="bg-zinc-50/50 p-4 rounded-lg border border-[#acc2ef]">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Quotations</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-zinc-50/50 p-4 rounded-lg border border-[#acc2ef]">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Value</div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</div>
        </div>
        <div className="bg-zinc-50/50 p-4 rounded-lg border border-[#acc2ef]">
          <div className="text-sm font-medium text-gray-500 mb-1">Pending</div>
          <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
        </div>
        <div className="bg-zinc-50/50 p-4 rounded-lg border border-[#acc2ef]">
          <div className="text-sm font-medium text-gray-500 mb-1">Quoted</div>
          <div className="text-2xl font-bold text-gray-900">{stats.quoted}</div>
        </div>
      </div>

      <div className="bg-zinc-50/50 rounded-lg border border-[#acc2ef] shadow-sm p-4">
        <div className="py-4 border-b border-[#acc2ef]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by quote number, customer name, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 bg-zinc-50/50 border-[#acc2ef]"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[160px] h-10 bg-zinc-50/50 border-[#acc2ef]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="quoted">Quoted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="py-4 border-[#acc2ef]">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-gray-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-5 border-[#acc2ef]">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center py-8 border-[#acc2ef]"
                >
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No quotations found</h3>
                    <p className="text-sm text-gray-600">
                      {quotations.length === 0 ? "No quotations yet" : "Try adjusting your filters"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center mt-5 justify-end space-x-2 py-4 border-t border-[#acc2ef]">
          <div className="flex-1 text-sm text-muted-foreground">
            Showing {table.getRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s).
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              className="bg-gray-50 border-[#acc2ef]"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              className="bg-gray-50 border-[#acc2ef]"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="text-gray-900 border-[#acc2ef] bg-slate-50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-bold">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete Quotation
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete Quotation <span className="font-semibold">#{deleteQuotationId}</span>?
              This action cannot be undone and will permanently remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className="border-[#acc2ef] bg-gray-600" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => {
              handleDelete(deleteQuotationId)
              setDeleteQuotationId("")
            }}>
              Delete Quotation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}