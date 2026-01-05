import React, { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronLeft, Send, LogOut, Sparkles } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { demoRepo } from "../api/DemoSeoRepository";
import { aiService } from "../api/AiService";
import type { SeoPeriodReport } from "../types/seoReport";
import { adminCustomersMock } from "../mock/admin.customers";

interface AdminDraftReviewPageProps {
  customerId: string;
  month: string;
  onPublished: () => void;
  onBack?: () => void;
  onLogout?: () => void;
}

const AdminDraftReviewPage: React.FC<AdminDraftReviewPageProps> = ({
  customerId,
  month,
  onPublished,
  onBack,
  onLogout,
}) => {
  const [report, setReport] = useState<SeoPeriodReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [notes, setNotes] = useState("");
  const cust = adminCustomersMock.find((c) => c.id === customerId);
  const [publishSuccess, setPublishSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const r = await demoRepo.getReport(customerId, 'monthly', month);
      if (!mounted) return;
      if (r) {
        setReport(r);
        setNotes(r.adminNotes || "");
      }
      setLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, [customerId, month]);

  // Auto-fill logic
  useEffect(() => {
    const autoGenerate = async () => {
      if (report && report.kpis && !report.adminNotes && !notes && !generating) {
        setGenerating(true);
        try {
          const stats = {
            customerName: cust?.name,
            visitsTrend: report.kpis.uniqueVisitors.deltaPercent
          };
          const summary = await aiService.generateReportSummary(stats);
          if (!notes) setNotes(summary);
        } catch (e) {
          // Silent fail for auto-gen
        } finally {
          setGenerating(false);
        }
      }
    };

    // Delay slightly to ensure load is done and to provide a nice UX effect
    const t = setTimeout(autoGenerate, 800);
    return () => clearTimeout(t);
  }, [report]);

  const chartData = useMemo(() => {
    return (
      report?.trafficTimeline.map((p) => {
        const d = new Date(p.date);
        const label = Number.isNaN(d.getTime())
          ? p.date
          : d.toLocaleDateString("sv-SE", { day: "2-digit", month: "2-digit" });
        return { name: label, visningar: p.impressions };
      }) || []
    );
  }, [report]);

  const kpis = report?.kpis;

  const handlePublish = async () => {
    if (!report) return;
    setLoading(true);
    // Upsert with notes first
    await demoRepo.upsertReport({ ...report, adminNotes: notes });
    // Then publish
    await demoRepo.publishReport(customerId, 'monthly', month);
    setLoading(false);
    onPublished();
    setPublishSuccess(true);
    setTimeout(() => setPublishSuccess(false), 3500);
  };

  if (!report) {
    return <div className="text-sm text-slate-600">Ingen rapport hittad...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {publishSuccess && (
        <div className="rounded-2xl bg-success/15 text-success font-semibold text-sm px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
          Rapport publicerad och notifiering skickad
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500 font-semibold">
            Draft review
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            {cust?.name || customerId} – {month}
          </h1>
          <p className="text-xs text-slate-600">{cust?.domain}</p>
        </div>
        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="secondary" className="px-3 py-2 text-sm flex items-center gap-2" onClick={onBack}>
              <ChevronLeft size={16} />
              Tillbaka
            </Button>
          )}
          <Button variant="primary" className="px-4 py-2 text-sm flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200" onClick={handlePublish} disabled={loading}>
            <Send size={16} />
            Publish
          </Button>
          {onLogout && (
            <Button variant="ghost" className="px-3 py-2 text-sm flex items-center gap-2 text-slate-500 hover:text-slate-800" onClick={onLogout}>
              <LogOut size={16} />
              Logga ut
            </Button>
          )}
        </div>
      </div>

      {loading && <div className="text-xs text-slate-500 font-semibold">Laddar...</div>}

      <GlassCard className="p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {kpis && (
            <>
              <Kpi label="Visningar" value={kpis.impressions.value} delta={kpis.impressions.deltaPercent} />
              <Kpi label="Unika besökare" value={kpis.uniqueVisitors.value} delta={kpis.uniqueVisitors.deltaPercent} />
              <Kpi label="Konverteringar" value={kpis.conversions.value} delta={kpis.conversions.deltaPercent} />
            </>
          )}
        </div>
      </GlassCard>

      <GlassCard className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900">Trafikutveckling</h3>
        </div>
        <div className="h-48 sm:h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -10, bottom: 24 }}>
              <defs>
                <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0064E1" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#0064E1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 8" vertical={false} stroke="rgba(15,23,42,0.08)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} tickMargin={12} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  borderRadius: '16px',
                  border: 'none',
                  padding: '12px',
                  color: '#0f172a',
                  backdropFilter: 'blur(18px)',
                }}
                itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                cursor={{ stroke: 'rgba(0,100,225,0.18)', strokeWidth: 2 }}
              />
              <Area type="monotone" dataKey="visningar" stroke="#0064E1" strokeWidth={3} fillOpacity={1} fill="url(#colorVis)" activeDot={{ r: 6, strokeWidth: 0, fill: '#0064E1' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-900">VD-ord / Sammanfattning</h3>
          <button
            onClick={async () => {
              if (!kpis) return;
              setGenerating(true);
              try {
                // Gather stats for the AI
                const stats = {
                  customerName: cust?.name,
                  visitsTrend: kpis.uniqueVisitors.deltaPercent
                };
                const summary = await aiService.generateReportSummary(stats);
                setNotes(summary);
              } catch (e) {
                alert("Kunde inte generera text.");
              } finally {
                setGenerating(false);
              }
            }}
            disabled={generating}
            className="flex items-center gap-1.5 text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1.5 rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors disabled:opacity-50"
          >
            <Sparkles size={14} className={generating ? "animate-pulse" : ""} />
            {generating ? 'Skriver...' : 'Generera med AI'}
          </button>
        </div>
        <textarea
          className="w-full rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-xl p-3 text-sm text-slate-800 outline-none focus:border-accent transition"
          rows={6}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Skriv din kommentar här eller låt AI:n generera ett utkast..."
        />
      </GlassCard>
    </div>
  );
};

const Kpi = ({ label, value, delta }: { label: string; value: number; delta: number }) => {
  const trend: 'up' | 'down' | 'flat' = delta == null ? 'flat' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
  return (
    <GlassCard className="p-3 sm:p-3.5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-[0.16em]">{label}</h3>
        <span
          className={[
            'px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1',
            trend === 'down'
              ? 'bg-danger/10 text-danger'
              : trend === 'up'
                ? 'bg-success/15 text-success'
                : 'bg-slate-900/5 text-slate-700',
          ].join(' ')}
        >
          {delta == null ? '—' : `${delta > 0 ? '+' : ''}${delta}%`}
        </span>
      </div>
      <div className="text-xl sm:text-2xl font-semibold text-slate-900 mb-1 tracking-tight">
        {new Intl.NumberFormat('sv-SE').format(value)}
      </div>
      <p className="text-xs text-slate-600 font-medium">Jämfört med föregående period</p>
    </GlassCard>
  );
};

export default AdminDraftReviewPage;
