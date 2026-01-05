export type NotificationType = 'message' | 'system' | 'alert' | 'info';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    timestamp: string; // ISO string
    read: boolean;
    link?: string; // URL/path to navigate to
    relatedId?: string; // ID of related entity (e.g. threadId)
    recipientRole: 'admin' | 'client' | 'all';
    recipientId?: string; // If specific client
}
