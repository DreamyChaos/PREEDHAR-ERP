import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Quotation } from "@/lib/data/quotations-mock";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  PDF_COLORS,
  PDF_COMPANY_DETAILS,
  renderOfficialHeader,
  renderMetadataTable,
  renderFinancialTotalsBlock,
  renderOfficialSignatureBlocks,
  renderOfficialFooter,
} from "./pdf-primitives";

export function generateQuotationPDF(
  quotation: Quotation,
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
  let currentY = renderOfficialHeader(doc, "QUOTATION", quotation.quotationNumber, companyOverride);

  // 2. Metadata Table
  currentY = renderMetadataTable(
    doc,
    currentY,
    [
      { label: "Company", value: quotation.clientPrintedName || quotation.customerName },
      { label: "Attn", value: quotation.attention || "Manager / Project In-Charge" },
      { label: "Site", value: quotation.projectLocation || "Dubai, UAE" },
      { label: "Contact", value: quotation.customerPhone || quotation.customerEmail || "N/A" },
    ],
    [
      { label: "Ref. No.", value: quotation.quotationNumber },
      { label: "Date", value: formatDate(quotation.quotationDate) },
      { label: "Project", value: quotation.projectName || "Electro-Mechanical Works" },
      { label: "Subject", value: quotation.subject || "Technical Services Execution" },
    ]
  );

  // 3. Salutation & Introductory Text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...PDF_COLORS.primaryNavy);
  doc.text("Dear Sir,", startX, currentY + 3);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF_COLORS.textDark);
  doc.text(
    "We are pleased to submit our quotation for the below mentioned scope of work.",
    startX,
    currentY + 7
  );

  currentY += 10;

  // 4. Line Items Table
  const tableRows = quotation.items.map((item, index) => [
    (index + 1).toString(),
    item.description,
    `${item.quantity} ${item.unit}`,
    formatCurrency(item.unitPrice).replace("AED", "").trim(),
    formatCurrency(item.total).replace("AED", "").trim(),
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [["#", "DESCRIPTION", "QTY / UNIT", "UNIT RATE (AED)", "TOTAL (AED)"]],
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

  // 5. Financial Summary Block & Amount in Words
  // Check if summary and terms fit on this page, else create new page
  if (currentY + 65 > doc.internal.pageSize.getHeight() - 15) {
    doc.addPage();
    currentY = 16;
  }

  currentY = renderFinancialTotalsBlock(
    doc,
    currentY,
    {
      subtotal: quotation.subtotal,
      discount: quotation.discount,
      taxableAmount: quotation.taxableAmount,
      vatRate: quotation.vatRate || 5,
      vatAmount: quotation.vatAmount,
      grandTotal: quotation.grandTotal,
    },
    false
  );

  // 6. Terms & Conditions and Exclusions
  if (currentY + 45 > doc.internal.pageSize.getHeight() - 15) {
    doc.addPage();
    currentY = 16;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF_COLORS.primaryNavy);
  doc.text("TERMS & CONDITIONS:", startX, currentY + 1);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...PDF_COLORS.textDark);
  const termsText =
    quotation.termsAndConditions ||
    "• Payment Terms: 60% cash Advance, 40% cash After Completion of works\n• Validity: 30 days from quotation date\n• Work Completion: As per agreed site schedule upon LPO receipt\n• Standard warranty applies to installed equipment and components";

  const wrappedTerms = doc.splitTextToSize(termsText, usableWidth);
  doc.text(wrappedTerms, startX, currentY + 4.5);
  const termsHeight = Array.isArray(wrappedTerms) ? wrappedTerms.length * 2.8 : 3;

  currentY += termsHeight + 7;

  // 7. Exclusions
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF_COLORS.primaryNavy);
  doc.text("EXCLUSIONS:", startX, currentY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...PDF_COLORS.textDark);
  doc.text(
    "Any works, materials or services not specifically mentioned in the above scope are excluded from this quotation.",
    startX,
    currentY + 3.5
  );

  currentY += 8;

  // 8. Sign-off & Signatures
  if (currentY + 30 > doc.internal.pageSize.getHeight() - 15) {
    doc.addPage();
    currentY = 16;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...PDF_COLORS.textDark);
  doc.text("Thanks & Regards,", startX, currentY);

  currentY += 4.5;

  renderOfficialSignatureBlocks(doc, currentY, {
    leftTitle: "PREEDHAR TECHNICAL SERVICES CO. L.L.C.",
    leftSigner: "Authorized Signature & Stamp",
    showRight: false,
  });

  // 9. Page Numbers & Common Footer
  renderOfficialFooter(doc, companyOverride);

  return doc;
}
