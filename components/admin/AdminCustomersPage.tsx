import React, { useEffect, useState } from "react";
import GlassCard from "../ui/GlassCard";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { adminCustomersMock } from "../mock/admin.customers";
import { generateDraftForCustomer } from "../mock/adminReports.repo";
import type { AdminCustomer } from "../types/admin";

const LS_KEY = "admin:customers";

const loadOverrides = (): Record<string, boolean> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    return {};
  }
};

const saveOverrides = (data: Record<string, boolean>) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
};

interface AdminCustomersPageProps {
  selectedMonth?: string;
  onMonthChange?: (m: string) => void;
}

const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

const AdminCustomersPage: React.FC<AdminCustomersPageProps> = ({ selectedMonth = getCurrentMonth(), onMonthChange }) => {
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [customers, setCustomers] = useState<AdminCustomer[]>(adminCustomersMock);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [month, setMonth] = useState(selectedMonth);

  useEffect(() => {
    const ov = loadOverrides();
    setOverrides(ov);
    setCustomers(
      adminCustomersMock.map((c) => ({
        ...c,
        active: ov[c.id] !== undefined ? ov[c.id] : c.active,
      }))
    );
  }, []);

  const toggleActive = (id: string) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
    setOverrides((prev) => {
      const next = { ...prev, [id]: !(prev[id] ?? adminCustomersMock.find((c) => c.id === id)?.active ?? true) };
      saveOverrides(next);
      return next;
    });
  };

  const handleGenerateForCustomer = async (id: string) => {
    await generateDraftForCustomer(id, month);
    setStatusMsg(`Genererade draft för ${id} (${month})`);
  };

  return (
    <GlassCard className="p-4 sm:p-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Customers</h3>
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-[0.16em]">
            {customers.length} st
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            className="rounded-full bg-white/70 backdrop-blur-xl px-3 py-2 text-sm text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.06)] outline-none"
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              onMonthChange?.(e.target.value);
            }}
            placeholder="YYYY-MM"
          />
        </div>
      </div>
      {statusMsg && <div className="text-xs text-accent font-semibold mb-2">{statusMsg}</div>}
      <div className="space-y-2">
        {customers.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl bg-white/60 px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div>
              <div className="text-sm font-semibold text-slate-900">{c.name}</div>
              <div className="text-xs text-slate-600">{c.domain}</div>
              <div className="text-[11px] text-slate-500">{c.contactEmail}</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="px-3 py-1 text-[10px] uppercase font-semibold">
                {c.active ? "Aktiv" : "Inaktiv"}
              </Badge>
              <Button variant="secondary" className="px-3 py-1 text-xs" onClick={() => toggleActive(c.id)}>
                {c.active ? "Avaktivera" : "Aktivera"}
              </Button>
              <Button variant="secondary" className="px-3 py-1 text-xs" onClick={() => handleGenerateForCustomer(c.id)}>
                Generate draft
              </Button>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default AdminCustomersPage;
