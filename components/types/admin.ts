export type ReportStatus = "draft" | "published";

export type AdminCustomer = {
  id: string;        // "origin"
  name: string;      // "Origin AB"
  domain: string;    // "origin.se"
  contactEmail: string;
  active: boolean;

  // Extended CRM Data
  contacts?: CustomerContact[];
  services?: CustomerService[];
  credentials?: CustomerCredential[];
  technical?: CustomerTechnical;
};

export type CustomerContact = {
  id: string;
  name: string;
  role: string; // "VD", "Marknad", "Teknik"
  email: string;
  phone?: string;
};

export type CustomerService = {
  id: string; // "seo", "sem", "content"
  name: string;
  status: "active" | "paused" | "cancelled";
  startDate?: string;
  priceCheck?: number;
};

export type CustomerCredential = {
  id: string;
  serviceName: string; // "WordPress", "Google Ads"
  username: string;
  password?: string; // In a real app this would be encrypted or tokenized
  url?: string;
  notes?: string;
};

export type CustomerTechnical = {
  cms?: string; // "WordPress", "Shopify"
  hosting?: string;
  ga4Id?: string;
  gtmId?: string;
  notes?: string;
};

export type AdminNotification = {
  id: string;
  createdAt: string;     // ISO
  title: string;
  message: string;
  level: "info" | "success" | "warning";
  read: boolean;
  customerId?: string;
  month?: string;        // "YYYY-MM"
};

export type DraftGenerationJob = {
  id: string;
  createdAt: string;
  month: string;         // "YYYY-MM"
  customersProcessed: number;
  draftsCreated: number;
  status: "ok" | "partial" | "failed";
  notes?: string;
};

// --- Action Plan (Handlingsplan) Types ---

export type ActionPlan = {
  id: string;
  customerId: string;
  createdAt: string;
  updatedAt: string;

  // Simplified Strategy Section
  businessGoals?: string;
  seoGoals?: string; // Optional separate field if needed

  // Simplified Analysis Section
  statusAnalysis?: string;

  // Action Areas
  actionAreas: ActionArea[];
};

export type ActionArea = {
  id: string;
  title: string;
  status: 'not-started' | 'in-progress' | 'completed';
  progress: number; // 0-100
  activities: ActionActivity[];
};

export type ActionActivity = {
  id: string;
  description: string;
  status: 'pending' | 'done';
  estHours?: number;
};
