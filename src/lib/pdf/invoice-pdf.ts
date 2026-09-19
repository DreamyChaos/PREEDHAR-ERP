import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Invoice } from "@/lib/data/invoices-mock";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  PDF_COLORS,
  PDF_COMPANY_DETAILS,
  renderOfficialHeader,
  renderMetadataTable,
  renderFinancialTotalsBlock,
  renderBankRemittanceDetails,
  renderOfficialSignatureBlocks,
  renderOfficialFooter,
} from "./pdf-primitives";

export function generateInvoicePDF(
  invoice: Invoice,
  companyOverride?: Partial<typeof PDF_COMPANY_DETAILS>
): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const startX = 14;
  const usableWidth = pageWidth - 28;

  // 1. Official Header
  let currentY = renderOfficialHeader(doc, "TAX INVOICE", invoice.invoiceNumber, companyOverride);

  // 2. Metadata Table (5 rows on each side)
  currentY = renderMetadataTable(
    doc,
    currentY,
    [
      { label: "Customer", value: invoice.clientPrintedName || invoice.customerName },
      { label: "Contact", value: invoice.attention || "Manager / Finance Dept" },
      { label: "Project", value: invoice.projectName || "Commercial HVAC & MEP Works" },
      { label: "Site / Location", value: invoice.projectLocation || "Dubai, UAE" },
      { label: "Company TRN", value: invoice.customerTrn || "N/A" },
    ],
    [
      { label: "Invoice No.", value: invoice.invoiceNumber },
      { label: "Invoice Date", value: formatDate(invoice.invoiceDate) },
      { label: "Due Date", value: formatDate(invoice.dueDate) },
      { label: "Quote Ref.", value: invoice.quotationNumber || "N/A" },
      { label: "Payment Status", value: invoice.paymentStatus || "UNPAID" },
    ]
  );

  // 3. Line Items Table
  const tableRows = invoice.items.map((item, index) => [
    (index + 1).toString(),
    item.description,
    `${item.quantity} ${item.unit}`,
    formatCurrency(item.unitPrice).replace("AED", "").trim(),
    formatCurrency(item.total).replace("AED", "").trim(),
  ]);

  autoTable(doc, {
    startY: currentY + 2,
    head: [["#", "DESCRIPTION", "QTY / UNIT", "UNIT PRICE (AED)", "AMOUNT (AED)"]],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: PDF_COLORS.primaryNavy,
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: "bold",
      halign: "center",
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 7,
      textColor: PDF_COLORS.textDark,
      cellPadding: 2,
      lineColor: PDF_COLORS.tableBorder,
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { halign: "left", cellWidth: "auto" },
      2: { halign: "center", cellWidth: 26 },
      3: { halign: "right", cellWidth: 32 },
      4: { halign: "right", cellWidth: 32, fontStyle: "bold" },
    },
    margin: { left: startX, right: startX },
  });

  const lastTable = (doc as any).lastAutoTable;
  currentY = lastTable ? lastTable.finalY + 3 : currentY + 35;

  // 4. Financial Summary Block (with Subtotal, VAT, Total, Paid, Balance Due) & Amount in Words
  if (currentY + 70 > doc.internal.pageSize.getHeight() - 15) {
    doc.addPage();
    currentY = 16;
  }

  currentY = renderFinancialTotalsBlock(
    doc,
    currentY,
    {
      subtotal: invoice.subtotal,
      discount: invoice.discount,
      taxableAmount: invoice.taxableAmount,
      vatRate: invoice.vatRate || 5,
      vatAmount: invoice.vatAmount,
      grandTotal: invoice.grandTotal,
      amountPaid: invoice.amountPaid,
      outstandingAmount: invoice.outstandingAmount,
    },
    true
  );

  // 5. Official Bank Remittance Details & Remarks
  if (currentY + 45 > doc.internal.pageSize.getHeight() - 15) {
    doc.addPage();
    currentY = 16;
  }

  currentY = renderBankRemittanceDetails(doc, currentY, companyOverride);

  if (invoice.notes || invoice.termsAndConditions) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...PDF_COLORS.primaryNavy);
    doc.text("Remarks / Payment Terms:", startX, currentY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...PDF_COLORS.textDark);
    const remarks =
      invoice.notes ||
      invoice.termsAndConditions ||
      "Payment due strictly within agreed credit period. Cheques to be issued in favor of PREEDHAR TECHNICAL SERVICES CO. L.L.C.";

    const wrappedRemarks = doc.splitTextToSize(remarks, usableWidth);
    doc.text(wrappedRemarks, startX, currentY + 3.5);
    currentY += (Array.isArray(wrappedRemarks) ? wrappedRemarks.length * 2.8 : 3) + 6;
  }

  // 6. Signatures (Single PREEDHAR signature block or dual if desired)
  if (currentY + 30 > doc.internal.pageSize.getHeight() - 15) {
    doc.addPage();
    currentY = 16;
  }

  renderOfficialSignatureBlocks(doc, currentY, {
    leftTitle: "For PREEDHAR TECHNICAL SERVICES CO. L.L.C.",
    leftSigner: "Authorized Signature & Stamp",
    leftSub: "Accounts & Commercial Finance Dept",
    showRight: false,
  });

  // 7. Common Footer
  renderOfficialFooter(doc, companyOverride);

  return doc;
}
