import React from 'react';
import { ArrowDownTrayIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import GlassCard from './ui/GlassCard';
import Button from './ui/Button';

const invoices = [
  {
    id: 'F-1024',
    period: 'Januari 2026',
    amount: '12 500 kr',
    date: '2026-01-31',
    status: 'Betald'
  },
  {
    id: 'F-1023',
    period: 'December 2025',
    amount: '11 800 kr',
    date: '2025-12-31',
    status: 'Betald'
  },
  {
    id: 'F-1022',
    period: 'November 2025',
    amount: '10 950 kr',
    date: '2025-11-30',
    status: 'Obetald'
  }
];

const InvoicesPage: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in pb-6 sm:pb-8">
      <GlassCard className="p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900/5 flex items-center justify-center text-accent">
            <DocumentTextIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">Fakturor</h1>
            <p className="text-slate-600 text-sm">Översikt över dina fakturor och betalningsstatus.</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="hidden xl:block p-3.5 sm:p-4">
        <div className="grid grid-cols-5 gap-3 text-xs uppercase tracking-[0.16em] text-slate-500 font-semibold pb-2">
          <div>Faktura</div>
          <div>Period</div>
          <div>Datum</div>
          <div>Belopp</div>
          <div className="text-right">Åtgärd</div>
        </div>
        <div className="space-y-2">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="grid grid-cols-5 gap-3 items-center bg-white/70 rounded-2xl px-4 py-3"
            >
              <div className="text-sm font-semibold text-slate-900">{invoice.id}</div>
              <div className="text-sm text-slate-600">{invoice.period}</div>
              <div className="text-sm text-slate-600">{invoice.date}</div>
              <div className="text-sm font-semibold text-slate-900">{invoice.amount}</div>
              <div className="flex items-center justify-end gap-3">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    invoice.status === 'Betald'
                      ? 'bg-success/15 text-success'
                      : 'bg-warning/15 text-warning'
                  }`}
                >
                  {invoice.status}
                </span>
                <Button variant="secondary" className="h-8 px-3 text-xs gap-2 whitespace-nowrap">
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  Ladda ner
                </Button>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="space-y-3 xl:hidden">
        {invoices.map((invoice) => (
          <GlassCard key={invoice.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-slate-400 font-semibold">Faktura</div>
                <div className="text-base font-semibold text-slate-900">{invoice.id}</div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  invoice.status === 'Betald'
                    ? 'bg-success/15 text-success'
                    : 'bg-warning/15 text-warning'
                }`}
              >
                {invoice.status}
              </span>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-slate-400 font-semibold">Period</div>
                <div className="text-slate-700 font-medium">{invoice.period}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-slate-400 font-semibold">Datum</div>
                <div className="text-slate-700 font-medium">{invoice.date}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-slate-400 font-semibold">Belopp</div>
                <div className="text-slate-900 font-semibold">{invoice.amount}</div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button variant="secondary" className="h-9 px-4 text-xs gap-2 whitespace-nowrap">
                <ArrowDownTrayIcon className="h-4 w-4" />
                Ladda ner
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default InvoicesPage;
