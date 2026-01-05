import type { SeoPeriodReport } from '../types/seoReport';
import type { AdminCustomer, AdminNotification, DraftGenerationJob, ReportStatus } from '../types/admin';
import { adminCustomersMock } from './admin.customers';
import { addNotification as addBellNotification } from './notifications.repo';

const uid = () => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);

const LS_KEY_REPORTS = 'admin:reports';
const LS_KEY_NOTIFS = 'admin:notifs';
const LS_KEY_JOBS = 'admin:jobs';

const customers: AdminCustomer[] = adminCustomersMock;

const inMemoryReports: Record<string, SeoPeriodReport & { customerId: string; status: ReportStatus }> = {};
const inMemoryNotifications: AdminNotification[] = [];
const inMemoryJobs: DraftGenerationJob[] = [];

const loadLs = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const saveLs = (key: string, data: any) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
};

// init from LS
(() => {
  Object.assign(inMemoryReports, loadLs(LS_KEY_REPORTS, {}));
  const notifs = loadLs<AdminNotification[]>(LS_KEY_NOTIFS, []);
  inMemoryNotifications.push(...notifs);
  const jobs = loadLs<DraftGenerationJob[]>(LS_KEY_JOBS, []);
  inMemoryJobs.push(...jobs);
})();

const persist = () => {
  saveLs(LS_KEY_REPORTS, inMemoryReports);
  saveLs(LS_KEY_NOTIFS, inMemoryNotifications);
  saveLs(LS_KEY_JOBS, inMemoryJobs);
};

export const listCustomers = async (): Promise<AdminCustomer[]> => customers;

export const listDrafts = async (): Promise<(SeoPeriodReport & { customerId: string; status: ReportStatus })[]> => {
  return Object.values(inMemoryReports).filter(r => r.status === 'draft');
};

export const listPublished = async (): Promise<(SeoPeriodReport & { customerId: string; status: ReportStatus })[]> => {
  return Object.values(inMemoryReports).filter(r => r.status === 'published');
};

export const upsertReport = async (report: SeoPeriodReport & { customerId: string; status: ReportStatus }) => {
  const key = `${report.customerId}:${report.month}`;
  inMemoryReports[key] = report;
  persist();
};

export const publishReport = async (customerId: string, month: string) => {
  const key = `${customerId}:${month}`;
  const r = inMemoryReports[key];
  if (!r) throw new Error('Report not found');
  inMemoryReports[key] = { ...r, status: 'published' };
  const notif: AdminNotification = {
    id: uid(),
    createdAt: new Date().toISOString(),
    title: 'Rapport publicerad',
    message: `SEO-rapporten för ${month} är publicerad.`,
    level: 'success',
    read: false,
    customerId,
    month,
  };
  inMemoryNotifications.unshift(notif);
  persist();
  await addBellNotification(notif);
  return inMemoryReports[key];
};

export const listNotifications = async (): Promise<AdminNotification[]> => inMemoryNotifications;
export const markNotificationRead = async (id: string) => {
  const n = inMemoryNotifications.find((x) => x.id === id);
  if (n) n.read = true;
  persist();
};

export const simulateDraftJob = async (month: string): Promise<DraftGenerationJob> => {
  const job: DraftGenerationJob = {
    id: uid(),
    createdAt: new Date().toISOString(),
    month,
    customersProcessed: customers.length,
    draftsCreated: customers.length,
    status: 'ok',
  };
  inMemoryJobs.unshift(job);
  // create placeholder drafts
  customers.forEach((c, idx) => {
    const key = `${c.id}:${month}`;
    inMemoryReports[key] = {
      ...(inMemoryReports[key] || {
        customerId: c.id,
        periodType: 'monthly',
        periodKey: month,
        month,
        rangeLabel: 'Senaste 30 dagarna',
        uploadedAt: new Date().toISOString(),
        status: 'draft' as ReportStatus,
        kpis: {
          impressions: { value: 25000 + idx * 1200, deltaPercent: 2 },
          uniqueVisitors: { value: 480 + idx * 24, deltaPercent: -3 },
          conversions: { value: 12 + idx, deltaPercent: -5 },
        },
        trafficTimeline: [],
        services: [],
        indicators: [],
        channels: [],
        keywords: [],
        deviceSplit: [],
        conversionsByType: [],
      }),
      status: 'draft',
    };
  });
  persist();
  return job;
};

export const listJobs = async (): Promise<DraftGenerationJob[]> => inMemoryJobs;
