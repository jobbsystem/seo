import React, { useState, useEffect } from 'react';
import GlassCard from '../../ui/GlassCard';
import Button from '../../ui/Button';
import { aiService, AiInsight } from '../../api/AiService';
import {
    ArrowUpRight, FileText, Users, Bell,
    Activity, CheckCircle, AlertTriangle,
    Database, Globe, AlertCircle, Clock,
    Sparkles, RefreshCw as RefreshIcon, AlertOctagon
} from 'lucide-react';

interface AdminDashboardProps {
    stats?: {
        totalCustomers: number;
        draftsPending: number;
        publishedReports: number;
    };
    onNavigate: (page: string) => void;
}

const AiStatusWidget = () => {
    const [insights, setInsights] = useState<AiInsight[]>([]);
    const [loading, setLoading] = useState(false);
    const [lastScan, setLastScan] = useState<string | null>(null);

    const runScan = async () => {
        setLoading(true);
        // Minimum loading time for effect
        await new Promise(r => setTimeout(r, 1500));
        const results = await aiService.performHealthCheck();
        setInsights(results);
        setLastScan(new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }));
        setLoading(false);
    };

    useEffect(() => {
        runScan();
    }, []);

    const hasIssues = insights.some(i => i.type === 'warning');
    const issueCount = insights.filter(i => i.type === 'warning').length;

    return (
        <GlassCard className="p-6 relative overflow-hidden border-purple-100">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Sparkles size={120} className="text-purple-600" />
            </div>

            <div className="flex justify-between items-start relative z-10">
                <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${loading ? 'bg-purple-100 text-purple-600 animate-pulse' :
                        hasIssues ? 'bg-amber-100 text-amber-600' :
                            'bg-linear-to-br from-purple-500 to-indigo-600 text-white'
                        }`}>
                        {loading ? <RefreshIcon className="animate-spin" size={24} /> :
                            hasIssues ? <AlertOctagon size={24} /> :
                                <Sparkles size={24} />
                        }
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            AI Co-pilot
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full border border-purple-100 uppercase tracking-wide">Beta</span>
                        </h3>
                        <p className="text-sm text-slate-500">
                            {loading ? 'Analyserar systemdata...' :
                                hasIssues ? `Hittade ${issueCount} ärenden som behöver åtgärdas.` :
                                    'Systemet är fullt operativt. Inga fel upptäckta.'}
                        </p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={runScan} disabled={loading} className="text-xs">
                    {loading ? 'Scannar...' : 'Kör analys'}
                </Button>
            </div>

            {!loading && insights.length > 0 && (
                <div className="mt-6 space-y-3 relative z-10">
                    {insights.slice(0, 3).map((insight, i) => (
                        <div key={i} className={`p-3 rounded-xl border flex items-start justify-between text-sm ${insight.type === 'warning' ? 'bg-amber-50/50 border-amber-100 text-amber-900' : 'bg-slate-50 border-slate-100 text-slate-700'
                            }`}>
                            <div className="flex gap-3">
                                <div className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${insight.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                                    }`} />
                                <span>{insight.message}</span>
                            </div>
                            {insight.actionLink && (
                                <a href={insight.actionLink} className="text-xs font-semibold underline opacity-80 hover:opacity-100">
                                    {insight.actionLabel || 'Visa'}
                                </a>
                            )}
                        </div>
                    ))}
                    {insights.length > 3 && (
                        <p className="text-xs text-center text-slate-400 mt-2">
                            + {insights.length - 3} fler insikter
                        </p>
                    )}
                </div>
            )}

            {!loading && insights.length === 0 && (
                <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50/50 px-4 py-3 rounded-xl border border-emerald-100">
                    <CheckCircle size={16} />
                    <span className="font-medium">Alla system ser bra ut! Senast scannad: {lastScan}</span>
                </div>
            )}
        </GlassCard>
    );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ stats, onNavigate }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Översikt</h2>
                    <p className="text-sm text-slate-500">Här är vad som händer i byrån just nu.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="text-xs">
                        <Activity size={14} className="mr-2" />
                        Systemstatus: OK
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    label="Väntande Drafts"
                    value={stats?.draftsPending || 0}
                    trend="+12%"
                    icon={FileText}
                    trendGood={false}
                    trendLabel="vs föreg. period"
                />
                <StatsCard
                    label="Aktiva Kunder"
                    value={stats?.totalCustomers || 0}
                    trend="+3"
                    icon={Users}
                    trendGood={true}
                    trendLabel="nya denna månad"
                />
                <StatsCard
                    label="Publicerade (Månad)"
                    value={stats?.publishedReports || 0}
                    trend="100%"
                    icon={ArrowUpRight}
                    trendGood={true}
                    trendLabel="i tid"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Activity Feed (Main Focus) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* AI Co-pilot Widget */}
                    <AiStatusWidget />

                    <GlassCard className="p-0 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                <Clock size={18} className="text-slate-400" />
                                Händelselogg
                            </h3>
                            <Button variant="ghost" className="text-xs text-slate-500">Visa alla</Button>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {mockActivity.map((item, i) => (
                                <div key={i} className="p-4 flex gap-4 hover:bg-slate-50/50 transition-colors">
                                    <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.bg} ${item.color}`}>
                                        <item.icon size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-900">{item.title}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                                    </div>
                                    <span className="text-xs text-slate-400 whitespace-nowrap">{item.time}</span>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                    {/* Performance Warning List */}
                    <GlassCard className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                <AlertCircle size={18} className="text-amber-500" />
                                Varningslista & Opportunities
                            </h3>
                        </div>
                        <div className="space-y-3">
                            <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs">TA</div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">Tandläkare.se</p>
                                        <p className="text-xs text-red-600 font-medium">Trafik ner 15% (30 dagar)</p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    className="text-xs h-8"
                                    onClick={() => onNavigate('customers')}
                                >
                                    Analysera
                                </Button>
                            </div>
                            <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">KO</div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">Kontorshotell.se</p>
                                        <p className="text-xs text-amber-600 font-medium">Teknisk SEO: Långsam LCP</p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    className="text-xs h-8"
                                    onClick={() => onNavigate('customers')}
                                >
                                    Åtgärda
                                </Button>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Right Column: Status & Health */}
                <div className="space-y-6">
                    <GlassCard className="p-5">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Database size={18} className="text-slate-400" />
                            Datakällor & Integrationer
                        </h3>
                        <div className="space-y-4">
                            <IntegrationItem label="Google Search Console" status="healthy" count="52/52" />
                            <IntegrationItem label="Google Analytics 4" status="warning" count="50/52" />
                            <IntegrationItem label="Semrush / Ahrefs" status="healthy" count="Active" />
                            <IntegrationItem label="Systemnotiser (Mail)" status="healthy" count="Operational" />
                        </div>
                        <div className="mt-5 pt-4 border-t border-slate-100">
                            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg text-amber-800 text-xs leading-relaxed">
                                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                                Kunder 'Tandläkare.se' och 'Bygg AB' behöver förnya sina GA4-tokens.
                            </div>
                        </div>
                    </GlassCard>

                    <div className="p-5 bg-indigo-600 text-white relative overflow-hidden text-center rounded-[24px] shadow-lg transition-transform hover:-translate-y-0.5">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-bl-full -mr-10 -mt-10 opacity-50" />
                        <h3 className="relative z-10 font-semibold text-lg mb-1">Dags för månadsrapporter?</h3>
                        <p className="relative z-10 text-indigo-100 text-sm mb-4">Du har 3 väntande utkast att granska för januari.</p>
                        <Button
                            onClick={() => onNavigate('reports')}
                            className="relative z-10 w-full bg-white! text-indigo-600! hover:bg-indigo-50! border-none"
                        >
                            Gå till Rapporter
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Mock Data & Helpers ---

const mockActivity = [
    {
        title: "Rapport publicerad",
        desc: "Månadsrapport Jan 2026 för Origin.se skickades.",
        time: "14 min sedan",
        icon: CheckCircle,
        bg: "bg-emerald-100",
        color: "text-emerald-600"
    },
    {
        title: "Nytt utkast genererat",
        desc: "Draft skapad för Kontorshotell.se (2026-01).",
        time: "1 timme sedan",
        icon: FileText,
        bg: "bg-blue-100",
        color: "text-blue-600"
    },
    {
        title: "Varning: Nyckelordstapp",
        desc: "Tandläkare.se tappade #1 position på 'Tandläkare Stockholm'.",
        time: "3 timmar sedan",
        icon: AlertTriangle,
        bg: "bg-amber-100",
        color: "text-amber-600"
    },
    {
        title: "Systemuppdatering",
        desc: "Integrationer för Semrush uppdaterades framgångsrikt.",
        time: "Igår, 23:00",
        icon: Database,
        bg: "bg-slate-100",
        color: "text-slate-600"
    },
];

const IntegrationItem = ({ label, status, count }: any) => (
    <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full ${status === 'healthy' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' :
                status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                }`} />
            <span className="text-slate-700 font-medium">{label}</span>
        </div>
        <span className="text-slate-500 text-xs font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
            {count}
        </span>
    </div>
);

const StatsCard = ({ label, value, trend, icon: Icon, trendGood, trendLabel }: any) => (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm flex items-start justify-between group hover:shadow-md transition-shadow">
        <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500/80 mb-1">{label}</p>
            <div className="text-3xl font-bold text-slate-900 tracking-tight">{value}</div>
            <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${trendGood
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                    }`}>
                    {trend}
                </span>
                <span className="text-xs text-slate-400 font-medium">{trendLabel}</span>
            </div>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
            <Icon size={20} />
        </div>
    </div>
);

export default AdminDashboard;


