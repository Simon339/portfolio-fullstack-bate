
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';

// Register fonts
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2' },
  ],
});

// Create professional styles
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    padding: 40,
    backgroundColor: '#FFFFFF',
  },
  // Main content container
  content: {
    position: 'relative',
  },
  // Watermark style - ADDED
  watermark: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    opacity: 0.1, // Adjust opacity for subtle watermark
  },
  watermarkImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  // Watermark alternative - centered version - ADDED
  watermarkCentered: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: -1,
    opacity: 0.1,
  },
  watermarkCenteredImage: {
    width: 400,
    height: 400,
    objectFit: 'contain',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#acc2ef',
    borderBottomStyle: 'solid',
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 4,
  },
  companyTagline: {
    fontSize: 10,
    color: '#4a5568',
    marginBottom: 6,
  },
  companyContact: {
    fontSize: 8,
    color: '#718096',
    lineHeight: 1.4,
  },
  logoContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    borderWidth: 2,
    borderColor: '#acc2ef',
    borderRadius: 8,
  },
  quotationTitleContainer: {
    textAlign: 'center',
    marginVertical: 10,
  },
  quotationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  quotationSubtitle: {
    fontSize: 10,
    color: '#718096',
    textTransform: 'uppercase',
  },
  // Details sections - FLAT DESIGN
  detailsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 15,
  },
  detailsColumn: {
    flex: 1,
    padding: 15,
    borderWidth: 1,
    borderColor: '#acc2ef',
    borderStyle: 'solid',
    backgroundColor: '#f8fafc',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#acc2ef',
    borderBottomStyle: 'solid',
    textTransform: 'uppercase',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 8,
    color: '#718096',
    width: 60,
  },
  detailValue: {
    fontSize: 9,
    color: '#2d3748',
    flex: 1,
  },
  // Table - SIMPLIFIED
  tableContainer: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#acc2ef',
    borderStyle: 'solid',
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#4a5568',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#acc2ef',
    borderTopWidth: 0,
    borderStyle: 'solid',
  },
  tableRowText: {
    fontSize: 8,
    color: '#2d3748',
  },
  // Totals - CLEANER
  totalsContainer: {
    marginTop: 20,
    alignSelf: 'flex-end',
    width: '40%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#acc2ef',
    borderBottomStyle: 'solid',
  },
  totalLabel: {
    fontSize: 9,
    color: '#718096',
  },
  totalValue: {
    fontSize: 9,
    color: '#2d3748',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1e40af',
    borderTopStyle: 'solid',
  },
  grandTotalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1a365d',
  },
  grandTotalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  notesContainer: {
    marginTop: 20,
  },
  notesSection: {
    marginBottom: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#acc2ef',
    borderStyle: 'solid',
    backgroundColor: '#f8fafc',
  },
  sectionCardTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  sectionCardText: {
    fontSize: 9,
    color: '#4a5568',
    lineHeight: 1.4,
  },
  // Footer
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#acc2ef',
    borderTopStyle: 'solid',
    fontSize: 7,
    color: '#a0aec0',
    textAlign: 'center',
  },
  pageNumber: {
    fontSize: 7,
    color: '#a0aec0',
    textAlign: 'right',
    marginTop: 5,
  },
  // Status badge
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  acceptedStatus: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  pendingStatus: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
});

// Business logo - you need to provide the actual path
const businessLogo = '/newlogo.png'; // Change this to your actual logo path
const watermarkLogo = '/logo.png'; // ADDED: Watermark logo path

// Create Quotation Document Component
const QuotationDocument = ({ quotation, customer }: any) => {
  // Currency formatter
  const formatCurrency = (amount: string | number) => {
    if (amount === undefined || amount === null) return 'R 0.00';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return 'R 0.00';

    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
    }).format(num);
  };

  // Calculate totals for quotation
  const calculatedVat = (quotation?.subtotal * quotation?.taxRate) / 100;
  const subtotal = quotation?.subtotal || 0;
  const taxRate = quotation?.taxRate || 0;
  const vatAmount = calculatedVat || 0;
  const total = quotation?.total || 0;

  // Format address
  const formatAddress = (address: any) => {
    if (!address) return "No address provided";

    try {
      let addressObj = address;
      if (typeof address === 'string') {
        try {
          addressObj = JSON.parse(address);
        } catch (e) {
          return address;
        }
      }

      if (typeof addressObj === 'object' && addressObj !== null) {
        const parts = [
          addressObj.unit,
          addressObj.street,
          addressObj.subdivision,
          addressObj.city,
          addressObj.province,
          addressObj.postalCode
        ].filter(Boolean);
        return parts.join(", ");
      }
      return "No address provided";
    } catch (error) {
      return "No address provided";
    }
  };

  // Get items from quotation
  const items = quotation?.items || [];

  // Format dates
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy');
    } catch {
      return dateString;
    }
  };

  // Get status badge style
  const getStatusStyle = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('accepted')) return styles.acceptedStatus;
    if (statusLower.includes('pending')) return styles.pendingStatus;
    return styles.pendingStatus;
  };

  const customerData = customer || quotation?.customer;
  const quotationData = quotation;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Main Content Container */}
        <View style={styles.content}>
          
          {/* ADDED: Watermark - Full Page Version */}
          <View style={styles.watermark}>
            <Image
              src={watermarkLogo}
              style={styles.watermarkImage}
            />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>Malesela's Portfolio Inc</Text>
              <Text style={styles.companyTagline}>Professional IT Solutions</Text>
              <Text style={styles.companyContact}>
                123 Unit 4, 15878 Lengana Street, Palm Ridge, Germiston{'\n'}
                Gauteng, 1458 • simonmalapane018@protonmail.com • +27 81 897 4649
              </Text>
            </View>
            <View style={styles.logoContainer}>
              <Image
                src={businessLogo}
                style={styles.headerLogo}
              />
            </View>
          </View>

          {/* Title */}
          <View style={styles.quotationTitleContainer}>
            <Text style={styles.quotationTitle}>
              QUOTATION
            </Text>
            <Text style={styles.quotationSubtitle}>
              REFERENCE: {quotationData?.quotationNumber || 'QT-000000'}
            </Text>
          </View>

          {/* Customer and Details */}
          <View style={styles.detailsContainer}>
            {/* Bill To Column */}
            <View style={styles.detailsColumn}>
              <Text style={styles.sectionTitle}>Bill To</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>COMPANY:</Text>
                <Text style={styles.detailValue}>{customerData?.companyName || '—'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>CONTACT:</Text>
                <Text style={styles.detailValue}>{customerData?.name || customerData?.email || '—'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>EMAIL:</Text>
                <Text style={styles.detailValue}>{customerData?.email || '—'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>PHONE:</Text>
                <Text style={styles.detailValue}>{customerData?.phone || '—'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>ADDRESS:</Text>
                <Text style={styles.detailValue}>{formatAddress(customerData?.address)}</Text>
              </View>
            </View>

            {/* Details Column */}
            <View style={styles.detailsColumn}>
              <Text style={styles.sectionTitle}>Quotation Details</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>DATE:</Text>
                <Text style={styles.detailValue}>
                  {formatDate(quotationData?.createdAt || '')}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>QUOTE #:</Text>
                <Text style={styles.detailValue}>
                  {quotationData?.quotationNumber}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>SERVICE:</Text>
                <Text style={styles.detailValue}>
                  {quotationData?.service}
                </Text>
              </View>
            </View>
          </View>

          {/* Items Table */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { width: '5%' }]}>#</Text>
              <Text style={[styles.tableHeaderText, { width: '45%' }]}>Description</Text>
              <Text style={[styles.tableHeaderText, { width: '10%', textAlign: 'center' }]}>Qty</Text>
              <Text style={[styles.tableHeaderText, { width: '15%', textAlign: 'center' }]}>Unit</Text>
              <Text style={[styles.tableHeaderText, { width: '12%', textAlign: 'right' }]}>Unit Price</Text>
              <Text style={[styles.tableHeaderText, { width: '13%', textAlign: 'right' }]}>Total</Text>
            </View>

            {items.map((item: any, index: number) => (
              <View key={item.id || index} style={styles.tableRow}>
                <Text style={[styles.tableRowText, { width: '5%' }]}>{index + 1}</Text>
                <Text style={[styles.tableRowText, { width: '45%' }]}>{item.description}</Text>
                <Text style={[styles.tableRowText, { width: '10%', textAlign: 'center' }]}>{item.quantity}</Text>
                <Text style={[styles.tableRowText, { width: '15%', textAlign: 'center' }]}>{item.unit}</Text>
                <Text style={[styles.tableRowText, { width: '12%', textAlign: 'right' }]}>{formatCurrency(item.unitPrice)}</Text>
                <Text style={[styles.tableRowText, { width: '13%', textAlign: 'right' }]}>{formatCurrency(item.total)}</Text>
              </View>
            ))}
          </View>

          {/* Totals Section */}
          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>VAT ({taxRate}%):</Text>
              <Text style={styles.totalValue}>{formatCurrency(vatAmount)}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>TOTAL AMOUNT:</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(total)}</Text>
            </View>
          </View>

          {/* Notes and Additional Information */}
          <View style={styles.notesContainer}>
            {/* Terms & Conditions for Quotation */}
            {quotationData?.terms && (
              <View style={styles.notesSection}>
                <Text style={styles.sectionCardTitle}>Terms & Conditions</Text>
                <Text style={styles.sectionCardText}>{quotationData.terms}</Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text>Malesela's Portfolio Inc • Reg No: 2023/123456/07 • VAT No: 1234567890</Text>
            <Text>Tel: +27 81 897 4649 • Email: simonmalapane018@protonmail.com • Web: https://m-s-portfolio.vercel.app</Text>
            <Text style={{ marginTop: 5, fontStyle: 'italic' }}>
              This is an electronically generated quotation. No signature required. Thank you for your business!
            </Text>
            <Text style={styles.pageNumber}>Page 1 of 1</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
// Main function to generate and download PDF
export const generateQuotationPDF = async (quotation: any, customer: any) => {
  try {
    // Dynamically import PDF renderer to avoid SSR issues
    const { pdf } = await import('@react-pdf/renderer');

    // Create PDF blob
    const blob = await pdf((
      <QuotationDocument
        quotation={quotation}
        customer={customer}
      />
    )).toBlob();

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Quotation-${quotation.quotationNumber || 'QT-000000'}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    document.body.appendChild(link);
    link.click();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);

    return true;
  } catch (error) {
    throw error;
  }
};

// Alternative function to return PDF as blob for API endpoints
export const generateQuotationPDFBlob = async (quotation: any, customer: any) => {
  try {
    const { pdf } = await import('@react-pdf/renderer');

    const blob = await pdf((
      <QuotationDocument
        quotation={quotation}
        customer={customer}
      />
    )).toBlob();

    return blob;
  } catch (error) {
    throw error;
  }
};