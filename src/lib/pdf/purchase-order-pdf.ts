import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { PurchaseOrder } from "@/lib/data/purchase-orders-mock";
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

export function generatePurchaseOrderPDF(
  po: PurchaseOrder,
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
  let currentY = renderOfficialHeader(doc, "PURCHASE ORDER", po.purchaseOrderNumber, companyOverride);

  // 2. Metadata Table
  currentY = renderMetadataTable(
    doc,
    currentY,
    [
      { label: "Supplier", value: po.clientPrintedName || po.customerName },
      { label: "Project", value: `${po.projectName} (${po.projectLocation})` },
      { label: "Quote Ref.", value: po.quotationNumber || "N/A" },
    ],
    [
      { label: "PO Number", value: po.purchaseOrderNumber },
      { label: "PO Date", value: formatDate(po.poDate) },
      { label: "Status", value: po.status },
    ]
  );

  // 3. Line Items Table
  const tableRows = po.items.map((item, index) => [
    (index + 1).toString(),
    item.description,
    `${item.quantity} ${item.unit}`,
    formatCurrency(item.unitPrice).replace("AED", "").trim(),
    formatCurrency(item.total).replace("AED", "").trim(),
  ]);

  autoTable(doc, {
    startY: currentY + 2,
    head: [["#", "DESCRIPTION / SPECIFICATION", "QTY / UNIT", "UNIT RATE (AED)", "TOTAL (AED)"]],
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

  // 4. Financial Summary & Amount in Words
  if (currentY + 60 > doc.internal.pageSize.getHeight() - 15) {
    doc.addPage();
    currentY = 16;
  }

  currentY = renderFinancialTotalsBlock(
    doc,
    currentY,
    {
      subtotal: po.subtotal,
      discount: po.discount,
      taxableAmount: po.taxableAmount,
      vatRate: po.vatRate || 5,
      vatAmount: po.vatAmount,
      grandTotal: po.grandTotal,
    },
    false
  );

  // 5. Special Instructions / Delivery Terms
  if (currentY + 40 > doc.internal.pageSize.getHeight() - 15) {
    doc.addPage();
    currentY = 16;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF_COLORS.primaryNavy);
  doc.text("Special Instructions / Delivery Terms:", startX, currentY + 1);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...PDF_COLORS.textDark);
  const deliveryText =
    po.termsAndConditions ||
    `1. Delivery Site: ${po.deliveryAddress || po.projectLocation || "Dubai, UAE"}\n2. Expected Delivery Date: ${formatDate(po.expectedDeliveryDate)}\n3. Standard inspection and warranty certifications required upon handover.`;

  const wrappedTerms = doc.splitTextToSize(deliveryText, usableWidth);
  doc.text(wrappedTerms, startX, currentY + 4.5);
  const termsHeight = Array.isArray(wrappedTerms) ? wrappedTerms.length * 2.8 : 3;

  currentY += termsHeight + 7;

  // 6. Two Signatures Blocks
  if (currentY + 30 > doc.internal.pageSize.getHeight() - 15) {
    doc.addPage();
    currentY = 16;
  }

  renderOfficialSignatureBlocks(doc, currentY, {
    leftTitle: "Issued By: PREEDHAR TECHNICAL SERVICES CO. L.L.C.",
    leftSigner: "Procurement Manager",
    leftSub: "Supply Chain & Technical Procurement",
    rightTitle: "Supplier Acknowledgment:",
    rightSigner: "Authorized Supplier Signature",
    rightSub: po.customerName || "Vendor Representative Stamp",
  });

  // 7. Common Footer
  renderOfficialFooter(doc, companyOverride);

  return doc;
}
