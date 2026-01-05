import { read, utils } from 'xlsx';
import type { SeoPeriodReport, Keyword, TrafficData, ChannelData, Kpis } from '../types/seoReport';

// Internal structure to hold normalized table data from any source
type NormalizedTable = {
    name: string; // Sheet name or Table ID
    headers: string[];
    rows: any[];
};

// Dictionary for column matching
const SYNONYMS: Record<string, string[]> = {
    keyword: ['keyword', 'sökord', 'term', 'query', 'key'],
    position: ['position', 'rank', 'pos', 'current position', 'nuvarande position'],
    baseline: ['baseline', 'start rank', 'start position'],
    group: ['group', 'grupp', 'category', 'kategori'],
    searchVolume: ['volume', 'volym', 'sökvolym', 'search volume'],

    impressions: ['impressions', 'visningar', 'imps', 'views'],
    clicks: ['clicks', 'klick', 'visits'],
    sessions: ['sessions', 'besökare', 'visitors', 'users', 'användare'],
    conversions: ['conversions', 'konverteringar', 'goals', 'mål', 'leads'],

    date: ['date', 'datum', 'day', 'dag', 'period'],

    medium: ['medium', 'kanal', 'source', 'källa', 'channel', 'trafikkälla'],
    device: ['device', 'enhet', 'platform']
};

const normalizeHeader = (h: string) => String(h || '').toLowerCase().trim();

const findColumnKey = (headers: string[], targetField: string): string | undefined => {
    const targets = SYNONYMS[targetField] || [targetField];
    return headers.find(h => targets.some(t => normalizeHeader(h).includes(t)));
};

/**
 * The Engine: Parses XLSX, CSV, or HTML into a partial SeoPeriodReport.
 */
export const parseSeoReportExcel = async (file: File): Promise<Partial<SeoPeriodReport>> => {
    const fileType = file.name.split('.').pop()?.toLowerCase();

    let tables: NormalizedTable[] = [];

    if (fileType === 'xlsx' || fileType === 'xls' || fileType === 'csv') {
        tables = await parseSpreadsheet(file);
    } else if (fileType === 'html' || fileType === 'htm') {
        tables = await parseHtml(file);
    } else {
        // Try spreadsheet parsing for unknown types or assume it's one of them
        try {
            tables = await parseSpreadsheet(file);
        } catch {
            // Fallback to text/html parsing
            tables = await parseHtml(file);
        }
    }

    return processTables(tables);
};

// --- Parsers ---

const parseSpreadsheet = async (file: File): Promise<NormalizedTable[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = read(data, { type: 'array' });

                const tables: NormalizedTable[] = workbook.SheetNames.map(name => {
                    const sheet = workbook.Sheets[name];
                    const json = utils.sheet_to_json<any>(sheet, { header: 1 }); // Array of arrays
                    if (json.length === 0) return null;

                    const headers = (json[0] as any[]).map(String);
                    const rows = json.slice(1).map(r => {
                        const obj: any = {};
                        headers.forEach((h, i) => {
                            obj[h] = r[i];
                        });
                        return obj;
                    });

                    return { name, headers, rows };
                }).filter(t => t !== null) as NormalizedTable[];

                resolve(tables);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
};

const parseHtml = async (file: File): Promise<NormalizedTable[]> => {
    const text = await file.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const tableEls = doc.querySelectorAll('table');

    const tables: NormalizedTable[] = [];
    tableEls.forEach((table, index) => {
        const rows = Array.from(table.rows);
        if (rows.length === 0) return;

        // Assume first row is header
        const headerCells = Array.from(rows[0].cells).map(c => c.textContent?.trim() || '');
        const dataRows = rows.slice(1).map(r => {
            const obj: any = {};
            const cells = Array.from(r.cells);
            headerCells.forEach((h, i) => {
                obj[h] = cells[i]?.textContent?.trim();
            });
            return obj;
        });

        tables.push({
            name: table.id || `Table ${index + 1}`,
            headers: headerCells,
            rows: dataRows
        });
    });

    return tables;
};

// --- Heuristic Processor ---

const processTables = (tables: NormalizedTable[]): Partial<SeoPeriodReport> => {
    const result: Partial<SeoPeriodReport> = {};

    for (const table of tables) {
        if (!table.rows.length) continue;

        // SCORING HEURISTICS
        const h = table.headers;

        // 1. Check for Keywords
        const keyKey = findColumnKey(h, 'keyword');
        const posKey = findColumnKey(h, 'position');
        if (keyKey && posKey) {
            result.keywords = table.rows.map(r => ({
                keyword: String(r[keyKey] || ''),
                position: Number(r[posKey] || 0),
                baseline: r[findColumnKey(h, 'baseline')!] ? Number(r[findColumnKey(h, 'baseline')!]) : undefined,
                group: r[findColumnKey(h, 'group')!] ? String(r[findColumnKey(h, 'group')!]) : undefined,
                searchVolume: r[findColumnKey(h, 'searchVolume')!] ? Number(r[findColumnKey(h, 'searchVolume')!]) : undefined
            })).filter(k => k.keyword);
        }

        // 2. Check for Traffic Timeline
        const dateKey = findColumnKey(h, 'date');
        const impKey = findColumnKey(h, 'impressions');
        const clicksKey = findColumnKey(h, 'clicks');

        // If we have Date AND (Impressions OR Clicks OR Sessions)
        // Avoid confusing with just a list of dates.
        if (dateKey && (impKey || clicksKey)) {
            const traffic: TrafficData[] = table.rows.map(r => {
                // Date parsing attempt
                let dateStr = r[dateKey];
                if (typeof dateStr === 'number') {
                    // Excel serial date approximation
                    const d = new Date(Math.round((dateStr - 25569) * 86400 * 1000));
                    dateStr = d.toISOString().split('T')[0];
                } else {
                    // Try parsing string date
                    const d = new Date(dateStr);
                    if (!isNaN(d.getTime())) dateStr = d.toISOString().split('T')[0];
                }

                return {
                    date: String(dateStr || ''),
                    impressions: Number(r[impKey!] || 0),
                    clicks: Number(r[clicksKey!] || 0),
                    sessions: r[findColumnKey(h, 'sessions')!] ? Number(r[findColumnKey(h, 'sessions')!]) : undefined
                };
            }).filter(t => t.date && t.date.length === 10); // Simple validation YYYY-MM-DD length check (approx)

            if (traffic.length > 0) result.trafficTimeline = traffic;
        }

        // 3. Check for Channels
        const mediumKey = findColumnKey(h, 'medium');
        const sessKey = findColumnKey(h, 'sessions');
        // Ensure it's not the timeline (date check)
        if (mediumKey && sessKey && !dateKey) {
            result.channels = table.rows.map(r => ({
                medium: String(r[mediumKey] || 'other').toLowerCase(),
                sessions: Number(r[sessKey] || 0),
                conversions: r[findColumnKey(h, 'conversions')!] ? Number(r[findColumnKey(h, 'conversions')!]) : 0
            }));
        }

        // 4. KPIs (Vertical table check)
        // If a table has headers 'Metric', 'Value', 'Delta' OR if it's a 2-column table with text + number
        const metricKey = h.find(x => ['metric', 'mätvärde', 'nyckeltal', 'kpi'].includes(normalizeHeader(x)));
        const valueKey = h.find(x => ['value', 'värde', 'resultat', 'antal'].includes(normalizeHeader(x)));

        if (metricKey && valueKey) {
            const kpis: Partial<Kpis> = {};
            const deltaKey = h.find(x => ['delta', 'change', 'förändring'].includes(normalizeHeader(x)));

            table.rows.forEach(r => {
                const key = String(r[metricKey] || '').toLowerCase().trim();
                const val = Number(r[valueKey] || 0);
                const delta = deltaKey ? Number(r[deltaKey]) : undefined;

                // Re-use mapping logic
                if (key.match(/visningar|impressions/)) kpis.impressions = { value: val, deltaPercent: delta || 0 };
                else if (key.match(/unika|unique/)) kpis.uniqueVisitors = { value: val, deltaPercent: delta || 0 };
                else if (key.match(/konv|conv/)) kpis.conversions = { value: val, deltaPercent: delta || 0 };
                else if (key.match(/pos|rank/)) kpis.avgPosition = { value: val, deltaPercent: delta || 0 };
                else if (key.match(/klick|click/)) kpis.clicks = { value: val, deltaPercent: delta || 0 };
                else if (key.match(/ctr/)) kpis.ctr = { value: val, deltaPercent: delta || 0 };
            });

            if (Object.keys(kpis).length > 0) {
                result.kpis = kpis as Kpis;
            }
        }
    }

    return result;
};
