import type { AdminNotification } from "../types/admin";

const LS_KEY = "seo:notifications";

/**
 * TODO (Firebase/Firestore):
 * - Ersätt localStorage med collection:
 *   customers/{id}/notifications/{notificationId}
 * - Notifieringar skrivs från Cloud Functions (publish, draft gen)
 */

const load = (): AdminNotification[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AdminNotification[];
  } catch {
    return [];
  }
};

const save = (data: AdminNotification[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
};

let cache: AdminNotification[] = load();

export const listNotifications = async (): Promise<AdminNotification[]> => {
  cache = load();
  return cache;
};

export const addNotification = async (n: AdminNotification): Promise<void> => {
  cache = [n, ...cache];
  save(cache);
};

export const markAllRead = async (): Promise<void> => {
  cache = cache.map((n) => ({ ...n, read: true }));
  save(cache);
};

export const markRead = async (id: string): Promise<void> => {
  cache = cache.map((n) => (n.id === id ? { ...n, read: true } : n));
  save(cache);
};

export const unreadCount = async (): Promise<number> => {
  cache = load();
  return cache.filter((n) => !n.read).length;
};
