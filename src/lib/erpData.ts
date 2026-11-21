export type HierarchyLevel =
  | "Level 1: Governance"
  | "Level 2: Executive"
  | "Level 3: Management"
  | "Level 4: Operational";

export interface StaffMember {
  id: string;
  name: string;
  username: string;
  phone: string;
  password: string;
  avatarUrl: string;
  bio: string;
  title: string;
  level: HierarchyLevel;
  rankScore: number;
  departmentCode: string;
  clearance: string;
  shift: string;
  email: string;
  badgeCode: string;
  isStrategyCoAdmin?: boolean;
  trackedApps: {
    appName: string;
    activeTask: string;
    progress: number;
    status: "Running" | "Syncing" | "Idle";
    lastPing: string;
  }[];
}

export interface GovernanceMember {
  id: string;
  name: string;
  role: string;
  category: "Shareholder" | "Board of Directors" | "Executive Leadership";
  equityOrTerm: string;
  committee: string;
  status: "Active" | "Voting Member";
}

export interface SupermarketTransaction {
  id: string;
  reference: string;
  type: "POS Sale" | "Supplier Payment" | "Stock GRN" | "Payroll Batch";
  departmentCode: string;
  counterparty: string;
  amountKes: number;
  channel: "M-Pesa / Card Till" | "Bank Transfer" | "Warehouse Ledger" | "Payroll Run";
  timestamp: string;
  status: "Settled" | "Verified" | "Pending Approval";
}

export interface DepartmentModule {
  code: string;
  slug: string;
  name: string;
  badge: string;
  accent: string;
  purpose: string;
  weeklyRevenueK: number;
  weeklyCostK: number;
  kpiScore: number;
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
    badge: "Governance & Command",
    accent: "#0f172a",
    purpose:
      "Corporate strategy, shareholder & board governance, branch oversight, executive decision-making, and business performance.",
    weeklyRevenueK: 4820,
    weeklyCostK: 2910,
    kpiScore: 96,
    hierarchySummary: [
      "Shareholders & Board of Directors",
      "Senior Executive Admin / CEO",
      "COO, CFO, CHRO, CIO, CCO, CMO, CRO, CLO",
    ],
    specialists: [
      "Chief Executive Officer (Senior Exec Admin)",
      "Strategy Director",
      "Business Intelligence Manager",
      "Internal Audit Director",
      "Corporate Secretary",
    ],
    documents: [
      "Shareholder & Board Register",
      "Board Resolution Minutes",
      "Branch Performance Report",
      "Corporate Risk Register",
    ],
    kpis: [
      "Total Company Revenue",
      "Net & Gross Profit Margin",
      "Branch Profitability",
      "Operating Expenditure",
      "Employee Productivity",
    ],
  },
  {
    code: "FIN-02",
    slug: "fin-02",
    name: "Finance & Accounting",
    badge: "Fiscal",
    accent: "#047857",
    purpose:
      "Financial management, accounting, cash reconciliation, supplier payments, taxation, budgeting, and financial accountability.",
    weeklyRevenueK: 3650,
    weeklyCostK: 2480,
    kpiScore: 94,
    hierarchySummary: [
      "Chief Financial Officer",
      "Finance Director & Manager",
      "Financial Controller & Chief Accountant",
    ],
    specialists: [
      "Finance Manager & Controller",
      "General Ledger Accountant",
      "Accounts Payable Accountant",
      "Payroll & Tax Accountant",
      "Cash Office Supervisor",
    ],
    documents: [
      "Daily Cash Reconciliation Report",
      "POS Sales Summary",
      "Payment Voucher",
      "Bank Reconciliation Statement",
      "Monthly P&L Statement",
    ],
    kpis: [
      "Cash Reconciliation Accuracy",
      "Bank Reconciliation Accuracy",
      "Outstanding Supplier Invoices",
      "Payroll Accuracy",
      "Tax Filing Compliance",
    ],
  },
  {
    code: "PROC-03",
    slug: "proc-03",
    name: "Procurement & Purchasing",
    badge: "Sourcing",
    accent: "#4338ca",
    purpose:
      "Supplier sourcing, purchasing, price negotiation, purchase orders, contract management, and procurement efficiency.",
    weeklyRevenueK: 3120,
    weeklyCostK: 2290,
    kpiScore: 89,
    hierarchySummary: [
      "Chief Commercial Officer",
      "Procurement Director",
      "Procurement Manager & Senior Officer",
    ],
    specialists: [
      "Senior Procurement Officer",
      "Purchasing Officer",
      "Sourcing Specialist",
      "Contract Administrator",
      "Price Analyst",
    ],
    documents: [
      "Purchase Requisition",
      "Request for Quotation (RFQ)",
      "Purchase Order (PO)",
      "Supplier Contract",
      "Purchase Price Comparison Sheet",
    ],
    kpis: [
      "Purchase Price Variance",
      "Procurement Savings",
      "Supplier Delivery Accuracy",
      "Procurement Turnaround Time",
      "Contract Compliance",
    ],
  },
  {
    code: "INV-04",
    slug: "inv-04",
    name: "Inventory & Warehouse",
    badge: "Stock Control",
    accent: "#b45309",
    purpose:
      "Inventory control, warehouse management, stock receiving, stocktaking, expiry management, and shelf replenishment.",
    weeklyRevenueK: 3940,
    weeklyCostK: 2610,
    kpiScore: 91,
    hierarchySummary: [
      "Chief Supply Chain Officer",
      "Inventory & Warehouse Managers",
      "Stock Control & Receiving Supervisors",
    ],
    specialists: [
      "Warehouse & Stock Control Manager",
      "Goods Receiving Inspector",
      "Inventory Controller",
      "Storekeeper",
      "Cold-Chain Supervisor",
    ],
    documents: [
      "Goods Received Note (GRN)",
      "Stock Movement Register",
      "Inventory Count Sheet",
      "Expiry Monitoring Register",
      "Cold-Chain Temperature Log",
    ],
    kpis: [
      "Inventory Accuracy",
      "Stock Turnover",
      "Stockout Rate",
      "Inventory Shrinkage",
      "Expired Product Losses",
      "Receiving Accuracy",
    ],
  },
  {
    code: "SLS-05",
    slug: "sls-05",
    name: "Sales & Customer Service",
    badge: "Frontline",
    accent: "#be185d",
    purpose:
      "Retail sales, POS operations, customer service, returns, refunds, loyalty programs, and shopper satisfaction.",
    weeklyRevenueK: 4510,
    weeklyCostK: 2740,
    kpiScore: 93,
    hierarchySummary: [
      "Chief Commercial Officer",
      "Retail Operations & Branch Manager",
      "Sales, Customer Service & Front-End Managers",
    ],
    specialists: [
      "Front-End & Customer Service Supervisor",
      "Cashier",
      "Customer Care Representative",
      "Sales Attendant & Merchandiser",
      "Returns & Refund Officer",
    ],
    documents: [
      "POS Sales Receipt",
      "Daily Sales Report",
      "Cashier Till Report",
      "Product Return & Refund Form",
      "Customer Complaint Register",
    ],
    kpis: [
      "Daily Sales Revenue",
      "Average Transaction Value",
      "Checkout Speed",
      "Customer Satisfaction",
      "Refund Rate",
      "Customer Retention",
    ],
  },
  {
    code: "HR-06",
    slug: "hr-06",
    name: "Human Resources & People Ops",
    badge: "People Ops",
    accent: "#b91c1c",
    purpose:
      "Recruitment, employee management, attendance, staff scheduling, payroll coordination, employee relations, and workforce development.",
    weeklyRevenueK: 1480,
    weeklyCostK: 1120,
    kpiScore: 92,
    hierarchySummary: [
      "Chief Human Resources Officer",
      "HR Director & HR Manager",
      "HR Business Partner & Supervisor",
    ],
    specialists: [
      "HR Manager & Workforce Planner",
      "Recruitment Officer",
      "Training & Development Officer",
      "Employee Relations Officer",
      "Attendance & Payroll Officer",
    ],
    documents: [
      "Employment Contract",
      "Employee Attendance Register",
      "Staff Shift Roster",
      "Leave Application Form",
      "Performance Evaluation Form",
    ],
    kpis: [
      "Employee Turnover",
      "Absenteeism Rate",
      "Recruitment Turnaround Time",
      "Payroll Accuracy",
      "Training Completion",
      "Overtime Expenditure",
    ],
  },
  {
    code: "IT-07",
    slug: "it-07",
    name: "Information Technology",
    badge: "Systems",
    accent: "#0369a1",
    purpose:
      "Technology infrastructure, POS systems, software development, database management, cybersecurity, and technical support.",
    weeklyRevenueK: 1620,
    weeklyCostK: 980,
    kpiScore: 97,
    hierarchySummary: [
      "Chief Information Officer",
      "IT Director & IT Manager",
      "IT Operations, Security & Dev Managers",
    ],
    specialists: [
      "IT Operations & Systems Lead",
      "Systems & Network Administrator",
      "Database Administrator",
      "POS & Hardware Technician",
      "Cybersecurity Analyst",
    ],
    documents: [
      "IT Support Ticket",
      "POS Maintenance Report",
      "Data Backup Report",
      "Security Incident Report",
      "System Access & Asset Register",
    ],
    kpis: [
      "System Uptime",
      "POS Availability",
      "IT Ticket Resolution Time",
      "Backup Success Rate",
      "Security Incident Frequency",
    ],
  },
  {
    code: "LOG-08",
    slug: "log-08",
    name: "Logistics & Transport",
    badge: "Supply Chain",
    accent: "#c2410c",
    purpose:
      "Product transportation, fleet management, delivery coordination, dispatch operations, and inter-branch transfers.",
    weeklyRevenueK: 2380,
    weeklyCostK: 1690,
    kpiScore: 88,
    hierarchySummary: [
      "Chief Supply Chain Officer",
      "Logistics & Transport Managers",
      "Fleet & Dispatch Supervisors",
    ],
    specialists: [
      "Logistics & Fleet Manager",
      "Dispatch Officer",
      "Transport Coordinator",
      "Route Planner",
      "Goods Transfer Officer",
    ],
    documents: [
      "Delivery Order",
      "Dispatch Note",
      "Goods Transfer Note",
      "Proof of Delivery (POD)",
      "Fuel Consumption & Vehicle Maintenance Log",
    ],
    kpis: [
      "On-Time Delivery Rate",
      "Fuel Efficiency",
      "Transportation Cost",
      "Vehicle Utilization",
      "Delivery Accuracy",
    ],
  },
  {
    code: "BRD-09",
    slug: "brd-09",
    name: "Marketing & Branding",
    badge: "Marketing",
    accent: "#6d28d9",
    purpose:
      "Brand identity, advertising, promotional campaigns, customer acquisition, market research, and visual merchandising.",
    weeklyRevenueK: 2190,
    weeklyCostK: 1340,
    kpiScore: 90,
    hierarchySummary: [
      "Chief Marketing Officer",
      "Marketing & Brand Managers",
      "Digital Marketing & Visual Merchandising Managers",
    ],
    specialists: [
      "Brand & Visual Merchandising Manager",
      "Marketing Strategist",
      "Social Media & Content Lead",
      "Promotions Coordinator",
      "Market Research Analyst",
    ],
    documents: [
      "Marketing Campaign Plan",
      "Promotional Calendar",
      "Discount Authorization Form",
      "Brand Guidelines",
      "Campaign Performance Report",
    ],
    kpis: [
      "Customer Acquisition",
      "Marketing ROI",
      "Promotional Sales Lift",
      "Brand Awareness",
      "Campaign Conversion Rate",
    ],
  },
];

export const GOVERNANCE_MEMBERS: GovernanceMember[] = [
  {
    id: "GOV-01",
    name: "Collins Musa",
    role: "Senior Executive Admin & Chief Executive Officer",
    category: "Executive Leadership",
    equityOrTerm: "Executive Command • 2026 Term",
    committee: "Executive & Strategy Committee",
    status: "Active",
  },
  {
    id: "GOV-02",
    name: "Rift Valley Retail Holdings Ltd",
    role: "Anchor Shareholder",
    category: "Shareholder",
    equityOrTerm: "45% Equity Stake",
    committee: "Annual General Assembly",
    status: "Voting Member",
  },
  {
    id: "GOV-03",
    name: "Dr. Hellen Kariuki",
    role: "Chairperson of the Board",
    category: "Board of Directors",
    equityOrTerm: "Board Chair • 3-Year Mandate",
    committee: "Governance & Nominations Board",
    status: "Voting Member",
  },
  {
    id: "GOV-04",
    name: "Eng. Patrick Njoroge",
    role: "Non-Executive Director & Audit Chair",
    category: "Board of Directors",
    equityOrTerm: "Independent Director",
    committee: "Audit & Risk Committee",
    status: "Voting Member",
  },
  {
    id: "GOV-05",
    name: "Nakuru Commercial Investors Group",
    role: "Institutional Shareholder",
    category: "Shareholder",
    equityOrTerm: "25% Equity Stake",
    committee: "Capital & Expansion Assembly",
    status: "Voting Member",
  },
];

export const INITIAL_TRANSACTIONS: SupermarketTransaction[] = [
  {
    id: "TXN-501",
    reference: "POS-BATCH-089",
    type: "POS Sale",
    departmentCode: "SLS-05",
    counterparty: "Walk-In & Loyalty Shoppers (8 Tills)",
    amountKes: 486900,
    channel: "M-Pesa / Card Till",
    timestamp: "15:40 EAT",
    status: "Settled",
  },
  {
    id: "TXN-502",
    reference: "PO-2026-884",
    type: "Supplier Payment",
    departmentCode: "PROC-03",
    counterparty: "FreshFarms Dairy & Agro Ltd",
    amountKes: 214500,
    channel: "Bank Transfer",
    timestamp: "14:15 EAT",
    status: "Verified",
  },
  {
    id: "TXN-503",
    reference: "GRN-2026-441",
    type: "Stock GRN",
    departmentCode: "INV-04",
    counterparty: "Receiving Bay 2 — Cooking Oil & Rice",
    amountKes: 332000,
    channel: "Warehouse Ledger",
    timestamp: "12:50 EAT",
    status: "Verified",
  },
  {
    id: "TXN-504",
    reference: "PAY-NOV-W3",
    type: "Payroll Batch",
    departmentCode: "FIN-02",
    counterparty: "Branch Staff Remuneration & Statutory",
    amountKes: 615000,
    channel: "Payroll Run",
    timestamp: "10:20 EAT",
    status: "Pending Approval",
  },
];

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: "EMP-1001",
    name: "Collins Musa",
    username: "collins.musa",
    phone: "+254 782 246 442",
    password: "eucabeth1musa",
    avatarUrl: "",
    bio: "Senior Executive Admin leading supermarket governance, cross-department coordination, and strategy.",
    title: "Senior Executive Admin & CEO",
    level: "Level 2: Executive",
    rankScore: 100,
    departmentCode: "EXEC-01",
    clearance: "L4-SENIOR-EXEC-ADMIN",
    shift: "07:30 - 18:00 EAT",
    email: "ceo@supermarket-erp.local",
    badgeCode: "SM-EXEC-001",
    isStrategyCoAdmin: true,
    trackedApps: [
      {
        appName: "Executive BI & Branch Telemetry",
        activeTask: "Reviewing Main Branch Daily Margin & KPIs",
        progress: 92,
        status: "Running",
        lastPing: "Just now",
      },
      {
        appName: "Governance & Strategy Command",
        activeTask: "Approving Departmental Strategy Co-Admins",
        progress: 100,
        status: "Syncing",
        lastPing: "1m ago",
      },
    ],
  },
  {
    id: "EMP-1002",
    name: "Grace Wanjiku",
    username: "grace.wanjiku",
    phone: "+254 712 340 112",
    password: "staff123",
    avatarUrl: "",
    bio: "Managing daily POS reconciliation, supplier invoices, and branch financial controls.",
    title: "Finance Manager & Executive Admin (FIN-02)",
    level: "Level 3: Management",
    rankScore: 85,
    departmentCode: "FIN-02",
    clearance: "L3-DEPT-EXEC-ADMIN",
    shift: "08:00 - 17:00 EAT",
    email: "finance@supermarket-erp.local",
    badgeCode: "SM-FIN-014",
    isStrategyCoAdmin: true,
    trackedApps: [
      {
        appName: "POS & Mobile Money Reconciler",
        activeTask: "Matching Till #01–#08 Mobile Money & Card Totals",
        progress: 78,
        status: "Running",
        lastPing: "Just now",
      },
      {
        appName: "Accounts Payable Three-Way Match",
        activeTask: "Verifying Invoice #INV-902 vs GRN-441",
        progress: 64,
        status: "Running",
        lastPing: "2m ago",
      },
    ],
  },
  {
    id: "EMP-1003",
    name: "David Kiprop",
    username: "david.kiprop",
    phone: "+254 723 551 908",
    password: "staff123",
    avatarUrl: "",
    bio: "Handling vendor sourcing, purchase orders, and restock cost negotiations.",
    title: "Senior Procurement Officer & Executive Admin (PROC-03)",
    level: "Level 3: Management",
    rankScore: 84,
    departmentCode: "PROC-03",
    clearance: "L3-DEPT-EXEC-ADMIN",
    shift: "08:00 - 17:00 EAT",
    email: "procurement@supermarket-erp.local",
    badgeCode: "SM-PROC-008",
    trackedApps: [
      {
        appName: "Supplier RFQ & Tender Engine",
        activeTask: "Comparing 3 Dairy & Dry Goods Quotations",
        progress: 85,
        status: "Running",
        lastPing: "Just now",
      },
      {
        appName: "Auto-Replenishment PO Generator",
        activeTask: "Dispatched PO-2026-884 to FreshFarms Ltd",
        progress: 100,
        status: "Syncing",
        lastPing: "3m ago",
      },
    ],
  },
  {
    id: "EMP-1004",
    name: "Peter Otieno",
    username: "peter.otieno",
    phone: "+254 701 882 334",
    password: "staff123",
    avatarUrl: "",
    bio: "Inspecting incoming goods at receiving bays, verifying expiry dates, and logging GRNs.",
    title: "Warehouse & Stock Control Executive Admin (INV-04)",
    level: "Level 3: Management",
    rankScore: 86,
    departmentCode: "INV-04",
    clearance: "L3-DEPT-EXEC-ADMIN",
    shift: "06:30 - 15:30 EAT",
    email: "receiving@supermarket-erp.local",
    badgeCode: "SM-INV-021",
    trackedApps: [
      {
        appName: "Receiving Bay Barcode & GRN Scanner",
        activeTask: "Inspecting Batch #B-774 Expiry & Seal Integrity",
        progress: 71,
        status: "Running",
        lastPing: "Just now",
      },
      {
        appName: "Cold-Chain Temperature Telemetry",
        activeTask: "Chiller Zone A at 3.4°C (Compliant)",
        progress: 100,
        status: "Running",
        lastPing: "30s ago",
      },
    ],
  },
  {
    id: "EMP-1005",
    name: "Faith Njeri",
    username: "faith.njeri",
    phone: "+254 718 902 441",
    password: "staff123",
    avatarUrl: "",
    bio: "Supervising checkout lanes, customer care escalations, and loyalty rewards.",
    title: "Front-End & Sales Executive Admin (SLS-05)",
    level: "Level 3: Management",
    rankScore: 85,
    departmentCode: "SLS-05",
    clearance: "L3-DEPT-EXEC-ADMIN",
    shift: "08:00 - 17:00 EAT",
    email: "sales@supermarket-erp.local",
    badgeCode: "SM-SLS-019",
    trackedApps: [
      {
        appName: "Live POS Lane & Queue Monitor",
        activeTask: "6 Active Checkout Tills • Avg Wait 1m 40s",
        progress: 88,
        status: "Running",
        lastPing: "Just now",
      },
      {
        appName: "Loyalty & Returns Desk Portal",
        activeTask: "Processed 1 Receipt Exchange (#RET-104)",
        progress: 100,
        status: "Idle",
        lastPing: "4m ago",
      },
    ],
  },
  {
    id: "EMP-1006",
    name: "Mercy Chebet",
    username: "mercy.chebet",
    phone: "+254 725 614 778",
    password: "staff123",
    avatarUrl: "",
    bio: "Coordinating staff rosters, attendance tracking, recruitment, and employee welfare.",
    title: "HR Manager & Executive Admin (HR-06)",
    level: "Level 3: Management",
    rankScore: 88,
    departmentCode: "HR-06",
    clearance: "L3-DEPT-EXEC-ADMIN",
    shift: "08:00 - 17:00 EAT",
    email: "hr@supermarket-erp.local",
    badgeCode: "SM-HR-003",
    trackedApps: [
      {
        appName: "Biometric Shift Roster & Attendance",
        activeTask: "42/43 Scheduled Staff Clocked In On Time",
        progress: 97,
        status: "Running",
        lastPing: "Just now",
      },
      {
        appName: "Recruitment & Onboarding Pipeline",
        activeTask: "Evaluating 5 Cashier & Picker Applicants",
        progress: 55,
        status: "Running",
        lastPing: "5m ago",
      },
    ],
  },
  {
    id: "EMP-1007",
    name: "Brian Mwangi",
    username: "brian.mwangi",
    phone: "+254 734 119 820",
    password: "staff123",
    avatarUrl: "",
    bio: "Maintaining POS hardware, network stability, backups, and system security.",
    title: "IT Infrastructure & Executive Admin (IT-07)",
    level: "Level 3: Management",
    rankScore: 84,
    departmentCode: "IT-07",
    clearance: "L3-DEPT-EXEC-ADMIN",
    shift: "07:30 - 16:30 EAT",
    email: "it@supermarket-erp.local",
    badgeCode: "SM-IT-005",
    trackedApps: [
      {
        appName: "POS & ERP Server Health Console",
        activeTask: "99.98% Uptime • Database Snapshot Verified",
        progress: 99,
        status: "Running",
        lastPing: "Just now",
      },
      {
        appName: "Encrypted Gateway & Access Audit",
        activeTask: "Monitoring Zero-Trust Session Tokens",
        progress: 90,
        status: "Syncing",
        lastPing: "1m ago",
      },
    ],
  },
  {
    id: "EMP-1008",
    name: "Samuel Kamau",
    username: "samuel.kamau",
    phone: "+254 711 405 612",
    password: "staff123",
    avatarUrl: "",
    bio: "Managing delivery dispatch, fleet schedules, and inter-branch stock transfers.",
    title: "Logistics & Fleet Executive Admin (LOG-08)",
    level: "Level 3: Management",
    rankScore: 85,
    departmentCode: "LOG-08",
    clearance: "L3-DEPT-EXEC-ADMIN",
    shift: "06:00 - 15:00 EAT",
    email: "logistics@supermarket-erp.local",
    badgeCode: "SM-LOG-011",
    trackedApps: [
      {
        appName: "Fleet GPS & Bay Dock Scheduler",
        activeTask: "Truck KDG-412P Docked at Receiving Bay 2",
        progress: 82,
        status: "Running",
        lastPing: "Just now",
      },
      {
        appName: "Inter-Branch Transfer Manifest",
        activeTask: "Prepared Transfer Note #TRN-309",
        progress: 100,
        status: "Idle",
        lastPing: "6m ago",
      },
    ],
  },
  {
    id: "EMP-1009",
    name: "Amina Hassan",
    username: "amina.hassan",
    phone: "+254 720 778 219",
    password: "staff123",
    avatarUrl: "",
    bio: "Leading brand promotions, visual merchandising displays, and campaign analytics.",
    title: "Brand & Merchandising Executive Admin (BRD-09)",
    level: "Level 3: Management",
    rankScore: 86,
    departmentCode: "BRD-09",
    clearance: "L3-DEPT-EXEC-ADMIN",
    shift: "08:30 - 17:30 EAT",
    email: "branding@supermarket-erp.local",
    badgeCode: "SM-BRD-007",
    trackedApps: [
      {
        appName: "In-Store Digital Signage & Promo CMS",
        activeTask: "Synced Weekend Fresh Produce Bundle Banners",
        progress: 94,
        status: "Running",
        lastPing: "Just now",
      },
      {
        appName: "Campaign Conversion & Footfall Tracker",
        activeTask: "Measuring Aisle 3 End-Cap Uplift (+18%)",
        progress: 73,
        status: "Running",
        lastPing: "2m ago",
      },
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

export function getRankScoreForLevel(level: HierarchyLevel, customRank?: number): number {
  if (typeof customRank === "number") return customRank;
  if (level === "Level 1: Governance") return 110;
  if (level === "Level 2: Executive") return 95;
  if (level === "Level 3: Management") return 75;
  return 50;
}
