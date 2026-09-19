import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PREEDHAR_LOGO_BASE64 } from "./logo-base64";
import { numberToWordsAED } from "./amount-to-words";

// PREEDHAR Official Brand Colors
export const PDF_COLORS = {
  primaryNavy: [11, 31, 51] as [number, number, number], // #0B1F33
  brandOrange: [194, 65, 12] as [number, number, number], // #C2410C / #FF6500 accent
  brandBlue: [37, 99, 235] as [number, number, number], // #2563EB Corporate Blue
  textDark: [15, 23, 42] as [number, number, number], // #0F172A
  textMuted: [100, 116, 139] as [number, number, number], // #64748B
  tableLabelBg: [241, 245, 249] as [number, number, number], // #F1F5F9
  tableBorder: [203, 213, 225] as [number, number, number], // #CBD5E1
  borderLight: [226, 232, 240] as [number, number, number], // #E2E8F0
  dangerRed: [185, 28, 28] as [number, number, number], // #B91C1C
  successGreen: [21, 128, 61] as [number, number, number], // #15803D
};

export const PDF_COMPANY_DETAILS = {
  name: "PREEDHAR TECHNICAL SERVICES CO. L.L.C.",
  tagline: "Commercial HVAC, Chiller Overhauls, MEP & Facility Engineering",
  address: "Dubai – United Arab Emirates",
  phone: "+971-569653603",
  email: "preedhartechinicalservice@gmail.com",
  trn: "100234567800003",
  bankName: "Emirates NBD",
  accountName: "PREEDHAR TECHNICAL SERVICES CO. L.L.C.",
  iban: "AE070260001012345678901",
  swift: "EBILAEADXXX",
};

function getLogoBytes(): Uint8Array {
  try {
    const cleanBase64 = PREEDHAR_LOGO_BASE64.replace(/^data:image\/[a-z]+;base64,/, "").replace(/\s+/g, "");
    if (typeof Buffer !== "undefined") {
      return new Uint8Array(Buffer.from(cleanBase64, "base64"));
    }
    if (typeof atob === "function") {
      const binaryString = atob(cleanBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    }
  } catch {
    // fallback
  }
  return new Uint8Array();
}

/**
 * 1. HEADER: Common across all official PREEDHAR documents
 * Real Logo at top-left, corporate title, thin divider, centered document title.
 */
export function renderOfficialHeader(
  doc: jsPDF,
  documentTitle: string,
  _docNumber?: string,
  companyOverride?: Partial<typeof PDF_COMPANY_DETAILS>
): number {
  const comp = { ...PDF_COMPANY_DETAILS, ...companyOverride };
  const pageWidth = doc.internal.pageSize.getWidth();
  const startX = 14;
  const usableWidth = pageWidth - 28;

  // Render Real Logo
  try {
    const logoBytes = getLogoBytes();
    if (logoBytes && logoBytes.length > 0) {
      doc.addImage(logoBytes, "JPEG", startX, 10, 24, 18, undefined, "FAST");
    } else {
      doc.addImage(PREEDHAR_LOGO_BASE64, "JPEG", startX, 10, 24, 18, undefined, "FAST");
    }
  } catch {
    // Fallback placeholder if image fails
    doc.setFillColor(...PDF_COLORS.tableLabelBg);
    doc.rect(startX, 10, 24, 18, "F");
  }

  // Company Name & Subtitle
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...PDF_COLORS.primaryNavy);
  doc.text(comp.name, startX + 28, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF_COLORS.textMuted);
  doc.text(
    `${comp.address} • Mob: ${comp.phone} • Email: ${comp.email}`,
    startX + 28,
    21
  );
  doc.text(
    `TRN: ${comp.trn} • Commercial Electro-Mechanical & HVAC Technical Services`,
    startX + 28,
    25.5
  );

  // Thin Navy Header Divider
  doc.setDrawColor(...PDF_COLORS.primaryNavy);
  doc.setLineWidth(0.6);
  doc.line(startX, 30, startX + usableWidth, 30);

  // Centered Document Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...PDF_COLORS.primaryNavy);
  doc.text(documentTitle.toUpperCase(), pageWidth / 2, 36.5, { align: "center" });

  return 40;
}

export interface MetadataPair {
  label: string;
  value: string;
}

/**
 * 2. STRUCTURED METADATA TABLE
 * Two-column grid (Left and Right) with shaded label cells and clean value text.
 */
export function renderMetadataTable(
  doc: jsPDF,
  startY: number,
  leftPairs: MetadataPair[],
  rightPairs: MetadataPair[]
): number {
  const maxRows = Math.max(leftPairs.length, rightPairs.length);
  const bodyRows: any[][] = [];

  for (let i = 0; i < maxRows; i++) {
    const left = leftPairs[i] || { label: "", value: "" };
    const right = rightPairs[i] || { label: "", value: "" };
    bodyRows.push([left.label, left.value, right.label, right.value]);
  }

  autoTable(doc, {
    startY,
    body: bodyRows,
    theme: "grid",
    styles: {
      fontSize: 7.5,
      cellPadding: 1.8,
      lineColor: PDF_COLORS.tableBorder,
      lineWidth: 0.2,
      textColor: PDF_COLORS.textDark,
    },
    columnStyles: {
      0: {
        cellWidth: 31,
        fillColor: PDF_COLORS.tableLabelBg,
        fontStyle: "bold",
        textColor: PDF_COLORS.primaryNavy,
      },
      1: {
        cellWidth: 60,
        fillColor: [255, 255, 255],
      },
      2: {
        cellWidth: 31,
        fillColor: PDF_COLORS.tableLabelBg,
        fontStyle: "bold",
        textColor: PDF_COLORS.primaryNavy,
      },
      3: {
        cellWidth: 60,
        fillColor: [255, 255, 255],
      },
    },
    tableWidth: 182,
    margin: { left: 14, right: 14 },
  });

  const lastTable = (doc as any).lastAutoTable;
  return lastTable ? lastTable.finalY + 3 : startY + 25;
}

/**
 * 3. FINANCIAL SUMMARY AND AMOUNT IN WORDS
 */
export function renderFinancialTotalsBlock(
  doc: jsPDF,
  startY: number,
  data: {
    subtotal: number;
    discount?: number;
    taxableAmount?: number;
    vatRate?: number;
    vatAmount: number;
    grandTotal: number;
    amountPaid?: number;
    outstandingAmount?: number;
  },
  isInvoice: boolean = false
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const startX = 14;
  const usableWidth = pageWidth - 28;

  // Build Summary Rows
  const summaryRows: Array<{ label: string; value: string; isBold?: boolean; isTotal?: boolean; isBalance?: boolean }> = [];

  summaryRows.push({
    label: "Sub Total (AED)",
    value: formatCurrency(data.subtotal).replace("AED", "").trim(),
  });

  if (data.discount && data.discount > 0) {
    summaryRows.push({
      label: "Discount (AED)",
      value: `-${formatCurrency(data.discount).replace("AED", "").trim()}`,
    });
  }

  summaryRows.push({
    label: `VAT ${data.vatRate ? data.vatRate.toFixed(0) : "5"}% (AED)`,
    value: formatCurrency(data.vatAmount).replace("AED", "").trim(),
  });

  summaryRows.push({
    label: "TOTAL AMOUNT (AED)",
    value: formatCurrency(data.grandTotal).replace("AED", "").trim(),
    isBold: true,
    isTotal: true,
  });

  if (isInvoice) {
    if (data.amountPaid !== undefined && data.amountPaid > 0) {
      summaryRows.push({
        label: "Amount Paid (AED)",
        value: formatCurrency(data.amountPaid).replace("AED", "").trim(),
        isBold: true,
      });
    }

    summaryRows.push({
      label: "BALANCE DUE (AED)",
      value: formatCurrency(data.outstandingAmount !== undefined ? data.outstandingAmount : data.grandTotal).replace("AED", "").trim(),
      isBold: true,
      isBalance: true,
    });
  }

  // Draw Summary Table aligned to the right side
  const boxWidth = 85;
  const boxX = startX + usableWidth - boxWidth;
  let currentY = startY;

  autoTable(doc, {
    startY: currentY,
    body: summaryRows.map((r) => [r.label, r.value]),
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 1.8,
      lineColor: PDF_COLORS.tableBorder,
      lineWidth: 0.2,
    },
    columnStyles: {
      0: {
        cellWidth: 48,
        halign: "left",
        fontStyle: "bold",
        fillColor: PDF_COLORS.tableLabelBg,
        textColor: PDF_COLORS.primaryNavy,
      },
      1: {
        cellWidth: 37,
        halign: "right",
        fontStyle: "bold",
        textColor: PDF_COLORS.textDark,
      },
    },
    didParseCell: (hookData) => {
      const rowIndex = hookData.row.index;
      const rowItem = summaryRows[rowIndex];
      if (rowItem?.isTotal) {
        hookData.cell.styles.fillColor = [241, 245, 249];
        hookData.cell.styles.textColor = PDF_COLORS.primaryNavy;
        hookData.cell.styles.fontSize = 8.5;
      }
      if (rowItem?.isBalance) {
        hookData.cell.styles.fillColor = [254, 242, 242]; // subtle light red
        hookData.cell.styles.textColor = PDF_COLORS.dangerRed;
        hookData.cell.styles.fontSize = 8.5;
      }
    },
    tableWidth: boxWidth,
    margin: { left: boxX, right: startX },
  });

  const lastTable = (doc as any).lastAutoTable;
  currentY = lastTable ? lastTable.finalY + 3 : currentY + 30;

  // Amount in Words
  const words = numberToWordsAED(data.grandTotal);
  doc.setFillColor(...PDF_COLORS.tableLabelBg);
  doc.setDrawColor(...PDF_COLORS.tableBorder);
  doc.setLineWidth(0.2);
  doc.rect(startX, currentY, usableWidth, 6.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF_COLORS.primaryNavy);
  doc.text("Amount in Words:", startX + 3, currentY + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...PDF_COLORS.textDark);
  doc.text(words, startX + 28, currentY + 4.5);

  return currentY + 9;
}

/**
 * 4. BANK REMITTANCE INSTRUCTIONS
 */
export function renderBankRemittanceDetails(
  doc: jsPDF,
  startY: number,
  companyOverride?: Partial<typeof PDF_COMPANY_DETAILS>
): number {
  const comp = { ...PDF_COMPANY_DETAILS, ...companyOverride };
  const pageWidth = doc.internal.pageSize.getWidth();
  const startX = 14;
  const usableWidth = pageWidth - 28;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(...PDF_COLORS.tableBorder);
  doc.setLineWidth(0.2);
  doc.rect(startX, startY, usableWidth, 12, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF_COLORS.primaryNavy);
  doc.text("Official Bank Remittance & Payment Details:", startX + 3, startY + 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...PDF_COLORS.textDark);
  doc.text(
    `Beneficiary: ${comp.accountName} • Bank: ${comp.bankName}`,
    startX + 3,
    startY + 7.5
  );
  doc.text(
    `IBAN: ${comp.iban} • SWIFT: ${comp.swift} • Currency: AED`,
    startX + 3,
    startY + 10.5
  );

  return startY + 14.5;
}

/**
 * 5. SIGNATURES: Left and Right blocks matching PREEDHAR samples
 */
export function renderOfficialSignatureBlocks(
  doc: jsPDF,
  startY: number,
  options: {
    leftTitle?: string;
    leftSigner?: string;
    leftSub?: string;
    rightTitle?: string;
    rightSigner?: string;
    rightSub?: string;
    showRight?: boolean;
  }
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const startX = 14;
  const usableWidth = pageWidth - 28;
  const colWidth = (usableWidth - 10) / 2;

  // Left Signatory
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF_COLORS.primaryNavy);
  doc.text(options.leftTitle || "For PREEDHAR TECHNICAL SERVICES CO. L.L.C.", startX, startY);

  // Line for signature
  doc.setDrawColor(...PDF_COLORS.tableBorder);
  doc.setLineWidth(0.4);
  doc.line(startX, startY + 15, startX + colWidth, startY + 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...PDF_COLORS.textDark);
  doc.text(options.leftSigner || "Authorized Signature & Stamp", startX, startY + 19);
  if (options.leftSub) {
    doc.setFontSize(6.5);
    doc.setTextColor(...PDF_COLORS.textMuted);
    doc.text(options.leftSub, startX, startY + 22.5);
  }

  // Right Signatory (if applicable)
  if (options.showRight !== false) {
    const rightX = startX + colWidth + 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...PDF_COLORS.primaryNavy);
    doc.text(options.rightTitle || "Client / Supplier Acceptance", rightX, startY);

    doc.setDrawColor(...PDF_COLORS.tableBorder);
    doc.setLineWidth(0.4);
    doc.line(rightX, startY + 15, rightX + colWidth, startY + 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...PDF_COLORS.textDark);
    doc.text(options.rightSigner || "Authorized Signature & Stamp", rightX, startY + 19);
    if (options.rightSub) {
      doc.setFontSize(6.5);
      doc.setTextColor(...PDF_COLORS.textMuted);
      doc.text(options.rightSub, rightX, startY + 22.5);
    }
  }

  return startY + 25;
}

/**
 * 6. COMMON FOOTER ACROSS ALL PAGES
 * Thin divider line, contact text, and Page X of Y.
 */
export function renderOfficialFooter(
  doc: jsPDF,
  companyOverride?: Partial<typeof PDF_COMPANY_DETAILS>
): void {
  const comp = { ...PDF_COMPANY_DETAILS, ...companyOverride };
  const totalPages = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const startX = 14;
  const usableWidth = pageWidth - 28;

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Thin Footer Divider
    doc.setDrawColor(...PDF_COLORS.tableBorder);
    doc.setLineWidth(0.3);
    doc.line(startX, pageHeight - 11, startX + usableWidth, pageHeight - 11);

    // Footer Contact Info
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...PDF_COLORS.textMuted);
    doc.text(
      `${comp.name} | DUBAI – UAE | Mob: ${comp.phone} | Email: ${comp.email}`,
      startX,
      pageHeight - 6.5
    );

    // Page Number
    doc.text(`Page ${i} of ${totalPages}`, startX + usableWidth, pageHeight - 6.5, {
      align: "right",
    });
  }
}
