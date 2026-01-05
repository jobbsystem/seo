import React, { useEffect, useState } from 'react';
import { adminRepo } from '../../api/AdminRepository';
import { MessageThread, Message } from '../../../types/message';
import ChatInterface from '../../ui/ChatInterface';
import { Search, MessageSquare, Clock, Plus, Sparkles } from 'lucide-react';
import { useToast } from '../../ui/ToastContext';

const AdminMessages: React.FC = () => {
    const [threads, setThreads] = useState<MessageThread[]>([]);
    const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [customers, setCustomers] = useState<{ id: string, name: string }[]>([]);
    const [newMessage, setNewMessage] = useState({
        customerId: '',
        subject: '',
        content: ''
    });
    const { success, error } = useToast();

    const mockAiEnhance = (mode: 'professional' | 'friendly') => {
        let improved = newMessage.content;
        if (mode === 'professional') {
            improved = `Hej,\n\n${newMessage.content}\n\nMed vänlig hälsning,\nAgency Support`;
        } else if (mode === 'friendly') {
            improved = `Hej! 👋\n\n${newMessage.content} 😊\n\nHör av dig om du behöver hjälp!`;
        }
        setNewMessage({ ...newMessage, content: improved });
        success("AI putsade till texten! ✨");
    };

    // Load available customers for the dropdown
    const loadCustomers = async () => {
        const data = await adminRepo.listCustomers();
        setCustomers(data.map(c => ({ id: c.id, name: c.companyName })));
    };

    useEffect(() => {
        if (isModalOpen) {
            loadCustomers();
        }
    }, [isModalOpen]);

    const handleCreateThread = async () => {
        if (!newMessage.customerId || !newMessage.subject || !newMessage.content) {
            error("Alla fält måste fyllas i");
            return;
        }

        try {
            const customer = customers.find(c => c.id === newMessage.customerId);
            if (!customer) return;

            const newThread = await adminRepo.createThread(
                customer.id,
                customer.name,
                newMessage.subject,
                newMessage.content,
                'admin' // Explicitly set as admin-initiated
            );

            setNewMessage({ customerId: '', subject: '', content: '' });
            setIsModalOpen(false);
            success("Meddelande skickat");

            await refreshThreads();
            setSelectedThreadId(newThread.id);
        } catch (e) {
            console.error(e);
            error("Kunde inte skicka meddelande");
        }
    };

    const refreshThreads = async () => {
        const data = await adminRepo.listThreads();
        setThreads(data.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
        setLoading(false);
    };

    useEffect(() => {
        refreshThreads();
        // Poll for new messages every 30s
        const interval = setInterval(refreshThreads, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedThreadId) {
            loadMessages(selectedThreadId);
            // Mark as read when opening
            adminRepo.markThreadRead(selectedThreadId, 'admin').then(refreshThreads);
        }
    }, [selectedThreadId]);

    const loadMessages = async (threadId: string) => {
        setLoadingMessages(true);
        const msgs = await adminRepo.getThreadMessages(threadId);
        setMessages(msgs);
        setLoadingMessages(false);
    };

    const handleSendMessage = async (content: string, attachments?: File[]) => {
        if (!selectedThreadId) return;

        // Mock uploading attachments if any
        if (attachments && attachments.length > 0) {
            console.log("Uploading attachments:", attachments.map(f => f.name));
            // In a real app we would upload these first and get IDs back
        }

        await adminRepo.sendMessage(selectedThreadId, content, 'admin');
        await loadMessages(selectedThreadId);
        refreshThreads();
    };

    const filteredThreads = threads.filter(t =>
        t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedThread = threads.find(t => t.id === selectedThreadId);

    return (
        <div className="h-[calc(100vh-140px)] flex gap-6 relative">
            {/* Sidebar List */}
            <div className="w-80 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden shrink-0">
                <div className="p-4 border-b border-slate-100 space-y-3">
                    <div className="flex justify-between items-center">
                        <h2 className="font-bold text-slate-800">Inbox</h2>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-slate-900 hover:bg-slate-800 text-white p-1.5 rounded-lg transition-colors"
                            title="Nytt meddelande"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            placeholder="Sök diskussion..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredThreads.map(thread => (
                        <div
                            key={thread.id}
                            onClick={() => setSelectedThreadId(thread.id)}
                            className={`p-4 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50 ${selectedThreadId === thread.id ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-sm font-semibold truncate ${thread.unreadCount.admin > 0 ? 'text-slate-900' : 'text-slate-600'}`}>
                                    {thread.customerName}
                                </span>
                                <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                                    {new Date(thread.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                            <div className={`text-xs mb-1 truncate ${thread.unreadCount.admin > 0 ? 'font-bold text-slate-800' : 'text-slate-500'}`}>
                                {thread.subject}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                                {thread.lastMessage?.senderRole === 'admin' ? 'Du: ' : ''}
                                {thread.lastMessage?.content || 'Inget meddelande'}
                            </div>

                            {thread.unreadCount.admin > 0 && (
                                <div className="mt-2 flex justify-end">
                                    <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                        {thread.unreadCount.admin}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}

                    {filteredThreads.length === 0 && (
                        <div className="p-8 text-center text-slate-400 text-sm">
                            Inga konversationer hittades.
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 min-w-0">
                {selectedThreadId ? (
                    <div className="h-full flex flex-col">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-slate-800">{selectedThread?.subject}</h2>
                            <p className="text-sm text-slate-500">Konversation med <span className="font-semibold text-slate-700">{selectedThread?.customerName}</span></p>
                        </div>
                        <div className="flex-1 min-h-0">
                            <ChatInterface
                                messages={messages}
                                currentUserId="admin_1" // Mock Admin ID
                                onSendMessage={handleSendMessage}
                                isLoading={loadingMessages}
                                enableAiTools={true}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                            <MessageSquare className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-600">Välj en konversation</h3>
                        <p className="text-sm max-w-xs text-center mt-2">Klicka på en tråd i listan till vänster för att läsa och svara på meddelanden, eller starta en ny.</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors text-sm font-medium"
                        >
                            Nytt Meddelande
                        </button>
                    </div>
                )}
            </div>

            {/* New Message Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-900">Nytt Meddelande</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Mottagare</label>
                                <select
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none text-sm"
                                    value={newMessage.customerId}
                                    onChange={e => setNewMessage({ ...newMessage, customerId: e.target.value })}
                                >
                                    <option value="">Välj kund...</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Ämne</label>
                                <input
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none text-sm"
                                    placeholder="Vad gäller ärendet?"
                                    value={newMessage.subject}
                                    onChange={e => setNewMessage({ ...newMessage, subject: e.target.value })}
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Meddelande</label>
                                    {newMessage.content.length > 3 && (
                                        <div className="flex gap-1">
                                            <button onClick={() => mockAiEnhance('professional')} className="text-[10px] bg-purple-50 text-purple-700 px-2 py-1 rounded-full hover:bg-purple-100 flex items-center gap-1">
                                                <Sparkles size={10} /> Formell
                                            </button>
                                            <button onClick={() => mockAiEnhance('friendly')} className="text-[10px] bg-purple-50 text-purple-700 px-2 py-1 rounded-full hover:bg-purple-100 flex items-center gap-1">
                                                <Sparkles size={10} /> Trevlig
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <textarea
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none text-sm min-h-[120px] resize-none transition-all"
                                    placeholder="Skriv ditt meddelande här..."
                                    value={newMessage.content}
                                    onChange={e => setNewMessage({ ...newMessage, content: e.target.value })}
                                />
                            </div>

                            <div className="pt-2 flex gap-3 justify-end">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Avbryt
                                </button>
                                <button
                                    onClick={handleCreateThread}
                                    className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
                                >
                                    Skicka
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMessages;
