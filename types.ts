export interface User {
  id: string;
  name: string;
  role: 'Admin' | 'Accountant' | 'Data Entry' | 'Auditor' | 'CA' | 'Domain Expert';
  pass: string;
}

export interface Group {
  id: string;
  name: string;
  nat: 'A' | 'L' | 'I' | 'E'; // Assets, Liabilities, Income, Expenses
  dr: boolean;
  side: 'BS-A' | 'BS-L' | 'PL';
  parent?: string;
  subledger?: boolean;
  nett?: boolean;
}

export interface Ledger {
  id: string;
  name: string;
  grp: string;
  ob: number;
  obt: 'Dr' | 'Cr';
  type?: string;
  gstin?: string;
  hsn?: string;
  mobile?: string;
  contactPerson?: string;
  address?: string;
}

export interface InventoryEntry {
  item: string;
  qty: number;
  rate: number;
  dir: 'in' | 'out';
}

export interface VoucherEntryLine {
  led: string;
  dr: number;
  cr: number;
}

export interface VoucherAttachment {
  name: string;
  size?: number;
  attId?: string | null;
  dataUrl?: string;
  isProceedingsCopy?: boolean;
}

export interface DeleteRequest {
  requestedBy: string;
  requestedRole: string;
  reason: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectedReason?: string;
  rejectedBy?: string;
  rejectedAt?: string;
}

export interface Voucher {
  id: string;
  type: string; // Payment, Receipt, Contra, Journal, Sales, Purchase, Debit Note, Credit Note
  no: string;
  date: string;
  narration?: string;
  partyName?: string;
  partyMobile?: string;
  entries: VoucherEntryLine[];
  inv?: InventoryEntry[];
  justify?: string;
  backdated?: boolean;
  createdBy: string;
  createdAt: string;
  modifiedBy?: string;
  modifiedAt?: string;
  unlocked?: boolean;
  attachment?: VoucherAttachment | null;
  proceedingsAttachment?: VoucherAttachment | null;
  fromPdf?: boolean;
  imported?: boolean;
  isB2B?: boolean;
  invoiceNo?: string;
  deleteRequest?: DeleteRequest | null;
}

export interface StockItem {
  id: string;
  name: string;
  unit: string;
  hsn?: string;
  gst: number;
  openingQty: number;
  rate: number;
  batch?: string;
  expiry?: string;
  reorder?: number;
  godown?: string;
  stockGroup?: string;
  stockCategory?: string;
}

export interface FixedAsset {
  id: string;
  name: string;
  cls: string;
  cost: number;
  date: string;
  method: 'WDV' | 'SLM';
  location?: string;
}

export interface AuditLog {
  id: string;
  ts: string;
  user: string;
  role: string;
  action: string;
  detail: string;
  amt?: number;
  dr?: number;
  cr?: number;
  vtype?: string;
  name?: string;
  vdate?: string;
}

export interface FileAttachment {
  name: string;
  type: string;
  dataUrl: string;
  size?: number;
  uploadedAt: string;
}

export interface Observation {
  id: string;
  title?: string;
  voucher?: string;
  cat: 'Malpractice' | 'Irregularity' | 'Compliance Violation' | 'Audit Observation' | 'Accounting Variance' | string;
  severity?: 'Critical' | 'High' | 'Medium' | 'Low' | string;
  note: string;
  actionRequired?: string;
  deadline?: string;
  by: string;
  role?: string;
  status: 'Open' | 'Under Review' | 'Resolved' | 'Overridden' | 'Closed' | string;
  ts: string;
  attachment?: FileAttachment | null;
  reply?: string;
  replyAttachment?: FileAttachment | null;
  replyBy?: string;
  replyTs?: string;
}

export interface TaskItem {
  id: string;
  companyId?: string;
  assignee: string;
  assigneeRole?: string;
  mailRef?: string;
  mailDate?: string;
  task: string;
  description?: string;
  category?: string;
  priority?: 'High' | 'Medium' | 'Low';
  dateGiven: string;
  expectedDate?: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Delayed / Not Done' | 'Approved by Expert' | string;
  completionNotes?: string;
  completedAt?: string;
  proofAttachment?: FileAttachment | null;
  reason?: string;
  reasonAttachment?: FileAttachment | null;
  by: string;
  ts: string;
  expertFeedback?: string;
}

export interface MSMEInvoice {
  supplier: string;
  invNo: string;
  invDate: string;
  amount: number;
  creditDays: number;
  payDate?: string;
  status: 'Not Paid' | 'Paid';
}

export interface ShareCertificate {
  id: string;
  certNo: string;
  folioNo: string;
  memberName: string;
  holderAddress?: string;
  numberOfShares: number;
  nominalValue: number;
  paidUpValue?: number;
  shareClass?: string;
  distinctiveFrom: number;
  distinctiveTo: number;
  issueDate: string;
  status: 'Active' | 'Cancelled' | 'Transferred';
  director1?: string;
  director2?: string;
  secretary?: string;
  transfers?: Array<{
    date: string;
    transferNo: string;
    folio: string;
    transferee: string;
    signatory: string;
  }>;
}

export interface TDSEntry {
  id: string;
  vendorName: string;
  pan: string;
  section: '194Q' | '194H' | '194C' | '194I' | '194J' | '192' | '194A';
  grossAmount: number;
  thresholdLimit: number;
  tdsRate: number;
  tdsAmount: number;
  paymentDate: string;
  challanNo?: string;
  status: 'Accrued' | 'Deducted' | 'Paid to Govt';
}

export interface CompanyMeta {
  district?: string;
  block?: string;
  cin?: string;
  officialEmail?: string;
  pass?: string;
  gstUsername?: string;
  gstPass?: string;
  gstin?: string;
  ceo?: string;
  ceoMob?: string;
  ceoEmail?: string;
  acc?: string;
  accMob?: string;
  accEmail?: string;
  tallyCompanyName?: string;
}

export interface StoredBill {
  id: string;
  category: 'Purchase' | 'Sales' | 'Expense' | 'Income' | 'Bank Statement' | 'Bulk Bill / Other';
  title: string;
  fileName: string;
  fileType: 'PDF' | 'Excel' | 'PNG' | 'JPG' | 'Image' | 'Other';
  fileSize?: number;
  dataUrl?: string;
  uploadDate: string;
  uploadedBy: string;
  status: 'Stored / Unmapped' | 'Posted to Voucher' | 'Under Review';
  notes?: string;
  voucherId?: string;
}

export interface VisitorLog {
  id: string;
  timestamp: string;
  date: string; // YYYY-MM-DD
  region: string;
  device: string;
}

export interface Company {
  id: string;
  name: string;
  cin?: string;
  gstin: string;
  pan: string;
  fyStart: string;
  fyEnd: string;
  address: string;
  memberRevenue80P: boolean;
  meta: CompanyMeta;
  groups: Group[];
  ledgers: Ledger[];
  vouchers: Voucher[];
  stockItems: StockItem[];
  stockGroups: Array<{ id: string; name: string }>;
  stockCategories: Array<{ id: string; name: string }>;
  units: Array<{ id: string; symbol: string; name: string }>;
  voucherTypes: Array<{ id: string; name: string; parent: string; abbr?: string }>;
  godowns: Array<{ id: string; name: string }>;
  assets: FixedAsset[];
  users: User[];
  audit: AuditLog[];
  createdAt: string;
  attendance?: string;
  auditDocs?: Record<string, string>;
  auditRemark?: string;
  observations?: Observation[];
  msme?: MSMEInvoice[];
  msmeBankRate?: number;
  docs?: Array<{ name: string; href: string }>;
  uploads?: Array<{ id: string; name: string; by: string; ts: string }>;
  shares?: ShareCertificate[];
  tdsList?: TDSEntry[];
  auditReport?: Record<string, string>;
  payroll?: any[];
  payrollCfg?: { minWage: number };
  fpoCompliance?: Record<string, { status?: string; note?: string }>;
  features?: Record<string, boolean>;
  storeMarkup?: number;
  storeApproved?: boolean;
  storeName?: string;
  billsVault?: StoredBill[];
}

export interface LoginRecord {
  id: string;
  username: string;
  personName?: string;
  contactNumber?: string;
  role: string;
  companyName: string;
  timestamp: string;
  status: 'Success' | 'Failed';
  loginType: 'Standard' | 'SSO' | 'Demo' | 'Firebase';
  ipAddress?: string;
  region?: string;
}

export interface Session {
  userId: string;
  name: string;
  role: 'Admin' | 'Accountant' | 'Data Entry' | 'Auditor' | 'CA' | 'Domain Expert';
  firebase?: boolean;
}

export interface AppDatabase {
  companies: Company[];
  active: string | null;
  dailyReview?: string;
  tasks?: TaskItem[];
  visitorCount?: number;
  visitorLogs?: VisitorLog[];
  loginRegister?: LoginRecord[];
}
