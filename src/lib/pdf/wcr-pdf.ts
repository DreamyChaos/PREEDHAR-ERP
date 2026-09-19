import jsPDF from "jspdf";
import type { WorkCompletionReport } from "@/lib/data/work-completion-mock";
import { formatDate } from "@/lib/utils";
import {
  PDF_COLORS,
  PDF_COMPANY_DETAILS,
  renderOfficialHeader,
  renderMetadataTable,
  renderOfficialFooter,
} from "./pdf-primitives";

export function generateWCRPDF(
  report: WorkCompletionReport,
  companyOverride?: Partial<typeof PDF_COMPANY_DETAILS>
): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth  = doc.internal.pageSize.getWidth();
  const startX     = 14;
  const usableWidth = pageWidth - 28;

  // 1. Header
  let currentY = renderOfficialHeader(doc, "WORK COMPLETION REPORT", report.reportNumber, companyOverride, false);

  // 2. Metadata
  currentY = renderMetadataTable(
    doc,
    currentY,
    [
      { label: "Completion No.",   value: report.reportNumber },
      { label: "Client / Customer",value: report.clientPrintedName || report.customerName },
      { label: "Location / Site",  value: report.projectLocation || "Dubai, UAE" },
      { label: "Quotation Ref.",   value: report.quotationNumber || "N/A" },
    ],
    [
      { label: "Date",           value: formatDate(report.workCompletionDate || report.reportDate) },
      { label: "Project",        value: report.projectName || "Technical Works" },
      { label: "Purchase Order", value: report.purchaseOrderNumber || "N/A" },
      { label: "Status",         value: report.status },
    ]
  );

  // Helper: draw a section header bar
  function drawSectionHeader(title: string, y: number): number {
    doc.setFillColor(...PDF_COLORS.tableLabelBg);
    doc.setDrawColor(...PDF_COLORS.tableBorder);
    doc.setLineWidth(0.25);
    doc.rect(startX, y, usableWidth, 6.5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...PDF_COLORS.primaryNavy);
    doc.text(title, startX + 3, y + 4.5);
    return y + 7;
  }

  // Helper: draw a content box with text
  function drawContentBox(text: string | null, y: number, minHeight = 10): number {
    if (!text) {
      // Italic placeholder
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7.5);
      doc.setTextColor(...PDF_COLORS.textMuted);
      doc.text("No photos attached for this section.", startX + 3, y + 5);
      return y + 10;
    }
    const wrapped = doc.splitTextToSize(text, usableWidth - 6);
    const height = Math.max(wrapped.length * 4 + 4, minHeight);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...PDF_COLORS.tableBorder);
    doc.setLineWidth(0.25);
    doc.rect(startX, y, usableWidth, height, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...PDF_COLORS.textDark);
    doc.text(wrapped, startX + 3, y + 5);
    return y + height + 3;
  }

  // 3. WORK DESCRIPTION
  currentY = drawSectionHeader("WORK DESCRIPTION", currentY);
  const descText =
    report.workDescription || report.subject || null;

  const descWrapped = descText
    ? doc.splitTextToSize(descText, usableWidth - 6)
    : null;
  const descHeight = descWrapped
    ? Math.max(descWrapped.length * 4 + 4, 12)
    : 12;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...PDF_COLORS.tableBorder);
  doc.setLineWidth(0.25);
  doc.rect(startX, currentY, usableWidth, descHeight, "FD");

  if (descWrapped) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...PDF_COLORS.textDark);
    doc.text(descWrapped, startX + 3, currentY + 5);
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(...PDF_COLORS.textMuted);
    doc.text("No description provided.", startX + 3, currentY + 5);
  }
  currentY += descHeight + 3;

  // 4. BEFORE WORK
  currentY = drawSectionHeader("BEFORE WORK", currentY);
  currentY = drawContentBox(report.observations || null, currentY);

  // 5. AFTER WORK
  currentY = drawSectionHeader("AFTER WORK", currentY);
  currentY = drawContentBox((report as any).afterWorkNotes || null, currentY);

  // 6. REMARKS / NOTES
  if (currentY + 40 > doc.internal.pageSize.getHeight() - 15) {
    doc.addPage();
    currentY = 16;
  }
  currentY = drawSectionHeader("REMARKS / NOTES", currentY);

  const remarksText =
    report.clientRemarks || report.notes || null;

  const remarksWrapped = remarksText
    ? doc.splitTextToSize(remarksText, usableWidth - 6)
    : null;
  const remarksHeight = remarksWrapped
    ? Math.max(remarksWrapped.length * 4 + 4, 10)
    : 10;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...PDF_COLORS.tableBorder);
  doc.setLineWidth(0.25);
  doc.rect(startX, currentY, usableWidth, remarksHeight, "FD");

  if (remarksWrapped) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...PDF_COLORS.textDark);
    doc.text(remarksWrapped, startX + 3, currentY + 5);
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(...PDF_COLORS.textMuted);
    doc.text("No remarks provided.", startX + 3, currentY + 5);
  }
  currentY += remarksHeight + 6;

  // 7. Dual Signature Blocks (PREEDHAR + Client)
  if (currentY + 26 > doc.internal.pageSize.getHeight() - 15) {
    doc.addPage();
    currentY = 16;
  }

  // 8. Footer
  renderOfficialFooter(doc, companyOverride);
  return doc;
}
