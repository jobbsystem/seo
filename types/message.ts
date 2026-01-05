export type MessageSenderRole = 'admin' | 'client' | 'system';

export interface MessageAttachment {
    id: string;
    name: string;
    url: string;
    type: 'image' | 'document' | 'other';
    size: number;
}

export interface Message {
    id: string;
    threadId: string;
    senderId: string;
    senderRole: MessageSenderRole;
    senderName: string;
    content: string;
    attachments: MessageAttachment[];
    readAt?: string; // ISO date string
    createdAt: string; // ISO date string
}

export interface MessageThread {
    id: string;
    customerId: string;
    customerName: string; // Denormalized for list views
    subject: string;
    lastMessage?: Message;
    unreadCount: {
        admin: number;
        client: number;
    };
    status: 'open' | 'closed' | 'archived';
    createdAt: string;
    updatedAt: string;
}

export interface MessageFilters {
    status?: 'open' | 'closed' | 'archived';
    customerId?: string;
    search?: string;
}
