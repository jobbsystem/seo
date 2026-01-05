import { AgencyCustomer, IntegrationConnection, IntegrationProviderId } from "../types/agency";
import { Message, MessageThread } from "../../types/message";

const STORAGE_KEY_CUSTOMERS = 'seo-portal:customers';
const STORAGE_KEY_CONNECTIONS = "agency:connections_v1";
const STORAGE_KEY_THREADS = "agency:threads_v1";
const STORAGE_KEY_MESSAGES = "agency:messages_v1";
const STORAGE_KEY_NOTIFICATIONS = 'seo-portal:notifications';
const STORAGE_KEY_USERS = 'seo-portal:users'; // New for simulated auth_v1";
import { Notification } from "../../types/notification";

/**
 * Mock Backend Service for Agency Admin
 * Simulates Firestore / Cloud Functions operations.
 */
export class AdminRepository {

    constructor() {
        this.seedIfNeeded();
    }

    private seedIfNeeded() {
        if (typeof window === "undefined") return;

        console.log("AdminRepository: Seeding initial data...");

        // Check if main data exists
        if (!localStorage.getItem(STORAGE_KEY_CUSTOMERS)) {
            // Initial 2 Customers
            const customers: AgencyCustomer[] = [
                {
                    id: "origin",
                    agencyId: "agency1",
                    email: "demo@origin.se",
                    companyName: "Origin.se",
                    domain: "origin.se",
                    timezone: "Europe/Stockholm",
                    active: true,
                    reportSettings: { weeklyEnabled: true, monthlyEnabled: true, recipientEmails: ["demo@origin.se"] },
                    connectionSummary: { googleConnected: true, toolsConnectedCount: 1, errorsCount: 0 },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    lastLoginAt: new Date().toISOString() // Active now
                },
                {
                    id: "tandlakare",
                    agencyId: "agency1",
                    email: "info@tandlakare.se",
                    companyName: "Tandläkare.se",
                    domain: "tandlakare.se",
                    timezone: "Europe/Stockholm",
                    active: true,
                    reportSettings: { weeklyEnabled: false, monthlyEnabled: true, recipientEmails: ["info@tandlakare.se"] },
                    connectionSummary: { googleConnected: false, toolsConnectedCount: 0, errorsCount: 1 },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    lastLoginAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString() // 100 days ago (Passivity Risk)
                }
            ];

            // Initial Connections for Origin
            const connections: IntegrationConnection[] = [
                {
                    id: "conn_1",
                    customerId: "origin",
                    providerId: "google_search_console",
                    status: "connected",
                    lastSyncAt: new Date().toISOString(),
                    meta: { gscProperty: "sc-domain:origin.se" }
                },
                {
                    id: "conn_2",
                    customerId: "origin",
                    providerId: "google_analytics_4",
                    status: "connected",
                    lastSyncAt: new Date().toISOString(),
                    meta: { ga4PropertyId: "12345678" }
                },
                {
                    id: "conn_3",
                    customerId: "tandlakare",
                    providerId: "semrush",
                    status: "error",
                    lastSyncAt: new Date().toISOString(),
                    lastError: "Invalid API Key",
                    meta: { apiKey: "invalid_key_123" }
                }
            ];

            localStorage.setItem(STORAGE_KEY_CUSTOMERS, JSON.stringify(customers));
            localStorage.setItem(STORAGE_KEY_CONNECTIONS, JSON.stringify(connections));

            // Initial Threads
            const threads: MessageThread[] = [
                {
                    id: "thread_1",
                    customerId: "origin",
                    customerName: "Origin.se",
                    subject: "Fråga om veckorapporten",
                    status: "open",
                    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
                    updatedAt: new Date(Date.now() - 3600000).toISOString(),
                    unreadCount: { admin: 1, client: 0 },
                    lastMessage: {
                        id: "msg_2",
                        threadId: "thread_1",
                        senderId: "origin_user",
                        senderRole: "client",
                        senderName: "Anna Andersson",
                        content: "Hej! Ser bra ut, men kan vi lägga till konverteringsdata?",
                        createdAt: new Date(Date.now() - 3600000).toISOString(),
                        attachments: []
                    }
                },
                {
                    id: "thread_priority",
                    customerId: "tandlakare",
                    customerName: "Tandläkare.se",
                    subject: "Fakturafråga - Missnöjd",
                    status: "open",
                    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2h ago
                    updatedAt: new Date(Date.now() - 7200000).toISOString(),
                    unreadCount: { admin: 1, client: 0 },
                    lastMessage: {
                        id: "msg_angry_1",
                        threadId: "thread_priority",
                        senderId: "tandlakare_user",
                        senderRole: "client",
                        senderName: "Erik (Tandläkare.se)",
                        content: "Jag är inte nöjd med fakturan. Varför kostar det så mycket när resultaten dalar? Ring mig!",
                        createdAt: new Date(Date.now() - 7200000).toISOString(),
                        attachments: []
                    }
                }
            ];

            const messages: Message[] = [
                {
                    id: "msg_1",
                    threadId: "thread_1",
                    senderId: "admin_1",
                    senderRole: "admin",
                    senderName: "Support",
                    content: "Hej! Här är din veckorapport. Hör av dig om du har frågor.",
                    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
                    attachments: []
                },
                {
                    id: "msg_2",
                    threadId: "thread_1",
                    senderId: "origin_user",
                    senderRole: "client",
                    senderName: "Anna Andersson",
                    content: "Hej! Ser bra ut, men kan vi lägga till konverteringsdata?",
                    createdAt: new Date(Date.now() - 3600000).toISOString(),
                    attachments: []
                }
            ];

            localStorage.setItem(STORAGE_KEY_THREADS, JSON.stringify(threads));
            localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
        }

        // Check if Notifications exist, seed if missing
        if (!localStorage.getItem(STORAGE_KEY_NOTIFICATIONS)) {
            // Initial Notifications
            const notifications: Notification[] = [
                {
                    id: "notif_1",
                    title: "Nytt meddelande från Origin.se",
                    message: "Anna Andersson: Hej! Ser bra ut, men kan vi lägga till...",
                    type: 'message',
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    read: false,
                    link: '/admin/messages',
                    relatedId: 'thread_1',
                    recipientRole: 'admin'
                },
                {
                    id: "notif_3",
                    title: "Varning: API-fel",
                    message: "Semrush-kopplingen för Tandläkare.se misslyckades.",
                    type: 'alert',
                    timestamp: new Date(Date.now() - 86400000).toISOString(),
                    read: false,
                    link: '/admin/customers',
                    recipientRole: 'admin'
                },
                {
                    id: "notif_client_1",
                    title: "Rapport publicerad",
                    message: "Din månadsrapport för Januari finns nu tillgänglig.",
                    type: 'system',
                    timestamp: new Date().toISOString(),
                    read: false,
                    link: '/seo',
                    recipientRole: 'client',
                    recipientId: 'origin' // Demo user ID usually matches customer ID or similar
                }
            ];
            localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
        }
    }

    // --- Customers ---

    async listCustomers(): Promise<AgencyCustomer[]> {
        const raw = localStorage.getItem(STORAGE_KEY_CUSTOMERS);
        return raw ? JSON.parse(raw) : [];
    }

    async getCustomer(id: string): Promise<AgencyCustomer | null> {
        const list = await this.listCustomers();
        return list.find(c => c.id === id) || null;
    }

    async createCustomer(customer: Omit<AgencyCustomer, "id" | "createdAt" | "updatedAt" | "connectionSummary">): Promise<AgencyCustomer> {
        const list = await this.listCustomers();
        const newId = `cust_${Date.now().toString(36)}`;
        const newCustomer: AgencyCustomer = {
            ...customer,
            id: newId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            connectionSummary: { googleConnected: false, toolsConnectedCount: 0, errorsCount: 0 },
            active: true
        };
        list.push(newCustomer);
        this.saveCustomers(list);
        return newCustomer;
    }

    async updateCustomer(id: string, updates: Partial<AgencyCustomer>): Promise<void> {
        const list = await this.listCustomers();
        const idx = list.findIndex(c => c.id === id);
        if (idx >= 0) {
            list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
            this.saveCustomers(list);
        }
    }

    // --- Helper ---
    private saveCustomers(list: AgencyCustomer[]) {
        localStorage.setItem(STORAGE_KEY_CUSTOMERS, JSON.stringify(list));
    }

    // --- User / Auth Simulation ---
    async createUser(email: string, password: string, name?: string): Promise<void> {
        const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '{}');
        users[email.toLowerCase()] = { password, name: name || email.split('@')[0] };
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    }

    async verifyUser(email: string, password: string): Promise<boolean> {
        // Hardcoded bypass for Demo Mode (requested by user)
        if (email.toLowerCase() === 'demo@origin.se' && password === 'demo') return true;

        // Admin bypass
        if (email === 'admin@admin.se') return true;

        const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '{}');
        const user = users[email.toLowerCase()];
        if (!user) return false;

        return user.password === password;
    }

    async updateUserPassword(email: string, newPassword: string): Promise<void> {
        const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '{}');
        if (users[email.toLowerCase()]) {
            users[email.toLowerCase()].password = newPassword;
            localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
        }
    }

    // --- Connections ---

    async listConnections(customerId: string): Promise<IntegrationConnection[]> {
        const raw = localStorage.getItem(STORAGE_KEY_CONNECTIONS);
        const all: IntegrationConnection[] = raw ? JSON.parse(raw) : [];
        return all.filter(c => c.customerId === customerId);
    }

    async getConnection(customerId: string, providerId: IntegrationProviderId): Promise<IntegrationConnection | null> {
        const list = await this.listConnections(customerId);
        return list.find(c => c.providerId === providerId) || null;
    }

    /**
     * Creates or updates a connection configuration.
     * In a real app, 'secret' would be sent to a secure backend endpoint.
     */
    async upsertConnection(
        customerId: string,
        providerId: IntegrationProviderId,
        meta: Record<string, any>,
        secret: string | null = null
    ): Promise<IntegrationConnection> {
        const raw = localStorage.getItem(STORAGE_KEY_CONNECTIONS);
        let all: IntegrationConnection[] = raw ? JSON.parse(raw) : [];

        const existingIdx = all.findIndex(c => c.customerId === customerId && c.providerId === providerId);

        const now = new Date().toISOString();
        let connection: IntegrationConnection;

        if (existingIdx >= 0) {
            connection = {
                ...all[existingIdx],
                meta: { ...all[existingIdx].meta, ...meta },
                status: secret ? "demo_connected" : all[existingIdx].status,
                lastSyncAt: secret ? now : all[existingIdx].lastSyncAt
            };
            all[existingIdx] = connection;
        } else {
            connection = {
                id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                customerId,
                providerId,
                status: secret ? "demo_connected" : "disconnected",
                meta,
                lastSyncAt: secret ? now : undefined
            };
            all.push(connection);
        }

        localStorage.setItem(STORAGE_KEY_CONNECTIONS, JSON.stringify(all));

        // Update customer summary
        await this.recalcCustomerSummary(customerId, all);

        return connection;
    }

    async disconnect(customerId: string, providerId: IntegrationProviderId): Promise<void> {
        const raw = localStorage.getItem(STORAGE_KEY_CONNECTIONS);
        let all: IntegrationConnection[] = raw ? JSON.parse(raw) : [];
        all = all.filter(c => !(c.customerId === customerId && c.providerId === providerId));
        localStorage.setItem(STORAGE_KEY_CONNECTIONS, JSON.stringify(all));
        await this.recalcCustomerSummary(customerId, all);
    }

    /**
     * Simulated backend job to verify specific connection
     */
    async testConnection(customerId: string, providerId: IntegrationProviderId): Promise<boolean> {
        // Simulate latency
        await new Promise(r => setTimeout(r, 600));

        // Random success/fail for demo
        const success = Math.random() > 0.1;

        const raw = localStorage.getItem(STORAGE_KEY_CONNECTIONS);
        let all: IntegrationConnection[] = raw ? JSON.parse(raw) : [];
        const idx = all.findIndex(c => c.customerId === customerId && c.providerId === providerId);

        if (idx >= 0) {
            all[idx] = {
                ...all[idx],
                status: success ? "connected" : "error",
                lastSyncAt: new Date().toISOString(),
                lastError: success ? undefined : "API limit reached or invalid key"
            };
            localStorage.setItem(STORAGE_KEY_CONNECTIONS, JSON.stringify(all));
            await this.recalcCustomerSummary(customerId, all);
            return success;
        }
        return false;
    }

    private async recalcCustomerSummary(customerId: string, allConnections: IntegrationConnection[]) {
        const customerConns = allConnections.filter(c => c.customerId === customerId);

        const google = customerConns.some(c =>
            (c.providerId === 'google_search_console' || c.providerId === 'google_analytics_4') &&
            ['connected', 'demo_connected'].includes(c.status)
        );

        const tools = customerConns.filter(c =>
            !c.providerId.startsWith('google') &&
            ['connected', 'demo_connected'].includes(c.status)
        ).length;

        const errors = customerConns.filter(c => c.status === 'error').length;

        await this.updateCustomer(customerId, {
            connectionSummary: {
                googleConnected: google,
                toolsConnectedCount: tools,
                errorsCount: errors
            }
        });
    }

    // --- Messaging System ---

    async listThreads(customerId?: string): Promise<MessageThread[]> {
        const raw = localStorage.getItem(STORAGE_KEY_THREADS);
        const all: MessageThread[] = raw ? JSON.parse(raw) : [];
        if (customerId) {
            return all.filter(t => t.customerId === customerId);
        }
        return all;
    }

    async getThreadMessages(threadId: string): Promise<Message[]> {
        const raw = localStorage.getItem(STORAGE_KEY_MESSAGES);
        const all: Message[] = raw ? JSON.parse(raw) : [];
        return all.filter(m => m.threadId === threadId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    async createThread(customerId: string, customerName: string, subject: string, initialMessage: string, sender: 'admin' | 'client' = 'client'): Promise<MessageThread> {
        const rawThreads = localStorage.getItem(STORAGE_KEY_THREADS);
        const threads: MessageThread[] = rawThreads ? JSON.parse(rawThreads) : [];

        const threadId = `thread_${Date.now()}`;
        const now = new Date().toISOString();

        const newThread: MessageThread = {
            id: threadId,
            customerId,
            customerName,
            subject,
            status: 'open',
            createdAt: now,
            updatedAt: now,
            unreadCount: {
                admin: sender === 'client' ? 1 : 0,
                client: sender === 'admin' ? 1 : 0
            },
            lastMessage: {
                id: `msg_${Date.now()}`,
                threadId,
                senderId: sender === 'admin' ? 'admin_1' : 'client_1',
                senderRole: sender,
                senderName: sender === 'admin' ? 'Admin Support' : 'Kund',
                content: initialMessage,
                createdAt: now,
                attachments: []
            }
        };

        // Save mock message as well
        const rawMsgs = localStorage.getItem(STORAGE_KEY_MESSAGES);
        const messages: Message[] = rawMsgs ? JSON.parse(rawMsgs) : [];
        messages.push(newThread.lastMessage!);
        localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));

        threads.push(newThread);
        localStorage.setItem(STORAGE_KEY_THREADS, JSON.stringify(threads));

        return newThread;
    }

    async sendMessage(threadId: string, content: string, senderRole: 'admin' | 'client'): Promise<Message> {
        const rawMsgs = localStorage.getItem(STORAGE_KEY_MESSAGES);
        const messages: Message[] = rawMsgs ? JSON.parse(rawMsgs) : [];

        const rawThreads = localStorage.getItem(STORAGE_KEY_THREADS);
        const threads: MessageThread[] = rawThreads ? JSON.parse(rawThreads) : [];
        const threadIndex = threads.findIndex(t => t.id === threadId);

        if (threadIndex === -1) throw new Error("Thread not found");

        const newMessage: Message = {
            id: `msg_${Date.now()}`,
            threadId,
            senderId: senderRole === 'admin' ? 'admin_1' : 'client_1',
            senderRole,
            senderName: senderRole === 'admin' ? 'Admin Support' : 'Kund',
            content,
            attachments: [],
            createdAt: new Date().toISOString()
        };

        messages.push(newMessage);
        localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));

        // Update thread
        const thread = threads[threadIndex];
        const unreadKey = senderRole === 'admin' ? 'client' : 'admin';

        threads[threadIndex] = {
            ...thread,
            lastMessage: newMessage,
            updatedAt: newMessage.createdAt,
            unreadCount: {
                ...thread.unreadCount,
                [unreadKey]: thread.unreadCount[unreadKey] + 1
            }
        };
        localStorage.setItem(STORAGE_KEY_THREADS, JSON.stringify(threads));

        // Create Notification if sender is client
        if (senderRole === 'client') {
            const rawNotifs = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
            const notifications: Notification[] = rawNotifs ? JSON.parse(rawNotifs) : [];
            const newNotif: Notification = {
                id: `notif_${Date.now()}`,
                title: `Nytt meddelande från ${thread.customerName}`,
                message: content.length > 50 ? content.substring(0, 50) + '...' : content,
                type: 'message',
                timestamp: newMessage.createdAt,
                read: false,
                link: '/admin/messages',
                relatedId: threadId,
                recipientRole: 'admin'
            };
            notifications.unshift(newNotif);
            localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
        }

        // Create Notification if sender is admin (notify client)
        if (senderRole === 'admin') {
            const rawNotifs = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
            const notifications: Notification[] = rawNotifs ? JSON.parse(rawNotifs) : [];
            const newNotif: Notification = {
                id: `notif_${Date.now()}`,
                title: `Nytt meddelande från Support`,
                message: content.length > 50 ? content.substring(0, 50) + '...' : content,
                type: 'message',
                timestamp: newMessage.createdAt,
                read: false,
                link: '/support', // Client supports page
                relatedId: threadId,
                recipientRole: 'client',
                recipientId: thread.customerId
            };
            notifications.unshift(newNotif);
            localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
        }

        return newMessage;
    }

    async markThreadRead(threadId: string, role: 'admin' | 'client'): Promise<void> {
        const rawThreads = localStorage.getItem(STORAGE_KEY_THREADS);
        const threads: MessageThread[] = rawThreads ? JSON.parse(rawThreads) : [];
        const threadIndex = threads.findIndex(t => t.id === threadId);

        if (threadIndex >= 0) {
            threads[threadIndex] = {
                ...threads[threadIndex],
                unreadCount: {
                    ...threads[threadIndex].unreadCount,
                    [role]: 0
                }
            };
            localStorage.setItem(STORAGE_KEY_THREADS, JSON.stringify(threads));
        }
    }

    // --- Notifications ---

    async getNotifications(role: 'admin' | 'client', userId?: string): Promise<Notification[]> {
        const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
        const all: Notification[] = raw ? JSON.parse(raw) : [];

        return all.filter(n => {
            if (n.recipientRole === 'all') return true;
            if (n.recipientRole !== role) return false;
            // If it's a client notification and we have a userId, check if it matches (or if no recipientId is set, assume all clients - simplistic)
            if (role === 'client' && userId && n.recipientId && n.recipientId !== userId) return false;
            return true;
        }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    async markNotificationRead(id: string): Promise<void> {
        const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
        const all: Notification[] = raw ? JSON.parse(raw) : [];
        const idx = all.findIndex(n => n.id === id);

        if (idx >= 0) {
            all[idx] = { ...all[idx], read: true };
            localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(all));
        }
    }

    async markAllNotificationsRead(role: 'admin' | 'client', userId?: string): Promise<void> {
        const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
        const all: Notification[] = raw ? JSON.parse(raw) : [];

        const updated = all.map(n => {
            if (n.recipientRole === 'all') return { ...n, read: true };
            if (n.recipientRole !== role) return n;
            if (role === 'client' && userId && n.recipientId && n.recipientId !== userId) return n;
            return { ...n, read: true };
        });
        localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(updated));
    }
    async createNotification(notification: Omit<Notification, "id" | "timestamp" | "read">): Promise<Notification> {
        const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
        const all: Notification[] = raw ? JSON.parse(raw) : [];

        const newOne: Notification = {
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            timestamp: new Date().toISOString(),
            read: false,
            ...notification
        };

        all.unshift(newOne);
        localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(all));
        return newOne;
    }
}

export const adminRepo = new AdminRepository();
