"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Mail, Phone, Building2, Calendar, MapPin, Plus, Edit,
  ArrowUpRight, ClipboardList, FileText, Package, Check, X,
  Trash2, ExternalLink, Copy, Save, AlertCircle, DollarSign,
  Hash, Loader, Clock, CheckCircle, Percent
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { deleteQuotationItem, getServiceInquiryById, updateQuotationWithItemsAndTax } from "@/server/actions/service"

interface ServiceInquiry {
  id: string
  name: string
  email: string
  companyName: string
  service: string
  phoneNumber: string
  createdAt: Date
  address?: {
    unit?: string
    street: string
    subdivision?: string
    city: string
    province: string
    postalCode: string
  } | string
  quotationNumber?: string
  subtotal?: string
  taxRate?: string
  total?: string
  notes?: string
  terms?: string
}

interface QuotationItem {
  id: string
  description: string
  quantity: number
  unit: string
  unitPrice: string
  total: string
  createdAt?: Date
}

interface ServiceInquiryDetailProps {
  inquiry: ServiceInquiry
  quotationItems: QuotationItem[]
}

const InquiryDetail = ({ inquiry: initialInquiry, quotationItems: initialItems }: ServiceInquiryDetailProps) => {
  const [inquiry, setInquiry] = useState(initialInquiry)
  const [quotationItems, setQuotationItems] = useState(initialItems)
  const [isEditing, setIsEditing] = useState(false)
  const [editedInquiry, setEditedInquiry] = useState(initialInquiry)
  const [hasChanges, setHasChanges] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editedItem, setEditedItem] = useState<QuotationItem | null>(null)

  // Calculate totals from items
  const calculateTotals = useCallback((items: QuotationItem[], taxRate: string) => {
    const subtotal = items.reduce((sum, item) => {
      return sum + (Number.parseFloat(item.unitPrice) || 0) * (item.quantity || 0)
    }, 0)

    const tax = Number.parseFloat(taxRate || '0')
    const taxAmount = subtotal * (tax / 100)
    const total = subtotal + taxAmount

    return {
      subtotal: subtotal.toFixed(2),
      total: total.toFixed(2)
    }
  }, [])

  // Update edited inquiry totals when items or tax rate change
  useEffect(() => {
    if (isEditing || quotationItems.length === 0) {
      const { subtotal, total } = calculateTotals(quotationItems, editedInquiry.taxRate || '0')
      setEditedInquiry(prev => ({ ...prev, subtotal, total }))
    }
  }, [quotationItems, editedInquiry.taxRate, isEditing, calculateTotals])

  // Update actual inquiry totals when not in edit mode but items exist
  useEffect(() => {
    if (!isEditing && quotationItems.length > 0) {
      const { subtotal, total } = calculateTotals(quotationItems, inquiry.taxRate || '0')
      setInquiry(prev => ({ ...prev, subtotal, total }))
    }
  }, [quotationItems, inquiry.taxRate, isEditing, calculateTotals])

  useEffect(() => {
    // Only check changes for editable fields: taxRate, notes, terms, and items
    const taxChanged = editedInquiry.taxRate !== inquiry.taxRate
    const notesChanged = editedInquiry.notes !== inquiry.notes
    const termsChanged = editedInquiry.terms !== inquiry.terms
    const itemsChanged = JSON.stringify(initialItems) !== JSON.stringify(quotationItems)

    setHasChanges(taxChanged || notesChanged || termsChanged || itemsChanged)
  }, [editedInquiry, inquiry, initialItems, quotationItems])

  const formattedDate = new Date(inquiry.createdAt).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  const formattedTime = new Date(inquiry.createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })

  const formattedItems = quotationItems.map(item => {
    const formattedDateItems = item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }) : ""

    const formattedTimeItems = item.createdAt ? new Date(item.createdAt).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }) : ""

    return {
      ...item,
      formattedDateItems,
      formattedTimeItems,
    }
  })

  const isQuoteRequest = !inquiry.quotationNumber || !inquiry.subtotal || !inquiry.total
  const hasQuotationNumber = Boolean(inquiry.quotationNumber)
  const isFullyQuoted = Boolean(inquiry.subtotal && inquiry.total)
  const needsQuotation = !isFullyQuoted

  const formatCurrency = (amount?: string | number | null) => {
    if (!amount) return "R 0.00"
    const numAmount = typeof amount === 'string' ? Number.parseFloat(amount) : amount
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(numAmount)
  }

const formatAddress = (address: ServiceInquiry['address']): string => {
  if (!address) return "No address provided"

  try {
    // If address is already a string (from database)
    if (typeof address === 'string') {
      // Check if it looks like JSON (starts with { and ends with })
      if (address.trim().startsWith('{') && address.trim().endsWith('}')) {
        try {
          const addressObj = JSON.parse(address)
          const parts = [
            addressObj.unit,
            addressObj.street,
            addressObj.subdivision,
            addressObj.city,
            addressObj.province,
            addressObj.postalCode
          ].filter(Boolean)
          return parts.length > 0 ? parts.join(", ") : "No address provided"
        } catch {
          // If JSON parsing fails, clean up the string by removing quotes
          return address.replace(/["']/g, '').trim()
        }
      }
      // It's a plain string, remove any quotes and return
      return address.replace(/["']/g, '').trim()
    }

    // If address is an object (from props), format it
    if (typeof address === 'object' && address !== null) {
      const parts = [
        address.unit,
        address.street,
        address.subdivision,
        address.city,
        address.province,
        address.postalCode
      ].filter(Boolean)

      return parts.length > 0 ? parts.join(", ") : "No address provided"
    }

    return "No address provided"
  } catch (error) {
    return "No address provided"
  }
}
  const handleSave = async () => {
    if (!inquiry || !editedInquiry) return

    try {
      // Prepare data for server action
      const updateData = {
        serviceInquiryId: inquiry.id,
        taxRate: editedInquiry.taxRate ? parseFloat(editedInquiry.taxRate) : 0,
        items: quotationItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: parseFloat(item.unitPrice),
        })),
        notes: editedInquiry.notes || '',
        terms: editedInquiry.terms || '',
      }

      const result = await updateQuotationWithItemsAndTax(updateData)

      if (result.error) {
        toast.error(result.error)
        return
      }

      // Update local state with server response
      if (result.data) {
        const updatedInquiry = {
          ...inquiry,
          subtotal: result.data.subtotal.toString(),
          taxRate: result.data.taxRate.toString(),
          total: result.data.total.toString(),
          notes: editedInquiry.notes,
          terms: editedInquiry.terms,
        }

        setInquiry(updatedInquiry)
        setEditedInquiry(updatedInquiry)
      }

      setIsEditing(false)
      setEditingItemId(null)
      setEditedItem(null)
      toast.success("Changes saved successfully")
    } catch (error) {
      console.error("Error saving changes:", error)
      toast.error("Failed to save changes")
    }
  }

  const handleCancel = () => {
    setEditedInquiry(inquiry)
    setQuotationItems(initialItems)
    setIsEditing(false)
    setEditingItemId(null)
    setEditedItem(null)
    setHasChanges(false)
  }

  const handleInputChange = (field: keyof ServiceInquiry, value: string) => {
    // Only allow editing taxRate, notes, and terms
    if (field === 'taxRate' || field === 'notes' || field === 'terms') {
      setEditedInquiry(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const handleGenerateQuotation = () => {
    if (!editedInquiry.quotationNumber) {
      const quoteNum = `QT-${Date.now().toString().slice(-6)}`
      setEditedInquiry(prev => ({ ...prev, quotationNumber: quoteNum }))
      toast.success("Quotation number generated")
    }
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      toast.success("Quotation created successfully")
    }, 1500)
  }

  // Item management functions
  const handleAddItem = () => {
    const newItem: QuotationItem = {
      id: `item-${Date.now()}`,
      description: '',
      quantity: 1,
      unit: 'pcs',
      unitPrice: '0.00',
      total: '0.00'
    }
    setQuotationItems(prev => [...prev, newItem])
    setEditingItemId(newItem.id)
    setEditedItem(newItem)
  }

  const handleEditItem = (item: QuotationItem) => {
    setEditingItemId(item.id)
    setEditedItem({ ...item })
  }

  const handleSaveItem = () => {
    if (!editedItem) return

    try {
      const unitPrice = Number.parseFloat(editedItem.unitPrice) || 0
      const quantity = editedItem.quantity || 0
      const newTotal = (unitPrice * quantity).toFixed(2)

      // Update local state
      const updatedItems = quotationItems.map(item =>
        item.id === editedItem.id ? { ...editedItem, total: newTotal } : item
      )
      setQuotationItems(updatedItems)

      // Update totals locally
      if (editedInquiry) {
        const { subtotal, total } = calculateTotals(updatedItems, editedInquiry.taxRate || '0')
        setEditedInquiry(prev => prev ? {
          ...prev,
          subtotal,
          total
        } : prev)
      }

      toast.success("Item saved")
      setEditingItemId(null)
      setEditedItem(null)
    } catch (error) {
      console.error("Error saving item:", error)
      toast.error("Failed to save item")
    }
  }


  const handleCancelItemEdit = () => {
    // If it's a new empty item, remove it
    if (editedItem && !editedItem.description && quotationItems.find(i => i.id === editedItem.id)?.description === '') {
      setQuotationItems(prev => prev.filter(item => item.id !== editedItem.id))
    }
    setEditingItemId(null)
    setEditedItem(null)
  }

  const handleDeleteItem = async (id: string) => {
    try {
      const result = await deleteQuotationItem(id, inquiry.id)

      if (result.error) {
        toast.error(result.error)
        return
      }

      // Update local state
      setQuotationItems(prev => prev.filter(item => item.id !== id))

      // Re-fetch totals from server
      if (inquiry) {
        const updatedInquiry = await getServiceInquiryById(inquiry.id)
        setInquiry(updatedInquiry)
        setEditedInquiry(updatedInquiry)
      }

      toast.success("Item deleted")
    } catch (error) {
      console.error("Error deleting item:", error)
      toast.error("Failed to delete item")
    }
  }

  // Notes and Terms management
  const handleDeleteNotes = () => {
    setEditedInquiry(prev => prev ? { ...prev, notes: '' } : prev)
    toast.success("Notes deleted")
  }

  const handleDeleteTerms = () => {
    setEditedInquiry(prev => prev ? { ...prev, terms: '' } : prev)
    toast.success("Terms deleted")
  }

  const statusConfig = isQuoteRequest
    ? { label: "Pending", icon: <Clock className="h-3 w-3" />, className: "bg-amber-500/10 text-amber-600 border-amber-200" }
    : { label: "Ready", icon: <CheckCircle className="h-3 w-3" />, className: "bg-emerald-500/10 text-emerald-600 border-emerald-200" }

  // Function to handle "Create Quote" when there are 0 items
  const handleCreateQuoteWithItems = () => {
    setIsEditing(true)
    if (quotationItems.length === 0) {
      // Auto-add first item when creating quote from empty state
      handleAddItem()
    }
    if (!inquiry.quotationNumber) {
      const quoteNum = `QT-${Date.now().toString().slice(-6)}`
      setEditedInquiry(prev => ({ ...prev, quotationNumber: quoteNum }))
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-zinc-50/50">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-[#acc2ef]">
          <div className="max-w-7xl mx-auto px-2 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-12 w-12 ring-2 ring-white shadow-md">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${inquiry.name}&backgroundColor=3b82f6`} />
                    <AvatarFallback className="text-sm font-semibold bg-zinc-900 text-white">
                      {inquiry.name?.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold text-zinc-900">{inquiry.name}</h1>
                    <Badge variant="outline" className={`text-[10px] font-medium px-2 py-0.5 ${statusConfig.className}`}>
                      {statusConfig.icon}
                      <span className="ml-1">{statusConfig.label}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-500">{inquiry.companyName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      className="text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                    >
                      Cancel
                    </Button>

                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={!hasChanges}
                      className="bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
                    >
                      <Save className="h-4 w-4 mr-1.5" />
                      Save All
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    {/* Copy Action */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                          onClick={() =>
                            handleCopyToClipboard(
                              `${inquiry.name}\n${inquiry.email}\n${inquiry.phoneNumber}`
                            )
                          }
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="bg-zinc-900 text-zinc-100 border-zinc-700 text-xs">
                        Copy details
                      </TooltipContent>
                    </Tooltip>

                    {/* Edit Action */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsEditing(true)}
                          className="h-9 w-9 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="bg-zinc-900 text-zinc-100 border-zinc-700 text-xs">
                        Edit inquiry
                      </TooltipContent>
                    </Tooltip>

                    {/* Conditional Primary Actions */}
                    <div className="ml-1">
                      {quotationItems.length === 0 ? (
                        <Button
                          size="sm"
                          onClick={handleCreateQuoteWithItems}
                          className="bg-sky-600 text-white hover:bg-sky-500 shadow-sm hover:shadow transition-all"
                        >
                          <FileText className="h-4 w-4 mr-1.5" />
                          Create Quote
                        </Button>
                      ) : (
                        isQuoteRequest && (
                          <Button
                            size="sm"
                            onClick={handleGenerateQuotation}
                            disabled={isGenerating}
                            className="bg-sky-600 text-white hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
                          >
                            {isGenerating ? (
                              <>
                                <Loader className="h-4 w-4 mr-1.5 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <FileText className="h-4 w-4 mr-1.5" />
                                Create Quote
                              </>
                            )}
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-2 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Info Cards - Non-editable */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ContactCard
                  icon={<Mail className="h-4 w-4" />}
                  label="Email"
                  value={inquiry.email}
                  href={`mailto:${inquiry.email}`}
                  isEditing={false}
                  onChange={() => { }}
                  accentColor="bg-sky-500"
                />
                <ContactCard
                  icon={<Phone className="h-4 w-4" />}
                  label="Phone"
                  value={inquiry.phoneNumber || "Not provided"}
                  href={inquiry.phoneNumber ? `tel:${inquiry.phoneNumber}` : undefined}
                  isEditing={false}
                  onChange={() => { }}
                  accentColor="bg-emerald-500"
                />
                <ContactCard
                  icon={<Building2 className="h-4 w-4" />}
                  label="Company"
                  value={inquiry.companyName || "Not provided"}
                  isEditing={false}
                  onChange={() => { }}
                  accentColor="bg-violet-500"
                />
              </div>

              {/* Service & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-[#acc2ef] shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <ClipboardList className="h-4 w-4 text-amber-600" />
                      </div>
                      <span className="text-sm font-medium text-zinc-700">Service Requested</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-zinc-600 leading-relaxed">{inquiry.service}</p>
                  </CardContent>
                </Card>

                <Card className="border-[#acc2ef] shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-rose-600" />
                        </div>
                        <span className="text-sm font-medium text-zinc-700">Location</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-zinc-500 hover:text-zinc-700"
                        onClick={() => window.open(`https://maps.google.com/?q=${formatAddress(inquiry.address)}`, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Map
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-zinc-600 leading-relaxed">{formatAddress(inquiry.address)}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Items Table */}
              <Card className="border-[#acc2ef] shadow-sm overflow-hidden">
                <CardHeader className="border-b border-zinc-100 bg-zinc-50/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 border-[#acc2ef] rounded-full bg-zinc-100 flex items-center justify-center">
                        <Package className="h-4 w-4 text-zinc-900" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-900">Items & Pricing</h3>
                        <p className="text-xs text-zinc-500">{quotationItems.length} items</p>
                      </div>
                    </div>
                    {isEditing && (
                      <Button size="sm" variant="ghost" className="bg-slate-50 border-[#acc2ef] rounded-full hover:bg-black-100 hover:text-slate-50 hover:font-bold text-gray-800" onClick={handleAddItem}>
                        <Plus className="h-4 w-4 mr-1" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {quotationItems.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                        <Package className="h-6 w-6 text-zinc-400" />
                      </div>
                      <p className="text-sm text-zinc-500 mb-4">No items added yet</p>
                      {!isEditing ? (
                        <Button size="sm" onClick={handleCreateQuoteWithItems} className="bg-sky-600 text-white hover:bg-sky-500">
                          <FileText className="h-4 w-4 mr-1" />
                          Create Quote
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" className="bg-slate-50 text-gray-800 border-[#acc2ef] rounded-md hover:bg-black-100 hover:text-slate-50 hover:font-bold" onClick={handleAddItem}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add First Item
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div>
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-zinc-50/80 hover:bg-zinc-50/80 border-b border-zinc-100">
                            <TableHead className="w-12 text-xs font-semibold text-zinc-500">#</TableHead>
                            <TableHead className="text-xs font-semibold text-zinc-500">Description</TableHead>
                            <TableHead className="w-20 text-center text-xs font-semibold text-zinc-500">Qty</TableHead>
                            <TableHead className="w-20 text-center text-xs font-semibold text-zinc-500">Unit</TableHead>
                            <TableHead className="w-28 text-right text-xs font-semibold text-zinc-500">Price</TableHead>
                            <TableHead className="w-28 text-right text-xs font-semibold text-zinc-500">Total</TableHead>
                            {isEditing && <TableHead className="w-24" />}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {quotationItems.map((item, index) => (
                            <TableRow key={item.id} className="hover:bg-zinc-50/50 border-b border-zinc-100">
                              {editingItemId === item.id && editedItem ? (
                                <>
                                  <TableCell className="text-sm text-zinc-400 font-medium">{index + 1}</TableCell>
                                  <TableCell>
                                    <Input
                                      value={editedItem.description}
                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedItem({ ...editedItem, description: e.target.value })}
                                      className="h-8 text-sm bg-white border-[#acc2ef]"
                                      placeholder="Item description"
                                      autoFocus
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      value={editedItem.quantity}
                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedItem({ ...editedItem, quantity: Number.parseInt(e.target.value) || 0 })}
                                      className="h-8 text-sm text-center bg-white border-[#acc2ef]"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      value={editedItem.unit}
                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedItem({ ...editedItem, unit: e.target.value })}
                                      className="h-8 text-sm text-center bg-white border-[#acc2ef]"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={editedItem.unitPrice}
                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedItem({ ...editedItem, unitPrice: e.target.value })}
                                      className="h-8 text-sm text-right bg-white border-[#acc2ef]"
                                    />
                                  </TableCell>
                                  <TableCell className="text-right font-semibold text-sm text-zinc-900">
                                    {formatCurrency((Number.parseFloat(editedItem.unitPrice) || 0) * (editedItem.quantity || 0))}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center justify-end gap-1">
                                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSaveItem}>
                                        <Check className="h-4 w-4 text-emerald-600" />
                                      </Button>
                                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCancelItemEdit}>
                                        <X className="h-4 w-4 text-zinc-400" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </>
                              ) : (
                                <>
                                  <TableCell className="text-sm text-zinc-400 font-medium">{index + 1}</TableCell>
                                  <TableCell className="text-sm font-medium text-zinc-900">{item.description || <span className="text-zinc-400 italic">No description</span>}</TableCell>
                                  <TableCell className="text-center text-sm text-zinc-600">{item.quantity}</TableCell>
                                  <TableCell className="text-center text-sm text-zinc-600">{item.unit}</TableCell>
                                  <TableCell className="text-right text-sm text-zinc-600">{formatCurrency(item.unitPrice)}</TableCell>
                                  <TableCell className="text-right font-semibold text-sm text-zinc-900">{formatCurrency(item.total)}</TableCell>
                                  {isEditing && (
                                    <TableCell>
                                      <div className="flex items-center justify-end gap-1">
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              size="icon"
                                              variant="ghost"
                                              className="h-7 w-7 text-zinc-400 hover:text-zinc-600"
                                              onClick={() => handleEditItem(item)}
                                            >
                                              <Edit className="h-3.5 w-3.5" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>Edit item</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              size="icon"
                                              variant="ghost"
                                              className="h-7 w-7 text-zinc-400 hover:text-red-500"
                                              onClick={() => handleDeleteItem(item.id)}
                                            >
                                              <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>Delete item</TooltipContent>
                                        </Tooltip>
                                      </div>
                                    </TableCell>
                                  )}
                                </>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {/* Totals - Tax Rate */}
                      <div className="border-t-2 border-zinc-200 bg-zinc-50/50">
                        <div className="flex justify-end">
                          <div className="w-80 p-4 space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-zinc-500">Subtotal</span>
                              <span className="font-medium text-zinc-700">
                                {formatCurrency(isEditing
                                  ? editedInquiry.subtotal
                                  : inquiry.subtotal || calculateTotals(quotationItems, inquiry.taxRate || '0').subtotal)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-zinc-500 flex items-center gap-1">
                                <Percent className="h-3 w-3" />
                                VAT Rate
                              </span>
                              {isEditing ? (
                                <div className="flex items-center gap-1">
                                  <Input
                                    type="number"
                                    step="0.1"
                                    value={editedInquiry.taxRate || '0'}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('taxRate', e.target.value)}
                                    className="h-7 w-16 text-sm text-right bg-white"
                                  />
                                  <span className="text-zinc-500">%</span>
                                </div>
                              ) : (
                                <span className="font-medium text-zinc-700">{inquiry.taxRate || '0'}%</span>
                              )}
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-zinc-500">VAT Amount</span>
                              <span className="font-medium text-zinc-700">
                                {formatCurrency(
                                  Number.parseFloat(isEditing
                                    ? editedInquiry.subtotal || '0'
                                    : inquiry.subtotal || calculateTotals(quotationItems, inquiry.taxRate || '0').subtotal) *
                                  Number.parseFloat(isEditing ? editedInquiry.taxRate || '0' : inquiry.taxRate || '0') / 100
                                )}
                              </span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between">
                              <span className="font-semibold text-zinc-900">Total</span>
                              <span className="text-lg font-bold text-zinc-900">
                                {formatCurrency(isEditing
                                  ? editedInquiry.total
                                  : inquiry.total || calculateTotals(quotationItems, inquiry.taxRate || '0').total)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes & Terms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Notes Card */}
                <Card className="border-[#acc2ef] shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-zinc-600" />
                        </div>
                        <span className="text-sm font-medium text-zinc-700">Notes</span>
                      </div>
                      {isEditing && (editedInquiry.notes || '') && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-zinc-400 hover:text-red-500"
                              onClick={handleDeleteNotes}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete notes</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {isEditing ? (
                      <Textarea
                        value={editedInquiry.notes || ''}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('notes', e.target.value)}
                        className="min-h-[100px] bg-zinc-50 border-zinc-200"
                        placeholder="Add notes..."
                      />
                    ) : (
                      <p className="text-sm text-zinc-600 whitespace-pre-wrap">
                        {inquiry.notes || <span className="text-zinc-400 italic">No notes</span>}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Terms Card */}
                <Card className="border-[#acc2ef] shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                          <ClipboardList className="h-4 w-4 text-zinc-600" />
                        </div>
                        <span className="text-sm font-medium text-zinc-700">Terms & Conditions</span>
                      </div>
                      {isEditing && (editedInquiry.terms || '') && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-zinc-400 hover:text-red-500"
                              onClick={handleDeleteTerms}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete terms</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {isEditing ? (
                      <Textarea
                        value={editedInquiry.terms || ''}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('terms', e.target.value)}
                        className="min-h-[100px] bg-zinc-50 border-zinc-200"
                        placeholder="Add terms and conditions..."
                      />
                    ) : (
                      <p className="text-sm text-zinc-600 whitespace-pre-wrap">
                        {inquiry.terms || <span className="text-zinc-400 italic">No terms</span>}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Quick Stats */}
              <Card className="border-[#acc2ef] shadow-sm overflow-hidden">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-5 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Total Amount</span>
                    <p className="text-sm font-bold text-zinc-400">R </p>
                  </div>
                  <p className="text-3xl font-bold tracking-tight">
                    {formatCurrency(isEditing
                      ? editedInquiry.total
                      : inquiry.total || calculateTotals(quotationItems, inquiry.taxRate || '0').total)}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">Including VAT</p>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500">Subtotal</span>
                    <span className="font-medium text-zinc-900">
                      {formatCurrency(isEditing
                        ? editedInquiry.subtotal
                        : inquiry.subtotal || calculateTotals(quotationItems, inquiry.taxRate || '0').subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500">VAT ({isEditing ? editedInquiry.taxRate : inquiry.taxRate || '0'}%)</span>
                    <span className="font-medium text-zinc-900">
                      {formatCurrency(
                        Number.parseFloat(isEditing
                          ? editedInquiry.subtotal || '0'
                          : inquiry.subtotal || calculateTotals(quotationItems, inquiry.taxRate || '0').subtotal) *
                        Number.parseFloat(isEditing ? editedInquiry.taxRate || '0' : inquiry.taxRate || '0') / 100
                      )}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500">Items</span>
                    <Badge variant="secondary" className="bg-zinc-100 text-zinc-700">
                      {quotationItems.length}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Timeline */}
              <Card className="border-[#acc2ef] shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-zinc-500" />
                    <span className="text-sm font-medium text-zinc-700">Timeline</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">

                    {/* Inquiry Received */}
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                        <div className="w-px h-8 bg-zinc-200" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-zinc-900">
                          Inquiry Received
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {formattedDate} at {formattedTime}
                        </p>
                      </div>
                    </div>

                    {/* Quotation Created */}
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`h-2.5 w-2.5 rounded-full ring-4 ${hasQuotationNumber
                            ? 'bg-emerald-500 ring-emerald-100'
                            : 'bg-zinc-300 ring-zinc-100'
                            }`}
                        />
                        <div className="w-px h-8 bg-zinc-200" />
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${hasQuotationNumber ? 'text-zinc-900' : 'text-zinc-400'
                            }`}
                        >
                          Quotation Created
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {hasQuotationNumber ? inquiry.quotationNumber : 'Pending'}
                        </p>
                      </div>
                    </div>

                    {/* Fully Quoted */}
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`h-2.5 w-2.5 rounded-full ring-4 ${isFullyQuoted
                            ? 'bg-emerald-500 ring-emerald-100'
                            : 'bg-zinc-300 ring-zinc-100'
                            }`}
                        />
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${isFullyQuoted ? 'text-zinc-900' : 'text-zinc-400'
                            }`}
                        >
                          Fully Quoted
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {isFullyQuoted
                            ? `${formattedItems[0].formattedDateItems} at ${formattedItems[0].formattedTimeItems}`
                            : 'Add items to complete quote'}
                        </p>
                      </div>
                    </div>

                  </div>
                </CardContent>

              </Card>

              {/* Quick Info */}
              <Card className="border-[#acc2ef] shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-zinc-500" />
                    <span className="text-sm font-medium text-zinc-700">Reference</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500">Inquiry ID</span>
                    <code className="text-xs font-mono bg-zinc-100 px-2 py-1 rounded text-zinc-700">
                      {inquiry.id.slice(0, 8).toUpperCase()}
                    </code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500">Quote Number</span>
                    <code className="text-xs font-mono bg-zinc-100 px-2 py-1 rounded text-zinc-700">
                      {(isEditing ? editedInquiry.quotationNumber : inquiry.quotationNumber) || 'N/A'}
                    </code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500">Type</span>
                    <Badge variant="outline" className="text-[10px] text-blue-400 border border-[#acc2ef]">
                      {isQuoteRequest ? 'Request' : 'Quotation'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Alert for Quote Request */}
              {isQuoteRequest && (
                <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Action Required</p>
                      <p className="text-xs text-amber-700 mt-1">Add items and pricing to generate a formal quotation.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Mode Indicator */}
              {isEditing && (
                <div className="rounded-lg border border-sky-200 bg-sky-50/50 p-4">
                  <div className="flex gap-3">
                    <Edit className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-sky-800">Edit Mode</p>
                      <p className="text-xs text-sky-700 mt-1">You can edit items, tax rate, notes, and terms. Click &quot;Save All&quot; when done.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

function ContactCard({ icon, label, value, href, isEditing, onChange, accentColor }: { icon: React.ReactNode; label: string; value: string; href?: string; isEditing: boolean; onChange: (value: string) => void; accentColor: string }) {
  const content = (
    <Card className="border-[#acc2ef] shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`h-9 w-9 rounded-lg ${accentColor} flex items-center justify-center text-white shrink-0`}>
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
            {/* Always non-editable, so just show the value */}
            <p className="text-sm font-medium text-zinc-900 truncate group-hover:text-zinc-700">{value}</p>
          </div>
          {href && (
            <ArrowUpRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-500 transition-colors shrink-0" />
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    )
  }

  return content
}

export default InquiryDetail