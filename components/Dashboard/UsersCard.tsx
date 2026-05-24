'use client'

import * as React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ColumnDef, ColumnFiltersState, SortingState, VisibilityState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Filter, ChevronDown, Trash2, Loader2, ChevronsLeft, ChevronRight, ChevronLeft, ChevronsRight } from 'lucide-react'
import UserModal from './modals/User';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchPlaceholder?: string
  onDelete?: (rows: TData[]) => Promise<void>
  isDeleting?: boolean
}

export function DataTable<TData extends { id: string; isSelected?: boolean }, TValue>({
  columns,
  data,
  searchPlaceholder = 'Search...',
  onDelete,
  isDeleting = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original)
  const selectedCount = selectedRows.length

  const handleDeleteClick = () => {
    if (selectedRows.length > 0) {
      setIsDeleteDialogOpen(true)
    }
  }

  const handleConfirmDelete = async () => {
    if (onDelete && selectedRows.length > 0) {
      await onDelete(selectedRows)
      setRowSelection({})
      setIsDeleteDialogOpen(false)
    }
  }

  // Get display text for selected items (customize based on your data structure)
  const getSelectedItemsText = () => {
    if (selectedCount === 1) {
      // Try to get name or username from the selected row
      const selectedItem = selectedRows[0] as any
      const itemName = selectedItem.name || selectedItem.username || selectedItem.email || 'this item'
      return itemName
    }
    return `${selectedCount} items`
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-full pr-1">
          <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={(table.getState().globalFilter || '') as string}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="pl-8 text-gray-600 bg-gray-50 border-[#acc2ef] hover:border-[#acc2ef] focus-visible:ring-1 focus-visible:ring-[#acc2ef]"
          />
        </div>
        <div className="flex items-center gap-2">
          {/* Export Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-gray-50 border-[#acc2ef] ">
                <Filter className="h-4 w-4" />
                View
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-50 border-[#acc2ef]">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {selectedCount > 0 && onDelete && (
                    <Button
                      size="icon"
                      onClick={handleDeleteClick}
                      disabled={isDeleting}
                      variant="ghost"
                      className="relative rounded-xl border-danger-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}

                      <Badge
                        variant="destructive"
                        className="absolute -right-2 -top-2 h-5 min-w-5 rounded-full px-0 text-[10px] flex items-center justify-center"
                      >
                        {selectedCount}
                      </Badge>
                    </Button>
                  )}
                </TooltipTrigger>

                <TooltipContent>
                  <p>Delete selected items</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <UserModal />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-gray-50 border-[#acc2ef]">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
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
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Data Table Pagination Component */}
      <div className="flex items-center justify-between px-2 mt-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              defaultValue={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-[70px] bg-gray-50 border-[#acc2ef] text-gray-600">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex bg-gray-50 border-[#acc2ef] text-gray-600 hover:bg-gray-100 hover:text-gray-800"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 bg-gray-50 border-[#acc2ef] text-gray-600 hover:bg-gray-100 hover:text-gray-800"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 bg-gray-50 border-[#acc2ef] text-gray-600 hover:bg-gray-100 hover:text-gray-800"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex bg-gray-50 border-[#acc2ef] text-gray-600 hover:bg-gray-100 hover:text-gray-800"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete {selectedCount === 1 ? 'User' : 'Users'}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {getSelectedItemsText()}? 
              {selectedCount === 1 
                ? " This action cannot be undone." 
                : " This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 justify-end mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}