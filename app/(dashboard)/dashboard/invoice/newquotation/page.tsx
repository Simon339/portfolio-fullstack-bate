"use client"

import { useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ChevronLeft, Loader, Plus, Minus, User, Mail, Phone, MapPin, Trash2, Package, FileText, Eye, CheckCircle, AlertCircle, X, Calendar, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { createNewQuotation } from "@/server/actions/service"
import { useRouter } from "next/navigation"

// Zod Schema for form validation
const quotationSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Valid email is required"),
    phone: z.string().min(1, "Phone number is required"),
    companyName: z.string().min(2, "Company name must be at least 2 characters"),
    address: z.object({
        unit: z.string().optional(),
        street: z.string().optional(),
        subdivision: z.string().optional(),
        city: z.string().optional(),
        province: z.string().optional(),
        postalCode: z.string().optional(),
    }),
    service: z.string().min(1, "Service description is required"),
    notes: z.string().optional(),
    terms: z.string().optional(),
})

type QuotationFormData = z.infer<typeof quotationSchema>

// Item validation schema
const itemSchema = z.object({
    description: z.string().min(1, "Description is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    unit: z.string().min(1, "Unit is required"),
    unitPrice: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, "Valid price required"),
})

interface QuotationItem {
    id: string
    description: string
    quantity: number
    unit: string
    unitPrice: string
    total: string
}

export default function AddQuotation() {
    const router = useRouter();
    const [items, setItems] = useState<QuotationItem[]>([])
    const [saving, setSaving] = useState(false)
    const [taxRate, setTaxRate] = useState<string>("15")
    const [showPreview, setShowPreview] = useState(false)
    const [editingCell, setEditingCell] = useState<{ rowIndex: number; column: string } | null>(null);
    
    // Inline item form state
    const [isAddingItem, setIsAddingItem] = useState(false)
    const [newItem, setNewItem] = useState({
        description: "",
        quantity: 1,
        unit: "units",
        unitPrice: "0.00",
    })
    const [itemErrors, setItemErrors] = useState<Record<string, string>>({})

    // React Hook Form setup
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<QuotationFormData>({
        resolver: zodResolver(quotationSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            companyName: "",
            address: {
                unit: "",
                street: "",
                subdivision: "",
                city: "",
                province: "",
                postalCode: "",
            },
            service: "",
            notes: "",
            terms: "",
        },
    })

    // Watch form values for preview
    const watchedValues = watch()

    // Calculate totals in background using useMemo
    const totals = useMemo(() => {
        const subtotal = items.reduce((sum, item) => sum + parseFloat(item.total || "0"), 0)
        const taxRateValue = parseFloat(taxRate || "15")
        const tax = (subtotal * taxRateValue) / 100
        const total = subtotal + tax

        return {
            subtotal: subtotal.toFixed(2),
            tax: tax.toFixed(2),
            total: total.toFixed(2),
        }
    }, [items, taxRate])

    const calculateItemTotal = (quantity: number, unitPrice: string) => {
        const price = parseFloat(unitPrice) || 0
        return (quantity * price).toFixed(2)
    }

    const validateNewItem = (): boolean => {
        const result = itemSchema.safeParse({
            ...newItem,
            quantity: newItem.quantity,
            unitPrice: newItem.unitPrice,
        })

        if (!result.success) {
            const fieldErrors: Record<string, string> = {}
            result.error.errors.forEach((err) => {
                if (err.path[0]) {
                    fieldErrors[err.path[0] as string] = err.message
                }
            })
            setItemErrors(fieldErrors)
            return false
        }

        setItemErrors({})
        return true
    }

    const handleAddItem = () => {
        if (!validateNewItem()) return

        const itemTotal = calculateItemTotal(newItem.quantity, newItem.unitPrice)
        const newItemWithTotal: QuotationItem = {
            ...newItem,
            total: itemTotal,
            id: `new-${Date.now()}`,
        }

        setItems([...items, newItemWithTotal])
        setNewItem({
            description: "",
            quantity: 1,
            unit: "units",
            unitPrice: "0.00",
        })
        setIsAddingItem(false)
        setItemErrors({})
        toast.success("Item added successfully")
    }

    const handleCancelAddItem = () => {
        setNewItem({
            description: "",
            quantity: 1,
            unit: "units",
            unitPrice: "0.00",
        })
        setIsAddingItem(false)
        setItemErrors({})
    }

    const handleDeleteItem = (index: number) => {
        const updatedItems = items.filter((_, i) => i !== index)
        setItems(updatedItems)
        toast.success("Item removed successfully")
    }

    const handleQuantityChange = (index: number, change: number) => {
        const updatedItems = [...items]
        const newQuantity = Math.max(1, updatedItems[index].quantity + change)
        updatedItems[index].quantity = newQuantity
        updatedItems[index].total = calculateItemTotal(newQuantity, updatedItems[index].unitPrice)
        setItems(updatedItems)
    }

    const handleUnitPriceChange = (index: number, value: string) => {
        const updatedItems = [...items]
        updatedItems[index].unitPrice = value
        updatedItems[index].total = calculateItemTotal(updatedItems[index].quantity, value)
        setItems(updatedItems)
    }

    const handleUnitChange = (index: number, value: string) => {
        const updatedItems = [...items]
        updatedItems[index].unit = value
        setItems(updatedItems)
    }

    const handleInlineItemSave = (index: number) => {
        const item = items[index]
        
        // Validate required fields
        if (!item.description.trim()) {
            toast.error("Please enter a description for the item")
            return
        }
        
        if (!item.unit.trim()) {
            toast.error("Please enter a unit for the item")
            return
        }
        
        setEditingCell(null)
    }

const onSubmit = async (data: QuotationFormData) => {
    // Validate items
    if (items.length === 0) {
        toast.error("Please add at least one item")
        return
    }

    // Validate all items have required fields
    const invalidItems = items.filter(item => !item.description.trim() || !item.unit.trim())
    if (invalidItems.length > 0) {
        toast.error("Please fill in all required item fields (description and unit)")
        return
    }

    try {
        setSaving(true)

        // Prepare data for server action
        const quotationData = {
            name: data.name.trim(),
            email: data.email.trim(),
            phone: data.phone.trim(),
            companyName: data.companyName.trim(),
            // Ensure address is properly formatted as an object
            address: {
                unit: data.address.unit?.trim() || "",
                street: data.address.street?.trim() || "",
                subdivision: data.address.subdivision?.trim() || "",
                city: data.address.city?.trim() || "",
                province: data.address.province?.trim() || "",
                postalCode: data.address.postalCode?.trim() || "",
            },

            // Quotation details
            service: data.service.trim(),
            notes: data.notes?.trim() || "",
            terms: data.terms?.trim() || "",

            // Quotation items
            items: items.map((item) => ({
                description: item.description.trim(),
                quantity: item.quantity,
                unit: item.unit.trim() || "units",
                unitPrice: parseFloat(item.unitPrice).toFixed(2),
                total: parseFloat(item.total).toFixed(2),
            })),

            // Financials
            subtotal: totals.subtotal,
            taxRate: parseFloat(taxRate).toFixed(2),
            total: totals.total,
        }

        console.log("Sending quotation data:", quotationData) // For debugging

        const response = await createNewQuotation(quotationData)
        
        if (response.error) {
            toast.error(response.error)
            return
        }

        toast.success("Quotation created successfully!")
        
        // Use the redirect path from the response if available
        if (response.redirect) {
            router.push(response.redirect)
        } else {
            router.push("/dashboard/invoice")
        }
    } catch (error: unknown) {
        console.error("Error creating quotation:", error)
        toast.error(error instanceof Error ? error.message : "Failed to create quotation")
    } finally {
        setSaving(false)
    }
}

    const handleCancel = () => {
        router.back()
        toast.info("Navigation cancelled")
    }

    // Error helper component
    const FieldError = ({ message }: { message?: string }) => {
        if (!message) return null
        return (
            <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {message}
            </p>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-slate-50 p-2 md:p-4 space-y-6">
            {/* Header */}
            <div className="border-b border-blue-200/80">
                <div className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={handleCancel} className="gap-2 hover:bg-blue-50">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Create New Quotation</h1>
                            <p className="text-slate-600 text-sm">From scratch with customer data</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                            <FileText className="h-3 w-3 mr-1" />
                            New Quotation
                        </Badge>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Main Content - Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Left Column - Customer & Service Details (2/3) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Customer Information Card */}
                        <div className="bg-white border border-blue-200/80 rounded-lg shadow-sm">
                            <div className="px-6 py-4 border-b border-blue-200/80 bg-slate-50/50 rounded-t-lg">
                                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                    <User className="h-5 w-5 text-blue-600" />
                                    Customer Information
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Enter customer details. A new customer will be created if they don&apos;t exist.
                                </p>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                                                Contact Person <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="name"
                                                {...register("name")}
                                                placeholder="John Doe"
                                                className={cn(
                                                    "bg-slate-100/80 border-blue-200/80 focus:border-blue-400 focus:ring-blue-400/20",
                                                    errors.name && "border-red-300 focus:border-red-400 focus:ring-red-400/20"
                                                )}
                                            />
                                            <FieldError message={errors.name?.message} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="companyName" className="text-sm font-medium text-slate-700">
                                                Company Name <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="companyName"
                                                {...register("companyName")}
                                                placeholder="Company Ltd"
                                                className={cn(
                                                    "bg-slate-100/80 border-blue-200/80 focus:border-blue-400 focus:ring-blue-400/20",
                                                    errors.companyName && "border-red-300 focus:border-red-400 focus:ring-red-400/20"
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                                <Mail className="h-4 w-4 text-slate-500" />
                                                Email Address <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                {...register("email")}
                                                placeholder="customer@example.com"
                                                className={cn(
                                                    "bg-slate-100/80 border-blue-200/80 focus:border-blue-400 focus:ring-blue-400/20",
                                                    errors.email && "border-red-300 focus:border-red-400 focus:ring-red-400/20"
                                                )}
                                            />
                                            <FieldError message={errors.email?.message} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                                <Phone className="h-4 w-4 text-slate-500" />
                                                Phone Number <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="phone"
                                                {...register("phone")}
                                                placeholder="+27 123 456 789"
                                                className={cn(
                                                    "bg-slate-100/80 border-blue-200/80 focus:border-blue-400 focus:ring-blue-400/20",
                                                    errors.phone && "border-red-300 focus:border-red-400 focus:ring-red-400/20"
                                                )}
                                            />
                                            <FieldError message={errors.phone?.message} />
                                        </div>
                                    </div>
                                </div>

                                <Separator className="bg-blue-100" />

                                {/* Address Information */}
                                <div>
                                    <h4 className="text-sm font-medium text-slate-700 mb-4 flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-slate-500" />
                                        Address Information <span className="text-slate-400 font-normal">(Optional)</span>
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="unit" className="text-sm text-slate-600">
                                                    Unit / Apartment
                                                </Label>
                                                <Input
                                                    id="unit"
                                                    {...register("address.unit")}
                                                    placeholder="A1"
                                                    className="bg-slate-100/80 border-blue-200/80 focus:border-blue-400 focus:ring-blue-400/20"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="street" className="text-sm text-slate-600">
                                                    Street Address
                                                </Label>
                                                <Input
                                                    id="street"
                                                    {...register("address.street")}
                                                    placeholder="123 Main Street"
                                                    className="bg-slate-100/80 border-blue-200/80 focus:border-blue-400 focus:ring-blue-400/20"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="subdivision" className="text-sm text-slate-600">
                                                    Subdivision / Complex
                                                </Label>
                                                <Input
                                                    id="subdivision"
                                                    {...register("address.subdivision")}
                                                    placeholder="Sunset Complex"
                                                    className="bg-slate-100/80 border-blue-200/80 focus:border-blue-400 focus:ring-blue-400/20"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="city" className="text-sm text-slate-600">
                                                    City
                                                </Label>
                                                <Input
                                                    id="city"
                                                    {...register("address.city")}
                                                    placeholder="Cape Town"
                                                    className="bg-slate-100/80 border-blue-200/80 focus:border-blue-400 focus:ring-blue-400/20"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="province" className="text-sm text-slate-600">
                                                    Province
                                                </Label>
                                                <Input
                                                    id="province"
                                                    {...register("address.province")}
                                                    placeholder="Western Cape"
                                                    className="bg-slate-100/80 border-blue-200/80 focus:border-blue-400 focus:ring-blue-400/20"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="postalCode" className="text-sm text-slate-600">
                                                    Postal Code
                                                </Label>
                                                <Input
                                                    id="postalCode"
                                                    {...register("address.postalCode")}
                                                    placeholder="8001"
                                                    className="bg-slate-100/80 border-blue-200/80 focus:border-blue-400 focus:ring-blue-400/20"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items Card */}
                        <div className="bg-white border border-blue-200/80 rounded-lg shadow-sm">
                            <div className="px-6 py-4 border-b border-blue-200/80 bg-slate-50/50 rounded-t-lg flex items-center justify-between">
                                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                    <Package className="h-5 w-5 text-blue-600" />
                                    Items & Pricing
                                </h3>
                                {!isAddingItem && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        className="gap-2 bg-blue-600 hover:bg-blue-700"
                                        onClick={() => {
                                            const newEmptyItem = {
                                                id: `new-${Date.now()}`,
                                                description: '',
                                                quantity: 1,
                                                unit: 'units',
                                                unitPrice: '0.00',
                                                total: '0.00'
                                            };
                                            setItems([...items, newEmptyItem]);
                                            setTimeout(() => {
                                                setEditingCell({ rowIndex: items.length, column: 'description' });
                                            }, 100);
                                        }}
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Item
                                    </Button>
                                )}
                            </div>

                            <div className="p-6">
                                {items.length > 0 ? (
                                    <div className="space-y-4">
                                        <div className="overflow-x-auto rounded-lg border border-slate-200">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-slate-50/80">
                                                        <TableHead className="text-xs font-semibold text-slate-600 w-2/5">Description</TableHead>
                                                        <TableHead className="text-xs font-semibold text-slate-600 text-center w-1/8">Unit</TableHead>
                                                        <TableHead className="text-xs font-semibold text-slate-600 text-center w-1/8">Quantity</TableHead>
                                                        <TableHead className="text-xs font-semibold text-slate-600 text-center w-1/8">Unit Price (R)</TableHead>
                                                        <TableHead className="text-xs font-semibold text-slate-600 text-center w-1/8">Total (R)</TableHead>
                                                        <TableHead className="text-xs font-semibold text-slate-600 text-center w-16">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {items.map((item, index) => (
                                                        <TableRow key={item.id} className="hover:bg-slate-50/50">
                                                            {/* Description Column - Editable */}
                                                            <TableCell className="py-3">
                                                                <div className="relative group">
                                                                    {editingCell?.rowIndex === index && editingCell?.column === 'description' ? (
                                                                        <Input
                                                                            value={item.description}
                                                                            onChange={(e) => {
                                                                                const updatedItems = [...items];
                                                                                updatedItems[index] = { ...item, description: e.target.value };
                                                                                setItems(updatedItems);
                                                                            }}
                                                                            onBlur={() => setEditingCell(null)}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter') setEditingCell(null);
                                                                            }}
                                                                            className="h-8 text-sm border-blue-300 bg-slate-100/80 border-blue-200/80 focus:border-blue-400 focus:ring-blue-400/20"
                                                                            autoFocus
                                                                        />
                                                                    ) : (
                                                                        <div
                                                                            className="text-sm font-medium text-slate-800 p-1 rounded hover:bg-slate-100 cursor-pointer min-h-[32px] flex items-center"
                                                                            onClick={() => setEditingCell({ rowIndex: index, column: 'description' })}
                                                                        >
                                                                            {item.description || "Click to add description"}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </TableCell>

                                                            {/* Unit Column - Editable */}
                                                            <TableCell className="text-center">
                                                                <div className="relative group">
                                                                    {editingCell?.rowIndex === index && editingCell?.column === 'unit' ? (
                                                                        <Input
                                                                            value={item.unit}
                                                                            onChange={(e) => {
                                                                                const updatedItems = [...items];
                                                                                updatedItems[index] = { ...item, unit: e.target.value };
                                                                                setItems(updatedItems);
                                                                            }}
                                                                            onBlur={() => setEditingCell(null)}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter') setEditingCell(null);
                                                                            }}
                                                                            className="h-8 text-sm text-center bg-slate-100/80 border-blue-200/80 focus:ring-blue-400/20 border-blue-300 focus:border-blue-500 w-24 mx-auto"
                                                                            autoFocus
                                                                            placeholder="units"
                                                                        />
                                                                    ) : (
                                                                        <div
                                                                            className="text-sm p-1 rounded hover:bg-slate-100 cursor-pointer min-h-[32px] flex items-center justify-center"
                                                                            onClick={() => setEditingCell({ rowIndex: index, column: 'unit' })}
                                                                        >
                                                                            {item.unit || "Click to set unit"}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </TableCell>

                                                            {/* Quantity Column - Editable */}
                                                            <TableCell className="text-center">
                                                                <div className="relative group">
                                                                    {editingCell?.rowIndex === index && editingCell?.column === 'quantity' ? (
                                                                        <Input
                                                                            type="number"
                                                                            min="1"
                                                                            value={item.quantity}
                                                                            onChange={(e) => {
                                                                                const value = parseInt(e.target.value) || 1;
                                                                                const updatedItems = [...items];
                                                                                updatedItems[index] = {
                                                                                    ...item,
                                                                                    quantity: value,
                                                                                    total: (value * parseFloat(item.unitPrice || "0")).toFixed(2)
                                                                                };
                                                                                setItems(updatedItems);
                                                                            }}
                                                                            onBlur={() => setEditingCell(null)}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter') setEditingCell(null);
                                                                            }}
                                                                            className="h-8 text-sm text-center bg-slate-100/80 border-blue-200/80 focus:ring-blue-400/20 border-blue-300 focus:border-blue-500 w-24 mx-auto"
                                                                            autoFocus
                                                                        />
                                                                    ) : (
                                                                        <div className="flex items-center justify-center gap-2">
                                                                            <Button
                                                                                type="button"
                                                                                size="sm"
                                                                                variant="ghost"
                                                                                className="h-7 w-7 p-0 hover:bg-slate-200"
                                                                                onClick={() => handleQuantityChange(index, -1)}
                                                                            >
                                                                                <Minus className="h-3 w-3" />
                                                                            </Button>
                                                                            <span
                                                                                className="w-16 text-sm font-medium p-1 rounded hover:bg-slate-100 cursor-pointer min-h-[32px] flex items-center justify-center"
                                                                                onClick={() => setEditingCell({ rowIndex: index, column: 'quantity' })}
                                                                            >
                                                                                {item.quantity}
                                                                            </span>
                                                                            <Button
                                                                                type="button"
                                                                                size="sm"
                                                                                variant="ghost"
                                                                                className="h-7 w-7 p-0 hover:bg-slate-200"
                                                                                onClick={() => handleQuantityChange(index, 1)}
                                                                            >
                                                                                <Plus className="h-3 w-3" />
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </TableCell>

                                                            {/* Unit Price Column - Editable */}
                                                            <TableCell className="text-center">
                                                                <div className="relative">
                                                                    {editingCell?.rowIndex === index && editingCell?.column === 'unitPrice' ? (
                                                                        <Input
                                                                            type="number"
                                                                            step="0.01"
                                                                            value={item.unitPrice}
                                                                            onChange={(e) => {
                                                                                const value = parseFloat(e.target.value) || 0;
                                                                                const updatedItems = [...items];
                                                                                updatedItems[index] = {
                                                                                    ...item,
                                                                                    unitPrice: value.toString(),
                                                                                    total: (item.quantity * value).toFixed(2)
                                                                                };
                                                                                setItems(updatedItems);
                                                                            }}
                                                                            onBlur={() => setEditingCell(null)}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter') setEditingCell(null);
                                                                            }}
                                                                            className="h-8 text-sm text-center border-blue-300 bg-slate-100/80 border-blue-200/80 focus:border-blue-400 focus:ring-blue-400/20 w-32 mx-auto"
                                                                            autoFocus
                                                                        />
                                                                    ) : (
                                                                        <div
                                                                            className="text-sm p-1 rounded hover:bg-slate-100 cursor-pointer min-h-[32px] flex items-center justify-center"
                                                                            onClick={() => setEditingCell({ rowIndex: index, column: 'unitPrice' })}
                                                                        >
                                                                            {formatCurrency(parseFloat(item.unitPrice || "0"))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </TableCell>

                                                            {/* Total Column - Calculated (Read-only) */}
                                                            <TableCell className="text-center font-semibold text-sm text-slate-800">
                                                                {formatCurrency(parseFloat(item.total || "0"))}
                                                            </TableCell>

                                                            {/* Actions Column */}
                                                            <TableCell className="text-center">
                                                                <div className="flex items-center justify-center gap-1">
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                                        onClick={() => handleDeleteItem(index)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {/* Summary */}
                                        <div className="border-t border-slate-200 pt-4 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-slate-600">Subtotal</span>
                                                <span className="text-lg font-bold text-slate-800">R {formatCurrency(parseFloat(totals.subtotal))}</span>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-slate-600">Tax Rate</span>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={taxRate}
                                                        onChange={(e) => setTaxRate(e.target.value)}
                                                        className="w-20 h-8 bg-slate-100/80 border-blue-200/80 text-sm"
                                                        min="0"
                                                        max="100"
                                                    />
                                                    <span className="text-sm text-slate-600">%</span>
                                                </div>
                                                <span className="text-lg font-bold text-slate-800">R {formatCurrency(parseFloat(totals.tax))}</span>
                                            </div>

                                            <Separator className="bg-slate-200" />

                                            <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg">
                                                <span className="text-lg font-bold text-slate-900">Total</span>
                                                <span className="text-2xl font-bold text-blue-700">R {formatCurrency(parseFloat(totals.total))}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    !isAddingItem && (
                                        <div className="text-center py-12">
                                            <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                                <Package className="h-8 w-8 text-slate-400" />
                                            </div>
                                            <p className="text-slate-500 mb-4">No items added yet</p>
                                            <Button
                                                type="button"
                                                size="sm"
                                                className="gap-2 bg-blue-600 hover:bg-blue-700"
                                                onClick={() => {
                                                    const newEmptyItem = {
                                                        id: `new-${Date.now()}`,
                                                        description: '',
                                                        quantity: 1,
                                                        unit: 'units',
                                                        unitPrice: '0.00',
                                                        total: '0.00'
                                                    };
                                                    setItems([newEmptyItem]);
                                                    setTimeout(() => {
                                                        setEditingCell({ rowIndex: 0, column: 'description' });
                                                    }, 100);
                                                }}
                                            >
                                                <Plus className="h-4 w-4" />
                                                Add First Item
                                            </Button>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Service Information (1/3) */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Service Information Card */}
                        <div className="bg-white border border-blue-200/80 rounded-lg shadow-sm">
                            <div className="px-6 py-4 border-b border-blue-200/80 bg-slate-50/50 rounded-t-lg">
                                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    Service Information
                                </h3>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="service" className="text-sm font-medium text-slate-700">
                                            Service Description <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="service"
                                            {...register("service")}
                                            placeholder="Provide the service being quoted..."
                                            className={cn(
                                                "bg-slate-100/80 border-blue-200/80 focus:border-blue-400 focus:ring-blue-400/20",
                                                errors.service && "border-red-300 focus:border-red-400 focus:ring-red-400/20"
                                            )}
                                        />
                                        <FieldError message={errors.service?.message} />
                                    </div>
                                </div>

                                <Separator className="bg-blue-100" />

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="notes" className="text-sm font-medium text-slate-700">
                                            Notes <span className="text-slate-400 font-normal">(Optional)</span>
                                        </Label>
                                        <Input
                                            id="notes"
                                            {...register("notes")}
                                            placeholder="Add any notes for this quotation..."
                                            className="bg-slate-100/80 border-blue-200/80 focus:border-blue-400 focus:ring-blue-400/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="terms" className="text-sm font-medium text-slate-700">
                                            Terms & Conditions <span className="text-slate-400 font-normal">(Optional)</span>
                                        </Label>
                                        <Input
                                            id="terms"
                                            {...register("terms")}
                                            placeholder="Add terms and conditions..."
                                            className="bg-slate-100/80 border-blue-200/80 focus:border-blue-400 focus:ring-blue-400/20"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Summary Card */}
                        <div className="bg-white border border-blue-200/80 rounded-lg shadow-sm">
                            <div className="px-6 py-4 border-b border-blue-200/80 bg-slate-50/50 rounded-t-lg">
                                <h3 className="text-base font-semibold text-slate-900">Quick Summary</h3>
                            </div>
                            <div className="p-6 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Items</span>
                                    <span className="font-medium text-slate-800">{items.length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Subtotal</span>
                                    <span className="font-medium text-slate-800">R {formatCurrency(parseFloat(totals.subtotal))}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Tax ({taxRate}%)</span>
                                    <span className="font-medium text-slate-800">R {formatCurrency(parseFloat(totals.tax))}</span>
                                </div>
                                <Separator className="bg-slate-200" />
                                <div className="flex justify-between">
                                    <span className="font-semibold text-slate-900">Total</span>
                                    <span className="font-bold text-blue-700 text-lg">R {formatCurrency(parseFloat(totals.total))}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-white border border-blue-200/80 rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <Button type="button" variant="outline" onClick={handleCancel} className="text-slate-600 hover:bg-slate-100 border-slate-300 bg-transparent">
                            Cancel
                        </Button>
                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="gap-2 text-slate-600 hover:bg-slate-100 border-slate-300 bg-transparent"
                                onClick={() => setShowPreview(true)}
                            >
                                <Eye className="h-4 w-4" />
                                Preview
                            </Button>
                            <Button type="submit" className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700" disabled={saving}>
                                {saving ? <Loader className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                {saving ? "Creating..." : "Create Quotation"}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Preview Header */}
                        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
                            <div className="flex items-center gap-2">
                                <Eye className="h-5 w-5 text-blue-600" />
                                <h2 className="text-lg font-semibold text-slate-900">Quotation Preview</h2>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowPreview(false)}
                                className="h-8 w-8 p-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Preview Content */}
                        <div className="p-6 space-y-6">
                            {/* Company Header */}
                            <div className="text-center border-b border-slate-200 pb-6">
                                <h1 className="text-2xl font-bold text-slate-900">QUOTATION</h1>
                                <p className="text-sm text-slate-500 mt-1">Draft Preview</p>
                            </div>

                            {/* Customer & Date Info */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Bill To
                                    </h3>
                                    <div className="text-slate-800">
                                        <p className="font-medium">{watchedValues.name || "Customer Name"}</p>
                                        {watchedValues.companyName && (
                                            <p className="flex items-center gap-1 text-sm">
                                                <Building2 className="h-3 w-3 text-slate-400" />
                                                {watchedValues.companyName}
                                            </p>
                                        )}
                                        <p className="text-sm text-slate-600">{watchedValues.email || "email@example.com"}</p>
                                        <p className="text-sm text-slate-600">{watchedValues.phone || "+27 000 000 000"}</p>
                                        {watchedValues.address?.street && (
                                            <p className="text-sm text-slate-600 mt-1">
                                                {[
                                                    watchedValues.address.unit,
                                                    watchedValues.address.street,
                                                    watchedValues.address.subdivision,
                                                    watchedValues.address.city,
                                                    watchedValues.address.province,
                                                    watchedValues.address.postalCode,
                                                ]
                                                    .filter(Boolean)
                                                    .join(", ")}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right space-y-2">
                                    <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide flex items-center justify-end gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Details
                                    </h3>
                                    <div className="text-slate-800 text-sm space-y-1">
                                        <p>
                                            <span className="text-slate-500">Date:</span>{" "}
                                            {new Date().toLocaleDateString("en-ZA", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </p>
                                        <p>
                                            <span className="text-slate-500">Quote #:</span> QT-DRAFT
                                        </p>
                                        <p>
                                            <span className="text-slate-500">Valid Until:</span>{" "}
                                            {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-ZA", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Service Description */}
                            <div className="bg-slate-50 p-4 rounded-lg">
                                <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                                    Service Description
                                </h3>
                                <p className="text-slate-800">{watchedValues.service || "No service description provided"}</p>
                            </div>

                            {/* Items Table */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">
                                    Line Items
                                </h3>
                                {items.length > 0 ? (
                                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-100">
                                                    <TableHead className="text-xs font-semibold text-slate-700">Description</TableHead>
                                                    <TableHead className="text-xs font-semibold text-slate-700 text-center">Unit</TableHead>
                                                    <TableHead className="text-xs font-semibold text-slate-700 text-center">Qty</TableHead>
                                                    <TableHead className="text-xs font-semibold text-slate-700 text-right">Unit Price</TableHead>
                                                    <TableHead className="text-xs font-semibold text-slate-700 text-right">Total</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {items.map((item) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell className="text-sm text-slate-800">{item.description || "No description"}</TableCell>
                                                        <TableCell className="text-sm text-slate-800 text-center">{item.unit || "units"}</TableCell>
                                                        <TableCell className="text-sm text-slate-800 text-center">{item.quantity}</TableCell>
                                                        <TableCell className="text-sm text-slate-800 text-right">
                                                            R {formatCurrency(parseFloat(item.unitPrice))}
                                                        </TableCell>
                                                        <TableCell className="text-sm font-medium text-slate-800 text-right">
                                                            R {formatCurrency(parseFloat(item.total))}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="border border-dashed border-slate-300 rounded-lg p-8 text-center">
                                        <Package className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                                        <p className="text-slate-500">No items added yet</p>
                                    </div>
                                )}
                            </div>

                            {/* Totals */}
                            <div className="flex justify-end">
                                <div className="w-64 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Subtotal</span>
                                        <span className="text-slate-800">R {formatCurrency(parseFloat(totals.subtotal))}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Tax ({taxRate}%)</span>
                                        <span className="text-slate-800">R {formatCurrency(parseFloat(totals.tax))}</span>
                                    </div>
                                    <Separator className="bg-slate-200" />
                                    <div className="flex justify-between font-semibold">
                                        <span className="text-slate-900">Total</span>
                                        <span className="text-blue-700 text-lg">R {formatCurrency(parseFloat(totals.total))}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Notes & Terms */}
                            {(watchedValues.notes || watchedValues.terms) && (
                                <div className="border-t border-slate-200 pt-4 space-y-4">
                                    {watchedValues.notes && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-600 mb-1">Notes</h4>
                                            <p className="text-sm text-slate-600">{watchedValues.notes}</p>
                                        </div>
                                    )}
                                    {watchedValues.terms && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-600 mb-1">Terms & Conditions</h4>
                                            <p className="text-sm text-slate-600">{watchedValues.terms}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Preview Footer */}
                        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between rounded-b-lg">
                            <p className="text-sm text-slate-500">This is a preview. Submit the form to create the quotation.</p>
                            <Button
                                type="button"
                                onClick={() => setShowPreview(false)}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Close Preview
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// Helper function for currency formatting
function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-ZA", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount)
}