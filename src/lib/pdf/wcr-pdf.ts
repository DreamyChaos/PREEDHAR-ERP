import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { WorkCompletionReport } from "@/lib/data/work-completion-mock";
import { formatDate } from "@/lib/utils";
import {
  PDF_COLORS,
  PDF_COMPANY_DETAILS,
  renderOfficialHeader,
  renderMetadataTable,
  renderOfficialSignatureBlocks,
  renderOfficialFooter,
} from "./pdf-primitives";

export function generateWCRPDF(
  report: WorkCompletionReport,
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
  let currentY = renderOfficialHeader(doc, "WORK COMPLETION REPORT", report.reportNumber, companyOverride);

  // 2. Metadata Table
  currentY = renderMetadataTable(
    doc,
    currentY,
    [
      { label: "Completion No.", value: report.reportNumber },
      { label: "Client / Customer", value: report.clientPrintedName || report.customerName },
      { label: "Location / Site", value: report.projectLocation || "Dubai, UAE" },
      { label: "Quotation Ref.", value: report.quotationNumber || "N/A" },
    ],
    [
      { label: "Date", value: formatDate(report.workCompletionDate || report.reportDate) },
      { label: "Project", value: report.projectName || "Electro-Mechanical Works" },
      { label: "Purchase Order", value: report.purchaseOrderNumber || "N/A" },
      { label: "Status", value: `${report.status} (${report.completionPercentage}% Handover)` },
    ]
  );

  // 3. Section: WORK DESCRIPTION
  doc.setFillColor(...PDF_COLORS.tableLabelBg);
  doc.setDrawColor(...PDF_COLORS.tableBorder);
  doc.setLineWidth(0.2);
  doc.rect(startX, currentY + 1, usableWidth, 6, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF_COLORS.primaryNavy);
  doc.text("WORK DESCRIPTION", startX + 3, currentY + 5);

  currentY += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...PDF_COLORS.textDark);
  const descText =
    report.workDescription ||
    report.subject ||
    "Execution, overhaul, testing, and commissioning of electro-mechanical technical systems in accordance with project engineering specifications.";

  const wrappedDesc = doc.splitTextToSize(descText, usableWidth - 6);
  const descHeight = Math.max(wrappedDesc.length * 3 + 2, 10);

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...PDF_COLORS.tableBorder);
  doc.setLineWidth(0.2);
  doc.rect(startX, currentY, usableWidth, descHeight, "FD");
  doc.text(wrappedDesc, startX + 3, currentY + 4);

  currentY += descHeight + 3;

  // 4. Section: BEFORE WORK (Observations / Technical Readings)
  doc.setFillColor(...PDF_COLORS.tableLabelBg);
  doc.setDrawColor(...PDF_COLORS.tableBorder);
  doc.setLineWidth(0.2);
  doc.rect(startX, currentY, usableWidth, 6, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF_COLORS.primaryNavy);
  doc.text("BEFORE WORK", startX + 3, currentY + 4);

  currentY += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...PDF_COLORS.textDark);
  const beforeText =
    report.observations ||
    "Initial site assessment conducted. Verified parameters, operating pressures, temperatures, electrical loads, and diagnostic telemetry prior to commencement of physical overhaul.";

  const wrappedBefore = doc.splitTextToSize(beforeText, usableWidth - 6);
  const beforeHeight = Math.max(wrappedBefore.length * 3 + 2, 10);

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...PDF_COLORS.tableBorder);
  doc.setLineWidth(0.2);
  doc.rect(startX, currentY, usableWidth, beforeHeight, "FD");
  doc.text(wrappedBefore, startX + 3, currentY + 4);

  currentY += beforeHeight + 3;

  // 5. Section: AFTER WORK (Execution Items / Scope & Materials)
  doc.setFillColor(...PDF_COLORS.tableLabelBg);
  doc.setDrawColor(...PDF_COLORS.tableBorder);
  doc.setLineWidth(0.2);
  doc.rect(startX, currentY, usableWidth, 6, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF_COLORS.primaryNavy);
  doc.text("AFTER WORK", startX + 3, currentY + 4);

  currentY += 7;

  // Table of executed work items
  const tableRows = report.items.map((item, index) => [
    (index + 1).toString(),
    item.description || "Service Item",
    `${item.quantity !== undefined ? item.quantity : 1} ${item.unit || "LOT"}`,
    item.status,
    item.remarks || "Executed and site verified",
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [["#", "EXECUTED TECHNICAL ITEM", "QTY / UNIT", "STATUS", "INSPECTION REMARKS"]],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: PDF_COLORS.primaryNavy,
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: "bold",
      halign: "center",
      cellPadding: 1.8,
    },
    bodyStyles: {
      fontSize: 7,
      textColor: PDF_COLORS.textDark,
      cellPadding: 1.8,
      lineColor: PDF_COLORS.tableBorder,
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { halign: "left", cellWidth: "auto" },
      2: { halign: "center", cellWidth: 24 },
      3: { halign: "center", cellWidth: 26, fontStyle: "bold" },
      4: { halign: "left", cellWidth: 48 },
    },
    margin: { left: startX, right: startX },
  });

  const lastTable = (doc as any).lastAutoTable;
  currentY = lastTable ? lastTable.finalY + 3 : currentY + 30;

  // Materials if provided
  if (report.materialsUsed) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...PDF_COLORS.primaryNavy);
    doc.text("Materials & Consumables Installed:", startX, currentY + 3);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...PDF_COLORS.textDark);
    doc.text(report.materialsUsed, startX + 44, currentY + 3);
    currentY += 6;
  }

  // 6. Section: REMARKS / NOTES
  if (currentY + 45 > doc.internal.pageSize.getHeight() - 15) {
    doc.addPage();
    currentY = 16;
  }

  doc.setFillColor(...PDF_COLORS.tableLabelBg);
  doc.setDrawColor(...PDF_COLORS.tableBorder);
  doc.setLineWidth(0.2);
  doc.rect(startX, currentY, usableWidth, 6, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF_COLORS.primaryNavy);
  doc.text("REMARKS / NOTES", startX + 3, currentY + 4);

  currentY += 7;

  const remarksText =
    report.clientRemarks ||
    report.notes ||
    "The technical works detailed above have been successfully executed, pressure tested, and verified to be operational per PREEDHAR engineering quality standards. Equipment handed over to client satisfaction.";

  const wrappedRemarks = doc.splitTextToSize(remarksText, usableWidth - 6);
  const remarksHeight = Math.max(wrappedRemarks.length * 3 + 2, 8);

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...PDF_COLORS.tableBorder);
  doc.setLineWidth(0.2);
  doc.rect(startX, currentY, usableWidth, remarksHeight, "FD");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...PDF_COLORS.textDark);
  doc.text(wrappedRemarks, startX + 3, currentY + 4);

  currentY += remarksHeight + 5;

  // 7. Signature blocks: PREEDHAR and Client Acceptance
  if (currentY + 30 > doc.internal.pageSize.getHeight() - 15) {
    doc.addPage();
    currentY = 16;
  }

  renderOfficialSignatureBlocks(doc, currentY, {
    leftTitle: "PREEDHAR TECHNICAL SERVICES CO. L.L.C.",
    leftSigner: "Authorized Signature & Stamp",
    leftSub: report.engineerInCharge || "Lead MEP Engineer",
    rightTitle: "CLIENT / CUSTOMER ACCEPTANCE",
    rightSigner: report.clientAcknowledgement
      ? `${report.clientAcknowledgement.clientRepresentativeName} (${report.clientAcknowledgement.designation || "Representative"})`
      : "Authorized Client Signature & Stamp",
    rightSub: report.clientAcknowledgement?.acknowledgementDate
      ? `Date: ${formatDate(report.clientAcknowledgement.acknowledgementDate)}`
      : `Date: ${formatDate(report.workCompletionDate)}`,
  });

  // 8. Common Footer
  renderOfficialFooter(doc, companyOverride);

  return doc;
}
