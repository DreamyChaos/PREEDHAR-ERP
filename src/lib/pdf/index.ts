import jsPDF from "jspdf";
import { generateQuotationPDF } from "./quotation-pdf";
import { generateInvoicePDF } from "./invoice-pdf";
import { generatePurchaseOrderPDF } from "./purchase-order-pdf";
import { generateWCRPDF } from "./wcr-pdf";
import type { Quotation } from "@/lib/data/quotations-mock";
import type { Invoice } from "@/lib/data/invoices-mock";
import type { PurchaseOrder } from "@/lib/data/purchase-orders-mock";
import type { WorkCompletionReport } from "@/lib/data/work-completion-mock";

import { PDF_COMPANY_DETAILS } from "./pdf-primitives";

export {
  generateQuotationPDF,
  generateInvoicePDF,
  generatePurchaseOrderPDF,
  generateWCRPDF,
  PDF_COMPANY_DETAILS,
};

/**
 * Downloads a generated jsPDF document with given filename
 */
export function downloadPDF(doc: jsPDF, filename: string): void {
  doc.save(filename);
}

/**
 * Opens a generated jsPDF document in a new browser tab for preview/printing
 */
export function previewPDF(doc: jsPDF): void {
  const blob = doc.output("blob");
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, "_blank");
}

export const PDFService = {
  downloadQuotation(quotation: Quotation, companyOverride?: Partial<typeof PDF_COMPANY_DETAILS>) {
    const doc = generateQuotationPDF(quotation, companyOverride);
    downloadPDF(doc, `${quotation.quotationNumber}.pdf`);
  },

  previewQuotation(quotation: Quotation, companyOverride?: Partial<typeof PDF_COMPANY_DETAILS>) {
    const doc = generateQuotationPDF(quotation, companyOverride);
    previewPDF(doc);
  },

  downloadInvoice(invoice: Invoice, companyOverride?: Partial<typeof PDF_COMPANY_DETAILS>) {
    const doc = generateInvoicePDF(invoice, companyOverride);
    downloadPDF(doc, `${invoice.invoiceNumber}.pdf`);
  },

  previewInvoice(invoice: Invoice, companyOverride?: Partial<typeof PDF_COMPANY_DETAILS>) {
    const doc = generateInvoicePDF(invoice, companyOverride);
    previewPDF(doc);
  },

  downloadPurchaseOrder(po: PurchaseOrder, companyOverride?: Partial<typeof PDF_COMPANY_DETAILS>) {
    const doc = generatePurchaseOrderPDF(po, companyOverride);
    downloadPDF(doc, `${po.purchaseOrderNumber}.pdf`);
  },

  previewPurchaseOrder(po: PurchaseOrder, companyOverride?: Partial<typeof PDF_COMPANY_DETAILS>) {
    const doc = generatePurchaseOrderPDF(po, companyOverride);
    previewPDF(doc);
  },

  downloadWCR(report: WorkCompletionReport, companyOverride?: Partial<typeof PDF_COMPANY_DETAILS>) {
    const doc = generateWCRPDF(report, companyOverride);
    downloadPDF(doc, `${report.reportNumber}.pdf`);
  },

  previewWCR(report: WorkCompletionReport, companyOverride?: Partial<typeof PDF_COMPANY_DETAILS>) {
    const doc = generateWCRPDF(report, companyOverride);
    previewPDF(doc);
  },
};
