import type { SeoRepository } from "./SeoRepository";
import type { SeoPeriodReport } from "../types/seoReport";
import { seoMonthlyReportMock } from "../mock/seoMonthlyReport.mock";
import type { AdminCustomer } from "../types/admin";
import { adminRepo } from "./AdminRepository";

const STORAGE_PREFIX = "seo:demo:";

// Seed helpers
const cloneReport = (
    base: any,
    customerId: string,
    periodType: "monthly" | "weekly",
    periodKey: string,
    deltaFactor: number
): SeoPeriodReport => {
    const bumpInt = (v: number) => Math.max(0, Math.round(v * deltaFactor));
    const bumpFloat = (v: number) => Number((v * deltaFactor).toFixed(2));

    // Determine label
    const label = periodType === 'monthly' ? periodKey : `Vecka ${periodKey.split('W')[1] || '?'}`;

    const isOffice = customerId === 'origin' || customerId === 'hedekontor';

    let summary = "Under denna period såg vi en stadig ökning av organisk trafik, drivet främst av förbättrade positioner på era kärnsökord. Konverteringsgraden har också stabiliserats efter förra månadens optimeringar.";
    let actions = [
        { id: "1", title: "Optimerat meta-titlar för produktsidor", date: "2024-12-05", status: "completed" },
        { id: "2", title: "Skapat 2 nya blogginlägg om 'Hållbarhet'", date: "2024-12-12", status: "completed" },
        { id: "3", title: "Teknisk SEO-audit och fix av 404-fel", date: "2024-12-20", status: "completed" }
    ];
    let keywords = base.keywords;

    if (isOffice) {
        summary = "Toppenmånad! Vi ser att sökord inom 'Ergonomi' och 'Kontorsinredning' driver mest trafik. Ni rankar nu topp 3 på 'Höj- och sänkbart skrivbord'.";
        actions = [
            { id: "1", title: "Lanserat ny landningssida för 'Ergonomi'", date: "2025-01-05", status: "completed" },
            { id: "2", title: "Optimerat produkttexter för kontorsstolar", date: "2025-01-12", status: "completed" },
            { id: "3", title: "Fixat laddtider på startsidan (Core Web Vitals)", date: "2025-01-20", status: "completed" }
        ];
        keywords = [
            { keyword: "Kontorsmöbler Stockholm", group: "Geografisk", baseline: 12, position: 3 },
            { keyword: "Höj- och sänkbart skrivbord", group: "Produkt", baseline: 8, position: 2 },
            { keyword: "Ergonomisk kontorsstol", group: "Produkt", baseline: 15, position: 4 },
            { keyword: "Kontorsinredning", group: "Övergripande", baseline: 22, position: 7 },
            { keyword: "Köpa skrivbord", group: "Transaktion", baseline: 9, position: 5 },
            { keyword: "Begagnade kontorsmöbler", group: "Hållbarhet", baseline: 45, position: 12 },
            { keyword: "Skrivbordslampa LED", group: "Tillbehör", baseline: 18, position: 8 },
            { keyword: "Ljudabsorbenter kontor", group: "Miljö", baseline: 30, position: 15 },
            { keyword: "Konferensbord ek", group: "Möbler", baseline: 25, position: 10 },
            { keyword: "Ergonomisk mus", group: "Tillbehör", baseline: 14, position: 6 },
            { keyword: "Monitorarm dubbel", group: "Tillbehör", baseline: 20, position: 9 },
            { keyword: "Kontorsstol mesh", group: "Produkt", baseline: 16, position: 5 },
            { keyword: "Skrivbordsunderlägg", group: "Tillbehör", baseline: 35, position: 18 },
            { keyword: "Whiteboard glas", group: "Inredning", baseline: 28, position: 14 },
            { keyword: "Kabelhantering skrivbord", group: "Tillbehör", baseline: 40, position: 22 },
            { keyword: "Besöksstol", group: "Möbler", baseline: 32, position: 16 },
            { keyword: "Receptionsdisk", group: "Möbler", baseline: 50, position: 25 },
            { keyword: "Arkivskåp låsbart", group: "Förvaring", baseline: 24, position: 11 },
            { keyword: "Fotstöd kontor", group: "Ergonomi", baseline: 19, position: 8 },
            { keyword: "Balanspall", group: "Ergonomi", baseline: 26, position: 13 },
            { keyword: "Laptopstativ justerbart", group: "Tillbehör", baseline: 21, position: 10 }
        ];
    }

    return {
        ...base,
        customerId,
        periodType,
        periodKey,
        month: periodType === 'monthly' ? periodKey : undefined,
        rangeLabel: label,
        uploadedAt: new Date().toISOString(),
        status: "published", // Default seeded to published for demo effect
        executiveSummary: summary,
        completedActions: actions as any,
        kpis: {
            impressions: { value: bumpInt(base.kpis.impressions.value), deltaPercent: base.kpis.impressions.deltaPercent },
            uniqueVisitors: { value: bumpInt(base.kpis.uniqueVisitors.value), deltaPercent: base.kpis.uniqueVisitors.deltaPercent },
            conversions: { value: bumpInt(base.kpis.conversions.value), deltaPercent: base.kpis.conversions.deltaPercent },
            avgPosition: { value: bumpFloat(base.kpis.avgPosition.value), deltaPercent: base.kpis.avgPosition.deltaPercent },
            clicks: { value: bumpInt(base.kpis.clicks.value), deltaPercent: base.kpis.clicks.deltaPercent },
            organicVisitors: { value: bumpInt(base.kpis.organicVisitors.value), deltaPercent: base.kpis.organicVisitors.deltaPercent },
            organicConversions: { value: bumpInt(base.kpis.organicConversions.value), deltaPercent: base.kpis.organicConversions.deltaPercent },
            ctr: { value: bumpFloat(base.kpis.ctr.value), deltaPercent: base.kpis.ctr.deltaPercent },
        },
        trafficTimeline: base.trafficTimeline.map((p: any) => ({
            ...p,
            impressions: bumpInt(p.impressions),
        })),
        // Keep other arrays as is for now, or randomize slightly if needed
        services: base.services,
        indicators: base.indicators,
        channels: [
            ...base.channels,
            { medium: "email", sessions: 5, conversions: 1 },
            { medium: "display", sessions: 2, conversions: 0 }
        ],
        keywords: keywords,
        deviceSplit: base.deviceSplit,
        conversionsByType: base.conversionsByType,

    };
};

export class DemoSeoRepository implements SeoRepository {
    private inMemoryCache: Map<string, SeoPeriodReport> = new Map();

    constructor() {
        this.seedIfNeeded();
    }

    private seedCustomers() {
        if (typeof window === "undefined") return;
        const key = "seo:demo:customers_v3"; // Bumped version to v3 to align with admin mock
        if (localStorage.getItem(key)) return;

        // Seed default customers from admin mock
        const defaults: AdminCustomer[] = [
            {
                id: "origin",
                name: "Origin.se",
                domain: "origin.se",
                contactEmail: "report@origin.se",
                active: true,
                contacts: [{ id: "c1", name: "Admin", role: "Owner", email: "report@origin.se" }],
                services: [{ id: "seo", name: "SEO Pro", status: "active", startDate: "2024-01-01" }],
                technical: { cms: "WordPress", hosting: "Oderland" }
            },
            {
                id: "trad",
                name: "Tandläkare.se",
                domain: "tandläkare.se",
                contactEmail: "info@tandläkare.se",
                active: true,
                contacts: [{ id: "c1", name: "Anna", role: "Manager", email: "info@tandläkare.se" }],
                services: [{ id: "seo", name: "SEO Bas", status: "active", startDate: "2023-05-01" }],
                technical: { cms: "Custom", hosting: "AWS" }
            },
            {
                id: "hedekontor",
                name: "Kontor.se",
                domain: "kontorshotell.se",
                contactEmail: "info@kontorshotell.se",
                active: true,
                contacts: [{ id: "c1", name: "Erik", role: "CEO", email: "info@kontorshotell.se" }],
                services: [{ id: "seo", name: "SEO Standard", status: "active", startDate: "2024-02-15" }],
                technical: { cms: "Wix", hosting: "Wix" }
            },
        ];
        localStorage.setItem(key, JSON.stringify(defaults));
        // Update current pointer
        localStorage.setItem("seo:demo:customers_current_key", key);
    }


    private getKey(customerId: string, periodType: string, periodKey: string) {
        return `${STORAGE_PREFIX}${customerId}:${periodType}:${periodKey}`;
    }

    private seedIfNeeded() {
        if (typeof window === "undefined") return;

        // Check if we have data (bumped version to force re-seed for 2025-2026 range)
        const existing = localStorage.getItem("seo:demo:init_v10");
        if (existing) return;

        // Seed Data
        const customers = ["origin", "trad", "hedekontor"];
        // Generate months from 2025-01 to 2026-01
        const months = [
            "2026-01",
            "2025-12", "2025-11", "2025-10", "2025-09",
            "2025-08", "2025-07", "2025-06", "2025-05",
            "2025-04", "2025-03", "2025-02", "2025-01"
        ];
        const weeks = ["2026-W01", "2025-W52", "2025-W51"];

        customers.forEach(custId => {
            // Seed Monthly
            months.forEach((m, i) => {
                const factor = 1 - (i * 0.02); // gentle curve
                const report = cloneReport(seoMonthlyReportMock, custId, "monthly", m, factor);

                // Latest month as draft to demo workflow, others published
                if (m === '2026-01') {
                    report.status = "draft";
                } else {
                    report.status = "published";
                    // Spread published dates out
                    report.publishedAt = new Date(2025, 11 - i, 15).toISOString();
                }

                this.saveToStorage(report);
            });

            // Seed Weekly
            weeks.forEach((w, i) => {
                const factor = 0.25;
                const report = cloneReport(seoMonthlyReportMock, custId, "weekly", w, factor);
                report.status = "published";
                this.saveToStorage(report);
            });
        });

        localStorage.setItem("seo:demo:init_v10", "true");
        console.log("DemoSeoRepository: Seeded local storage (v10).");
    }

    private saveToStorage(report: SeoPeriodReport) {
        const key = this.getKey(report.customerId, report.periodType, report.periodKey);
        localStorage.setItem(key, JSON.stringify(report));
        this.inMemoryCache.set(key, report);
    }

    private loadFromStorage(customerId: string, periodType: string, periodKey: string): SeoPeriodReport | null {
        const key = this.getKey(customerId, periodType, periodKey);
        if (this.inMemoryCache.has(key)) return this.inMemoryCache.get(key)!;

        const raw = localStorage.getItem(key);
        if (!raw) return null;

        try {
            const data = JSON.parse(raw);
            this.inMemoryCache.set(key, data);
            return data;
        } catch (e) {
            return null;
        }
    }

    async listPeriods(customerId: string, periodType: "monthly" | "weekly"): Promise<string[]> {
        // Scan localStorage for keys matching prefix
        const keys: string[] = [];
        if (typeof window !== 'undefined') {
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k?.startsWith(`${STORAGE_PREFIX}${customerId}:${periodType}:`)) {
                    // Extract periodKey
                    const parts = k.split(':');
                    if (parts.length >= 5) {
                        keys.push(parts[4]);
                    }
                }
            }
        }
        return keys.sort().reverse();
    }

    async getReport(customerId: string, periodType: "monthly" | "weekly", periodKey: string): Promise<SeoPeriodReport | null> {
        return this.loadFromStorage(customerId, periodType, periodKey);
    }

    async getPublishedReport(customerId: string, periodType: "monthly" | "weekly", periodKey: string): Promise<SeoPeriodReport | null> {
        const r = this.loadFromStorage(customerId, periodType, periodKey);
        if (r && r.status === 'published') return r;
        return null;
    }

    async upsertReport(report: SeoPeriodReport): Promise<void> {
        this.saveToStorage(report);
    }

    async publishReport(customerId: string, periodType: "monthly" | "weekly", periodKey: string): Promise<void> {
        const r = await this.getReport(customerId, periodType, periodKey);
        if (r) {
            r.status = 'published';
            // Set publishedAt to current date in Sweden
            const sweDate = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Stockholm" }); // YYYY-MM-DD
            r.publishedAt = sweDate;
            this.saveToStorage(r);
        }
    }

    private getCustomerStorageKey(): string {
        if (typeof window === 'undefined') return "seo:demo:customers_v3";
        return localStorage.getItem("seo:demo:customers_current_key") || "seo:demo:customers_v3";
    }

    async listCustomers(): Promise<AdminCustomer[]> {
        if (typeof window === "undefined") return [];
        // Use the AdminRepository's storage key as the source of truth
        const key = "agency:customers_v1";
        const raw = localStorage.getItem(key);
        if (!raw) {
            // If empty, trigger AdminRepository seed via simple check
            // (In real app, this dependency would be better managed)
            return [];
        }

        try {
            const agencyCustomers: any[] = JSON.parse(raw);
            // Map AgencyCustomer to (legacy) AdminCustomer format if needed
            return agencyCustomers.map(ac => ({
                id: ac.id,
                name: ac.companyName,
                domain: ac.domain,
                contactEmail: ac.reportSettings?.recipientEmails?.[0] || ac.id + "@demo.se",
                active: ac.active,
                // Map extended fields if they exist in AgencyCustomer or leave incomplete
                contacts: [], // AgencyCustomer structure might differ, handling minimally for now
                services: [],
                technical: {
                    cms: "",
                    hosting: ""
                }
            }));
        } catch (e) {
            console.error("Failed to parse agency customers", e);
            return [];
        }
    }

    async addCustomer(customer: Omit<AdminCustomer, "id">): Promise<AdminCustomer> {
        const customers = await this.listCustomers();
        const newCustomer: AdminCustomer = {
            ...customer,
            id: `kund${customers.length + 1}-${Date.now().toString(36)}` // Simple unique ID
        };
        customers.push(newCustomer);
        localStorage.setItem(this.getCustomerStorageKey(), JSON.stringify(customers));

        // Optionally seed initial reports for this new customer?
        await this.generateDraftForCustomer(newCustomer.id, "monthly", "2026-01");

        return newCustomer;
    }

    async updateCustomer(customer: AdminCustomer): Promise<void> {
        const customers = await this.listCustomers();
        const idx = customers.findIndex(c => c.id === customer.id);
        if (idx >= 0) {
            customers[idx] = customer;
            localStorage.setItem(this.getCustomerStorageKey(), JSON.stringify(customers));
        }
    }

    async listAllReports(periodType: "monthly" | "weekly", periodKey: string): Promise<SeoPeriodReport[]> {
        // Use Admin Repo to find actual customers
        const customers = await adminRepo.listCustomers();
        const reports: SeoPeriodReport[] = [];
        for (const c of customers) {
            const r = await this.getReport(c.id, periodType, periodKey);
            if (r) reports.push(r);
        }
        return reports;
    }

    async listRecentPublishedReports(limit: number = 20): Promise<SeoPeriodReport[]> {
        // Inefficient scan, but fine for demo
        const allKeys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k?.startsWith(STORAGE_PREFIX)) allKeys.push(k);
        }

        const reports: SeoPeriodReport[] = [];
        for (const k of allKeys) {
            try {
                const r = JSON.parse(localStorage.getItem(k) || "");
                if (r && r.status === 'published' && r.periodType === 'monthly') {
                    reports.push(r);
                }
            } catch (e) { /* ignore */ }
        }

        // Sort by publishedAt desc, then periodKey desc
        return reports.sort((a, b) => {
            const dateA = a.publishedAt || a.periodKey;
            const dateB = b.publishedAt || b.periodKey;
            return dateB.localeCompare(dateA);
        }).slice(0, limit);
    }

    async generateDrafts(periodType: "monthly" | "weekly", periodKey: string): Promise<{ created: number; existing: number; total: number }> {
        try {
            // Use Admin Repo to find actual customers
            const customers = await adminRepo.listCustomers();
            console.log("Found customers:", customers);
            const activeCustomers = customers.filter(c => c.active !== false);
            console.log("Active customers:", activeCustomers);

            let created = 0;
            let existingCount = 0;

            for (const c of activeCustomers) {
                // Check if exists
                const existing = await this.getReport(c.id, periodType, periodKey);
                if (!existing) {
                    // Create new draft
                    const factor = 0.9 + Math.random() * 0.2;
                    // Safely clone
                    const report = cloneReport(seoMonthlyReportMock, c.id, periodType, periodKey, factor);
                    report.status = 'draft';
                    // Ensure uploadedAt is fresh
                    report.uploadedAt = new Date().toISOString();
                    await this.upsertReport(report);
                    console.log(`Generated draft for ${c.id}`);
                    created++;
                } else {
                    console.log(`Report already exists for ${c.id}`);
                    existingCount++;
                }
            }
            return { created, existing: existingCount, total: activeCustomers.length };
        } catch (e) {
            console.error("Error generating drafts:", e);
            throw e;
        }
    }

    // Helper to generate a single draft report (reused logic)
    private async generateDraftForCustomer(customerId: string, periodType: "monthly" | "weekly", periodKey: string) {
        const report = cloneReport(seoMonthlyReportMock, customerId, periodType, periodKey, 1.0);
        report.status = 'draft';
        await this.upsertReport(report);
    }

    // --- Action Plan Methods ---

    private getActionPlanKey(customerId: string) {
        return `${STORAGE_PREFIX}${customerId}:actionPlan`;
    }

    async getActionPlan(customerId: string): Promise<any | null> {
        const key = this.getActionPlanKey(customerId);
        const raw = localStorage.getItem(key);
        if (raw) return JSON.parse(raw);

        // Auto-seed if missing for demo
        const seed = this.seedActionPlan(customerId);
        localStorage.setItem(key, JSON.stringify(seed));
        return seed;
    }

    async updateActionPlan(plan: any): Promise<void> {
        const key = this.getActionPlanKey(plan.customerId);
        // Update timestamp
        const updated = { ...plan, updatedAt: new Date().toISOString() };
        localStorage.setItem(key, JSON.stringify(updated));
    }

    private seedActionPlan(customerId: string): any {
        return {
            id: `plan-${customerId}`,
            customerId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            businessGoals: "Öka onlineförsäljningen med 20% under 2026.\nEtablera varumärket som marknadsledande inom nischen.",
            seoGoals: "Öka organisk trafik med 15% Y/Y.\nTopp 3-placeringar för 10 prioriterade sökord.\nFörbättra konverteringsgraden från organisk trafik till 2.5%.",
            statusAnalysis: "Webbplatsen har en solid grund men lider av långsamma laddtider på mobila enheter (CWV).\n\nBra grundinnehåll, men saknar djupgående guider för att fånga 'top-of-funnel' trafik.\n\nStark synlighet lokalt, men svagare nationellt på generiska termer. Inga tidigare straff. Stabil tillväxt senaste året.",
            actionAreas: [
                {
                    id: "tech",
                    title: "Teknisk SEO",
                    status: "in-progress",
                    progress: 50,
                    activities: [
                        { id: "t1", description: "Optimera bilder och script för bättre Core Web Vitals", status: "pending", estHours: 4 },
                        { id: "t2", description: "Rensa upp 404-fel och redirect-kedjor", status: "done", estHours: 2 }
                    ]
                },
                {
                    id: "content",
                    title: "Content & Innehåll",
                    status: "not-started",
                    progress: 0,
                    activities: [
                        { id: "c1", description: "Producera 2 artiklar om 'Hållbarhet'", status: "pending", estHours: 6 },
                        { id: "c2", description: "Uppdatera landningssida för 'Tjänster'", status: "pending", estHours: 3 }
                    ]
                },
                {
                    id: "links",
                    title: "Länkar & Auktoritet",
                    status: "not-started",
                    progress: 0,
                    activities: [
                        { id: "l1", description: "Outreach till relevanta branschbloggar", status: "pending", estHours: 8 }
                    ]
                }
            ]
        };
    }
}

// Singleton instance
export const demoRepo = new DemoSeoRepository();
