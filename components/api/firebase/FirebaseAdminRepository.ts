// ------------------------------------------------------------------
// FIREBASE ADMIN REPOSITORY (PREPARED)
// ------------------------------------------------------------------
// Implements the AdminRepository interface using Cloud Firestore.
// Uncomment this file after installing 'firebase' package.
// ------------------------------------------------------------------

import { AgencyCustomer, IntegrationConnection, IntegrationProviderId } from "../../types/agency";
import { Message, MessageThread } from "../../../types/message";
import { Notification } from "../../../types/notification";

/*
import { db } from "./config";
import { 
    collection, 
    doc, 
    getDocs, 
    getDoc, 
    setDoc, 
    updateDoc, 
    query, 
    where, 
    orderBy, 
    addDoc,
    Timestamp 
} from "firebase/firestore";

export class FirebaseAdminRepository {

    // --- Customers ---

    async listCustomers(): Promise<AgencyCustomer[]> {
        const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AgencyCustomer));
    }

    async getCustomer(id: string): Promise<AgencyCustomer | null> {
        const docRef = doc(db, "customers", id);
        const snapshot = await getDoc(docRef);
        return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as AgencyCustomer) : null;
    }

    async createCustomer(customer: Omit<AgencyCustomer, "id" | "createdAt" | "updatedAt" | "connectionSummary">): Promise<AgencyCustomer> {
        // Create a new ID automatically or use slug
        const colRef = collection(db, "customers");
        const docRef = doc(colRef); // Auto-ID
        
        const newCustomer: AgencyCustomer = {
            ...customer,
            id: docRef.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            connectionSummary: { googleConnected: false, toolsConnectedCount: 0, errorsCount: 0 }
        };

        await setDoc(docRef, newCustomer);
        return newCustomer;
    }

    async updateCustomer(id: string, updates: Partial<AgencyCustomer>): Promise<void> {
        const docRef = doc(db, "customers", id);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: new Date().toISOString()
        });
    }

    // --- Connections (Sub-collection approach recommended for Firestore) ---
    // Structure: customers/{customerId}/connections/{connectionId}

    async listConnections(customerId: string): Promise<IntegrationConnection[]> {
        const q = collection(db, "customers", customerId, "connections");
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as IntegrationConnection));
    }

    async upsertConnection(
        customerId: string, 
        providerId: IntegrationProviderId, 
        meta: Record<string, any>,
        secret: string | null = null
    ): Promise<IntegrationConnection> {
        // Check if exists
        const q = query(
            collection(db, "customers", customerId, "connections"), 
            where("providerId", "==", providerId)
        );
        const snapshot = await getDocs(q);
        
        const now = new Date().toISOString();
        let ref;
        let data: Partial<IntegrationConnection>;

        if (!snapshot.empty) {
            // Update
            const docSnap = snapshot.docs[0];
            ref = docSnap.ref;
            data = {
                status: secret ? "connected" : docSnap.data().status,
                meta: { ...docSnap.data().meta, ...meta },
                lastSyncAt: secret ? now : docSnap.data().lastSyncAt
            };
            await updateDoc(ref, data);
            return { id: ref.id, ...docSnap.data(), ...data } as IntegrationConnection;
        } else {
            // Create
            const colRef = collection(db, "customers", customerId, "connections");
            ref = doc(colRef);
            data = {
                id: ref.id,
                customerId,
                providerId,
                status: secret ? "connected" : "disconnected",
                meta,
                lastSyncAt: secret ? now : undefined
            };
            await setDoc(ref, data);
            return data as IntegrationConnection;
        }
    }

    async disconnect(customerId: string, providerId: IntegrationProviderId): Promise<void> {
        const q = query(
            collection(db, "customers", customerId, "connections"), 
            where("providerId", "==", providerId)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            await updateDoc(snapshot.docs[0].ref, { status: 'disconnected', meta: {} });
        }
    }

    // --- Messaging (Top-level collection or Sub-collection) ---
    // Using top-level 'threads' for easier admin overview

    async listThreads(customerId?: string): Promise<MessageThread[]> {
        let q = query(collection(db, "threads"), orderBy("updatedAt", "desc"));
        if (customerId) {
            q = query(collection(db, "threads"), where("customerId", "==", customerId), orderBy("updatedAt", "desc"));
        }
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MessageThread));
    }

    async getThreadMessages(threadId: string): Promise<Message[]> {
        const q = query(
            collection(db, "threads", threadId, "messages"),
            orderBy("createdAt", "asc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Message));
    }

    async createThread(customerId: string, customerName: string, subject: string, initialMessage: string, sender: 'admin' | 'client'): Promise<MessageThread> {
        const threadRef = doc(collection(db, "threads"));
        const now = new Date().toISOString();
        
        const newThread: MessageThread = {
            id: threadRef.id,
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
                id: "init", // Temporary placeholder
                threadId: threadRef.id,
                senderId: sender,
                senderRole: sender,
                senderName: sender,
                content: initialMessage,
                createdAt: now,
                attachments: []
            }
        };

        await setDoc(threadRef, newThread);

        // Add first message
        const msgRef = doc(collection(db, "threads", threadRef.id, "messages"));
        const message: Message = {
             id: msgRef.id,
             threadId: threadRef.id,
             senderId: sender,
             senderRole: sender,
             senderName: sender,
             content: initialMessage,
             createdAt: now,
             attachments: []
        };
        await setDoc(msgRef, message);
        
        // Update thread with real LastMessage
        await updateDoc(threadRef, { lastMessage: message });

        return newThread;
    }

    async sendMessage(threadId: string, content: string, senderRole: 'admin' | 'client'): Promise<Message> {
        const threadRef = doc(db, "threads", threadId);
        const msgRef = doc(collection(db, "threads", threadId, "messages"));
        
        const now = new Date().toISOString();
        const message: Message = {
             id: msgRef.id,
             threadId: threadId,
             senderId: senderRole,
             senderRole: senderRole,
             senderName: senderRole, // Should fetch real name
             content: content,
             createdAt: now,
             attachments: []
        };

        await setDoc(msgRef, message);

        // Update thread (Atomic increment ideally)
        // For simplicity:
        const threadSnap = await getDoc(threadRef);
        const currentUnread = threadSnap.data()?.unreadCount || { admin: 0, client: 0 };
        const target = senderRole === 'admin' ? 'client' : 'admin';
        
        await updateDoc(threadRef, {
            lastMessage: message,
            updatedAt: now,
            [`unreadCount.${target}`]: currentUnread[target] + 1
        });

        return message;
    }

    // --- Notifications ---

    async getNotifications(role: 'admin' | 'client'): Promise<Notification[]> {
        const q = query(
            collection(db, "notifications"), 
            where("recipientRole", "==", role),
            orderBy("timestamp", "desc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
    }

    async createNotification(notification: Omit<Notification, "id" | "timestamp" | "read">): Promise<Notification> {
        const ref = doc(collection(db, "notifications"));
        const newNotif = {
            id: ref.id,
            ...notification,
            timestamp: new Date().toISOString(),
            read: false
        };
        await setDoc(ref, newNotif);
        return newNotif;
    }

    async markNotificationRead(id: string): Promise<void> {
        await updateDoc(doc(db, "notifications", id), { read: true });
    }
    
    async markAllNotificationsRead(role: string): Promise<void> {
        // Batch update needed
        // For now, simpler:
        const notifs = await this.getNotifications(role as any);
        const unread = notifs.filter(n => !n.read);
        for (const n of unread) {
            await updateDoc(doc(db, "notifications", n.id), { read: true });
        }
    }
}

export const adminRepo = new FirebaseAdminRepository();
*/
