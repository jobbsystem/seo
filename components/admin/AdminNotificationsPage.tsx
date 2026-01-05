import React, { useEffect, useMemo, useState } from "react";
import GlassCard from "../ui/GlassCard";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { listNotifications, markAllRead, markRead } from "../mock/notifications.repo";
import type { AdminNotification } from "../types/admin";
import { adminCustomersMock } from "../mock/admin.customers";
import { sendMessage } from "../mock/messages.repo";

const AdminNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<AdminNotification | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const n = await listNotifications();
    setNotifications(n);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const getCustomerLabel = (customerId?: string) => {
    if (!customerId) return '';
    const cust = adminCustomersMock.find((c) => c.id === customerId);
    if (!cust) return customerId;
    return `${cust.name} (${cust.domain})`;
  };

  const filtered = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.read);
    return notifications;
  }, [notifications, filter]);

  const handleSelect = async (n: AdminNotification) => {
    setSelected(n);
    if (!n.read) {
      await markRead(n.id);
      load();
    }
  };

  const handleSendReply = async () => {
    if (!selected || !selected.customerId || !reply.trim()) return;
    setSending(true);
    await sendMessage({
      customerId: selected.customerId,
      from: "admin",
      text: reply,
      month: selected.month,
    });
    setSending(false);
    setReply("");
    setStatusMsg("Svar skickat till kunden.");
    setTimeout(() => setStatusMsg(null), 2500);
  };

  return (
    <GlassCard className="p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-slate-900">Notiser</h3>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as "all" | "unread")}
            className="rounded-full bg-white/70 backdrop-blur-xl px-3 py-2 text-sm text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.06)] outline-none cursor-pointer"
          >
            <option value="all">Alla</option>
            <option value="unread">Olästa</option>
          </select>
          <Button variant="secondary" className="px-3 py-1 text-xs" onClick={() => markAllRead().then(load)}>
            Markera alla som lästa
          </Button>
        </div>
      </div>

      {loading && <div className="text-xs text-slate-500 font-semibold mb-2">Laddar...</div>}
      {statusMsg && <div className="text-xs text-accent font-semibold mb-2">{statusMsg}</div>}

      {/* Reply panel pinned above list */}
      {selected && (
        <div className="mb-4 p-4 bg-white/80 rounded-2xl border border-slate-200 shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-sm font-semibold text-slate-900">{selected.title}</div>
              <div className="text-xs text-slate-600">{selected.message}</div>
              <div className="text-[11px] text-slate-500">{selected.createdAt}</div>
            </div>
            <Badge className="px-2 py-1 text-[10px] uppercase font-semibold">
              {selected.read ? "Läst" : "Oläst"}
            </Badge>
          </div>
          <textarea
            className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-800 outline-none focus:border-accent transition min-h-[140px]"
            placeholder="Svara kunden... (text/ länkar; bifoga bildlänk om behövs)"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
          />
          <div className="flex justify-end mt-2 gap-2">
            <Button variant="secondary" className="px-3 py-2 text-sm text-slate-900" onClick={() => setSelected(null)}>
              Stäng
            </Button>
            <Button
              variant="secondary"
              className="px-4 py-2 text-sm font-semibold text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.12)]"
              disabled={sending || !reply.trim()}
              onClick={handleSendReply}
            >
              Skicka svar
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((n) => (
          <div
            key={n.id}
            className="rounded-2xl bg-white/60 px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.06)] cursor-pointer hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition"
            onClick={() => handleSelect(n)}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900">
                {n.title} {n.customerId ? `– ${getCustomerLabel(n.customerId)}` : ""}
              </span>
              <div className="flex items-center gap-2">
                <Badge className="px-2 py-1 text-[10px] uppercase font-semibold">{n.level}</Badge>
                {!n.read && (
                  <Button variant="secondary" className="px-2 py-1 text-[10px]" onClick={(e) => { e.stopPropagation(); markRead(n.id).then(load); }}>
                    Markera läst
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-1">{n.message}</p>
            <p className="text-[11px] text-slate-500 mt-1">{n.createdAt}</p>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-sm text-slate-600">Inga notiser.</div>}
      </div>
    </GlassCard>
  );
};

export default AdminNotificationsPage;
