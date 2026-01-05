import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import {
  ArrowTrendingUpIcon, ArrowTrendingDownIcon, CalendarIcon, ShareIcon,
  BellIcon, MagnifyingGlassIcon, ArrowUpTrayIcon, ArrowDownTrayIcon,
  CheckCircleIcon, ClockIcon, DocumentArrowDownIcon, ChevronDownIcon, ChevronUpIcon,
  FlagIcon, PresentationChartLineIcon, SparklesIcon, DocumentTextIcon
} from '@heroicons/react/24/outline';

import GlassCard from './ui/GlassCard';
import Button from './ui/Button';
import Badge from './ui/Badge';
import type { SeoPeriodReport } from './types/seoReport';
// New Repository Pattern
import { demoRepo } from './api/DemoSeoRepository';
import ActionPlanView from './ActionPlanView';

type RangeKey = '7d' | '30d' | '90d' | '6m' | '1y' | '2y' | '3y' | '4y' | '5y';
const STORAGE_KEY = "seo:lastPeriod";
// Hardcoded for demo view
const DEMO_CUSTOMER_ID = 'origin';

const formatNumber = (n: number) => new Intl.NumberFormat('sv-SE').format(n);
const formatPercent = (n: number) =>
  `${new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 1 }).format(n)}%`;

// --- Tab Component ---
const TabButton = ({ label, active, onClick, icon: Icon }: { label: string; active: boolean; onClick: () => void; icon: any }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-full transition-all duration-200 ${active
      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
      : 'bg-white/50 text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-md'
      }`}
  >
    <Icon className="w-5 h-5" />
    {label}
  </button>
);

interface SeoPageProps {
  initialTab?: 'report' | 'plan';
}

const SeoPage: React.FC<SeoPageProps> = ({ initialTab = 'report' }) => {
  const [activeTab, setActiveTab] = useState<'report' | 'plan'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [periods, setPeriods] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(STORAGE_KEY) || '';
  });

  const [report, setReport] = useState<SeoPeriodReport | null>(null);
  const [loading, setLoading] = useState(false);

  // UI state
  const [range, setRange] = useState<RangeKey>('90d');
  const [search, setSearch] = useState('');
  const [expandedKeywords, setExpandedKeywords] = useState(false);

  // Initial Load
  useEffect(() => {
    const init = async () => {
      const avail = await demoRepo.listPeriods(DEMO_CUSTOMER_ID, 'monthly');
      setPeriods(avail);
      if (avail.length > 0) {
        // Demo default override
        const DEMO_DEFAULT = '2025-10';
        if (avail.includes(DEMO_DEFAULT)) {
          setSelectedPeriod(DEMO_DEFAULT);
        } else {
          const last = localStorage.getItem(STORAGE_KEY);
          const initial = last && avail.includes(last) ? last : avail[0];
          setSelectedPeriod(initial);
        }
      }
    };
    init();
  }, []);

  // Fetch Report on Selection
  useEffect(() => {
    if (!selectedPeriod) return;

    const fetchReport = async () => {
      setLoading(true);
      localStorage.setItem(STORAGE_KEY, selectedPeriod);
      const r = await demoRepo.getPublishedReport(DEMO_CUSTOMER_ID, 'monthly', selectedPeriod);
      setReport(r);
      setLoading(false);
    };
    fetchReport();
  }, [selectedPeriod]);



  // Derived state from 'report'
  const filteredTimeline = useMemo(() => {
    const data = report?.trafficTimeline ?? [];
    if (data.length === 0) return [];
    const takeLast = (count: number) => data.slice(Math.max(0, data.length - count));
    // Simple logic: map range to days
    const mapCount: Record<RangeKey, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '6m': 180,
      '1y': 365,
      '2y': 730,
      '3y': 1095,
      '4y': 1460,
      '5y': 1825
    };
    return takeLast(mapCount[range] || 1825);
  }, [report, range]);

  const chartData = useMemo(() => {
    return filteredTimeline.map((p) => ({
      name: new Date(p.date).toLocaleDateString('sv-SE', { day: '2-digit', month: '2-digit' }),
      visningar: p.impressions,
      klick: p.clicks,
      sessioner: p.sessions,
    }));
  }, [filteredTimeline]);

  const activeServicesLeft = useMemo(() => (report?.services ?? []).map(s => ({ name: s.name, active: s.active })), [report]);
  const indicatorsRight = useMemo(() => report?.indicators ?? [], [report]);
  const keywordRows = useMemo(() => {
    const rows = (report?.keywords ?? []).slice();
    const q = search.trim().toLowerCase();
    const filtered = q ? rows.filter(r => r.keyword.toLowerCase().includes(q)) : rows;
    return filtered.sort((a, b) => a.position - b.position).slice(0, 20);
  }, [report, search]);

  const channelRows = useMemo(() => {
    return (report?.channels ?? []).slice().sort((a, b) => b.sessions - a.sessions);
  }, [report]);

  const deviceChartData = useMemo(() => {
    return (report?.deviceSplit ?? []).map(d => ({
      name: d.device === 'mobile' ? 'Mobile' : d.device === 'desktop' ? 'Desktop' : 'Tablet',
      value: d.percent
    }));
  }, [report]);

  const conversionsBarData = useMemo(() => {
    return (report?.conversionsByType ?? []).map(x => ({ name: x.type, count: x.count }));
  }, [report]);

  // Handlers
  const handleDownloadCsv = () => {
    if (!report) return;

    // Create CSV content for keywords
    const headers = ['Sökord', 'Grupp', 'Position', 'Baseline', 'Uppladdad'];
    const rows = report.keywords.map(k => [
      `"${k.keyword.replace(/"/g, '""')}"`,
      `"${(k.group || '').replace(/"/g, '""')}"`,
      k.position,
      k.baseline || '',
      report.uploadedAt
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `seo_report_${report.periodKey}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-8">

      {/* Header Banner - SIMPLIFIED for Tab handling */}
      <GlassCard className="p-4 sm:p-5 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-xl text-white font-bold shadow-lg shadow-slate-900/20">
              {DEMO_CUSTOMER_ID.substring(0, 1).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {activeTab === 'report' ? 'SEO Resultat' : 'Handlingsplan & Strategi'}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="success" className="px-2 py-0.5 text-[10px] uppercase tracking-wider">
                  {DEMO_CUSTOMER_ID}
                </Badge>
                <span className="text-slate-400 text-sm">|</span>
                <span className="text-slate-500 text-sm font-medium">
                  {activeTab === 'report' ? 'Månadsrapport' : 'Aktuell Roadmap'}
                </span>
              </div>
            </div>
          </div>


          {/* Moved Period Selector */}
          {activeTab === 'report' && (
            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 shadow-sm border border-slate-200/60 transition-all hover:border-blue-400/50">
              <CalendarIcon className="h-5 w-5 text-blue-500" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer pr-2 min-w-[140px]"
              >
                {periods.map(p => <option key={p} value={p}>{p}</option>)}
                {periods.length === 0 && <option>Inga rapporter</option>}
              </select>
            </div>
          )}
        </div>
      </GlassCard >

      {/* VIEW: Action Plan */}
      {
        activeTab === 'plan' && (
          <ActionPlanView customerId={DEMO_CUSTOMER_ID} />
        )
      }

      {/* VIEW: Report (Existing) */}
      {
        activeTab === 'report' && (
          <div className="space-y-5 animate-fade-in">



            {/* Loading or Empty State */}
            {loading && <div className="text-center py-12 text-slate-400 animate-pulse">Laddar statistik...</div>}

            {!loading && !report && (
              <div className="p-12 text-center text-slate-500 bg-white/50 rounded-2xl border border-dashed border-slate-300">
                Ingen data tillgänglig för vald period.
              </div>
            )}

            {!loading && report && (
              <>
                {/* KPI GRID 4x2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Visningar på Google', value: report.kpis.impressions?.value || 0, delta: report.kpis.impressions?.deltaPercent },
                    { label: 'Unika besökare', value: report.kpis.uniqueVisitors?.value || 0, delta: report.kpis.uniqueVisitors?.deltaPercent },
                    { label: 'Totalt antal konverteringar', value: report.kpis.conversions?.value || 0, delta: report.kpis.conversions?.deltaPercent },
                    { label: 'Genomsnittlig position', value: report.kpis.avgPosition?.value || 0, delta: report.kpis.avgPosition?.deltaPercent, isDecimal: true },
                    { label: 'Klick på Google', value: report.kpis.clicks?.value || 0, delta: report.kpis.clicks?.deltaPercent },
                    { label: 'Unika organiska besökare', value: report.kpis.organicVisitors?.value || 0, delta: report.kpis.organicVisitors?.deltaPercent },
                    { label: 'Konv. från organisk trafik', value: report.kpis.organicConversions?.value || 0, delta: report.kpis.organicConversions?.deltaPercent },
                    { label: 'CTR', value: report.kpis.ctr?.value || 0, delta: report.kpis.ctr?.deltaPercent, suffix: '%', isDecimal: true },
                  ].map((stat, i) => {
                    const trend = stat.delta == null ? 'flat' : stat.delta >= 0 ? 'up' : 'down';
                    const TrendIcon = trend === 'up' ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
                    return (
                      <GlassCard key={i} className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">{stat.label}</span>
                          <div className={`flex items-center text-xs font-semibold ${trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-rose-500' : 'text-slate-400'}`}>
                            {trend !== 'flat' && <TrendIcon className="w-3 h-3 mr-1" />}
                            {stat.delta ? `${formatPercent(Math.abs(stat.delta))}` : '-'}
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-slate-900">
                          {stat.isDecimal ? stat.value.toFixed(2).replace('.', ',') : formatNumber(stat.value)}
                          {stat.suffix && <span className="text-sm font-normal text-slate-500 ml-1">{stat.suffix}</span>}
                        </div>
                      </GlassCard>
                    )
                  })}
                </div>

                {/* MAIN CHART */}
                <GlassCard className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Visningar och klick på Google sök</h3>
                      <p className="text-sm text-slate-500">Utveckling över tid</p>
                    </div>
                    <select
                      value={range}
                      onChange={(e) => setRange(e.target.value as RangeKey)}
                      className="bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg px-3 py-2 border-none outline-none"
                    >
                      <option value="7d">1 Vecka</option>
                      <option value="30d">1 Månad</option>
                      <option value="90d">3 Månader</option>
                      <option value="6m">6 Månader</option>
                      <option value="1y">1 År</option>
                      <option value="2y">2 År</option>
                      <option value="3y">3 År</option>
                      <option value="4y">4 År</option>
                      <option value="5y">5 År</option>
                    </select>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area type="monotone" dataKey="visningar" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVis)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>

                {/* KEYWORDS TABLE - Moved Here */}
                <GlassCard className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Sökordsranking</h3>
                    <Button variant="outline" size="sm" onClick={handleDownloadCsv}>Ladda ner CSV</Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs tracking-wider">
                        <tr>
                          <th className="px-4 py-3 rounded-l-lg">Sökord</th>
                          <th className="px-4 py-3">Grupp</th>
                          <th className="px-4 py-3">Baseline</th>
                          <th className="px-4 py-3 rounded-r-lg">Position</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {report.keywords.slice(0, expandedKeywords ? 50 : 10).map((kw, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-900">{kw.keyword}</td>
                            <td className="px-4 py-3 text-slate-500">{kw.group || '-'}</td>
                            <td className="px-4 py-3 text-slate-500">{kw.baseline}</td>
                            <td className="px-4 py-3 font-bold text-slate-900">{kw.position}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {report.keywords.length > 10 && (
                    <button
                      onClick={() => setExpandedKeywords(!expandedKeywords)}
                      className="w-full py-3 mt-2 text-sm font-semibold text-blue-600 hover:bg-blue-50/50 rounded-lg transition-colors"
                    >
                      {expandedKeywords ? 'Visa färre' : 'Visa alla sökord'}
                    </button>
                  )}
                </GlassCard>

                {/* DETAILED INSIGHTS GRID - Restored */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Device Split */}
                  <GlassCard className="p-6 flex flex-col min-h-[350px]">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Enheter</h3>
                    <div className="flex-1 w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={deviceChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {deviceChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b'][index % 3]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </GlassCard>

                  {/* Channels Table */}
                  <GlassCard className="p-6 flex flex-col min-h-[350px]">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Besökare per trafikkälla</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs tracking-wider">
                          <tr>
                            <th className="px-4 py-3 rounded-l-lg">Medium</th>
                            <th className="px-4 py-3 text-right">Besökare</th>
                            <th className="px-4 py-3 text-right rounded-r-lg">Konv.</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {channelRows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-3 font-medium text-slate-900 capitalize">{row.medium}</td>
                              <td className="px-4 py-3 text-right text-slate-600">{formatNumber(row.sessions)}</td>
                              <td className="px-4 py-3 text-right text-emerald-600 font-medium">{row.conversions}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </GlassCard>
                </div>

                {/* EXECUTIVE SUMMARY & ACTIONS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <GlassCard className="p-6 bg-linear-to-br from-indigo-50/50 to-white">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-indigo-100/50 rounded-lg text-indigo-600">
                        <PresentationChartLineIcon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Analys & Insikter</h3>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      {report.executiveSummary || "Ingen analys tillgänglig."}
                    </p>
                  </GlassCard>

                  <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-emerald-100/50 rounded-lg text-emerald-600">
                        <CheckCircleIcon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Genomfört denna månad</h3>
                    </div>
                    <div className="space-y-4">
                      {report.completedActions?.map((action, idx) => (
                        <div key={idx} className="flex gap-3 items-start">
                          <div className="mt-1">
                            {action.status === 'completed' ? <CheckCircleIcon className="w-5 h-5 text-emerald-500" /> : <ClockIcon className="w-5 h-5 text-amber-500" />}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{action.title}</div>
                            <div className="text-xs text-slate-500">{action.date}</div>
                          </div>
                        </div>
                      ))}
                      {(!report.completedActions || report.completedActions.length === 0) && (
                        <div className="text-slate-400 text-sm italic">Inga åtgärder loggade.</div>
                      )}
                    </div>
                  </GlassCard>
                </div>


              </>
            )
            }
          </div >
        )
      }
    </div >
  );
};

export default SeoPage;
