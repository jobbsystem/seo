import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { google } from "googleapis";

admin.initializeApp();
const db = admin.firestore();

// --- Configuration ---
// Best practice: Use a dedicated Service Account for the automation
// Ensure this account has 'Viewer' access to client properties in GSC/GA4
const auth = new google.auth.GoogleAuth({
    scopes: [
        "https://www.googleapis.com/auth/webmasters.readonly",
        "https://www.googleapis.com/auth/analytics.readonly"
    ],
});

/**
 * Scheduled Job: Runs at 06:00 on the 1st of every month.
 * Fetches data for the previous month for all active customers.
 */
export const generateMonthlyReports = functions.pubsub
    .schedule("0 6 1 * *")
    .timeZone("Europe/Stockholm")
    .onRun(async (context) => {
        console.log("Starting monthly report generation...");

        // 1. Calculate Period (Previous Month)
        const now = new Date();
        // Go back to the first day of previous month to determine the key
        const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const periodKey = prevMonthDate.toISOString().substring(0, 7); // "YYYY-MM"

        // Calculate date range for API queries (First to Last day of prev month)
        const startDate = formatDate(prevMonthDate);
        const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const endDate = formatDate(lastDayOfPrevMonth);

        console.log(`Generating reports for period: ${periodKey} (${startDate} to ${endDate})`);

        // 2. Fetch Active Customers
        const customersSnapshot = await db.collection("customers")
            .where("active", "==", true)
            .get();

        if (customersSnapshot.empty) {
            console.log("No active customers found.");
            return;
        }

        const results = { success: 0, failed: 0 };

        for (const doc of customersSnapshot.docs) {
            const customer = doc.data();
            console.log(`Processing customer: ${customer.name} (${customer.id})`);

            try {
                // Skip if no configured properties
                if (!customer.gscUrl && !customer.ga4PropertyId) {
                    console.warn(`Skipping ${customer.name}: No GSC URL or GA4 ID configured.`);
                    continue;
                }

                // 3. Fetch Data
                const searchData = await fetchSearchConsoleData(customer.gscUrl, startDate, endDate, auth);
                const analyticsData = await fetchGA4Data(customer.ga4PropertyId, startDate, endDate, auth);

                // 4. Construct Report
                const report = {
                    customerId: customer.id,
                    periodType: "monthly",
                    periodKey: periodKey,
                    month: periodKey,
                    rangeLabel: getMonthName(prevMonthDate),
                    rangeStart: startDate,
                    rangeEnd: endDate,

                    uploadedAt: new Date().toISOString(),
                    status: "draft", // Always start as draft

                    kpis: {
                        impressions: { value: searchData.impressions, deltaPercent: 0 }, // TODO: Calc delta vs prev month
                        clicks: { value: searchData.clicks, deltaPercent: 0 },
                        uniqueVisitors: { value: analyticsData.activeUsers, deltaPercent: 0 },
                        conversions: { value: analyticsData.conversions, deltaPercent: 0 },
                        avgPosition: { value: searchData.avgPosition, deltaPercent: 0 },
                        ctr: { value: searchData.ctr, deltaPercent: 0 },
                        // Placeholders for data we might not have yet
                        organicVisitors: { value: analyticsData.organicUsers, deltaPercent: 0 },
                        organicConversions: { value: analyticsData.organicConversions, deltaPercent: 0 },
                    },

                    trafficTimeline: searchData.timeline,
                    keywords: searchData.keywords,

                    // Defaults/Placeholders
                    services: customer.services || [],
                    indicators: [],
                    channels: analyticsData.channels,
                    deviceSplit: analyticsData.deviceSplit,
                    conversionsByType: analyticsData.conversionsByType
                };

                // 5. Save to Firestore
                // Use a deterministic ID so we don't create duplicates if job re-runs
                const reportId = `${customer.id}_monthly_${periodKey}`;
                await db.collection("reports").doc(reportId).set(report, { merge: true });

                console.log(`Successfully generated report for ${customer.name}`);
                results.success++;

            } catch (error) {
                console.error(`Failed to generate report for ${customer.name}:`, error);
                results.failed++;
            }
        }

        console.log(`Job complete. Success: ${results.success}, Failed: ${results.failed}`);
    });

// --- Helper Functions ---

function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

function getMonthName(date: Date): string {
    return date.toLocaleDateString("sv-SE", { month: "long", year: "numeric" });
}

async function fetchSearchConsoleData(siteUrl: string | undefined, startDate: string, endDate: string, auth: any) {
    if (!siteUrl) return { clicks: 0, impressions: 0, ctr: 0, avgPosition: 0, timeline: [], keywords: [] };

    const searchconsole = google.searchconsole({ version: 'v1', auth });

    // Fetch Totals & Timeline
    const timelineRes = await searchconsole.searchanalytics.query({
        siteUrl: siteUrl,
        requestBody: {
            startDate,
            endDate,
            dimensions: ['date'],
            rowLimit: 50 // roughly 30-31 days
        }
    });

    const timelineRows = timelineRes.data.rows || [];

    // Aggregates
    let clicks = 0;
    let impressions = 0;
    let positionSum = 0;
    let ctrSum = 0; // Weighted avg would be better, but simple avg for now

    const timeline = timelineRows.map((row: any) => {
        clicks += (row.clicks || 0);
        impressions += (row.impressions || 0);
        positionSum += (row.position || 0) * (row.impressions || 0); // Weighted by impressions for avg

        return {
            date: row.keys[0],
            impressions: row.impressions || 0,
            clicks: row.clicks || 0
        };
    });

    const avgPosition = impressions > 0 ? positionSum / impressions : 0;
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

    // Fetch Top Keywords
    const keywordsRes = await searchconsole.searchanalytics.query({
        siteUrl: siteUrl,
        requestBody: {
            startDate,
            endDate,
            dimensions: ['query'],
            rowLimit: 50
        }
    });

    const keywords = (keywordsRes.data.rows || []).map((row: any) => ({
        keyword: row.keys[0],
        position: Math.round(row.position || 0),
        searchVolume: 0, // GSC doesn't give volume, would need separate API
        baseline: 0,
        group: "General"
    }));

    return { clicks, impressions, avgPosition, ctr, timeline, keywords };
}

async function fetchGA4Data(propertyId: string | undefined, startDate: string, endDate: string, auth: any) {
    if (!propertyId) return { activeUsers: 0, conversions: 0, organicUsers: 0, organicConversions: 0, channels: [], deviceSplit: [], conversionsByType: [] };

    const analyticsData = google.analyticsdata({ version: 'v1beta', auth });

    // Basic Metrics
    const response = await analyticsData.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
            dateRanges: [{ startDate, endDate }],
            metrics: [
                { name: 'activeUsers' },
                { name: 'conversions' },
                { name: 'sessions' }
            ],
            dimensions: [{ name: 'sessionDefaultChannelGroup' }]
        }
    });

    let activeUsers = 0;
    let conversions = 0;
    let organicUsers = 0;
    let organicConversions = 0;

    const channels: any[] = [];

    // Parse Response
    const rows = response.data.rows || [];
    rows.forEach((row: any) => {
        const channel = row.dimensionValues[0].value;
        const users = parseInt(row.metricValues[0].value);
        const conv = parseInt(row.metricValues[1].value);
        const sessions = parseInt(row.metricValues[2].value);

        activeUsers += users;
        conversions += conv;

        if (channel === 'Organic Search') {
            organicUsers += users;
            organicConversions += conv;
        }

        channels.push({
            medium: channel,
            sessions: sessions,
            conversions: conv
        });
    });

    return {
        activeUsers,
        conversions,
        organicUsers,
        organicConversions,
        channels,
        deviceSplit: [], // TODO: distinct query for devices
        conversionsByType: [] // TODO: distinct query for event names
    };
}
