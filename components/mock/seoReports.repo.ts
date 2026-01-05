import type { SeoPeriodReport } from "../types/seoReport";
import { seoMonthlyReportMock } from "./seoMonthlyReport.mock";

/**
 * Mock-repo: rapporter per månad (YYYY-MM).
 * Byt senare till API utan att ändra SeoPage – bara byt implementation här.
 */
const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

const reportsByMonth: Record<string, SeoPeriodReport> = {
  [currentMonth]: { ...seoMonthlyReportMock, periodType: 'monthly', periodKey: currentMonth, month: currentMonth, uploadedAt: new Date().toISOString() },
};

/**
 * Clone helper som skapar variation per månad (för demo/UI).
 * DeltaFactor < 1 minskar, > 1 ökar.
 */
const cloneWithMonth = (
  base: SeoPeriodReport,
  month: string,
  deltaFactor: number
): SeoPeriodReport => {
  const bumpInt = (v: number) => Math.max(0, Math.round(v * deltaFactor));
  const bumpFloat2 = (v: number) => Number((v * deltaFactor).toFixed(2));

  return {
    ...base,
    periodType: 'monthly',
    periodKey: month,
    month,
    uploadedAt: new Date().toISOString(),
    kpis: {
      impressions: {
        value: bumpInt(base.kpis.impressions.value),
        deltaPercent: base.kpis.impressions.deltaPercent,
      },
      uniqueVisitors: {
        value: bumpInt(base.kpis.uniqueVisitors.value),
        deltaPercent: base.kpis.uniqueVisitors.deltaPercent,
      },
      conversions: {
        value: bumpInt(base.kpis.conversions.value),
        deltaPercent: base.kpis.conversions.deltaPercent,
      },
      clicks: base.kpis.clicks
        ? {
          value: bumpInt(base.kpis.clicks.value),
          deltaPercent: base.kpis.clicks.deltaPercent,
        }
        : undefined,
      ctr: base.kpis.ctr
        ? {
          value: bumpFloat2(base.kpis.ctr.value),
          deltaPercent: base.kpis.ctr.deltaPercent,
        }
        : undefined,
      avgPosition: base.kpis.avgPosition
        ? {
          value: bumpFloat2(base.kpis.avgPosition.value),
          deltaPercent: base.kpis.avgPosition.deltaPercent,
        }
        : undefined,
    },
    trafficTimeline: base.trafficTimeline.map((p) => ({
      ...p,
      impressions: bumpInt(p.impressions),
      sessions: typeof p.sessions === "number" ? bumpInt(p.sessions) : p.sessions,
      clicks: typeof p.clicks === "number" ? bumpInt(p.clicks) : p.clicks,
    })),
  };
};

// Förifyll 5 månader bakåt (nyast -> äldst kan ändras i listAvailableMonths)
(() => {
  const factors = [0.95, 0.9, 0.88, 0.92, 0.85];
  for (let i = 1; i <= 5; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const m = date.toISOString().slice(0, 7);
    reportsByMonth[m] = cloneWithMonth(seoMonthlyReportMock, m, factors[i - 1]);
  }
})();

/**
 * Returnerar tillgängliga månader (YYYY-MM), nyast först.
 */
export const listAvailableMonths = async (): Promise<string[]> => {
  return Object.keys(reportsByMonth).sort((a, b) => (a < b ? 1 : -1));
};

/**
 * Endast publicerade månader.
 */
export const listPublishedMonths = async (): Promise<string[]> => {
  const months = Object.values(reportsByMonth)
    .filter((r) => r.status === "published")
    .map((r) => r.month || r.periodKey);
  return Array.from(new Set(months)).sort((a, b) => (a < b ? 1 : -1));
};

/**
 * Hämtar en rapport för given månad.
 * Om månaden saknas returneras senaste (fallback).
 */
export const getSeoReportByMonth = async (month: string): Promise<SeoPeriodReport> => {
  const r = reportsByMonth[month];
  if (r) return r;

  const latest = (await listAvailableMonths())[0];
  return reportsByMonth[latest];
};

export const getPublishedReportByMonth = async (month: string): Promise<SeoPeriodReport | null> => {
  const published = Object.values(reportsByMonth).find((r) => r.month === month && r.status === "published");
  if (published) return published;
  return null;
};

/**
 * Skapar/uppdaterar en rapport (i minnet).
 * Används vid upload eller när admin publicerar en rapport.
 */
export const upsertSeoReport = async (report: SeoPeriodReport): Promise<void> => {
  if (report.periodKey) {
    reportsByMonth[report.periodKey] = report;
  } else if (report.month) {
    reportsByMonth[report.month] = report;
  }
};


/**
 * TODO (Backend): Byt implementation i denna fil till API.
 *
 * listAvailableMonths() -> GET /seo-report/:customerId/months
 * getSeoReportByMonth(month) -> GET /seo-report/:customerId/:month
 * upsertSeoReport(report) -> PUT/POST /seo-report/:customerId/:month
 */
