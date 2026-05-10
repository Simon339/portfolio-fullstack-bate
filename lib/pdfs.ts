// utils/pdfCache.ts
import { format } from 'date-fns';
import { generateQuotationPDFBlob } from '@/lib/generatedPDF';

interface PDFCacheItem {
  blob: Blob;
  url: string;
  timestamp: number;
  id: string;
}

class PDFCacheManager {
  private cache: Map<string, PDFCacheItem> = new Map();
  private maxAge = 5 * 60 * 1000; // 5 minutes cache

  private getCacheKey(id: string): string {
    return `${id}`;
  }

  async getOrCreatePDF(
    id: string,
    data: {
      quotation?: any;
      customer?: any;
    }
  ): Promise<{ blob: Blob; url: string }> {
    const cacheKey = this.getCacheKey(id);
    const cached = this.cache.get(cacheKey);

    // Check if cache is valid
    if (cached && Date.now() - cached.timestamp < this.maxAge) {
      return { blob: cached.blob, url: cached.url };
    }

    // Generate new PDF
    let blob: Blob;
    blob = await generateQuotationPDFBlob(data.quotation, data.customer);

    const url = URL.createObjectURL(blob);
    
    // Update cache
    this.cache.set(cacheKey, {
      blob,
      url,
      timestamp: Date.now(),
      id
    });

    // Clean up old cache entries
    this.cleanup();

    return { blob, url };
  }

  getCachedUrl(id: string): string | null {
    const cacheKey = this.getCacheKey( id);
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.maxAge) {
      return cached.url;
    }
    return null;
  }

  revokeUrl(id: string): void {
    const cacheKey = this.getCacheKey(id);
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      URL.revokeObjectURL(cached.url);
      this.cache.delete(cacheKey);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.maxAge) {
        URL.revokeObjectURL(item.url);
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    for (const item of this.cache.values()) {
      URL.revokeObjectURL(item.url);
    }
    this.cache.clear();
  }
}

export const pdfCache = new PDFCacheManager();

export interface PDFData {
  quotation?: any;
  customer: any;
}

export interface PDFResult {
  blob: Blob;
  url: string;
  fileName: string;
}

export class PDFHandler {

static async generatePDF(data: PDFData): Promise<PDFResult> {
  // Use quotationNumber as cache key if id is not available
  const id = data.quotation?.id || data.quotation?.quotationNumber;
  
  if (!id) {
    throw new Error('Quotation ID or quotationNumber is required to generate PDF');
  }

  const { blob, url } = await pdfCache.getOrCreatePDF(id, data);
  const fileName = this.getFileName(data);

  return { blob, url, fileName };
}
  static async downloadPDF(
    data: PDFData
  ): Promise<void> {
    try {
      const { blob, url, fileName } = await this.generatePDF(data);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Clean up link (but keep blob in cache)
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
      
      return Promise.resolve();
    } catch (error) {
      throw error;
    }
  }

  static async printPDF(
    data: PDFData
  ): Promise<void> {
    try {
      const { url } = await this.generatePDF( data);
      
      return this.openPDFForPrint(url);
    } catch (error) {
      throw error;
    }
  }

  static async downloadAndPrint(data: PDFData): Promise<void> {
    // Generate once, use for both operations
    const { blob, url, fileName } = await this.generatePDF( data);
    
    // 1. Download
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    
    // 2. Print after a short delay
    setTimeout(() => {
      document.body.removeChild(link);
      this.openPDFForPrint(url);
    }, 500);
  }

  // Get PDF as blob for email attachments
  static async getPDFBlob(data: PDFData): Promise<Blob> {
    try {
      const { blob } = await this.generatePDF(data);
      return blob;
    } catch (error) {
      throw error;
    }
  }

  // Get PDF as base64 for API requests
  static async getPDFBase64( data: PDFData): Promise<string> {
    try {
      const blob = await this.getPDFBlob(data);
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          // Remove data:application/pdf;base64, prefix
          const base64Content = base64data.split(',')[1];
          resolve(base64Content);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw error;
    }
  }

  private static getFileName( data: PDFData): string {
    const date = format(new Date(), 'yyyy-MM-dd');

    if (data.quotation) {
      const quoteNumber = data.quotation?.quotationNumber || 'QT-000000';
      return `Quotation-${quoteNumber}-${date}.pdf`;
    } else {
      return `Document-${date}.pdf`;
    }
  }

 // Updated openPDFForPrint method in pdfs.ts
private static openPDFForPrint(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Create a new window/tab
    const printWindow = window.open(url, '_blank');
    
    if (!printWindow) {
      reject(new Error('Popup blocked! Please allow popups to print.'));
      return;
    }
    
    // Check if it's a PDF (will show in browser)
    printWindow.onload = () => {
      try {
        // Wait for PDF to load (especially important for browsers that render PDFs)
        setTimeout(() => {
          // Focus the window
          printWindow.focus();
          
          // Just show the print dialog without auto-printing
          // This gives the user control to print or cancel
          //printWindow.print();
          
          // Resolve immediately after showing print dialog
          resolve();
        }, 1000);
      } catch (error) {
        printWindow.close();
        reject(error);
      }
    };
    
    printWindow.onerror = () => {
      printWindow.close();
      reject(new Error('Failed to load PDF'));
    };
    
    // Fallback for browsers that don't trigger onload for PDFs
    // setTimeout(() => {
    //   try {
    //     // Try to show print dialog anyway
    //     printWindow.focus();
    //     printWindow.print();
    //     resolve();
    //   } catch (error) {
    //     printWindow.focus();
    //     resolve(); 
    //   }
    // }, 2000);
  });
}
  static clearCache(): void {
    pdfCache.clear();
  }
}