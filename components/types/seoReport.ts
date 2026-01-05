export type SeoPeriodReport = {
  customerId: string;

  // Identity
  periodType: "monthly" | "weekly";
  periodKey: string; // "2026-01" or "2026-W02"
  month?: string; // Legacy/Convenience alias for periodKey if monthly, optional

  // Date Range
  rangeLabel: string; // ex "Senaste 30 dagarna" or "Vecka 02"
  rangeStart?: string; // ISO Date YYYY-MM-DD
  rangeEnd?: string;   // ISO Date YYYY-MM-DD

  uploadedAt: string; // ISO
  publishedAt?: string; // ISO
  adminNotes?: string; // Internal notes
  executiveSummary?: string; // Customer facing summary
  completedActions?: Array<{
    id: string;
    title: string;
    date: string;
    status: 'completed' | 'ongoing';
  }>; // Internal notes

  status: "draft" | "published";

  kpis: Kpis;

  trafficTimeline: Array<TrafficData>;

  services: Array<{ name: string; active: boolean }>;

  indicators: Array<{ label: string; valueText: string; trend: "up" | "down" | "flat" }>;

  channels: Array<ChannelData>;

  keywords: Array<Keyword>;

  deviceSplit: Array<{ device: "mobile" | "desktop" | "tablet"; percent: number }>;

  conversionsByType: Array<{ type: string; count: number }>;
};

export type Kpis = {
  impressions: { value: number; deltaPercent: number };
  uniqueVisitors: { value: number; deltaPercent: number };
  conversions: { value: number; deltaPercent: number };
  avgPosition: { value: number; deltaPercent: number };
  clicks: { value: number; deltaPercent: number };
  organicVisitors: { value: number; deltaPercent: number };
  organicConversions: { value: number; deltaPercent: number };
  ctr: { value: number; deltaPercent: number };
};

export type TrafficData = {
  date: string; // "YYYY-MM-DD"
  impressions: number;
  sessions?: number;
  clicks?: number;
};

export type ChannelData = { medium: string; sessions: number; conversions: number };

export type Keyword = { keyword: string; group?: string; baseline?: number; position: number; searchVolume?: number };