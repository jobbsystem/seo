import type { SeoPeriodReport } from "../types/seoReport";

export const seoMonthlyReportMock: SeoPeriodReport = {
  customerId: "origin",
  periodType: "monthly",
  periodKey: "2024-12",
  month: "2024-12",
  rangeLabel: "Senaste 30 dagarna",
  uploadedAt: new Date().toISOString(),
  status: "published",

  kpis: {
    impressions: { value: 39023, deltaPercent: 6 },
    uniqueVisitors: { value: 474, deltaPercent: -22.5 },
    conversions: { value: 12, deltaPercent: -57.1 },
    avgPosition: { value: 19.94, deltaPercent: 7.8 },
    clicks: { value: 237, deltaPercent: -8.5 },
    organicVisitors: { value: 151, deltaPercent: -13.05 },
    organicConversions: { value: 6, deltaPercent: -52.09 },
    ctr: { value: 0.59, deltaPercent: -16.1 },
  },

  trafficTimeline: Array.from({ length: 12 }).map((_, i) => ({
    date: new Date(2024, 11, 1 + i * 2).toISOString().slice(0, 10),
    impressions: 2500 + i * 60,
    sessions: 80 + i * 3,
  })),

  services: [
    { name: "Google Ads", active: true },
    { name: "META Ads", active: true },
    { name: "AI-SEO (GEO)", active: true },
    { name: "SEO-texter", active: true },
    { name: "Hemsida", active: true },
  ],

  indicators: [
    { label: "ROAS", valueText: "+18%", trend: "up" },
    { label: "Leads", valueText: "+9%", trend: "up" },
    { label: "Citeringar", valueText: "+6%", trend: "up" },
    { label: "CTR", valueText: "+4%", trend: "up" },
    { label: "Prestanda", valueText: "-2%", trend: "down" },
  ],

  channels: [
    { medium: "paid", sessions: 211, conversions: 6 },
    { medium: "organic", sessions: 181, conversions: 6 },
    { medium: "cpc", sessions: 191, conversions: 0 },
    { medium: "referral", sessions: 29, conversions: 0 },
    { medium: "direct", sessions: 9, conversions: 0 },
    { medium: "social", sessions: 1, conversions: 0 },
  ],

  keywords: [
    { keyword: "Trädfällning Varberg", group: "Tjänst + ort", baseline: 2, position: 2 },
    { keyword: "Trädbeskärning Varberg", group: "Tjänst + ort", baseline: 2, position: 3 },
    { keyword: "Arborist Göteborg", group: "C", baseline: 2, position: 2 },
    { keyword: "Snöröjning Varberg", group: "C", baseline: 100, position: 89 },
  ],

  deviceSplit: [
    { device: "mobile", percent: 76.8 },
    { device: "desktop", percent: 23.0 },
    { device: "tablet", percent: 0.2 },
  ],

  conversionsByType: [
    { type: "Kontaktformulär", count: 9 },
    { type: "Klick Telefonnummer", count: 3 },
  ],
};