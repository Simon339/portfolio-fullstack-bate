"use client";

import InquiryDetail from "@/components/Dashboard/InquiryDetail";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator";
import { ServiceInquiryQuotationItems, deleteQuotation, getAllServiceInquiry } from "@/server/actions/service";
import { ChevronLeft, MoreHorizontal, Printer, Send, Trash2, FileText, ArrowLeft, AlertTriangle, Info, Loader, User, Mail } from 'lucide-react';
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PDFHandler } from "@/lib/pdfs";

interface Address {
  unit?: string;
  street: string;
  subdivision?: string;
  city: string;
  province: string;
  postalCode: string;
}

interface ServiceInquiry {
  id: string;
  name: string;
  email: string;
  address?: Address | string;
  companyName: string;
  service: string;
  phoneNumber: string;
  createdAt: Date;
  isSelected: boolean;
  isRead: boolean;
  quotationNumber?: string;
  subtotal?: string;
  taxRate?: string;
  total?: string;
}

interface QuotationItem {
  id: string;
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  total: string;
  createdAt: Date;
}

const InquiryPage = () => {
  const params = useParams();
  const router = useRouter();
  const [inquiry, setInquiry] = useState<ServiceInquiry | null>(null);
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteQuotationId, setDeleteQuotationId] = useState<string>("");
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState("");
  const [additionalRecipients, setAdditionalRecipients] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const inquiryId = params.id as string;
  const emailSubject = useRef("")

  const loadInquiry = useCallback(async () => {
    if (!inquiryId) {
      setError("No inquiry ID provided");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const [inquiries, quotationItemsData] = await Promise.all([
        getAllServiceInquiry(),
        ServiceInquiryQuotationItems(inquiryId)
      ]);
      
      const foundInquiry = inquiries.find((i) => i.id === inquiryId);

      if (foundInquiry) {
        setInquiry(foundInquiry);
        setQuotationItems(quotationItemsData);
      } else {
        setError("Inquiry not found");
      }
    } catch (error) {
      setError("Failed to load inquiry");
    } finally {
      setIsLoading(false);
    }
  }, [inquiryId]);

  useEffect(() => {
    loadInquiry();
  }, [loadInquiry]);

  const handleDelete = async () => {
    if (!deleteQuotationId || !inquiry) return;
    
    try {
      await deleteQuotation(deleteQuotationId);
      toast.success("Quotation deleted successfully");
      router.push('/dashboard/mails');
    } catch (err) {
      toast.error("Failed to delete quotation");
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteQuotationId("");
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteQuotationId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleBack = () => {
    router.back();
  };

  const handleSendInquiryEmail = async () => {
    if (!inquiry) return;

    setIsSendingEmail(true);

    try {
      // Parse additional recipients
      const additionalEmails = additionalRecipients
        .split(',')
        .map(email => email.trim())
        .filter(email => email && email.includes('@'));

      // TODO: Implement actual email sending API call
      // const response = await sendInquiryEmail(inquiry.id, additionalEmails);
      
      // For now, simulate success
      const response = { success: true, recipients: [inquiry.email, ...additionalEmails] };

      if (response.success) {
        toast.success(`Inquiry sent to ${response.recipients?.length || 0} recipient(s)`);
        
        // Record in inquiry notes
        const emailRecord = `\n\n[Email Sent] ${new Date().toLocaleString()} - PDF sent to: ${inquiry.email}${additionalEmails.length > 0 ? `, ${additionalEmails.join(', ')}` : ''}`;
        
        // TODO: Update inquiry notes with emailRecord

        // Reset form
        setIsEmailDialogOpen(false);
        setAdditionalRecipients("");
      } else {
        toast.error("Failed to send inquiry");
      }
    } catch (error: any) {
      // Handle specific Mailtrap authentication error
      if (error.message?.includes('Invalid login') || error.message?.includes('535')) {
        toast.error("Email service configuration error. Please contact administrator.");
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error(error.message || "Failed to send inquiry");
      }
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSendToCustomer = () => {
    if (!inquiry) {
      toast.error("No inquiry data available");
      return;
    }

    // Set the customer's email as default recipient
    setEmailRecipient(inquiry.email);

    emailSubject.current = `Quotation #${inquiry.quotationNumber} - Magotlho TN Solutions (PTY) LTD - ${formatCurrency(parseFloat(inquiry.total || "0"))}`

    // Open email dialog
    setIsEmailDialogOpen(true);
  };

  const handlePrint = async () => {
  if (!inquiry) return;
  
  try {
    toast.info(`Opening quotation ${inquiry.quotationNumber} for printing...`);
    
    // Create the full PDF data object with all necessary information
    const pdfData = {
      quotation: {
        id: inquiry.id,
        quotationNumber: inquiry.quotationNumber,
        service: inquiry.service,
        subtotal: inquiry.subtotal || "0",
        taxRate: inquiry.taxRate || "0",
        total: inquiry.total || "0",
        createdAt: inquiry.createdAt,
        // CRITICAL: Pass the quotation items
        items: quotationItems.map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          total: item.total
        }))
      },
      customer: {
        id: inquiry.id,
        name: inquiry.name,
        email: inquiry.email,
        companyName: inquiry.companyName,
        phone: inquiry.phoneNumber,
        address: inquiry.address
      }
    };
    
    await PDFHandler.printPDF(pdfData);
    
    toast.success(`Quotation ${inquiry.quotationNumber} is ready for printing. Check the print dialog or the new tab.`);
  } catch (err: any) {
    console.error("Print error:", err);
    
    if (err.message?.includes('Popup blocked')) {
      toast.error(
        "Popup blocked! Please allow popups for this site and try again."
      );
    } else {
      toast.error("Failed to open print dialog");
    }
  }
};

  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (isLoading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-blue-50/50 to-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Button 
              onClick={handleBack} 
              variant="ghost" 
              className="gap-2 text-gray-600 hover:text-gray-900"
              disabled
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Inquiries
            </Button>
          </div>
          
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !inquiry) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-blue-50/50 to-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Inquiry Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || "The inquiry you're looking for doesn't exist or has been deleted."}
          </p>
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={handleBack} 
              variant="outline" 
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            <Button onClick={() => router.push('/dashboard/inquiries')}>
              View All Inquiries
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-2 md:p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleBack} 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Inquiry Details</h1>
              <p className="text-sm text-gray-500">Manage and review inquiry information</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-gray-100" onClick={() => handlePrint()}>
                <Printer className="h-4 w-4" />
                Print
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem 
                  className="gap-2 cursor-pointer hover:bg-blue-50"
                  onClick={handleSendToCustomer}
                >
                  <Send className="h-4 w-4" />
                  Send to Customer
                </DropdownMenuItem>
                <Separator />
                <DropdownMenuItem 
                  className="gap-2 text-red-600 hover:bg-red-50 cursor-pointer"
                  onClick={() => handleDeleteClick(inquiry.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Inquiry
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content */}
        <InquiryDetail inquiry={inquiry} quotationItems={quotationItems}/>
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
              Are you sure you want to delete Quotation <span className="font-semibold">#{inquiry.quotationNumber || deleteQuotationId}</span>?
              This action cannot be undone and will permanently remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className="border-[#acc2ef] bg-gray-300" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
            >
              Delete Quotation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Simple Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="max-w-md text-gray-900 border-[#acc2ef] bg-slate-50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-600" />
              Send Inquiry PDF
            </DialogTitle>
            <DialogDescription>
              Send Inquiry #{inquiry?.quotationNumber} as PDF to the customer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Customer Info */}
            {inquiry && (
              <div className="bg-blue-50 border border-[#acc2ef] rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{inquiry.name || inquiry.companyName}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-3 w-3 text-gray-500" />
                  <span className="text-sm">{inquiry.email}</span>
                </div>
              </div>
            )}

            {/* Additional Recipients */}
            <div className="space-y-2">
              <Label htmlFor="additionalRecipients">Additional recipients (optional)</Label>
              <Input
                id="additionalRecipients"
                type="text"
                value={additionalRecipients}
                onChange={(e) => setAdditionalRecipients(e.target.value)}
                placeholder="email1@example.com, email2@example.com"
                className="w-full border-[#acc2ef] bg-slate-50 text-gray-800"
              />
              <p className="text-xs text-gray-500">
                Separate multiple emails with commas
              </p>
            </div>

            {/* Quotation Preview */}
            {inquiry && inquiry.total && (
              <div className="border rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Quotation #{inquiry?.quotationNumber || "002826123456"}</span>
                  <Badge variant="outline" className="border-[#acc2ef] text-gray-700">
                    {formatCurrency(parseFloat(inquiry.total))}
                  </Badge>
                </div>
                <div className="text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className={parseFloat(inquiry.total) > 0 ? "font-medium" : "text-green-600"}>
                      {formatCurrency(parseFloat(inquiry.total))}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Note */}
            <div className="bg-yellow-50 border border-[#acc2ef]0 rounded p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  A PDF version of this inquiry will be sent as an email attachment.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEmailDialogOpen(false)}
              disabled={isSendingEmail}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendInquiryEmail}
              disabled={isSendingEmail}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSendingEmail ? (
                <>
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Inquiry
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default InquiryPage;