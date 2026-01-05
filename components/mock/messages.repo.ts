import type { PortalMessage } from "../types/messages";
import { addNotification as addAdminNotification } from "./notifications.repo";

const KEY = "seo:messages";

const readAll = (): PortalMessage[] => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PortalMessage[]) : [];
  } catch {
    return [];
  }
};

const writeAll = (items: PortalMessage[]) => {
  localStorage.setItem(KEY, JSON.stringify(items));
};

export const listThreads = async (): Promise<
  Array<{ customerId: string; lastMessageAt: string; unreadCount: number }>
> => {
  const all = readAll();
  const byCustomer = new Map<string, PortalMessage[]>();
  all.forEach((m) => {
    byCustomer.set(m.customerId, [...(byCustomer.get(m.customerId) || []), m]);
  });

  const threads = Array.from(byCustomer.entries()).map(([customerId, msgs]) => {
    const sorted = [...msgs].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    const unreadCount = msgs.filter((m) => m.from === "customer" && !m.readByAdmin).length;
    return {
      customerId,
      lastMessageAt: sorted[0]?.createdAt || new Date(0).toISOString(),
      unreadCount,
    };
  });

  return threads.sort((a, b) => (a.lastMessageAt < b.lastMessageAt ? 1 : -1));
};

export const listMessages = async (customerId: string): Promise<PortalMessage[]> => {
  const all = readAll().filter((m) => m.customerId === customerId);
  return all.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
};

export const sendMessage = async (input: {
  customerId: string;
  from: "customer" | "admin";
  text: string;
  month?: string;
}): Promise<PortalMessage> => {
  const msg: PortalMessage = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    customerId: input.customerId,
    from: input.from,
    text: input.text.trim(),
    month: input.month,
    readByAdmin: input.from === "admin" ? true : false,
    readByCustomer: input.from === "customer" ? true : false,
  };

  const all = readAll();
  all.push(msg);
  writeAll(all);

  if (input.from === "customer") {
    await addAdminNotification({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      title: "Nytt meddelande",
      message: `${input.customerId}: ${msg.text.slice(0, 60)}${msg.text.length > 60 ? "…" : ""}`,
      level: "info",
      read: false,
      customerId: input.customerId,
      month: input.month,
    });
  }

  return msg;
};

export const markThreadReadByAdmin = async (customerId: string): Promise<void> => {
  const all = readAll();
  const updated = all.map((m) => {
    if (m.customerId === customerId && m.from === "customer") return { ...m, readByAdmin: true };
    return m;
  });
  writeAll(updated);
};

/**
 * TODO Firebase:
 * customers/{customerId}/messages/{messageId}
 * Cloud Function trigger på nytt customer-message -> admin-notis
 */
