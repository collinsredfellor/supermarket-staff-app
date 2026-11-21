export interface StaffMember {
  id: string;
  name: string;
  title: string;
  level: "Level 1: Governance" | "Level 2: Executive" | "Level 3: Management" | "Level 4: Operational";
  departmentCode: string;
  clearance: string;
  shift: string;
  email: string;
  badgeCode: string;
  trackedApps: {
    appName: string;
    activeTask: string;
    progress: number;
    status: "Running" | "Syncing" | "Idle";
    lastPing: string;
  }[];
}

export interface DepartmentModule {
  code: string;
  slug: string;
  name: string;
  badge: string;
  accent: string;
  purpose: string;
  hierarchySummary: string[];
  specialists: string[];
  documents: string[];
  kpis: string[];
}

export interface TimelineEvent {
  id: string;
  workflow: string;
  stepNumber: number;
  departmentCode: string;
  actorRole: string;
  action: string;
  documentRef: string;
  timestamp: string;
  status: "Completed" | "In Progress" | "Pending";
}

export const DEPARTMENTS: DepartmentModule[] = [
  {
    code: "EXEC-01",
    slug: "exec-01",
    name: "Executive & Senior Management",
    badge: "Leadership",
    accent: "#38bdf8",
    purpose: "Corporate strategy, organizational governance, branch oversight, executive decision-making, and business performance.",
    hierarchySummary: ["Shareholders / Board of Directors", "CEO / Managing Director", "COO / CFO / CHRO / CIO / CCO / CMO / CRO / CLO"],
    specialists: ["Strategy Director", "Business Intelligence Manager", "Internal Audit Director", "Risk & Compliance Manager", "Executive Assistant"],
    documents: ["Board Resolution Minutes", "Branch Performance Report", "Strategic Initiative Approval", "Corporate Risk Register"],
    kpis: ["Total Company Revenue", "Net & Gross Profit Margin", "Branch Profitability", "Operating Expenditure", "Employee Productivity"],
  },
  {
    code: "FIN-02",
    slug: "fin-02",
    name: "Finance & Accounting",
    badge: "Fiscal",
    accent: "#34d399",
    purpose: "Financial management, accounting, cash reconciliation, supplier payments, taxation, budgeting, and financial accountability.",
    hierarchySummary: ["Chief Financial Officer", "Finance Director & Manager", "Financial Controller & Chief Accountant"],
    specialists: ["General Ledger Accountant", "Accounts Payable Accountant", "Accounts Receivable Accountant", "Payroll Accountant", "Cost & Tax Accountant", "Cash Office Supervisor"],
    documents: ["Daily Cash Reconciliation Report", "POS Sales Summary", "Payment Voucher", "Bank Reconciliation Statement", "Monthly P&L Statement"],
    kpis: ["Cash Reconciliation Accuracy", "Bank Reconciliation Accuracy", "Outstanding Supplier Invoices", "Payroll Accuracy", "Tax Filing Compliance"],
  },
  {
    code: "PROC-03",
    slug: "proc-03",
    name: "Procurement & Purchasing",
    badge: "Sourcing",
    accent: "#a78bfa",
    purpose: "Supplier sourcing, purchasing, price negotiation, purchase orders, contract management, and procurement efficiency.",
    hierarchySummary: ["Chief Commercial Officer", "Procurement Director", "Procurement Manager & Senior Officer"],
    specialists: ["Purchasing Officer", "Sourcing Specialist", "Supplier Relationship Manager", "Contract Administrator", "Price Analyst", "Procurement Compliance Officer"],
    documents: ["Purchase Requisition", "Request for Quotation (RFQ)", "Purchase Order (PO)", "Supplier Contract", "Purchase Price Comparison Sheet"],
    kpis: ["Purchase Price Variance", "Procurement Savings", "Supplier Delivery Accuracy", "Procurement Turnaround Time", "Contract Compliance"],
  },
  {
    code: "INV-04",
    slug: "inv-04",
    name: "Inventory & Warehouse",
    badge: "Stock Control",
    accent: "#fbbf24",
    purpose: "Inventory control, warehouse management, stock receiving, stocktaking, expiry management, and shelf replenishment.",
    hierarchySummary: ["Chief Supply Chain Officer", "Inventory & Warehouse Managers", "Stock Control & Receiving Supervisors"],
    specialists: ["Inventory Controller", "Receiving Clerk", "Goods Receiving Inspector", "Storekeeper", "Shelf Replenisher", "Expiry Control Officer", "Cold-Chain Supervisor"],
    documents: ["Goods Received Note (GRN)", "Stock Movement Register", "Inventory Count Sheet", "Expiry Monitoring Register", "Cold-Chain Temperature Log"],
    kpis: ["Inventory Accuracy", "Stock Turnover", "Stockout Rate", "Inventory Shrinkage", "Expired Product Losses", "Receiving Accuracy"],
  },
  {
    code: "SLS-05",
    slug: "sls-05",
    name: "Sales & Customer Service",
    badge: "Frontline",
    accent: "#f472b6",
    purpose: "Retail sales, POS operations, customer service, returns, refunds, loyalty programs, and shopper satisfaction.",
    hierarchySummary: ["Chief Commercial Officer", "Retail Operations & Branch Manager", "Sales, Customer Service & Front-End Managers"],
    specialists: ["Cashier", "Customer Care Representative", "Sales Attendant", "Merchandiser", "Returns & Refund Officer", "Loyalty Program Officer", "E-Commerce Picker"],
    documents: ["POS Sales Receipt", "Daily Sales Report", "Cashier Till Report", "Product Return & Refund Form", "Customer Complaint Register"],
    kpis: ["Daily Sales Revenue", "Average Transaction Value", "Checkout Speed", "Customer Satisfaction", "Refund Rate", "Customer Retention"],
  },
  {
    code: "HR-06",
    slug: "hr-06",
    name: "Human Resources & People Ops",
    badge: "People Ops",
    accent: "#fb7185",
    purpose: "Recruitment, employee management, attendance, staff scheduling, payroll coordination, employee relations, and workforce development.",
    hierarchySummary: ["Chief Human Resources Officer", "HR Director & HR Manager", "HR Business Partner & Supervisor"],
    specialists: ["Recruitment Officer", "Training & Development Officer", "Employee Relations Officer", "Compensation & Payroll Officer", "Attendance & Timekeeper Officer", "Occupational Health & Safety Officer"],
    documents: ["Employment Contract", "Employee Attendance Register", "Staff Shift Roster", "Leave Application Form", "Performance Evaluation Form"],
    kpis: ["Employee Turnover", "Absenteeism Rate", "Recruitment Turnaround Time", "Payroll Accuracy", "Training Completion", "Overtime Expenditure"],
  },
  {
    code: "IT-07",
    slug: "it-07",
    name: "Information Technology",
    badge: "Systems",
    accent: "#22d3ee",
    purpose: "Technology infrastructure, POS systems, software development, database management, cybersecurity, and technical support.",
    hierarchySummary: ["Chief Information Officer", "IT Director & IT Manager", "IT Operations, Security & Dev Managers"],
    specialists: ["Systems & Network Administrator", "Database Administrator", "Full-Stack / Backend / Frontend Developer", "POS & Hardware Technician", "Cybersecurity Analyst", "IT Helpdesk Officer"],
    documents: ["IT Support Ticket", "POS Maintenance Report", "Data Backup Report", "Security Incident Report", "System Access & Asset Register"],
    kpis: ["System Uptime", "POS Availability", "IT Ticket Resolution Time", "Backup Success Rate", "Security Incident Frequency"],
  },
  {
    code: "LOG-08",
    slug: "log-08",
    name: "Logistics & Transport",
    badge: "Supply Chain",
    accent: "#fb923c",
    purpose: "Product transportation, fleet management, delivery coordination, dispatch operations, and inter-branch transfers.",
    hierarchySummary: ["Chief Supply Chain Officer", "Logistics & Transport Managers", "Fleet & Dispatch Supervisors"],
    specialists: ["Dispatch Officer", "Transport Coordinator", "Fleet Maintenance Officer", "Route Planner", "Goods Transfer Officer", "Fuel Controller", "Truck & Van Drivers"],
    documents: ["Delivery Order", "Dispatch Note", "Goods Transfer Note", "Proof of Delivery (POD)", "Fuel Consumption & Vehicle Maintenance Log"],
    kpis: ["On-Time Delivery Rate", "Fuel Efficiency", "Transportation Cost", "Vehicle Utilization", "Delivery Accuracy"],
  },
  {
    code: "BRD-09",
    slug: "brd-09",
    name: "Marketing & Branding",
    badge: "Marketing",
    accent: "#c084fc",
    purpose: "Brand identity, advertising, promotional campaigns, customer acquisition, market research, and visual merchandising.",
    hierarchySummary: ["Chief Marketing Officer", "Marketing & Brand Managers", "Digital Marketing & Visual Merchandising Managers"],
    specialists: ["Marketing Strategist", "Social Media Manager", "Graphic Designer & Content Creator", "Promotions Coordinator", "Market Research Analyst", "Visual Merchandiser"],
    documents: ["Marketing Campaign Plan", "Promotional Calendar", "Discount Authorization Form", "Brand Guidelines", "Campaign Performance Report"],
    kpis: ["Customer Acquisition", "Marketing ROI", "Promotional Sales Lift", "Brand Awareness", "Campaign Conversion Rate"],
  },
];

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: "EMP-1001",
    name: "Collins Musa",
    title: "Chief Executive Officer / System Admin",
    level: "Level 2: Executive",
    departmentCode: "EXEC-01",
    clearance: "L4-GLOBAL-ROOT",
    shift: "07:30 - 18:00 EAT",
    email: "ceo@supermarket-erp.local",
    badgeCode: "SM-EXEC-001",
    trackedApps: [
      { appName: "Executive BI & Branch Telemetry", activeTask: "Reviewing Nakuru Main Branch Daily Margin", progress: 92, status: "Running", lastPing: "Just now" },
      { appName: "ERP Approval Queue", activeTask: "Signed PO-2026-884 Supplier Restock", progress: 100, status: "Syncing", lastPing: "1m ago" },
    ],
  },
  {
    id: "EMP-1002",
    name: "Grace Wanjiku",
    title: "Finance Manager & Controller",
    level: "Level 3: Management",
    departmentCode: "FIN-02",
    clearance: "L3-FISCAL-AUDIT",
    shift: "08:00 - 17:00 EAT",
    email: "finance@supermarket-erp.local",
    badgeCode: "SM-FIN-014",
    trackedApps: [
      { appName: "POS & Mobile Money Reconciler", activeTask: "Matching Till #01–#08 M-Pesa & Card Totals", progress: 78, status: "Running", lastPing: "Just now" },
      { appName: "Accounts Payable Three-Way Match", activeTask: "Verifying Invoice #INV-902 vs GRN-441", progress: 64, status: "Running", lastPing: "2m ago" },
    ],
  },
  {
    id: "EMP-1003",
    name: "David Kiprop",
    title: "Senior Procurement Officer",
    level: "Level 3: Management",
    departmentCode: "PROC-03",
    clearance: "L3-VENDOR-PO",
    shift: "08:00 - 17:00 EAT",
    email: "procurement@supermarket-erp.local",
    badgeCode: "SM-PROC-008",
    trackedApps: [
      { appName: "Supplier RFQ & Tender Engine", activeTask: "Comparing 3 Dairy & Dry Goods Quotations", progress: 85, status: "Running", lastPing: "Just now" },
      { appName: "Auto-Replenishment PO Generator", activeTask: "Dispatched PO-2026-884 to FreshFarms Ltd", progress: 100, status: "Syncing", lastPing: "3m ago" },
    ],
  },
  {
    id: "EMP-1004",
    name: "Peter Otieno",
    title: "Goods Receiving Inspector & Officer",
    level: "Level 4: Operational",
    departmentCode: "INV-04",
    clearance: "L2-BAY-RECEIVING",
    shift: "06:30 - 15:30 EAT",
    email: "receiving@supermarket-erp.local",
    badgeCode: "SM-INV-021",
    trackedApps: [
      { appName: "Receiving Bay Barcode & GRN Scanner", activeTask: "Inspecting Batch #B-774 Expiry & Seal Integrity", progress: 71, status: "Running", lastPing: "Just now" },
      { appName: "Cold-Chain Temperature Telemetry", activeTask: "Chiller Zone A at 3.4°C (Compliant)", progress: 100, status: "Running", lastPing: "30s ago" },
    ],
  },
  {
    id: "EMP-1005",
    name: "Faith Njeri",
    title: "Front-End & Customer Service Supervisor",
    level: "Level 3: Management",
    departmentCode: "SLS-05",
    clearance: "L2-POS-SUPERVISOR",
    shift: "08:00 - 17:00 EAT",
    email: "sales@supermarket-erp.local",
    badgeCode: "SM-SLS-019",
    trackedApps: [
      { appName: "Live POS Lane & Queue Monitor", activeTask: "6 Active Checkout Tills • Avg Wait 1m 40s", progress: 88, status: "Running", lastPing: "Just now" },
      { appName: "Loyalty & Returns Desk Portal", activeTask: "Processed 1 Receipt Exchange (#RET-104)", progress: 100, status: "Idle", lastPing: "4m ago" },
    ],
  },
  {
    id: "EMP-1006",
    name: "Mercy Chebet",
    title: "HR Manager & Workforce Planner",
    level: "Level 3: Management",
    departmentCode: "HR-06",
    clearance: "L3-PEOPLE-ADMIN",
    shift: "08:00 - 17:00 EAT",
    email: "hr@supermarket-erp.local",
    badgeCode: "SM-HR-003",
    trackedApps: [
      { appName: "Biometric Shift Roster & Attendance", activeTask: "42/43 Scheduled Staff Clocked In On Time", progress: 97, status: "Running", lastPing: "Just now" },
      { appName: "Recruitment & Onboarding Pipeline", activeTask: "Evaluating 5 Cashier & Picker Applicants", progress: 55, status: "Running", lastPing: "5m ago" },
    ],
  },
  {
    id: "EMP-1007",
    name: "Brian Mwangi",
    title: "Systems & POS Infrastructure Engineer",
    level: "Level 4: Operational",
    departmentCode: "IT-07",
    clearance: "L3-NET-SECURITY",
    shift: "07:30 - 16:30 EAT",
    email: "it@supermarket-erp.local",
    badgeCode: "SM-IT-005",
    trackedApps: [
      { appName: "POS & ERP Server Health Console", activeTask: "99.98% Uptime • Database Snapshot Verified", progress: 99, status: "Running", lastPing: "Just now" },
      { appName: "Encrypted Gateway & Access Audit", activeTask: "Monitoring Zero-Trust Session Tokens", progress: 90, status: "Syncing", lastPing: "1m ago" },
    ],
  },
  {
    id: "EMP-1008",
    name: "Samuel Kamau",
    title: "Dispatch & Fleet Coordinator",
    level: "Level 4: Operational",
    departmentCode: "LOG-08",
    clearance: "L2-FLEET-DISPATCH",
    shift: "06:00 - 15:00 EAT",
    email: "logistics@supermarket-erp.local",
    badgeCode: "SM-LOG-011",
    trackedApps: [
      { appName: "Fleet GPS & Bay Dock Scheduler", activeTask: "Truck KDG-412P Docked at Receiving Bay 2", progress: 82, status: "Running", lastPing: "Just now" },
      { appName: "Inter-Branch Transfer Manifest", activeTask: "Prepared Transfer Note #TRN-309", progress: 100, status: "Idle", lastPing: "6m ago" },
    ],
  },
  {
    id: "EMP-1009",
    name: "Amina Hassan",
    title: "Brand & Visual Merchandising Manager",
    level: "Level 3: Management",
    departmentCode: "BRD-09",
    clearance: "L2-CAMPAIGN-PUBLISH",
    shift: "08:30 - 17:30 EAT",
    email: "branding@supermarket-erp.local",
    badgeCode: "SM-BRD-007",
    trackedApps: [
      { appName: "In-Store Digital Signage & Promo CMS", activeTask: "Synced Weekend Fresh Produce Bundle Banners", progress: 94, status: "Running", lastPing: "Just now" },
      { appName: "Campaign Conversion & Footfall Tracker", activeTask: "Measuring Aisle 3 End-Cap Uplift (+18%)", progress: 73, status: "Running", lastPing: "2m ago" },
    ],
  },
];

export const INITIAL_TIMELINE: TimelineEvent[] = [
  {
    id: "TL-1",
    workflow: "Workflow 1: Product Procurement & Receiving",
    stepNumber: 1,
    departmentCode: "INV-04",
    actorRole: "Inventory Controller",
    action: "Flagged low stock on Fresh Milk & Cooking Oil and raised Requisition.",
    documentRef: "REQ-2026-410",
    timestamp: "08:10 AM",
    status: "Completed",
  },
  {
    id: "TL-2",
    workflow: "Workflow 1: Product Procurement & Receiving",
    stepNumber: 2,
    departmentCode: "PROC-03",
    actorRole: "Senior Procurement Officer",
    action: "Compared supplier quotes and issued approved Purchase Order.",
    documentRef: "PO-2026-884",
    timestamp: "08:42 AM",
    status: "Completed",
  },
  {
    id: "TL-3",
    workflow: "Workflow 1: Product Procurement & Receiving",
    stepNumber: 3,
    departmentCode: "LOG-08",
    actorRole: "Dispatch & Fleet Coordinator",
    action: "Assigned Bay 2 arrival slot and logged supplier delivery manifest.",
    documentRef: "DN-2026-119",
    timestamp: "09:15 AM",
    status: "Completed",
  },
  {
    id: "TL-4",
    workflow: "Workflow 1: Product Procurement & Receiving",
    stepNumber: 4,
    departmentCode: "INV-04",
    actorRole: "Goods Receiving Inspector",
    action: "Inspecting physical quantities, batch expiry dates, and issuing Goods Received Note.",
    documentRef: "GRN-2026-441",
    timestamp: "Live Now",
    status: "In Progress",
  },
  {
    id: "TL-5",
    workflow: "Workflow 1: Product Procurement & Receiving",
    stepNumber: 5,
    departmentCode: "FIN-02",
    actorRole: "Accounts Payable Accountant",
    action: "Awaiting GRN confirmation for 3-way invoice match & payment voucher.",
    documentRef: "PV-PENDING-884",
    timestamp: "Next Stage",
    status: "Pending",
  },
];
