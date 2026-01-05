import type { SeoPeriodReport } from "../types/seoReport";

export interface SeoRepository {
    /**
     * List available periods for a specific customer and type.
     * Returns a list of periodKeys (e.g. ["2026-01", "2025-12"] or ["2026-W02", ...])
      Sorted desc (newest first).
     */
    listPeriods(customerId: string, periodType: "monthly" | "weekly"): Promise<string[]>;

    /**
     * Get a specific report given its key.
     * Returns null if not found.
     */
    getReport(customerId: string, periodType: "monthly" | "weekly", periodKey: string): Promise<SeoPeriodReport | null>;

    /**
     * Get ONLY a published report (for customer view).
     * Returns null if not found or not published.
     */
    getPublishedReport(customerId: string, periodType: "monthly" | "weekly", periodKey: string): Promise<SeoPeriodReport | null>;

    /**
     * Create or update a report (Draft -> Published).
     */
    upsertReport(report: SeoPeriodReport): Promise<void>;

    /**
     * Mark a report as published.
     */
    publishReport(customerId: string, periodType: "monthly" | "weekly", periodKey: string): Promise<void>;

    /**
     * List clients (for admin).
     */
    listCustomers(): Promise<Array<{ id: string; name: string; domain: string }>>;
}
