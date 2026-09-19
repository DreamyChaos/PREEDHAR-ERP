export interface CompanyProfileSettings {
  legalName: string;
  tradeLicenseNumber: string;
  establishedYear: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
}

export interface TaxSettings {
  trn: string;
  standardVatRate: number; // 5.0
  taxOfficeJurisdiction: string;
  vatRegistrationDate: string;
}

export interface BankingSettings {
  bankName: string;
  bankBranch: string;
  accountName: string;
  accountNumber: string;
  iban: string;
  swiftCode: string;
}

export interface DocumentDefaultsSettings {
  quotationPrefix: string;
  invoicePrefix: string;
  purchaseOrderPrefix: string;
  workCompletionPrefix: string;
  defaultPaymentTerms: string;
  standardWarrantyClause: string;
  standardRemittanceClause: string;
}

export interface SystemPreferencesSettings {
  baseCurrency: string;
  dateFormat: string;
  autoCalculateVat: boolean;
  enableAuditLogging: boolean;
}

export interface AppSettings {
  company: CompanyProfileSettings;
  tax: TaxSettings;
  banking: BankingSettings;
  documentDefaults: DocumentDefaultsSettings;
  preferences: SystemPreferencesSettings;
  updatedAt: string;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  company: {
    legalName: "PREEDHAR TECHNICAL SERVICES CO. L.L.C.",
    tradeLicenseNumber: "CN-1094821",
    establishedYear: "2018",
    address: "Office 402, Al Garhoud Commercial Complex, Airport Road",
    city: "Dubai",
    country: "United Arab Emirates",
    phone: "+971-569653603",
    email: "billing@preedhar.ae",
    website: "https://preedhar.ae",
  },
  tax: {
    trn: "100234567800003",
    standardVatRate: 5.0,
    taxOfficeJurisdiction: "Federal Tax Authority (FTA) – Dubai, UAE",
    vatRegistrationDate: "2018-01-01",
  },
  banking: {
    bankName: "Emirates NBD",
    bankBranch: "Al Garhoud Branch, Dubai",
    accountName: "PREEDHAR TECHNICAL SERVICES CO. L.L.C.",
    accountNumber: "1012345678901",
    iban: "AE070260001012345678901",
    swiftCode: "EBILAEADXXX",
  },
  documentDefaults: {
    quotationPrefix: "PTS-Q",
    invoicePrefix: "PTSC-INV",
    purchaseOrderPrefix: "PTSC-PO",
    workCompletionPrefix: "PTSC-WCR",
    defaultPaymentTerms: "30 Days",
    standardWarrantyClause: "12 months comprehensive warranty on replacement equipment and 6 months on workmanship.",
    standardRemittanceClause: "Please quote invoice reference on bank transfer advice and remit strictly within agreed credit terms.",
  },
  preferences: {
    baseCurrency: "AED",
    dateFormat: "YYYY-MM-DD",
    autoCalculateVat: true,
    enableAuditLogging: true,
  },
  updatedAt: "2026-09-19T06:00:00Z",
};
