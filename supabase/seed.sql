-- ========================================================================
-- PREEDHAR TECHNICAL SERVICES CO. L.L.C. (DUBAI, UAE)
-- Database Seed File — Clean Production Baseline
-- ========================================================================

-- 1. Legitimate Company Configuration Singleton
INSERT INTO public.company_settings (
  id, legal_name, trade_license_number, established_year, address, city, country,
  phone, email, website, trn, standard_vat_rate, tax_office_jurisdiction,
  vat_registration_date, bank_name, bank_branch, account_name, account_number,
  iban, swift_code, quotation_prefix, invoice_prefix, purchase_order_prefix,
  work_completion_prefix, default_payment_terms, standard_warranty_clause,
  standard_remittance_clause, base_currency, date_format, auto_calculate_vat,
  enable_audit_logging
) VALUES (
  1,
  'PREEDHAR TECHNICAL SERVICES CO. L.L.C.',
  'CN-1094821',
  '2018',
  'Office 402, Al Garhoud Commercial Complex, Airport Road',
  'Dubai',
  'United Arab Emirates',
  '+971-569653603',
  'info@preedhar.ae',
  'https://preedhar.ae',
  '100234567800003',
  5.00,
  'Federal Tax Authority (FTA) - Dubai',
  '2018-01-01',
  'Emirates NBD',
  'Al Garhoud Branch, Dubai',
  'PREEDHAR TECHNICAL SERVICES CO. L.L.C.',
  '1012345678901',
  'AE070260001012345678901',
  'EBILAEADXXX',
  'PTS-Q',
  'PTSC-INV',
  'PTSC-PO',
  'PTSC-WCR',
  '30 Days Net from Invoice Date',
  'All workmanship is warranted for a period of twelve (12) months from the date of final handover.',
  'Please remit payment directly to Emirates NBD IBAN: AE070260001012345678901 referencing the Invoice Number.',
  'AED',
  'YYYY-MM-DD',
  TRUE,
  TRUE
) ON CONFLICT (id) DO UPDATE SET
  legal_name = EXCLUDED.legal_name,
  trn = EXCLUDED.trn;

