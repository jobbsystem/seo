import React, { useEffect, useMemo, useState } from "react";
import GlassCard from "../ui/GlassCard";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { adminCustomersMock } from "../mock/admin.customers";
import { listDrafts, listMonthsForCustomer } from "../mock/adminReports.repo";

type DraftRow = {
  customerId: string;
  customerName: string;
  domain: string;
  month: string;
  uploadedAt?: string;
  status: string;
};

interface AdminDraftsPageProps {
  onReview: (customerId: string, month: string) => void;
}

const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

const AdminDraftsPage: React.FC<AdminDraftsPageProps> = ({ onReview }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());
  const [months, setMonths] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<DraftRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // gather months from all customers
    const loadMonths = async () => {
      const allMonths = new Set<string>();
      for (const c of adminCustomersMock) {
        const m = await listMonthsForCustomer(c.id);
        m.forEach((x) => allMonths.add(x));
      }
      const list = Array.from(allMonths).sort((a, b) => (a < b ? 1 : -1));
      const finalList = list.length ? list : [getCurrentMonth()];
      setMonths(finalList);
      if (!finalList.includes(selectedMonth)) {
        setSelectedMonth(finalList[0]);
      }
    };
    loadMonths();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const rows: DraftRow[] = [];
      const customersMap = Object.fromEntries(adminCustomersMock.map((c) => [c.id, c]));

      for (const c of adminCustomersMock) {
        const ds = await listDrafts(selectedMonth);
        ds.forEach((d) => {
          if (d.customerId !== c.id) return;
          const cust = customersMap[d.customerId];
          rows.push({
            customerId: d.customerId,
            customerName: cust?.name || d.customerId,
            domain: cust?.domain || "",
            month: d.month,
            uploadedAt: d.report?.uploadedAt,
            status: d.report?.status || "draft",
          });
        });
      }
      setDrafts(rows);
      setLoading(false);
    };
    load();
  }, [selectedMonth]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return drafts;
    return drafts.filter(
      (d) =>
        d.customerName.toLowerCase().includes(q) ||
        d.domain.toLowerCase().includes(q) ||
        d.customerId.toLowerCase().includes(q)
    );
  }, [drafts, search]);

  return (
    <GlassCard className="p-4 sm:p-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Drafts</h3>
          <p className="text-xs text-slate-600">Välj månad för att granska drafts.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            className="rounded-full bg-white/70 backdrop-blur-xl px-3 py-2 text-sm text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.06)] outline-none"
            placeholder="Sök kund..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-full bg-white/70 backdrop-blur-xl px-3 py-2 text-sm text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.06)] outline-none cursor-pointer"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div className="text-xs text-slate-500 font-semibold mb-2">Laddar...</div>}

      <div className="space-y-2">
        {filtered.map((d) => (
          <div
            key={`${d.customerId}:${d.month}`}
            className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl bg-white/60 px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.06)] gap-2"
          >
            <div className="flex items-center gap-3">
              <Badge className="px-3 py-1 text-[10px] uppercase font-semibold">{d.status}</Badge>
              <div>
                <div className="text-sm font-semibold text-slate-900">{d.customerName}</div>
                <div className="text-xs text-slate-600">{d.domain}</div>
                <div className="text-[11px] text-slate-500">Månad: {d.month}</div>
                {d.uploadedAt && <div className="text-[11px] text-slate-500">Uppladdad: {d.uploadedAt}</div>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" className="px-3 py-1 text-xs" onClick={() => onReview(d.customerId, d.month)}>
                Review
              </Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-sm text-slate-600">Inga drafts.</div>}
      </div>
    </GlassCard>
  );
};

export default AdminDraftsPage;
