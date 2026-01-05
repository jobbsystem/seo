import type { Ticket, TicketStatus } from "../types/ticket";
import { addNotification } from "./notifications.repo";

const KEY = "seo:tickets";

const readAll = (): Ticket[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Ticket[]) : [];
  } catch {
    return [];
  }
};

const writeAll = (items: Ticket[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
};

export const listTickets = async (status?: TicketStatus): Promise<Ticket[]> => {
  const all = readAll().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return status ? all.filter((t) => t.status === status) : all;
};

export const createTicket = async (input: {
  customerId: string;
  title: string;
  description: string;
}): Promise<Ticket> => {
  const now = new Date().toISOString();
  const ticket: Ticket = {
    id: crypto.randomUUID(),
    customerId: input.customerId,
    title: input.title.trim(),
    description: input.description.trim(),
    status: "open",
    createdAt: now,
    updatedAt: now,
    readByAdmin: false,
  };

  const all = readAll();
  all.unshift(ticket);
  writeAll(all);

  await addNotification({
    id: crypto.randomUUID(),
    createdAt: now,
    title: "Nytt supportärende",
    message: `${input.customerId}: ${ticket.title}`,
    level: "info",
    read: false,
    customerId: input.customerId,
  });

  return ticket;
};

export const updateTicketStatus = async (id: string, status: TicketStatus): Promise<void> => {
  const all = readAll();
  const idx = all.findIndex((t) => t.id === id);
  if (idx === -1) return;
  all[idx] = { ...all[idx], status, updatedAt: new Date().toISOString(), resolvedAt: status === "closed" ? new Date().toISOString() : undefined };
  writeAll(all);
};

export const markReadByAdmin = async (id: string): Promise<void> => {
  const all = readAll();
  const idx = all.findIndex((t) => t.id === id);
  if (idx === -1) return;
  all[idx] = { ...all[idx], readByAdmin: true, updatedAt: new Date().toISOString() };
  writeAll(all);
};

/**
 * TODO: Byt till backend/Firebase
 * customers/{customerId}/tickets/{ticketId}
 * Trigger: nytt ticket -> admin notification
 */
