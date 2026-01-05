import React, { useEffect, useState } from 'react';
import { Plus, MessageSquare, ArrowLeft } from 'lucide-react'; // Using Lucide icons to match Admin
import GlassCard from './ui/GlassCard';
import Button from './ui/Button';
import ChatInterface from './ui/ChatInterface';
import { adminRepo } from './api/AdminRepository';
import type { MessageThread, Message } from './types/message';
import { useToast } from './ui/ToastContext';

const SupportPage: React.FC = () => {
  const { success, error } = useToast();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showNewThreadForm, setShowNewThreadForm] = useState(false);

  // New Thread Form
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const currentCustomerId = "origin";
  const currentUserId = "client_1"; // Mock client user ID

  const loadThreads = async () => {
    setLoading(true);
    const data = await adminRepo.listThreads(currentCustomerId);
    setThreads(data.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    setLoading(false);
  };

  useEffect(() => {
    loadThreads();
    const interval = setInterval(loadThreads, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedThreadId) {
      loadMessages(selectedThreadId);
      // Mark as read for client
      adminRepo.markThreadRead(selectedThreadId, 'client').then(loadThreads);
    }
  }, [selectedThreadId]);

  const loadMessages = async (threadId: string) => {
    const msgs = await adminRepo.getThreadMessages(threadId);
    setMessages(msgs);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedThreadId) return;
    await adminRepo.sendMessage(selectedThreadId, content, 'client');
    await loadMessages(selectedThreadId);
    loadThreads();
  };

  const handleCreateThread = async () => {
    if (!newSubject.trim() || !newMessage.trim()) return;
    try {
      const thread = await adminRepo.createThread(currentCustomerId, "Origin.se", newSubject, newMessage);
      setShowNewThreadForm(false);
      setNewSubject("");
      setNewMessage("");
      success("Ditt ärende har skapats!");
      loadThreads();
      setSelectedThreadId(thread.id);
    } catch (err) {
      error("Kunde inte skapa ärendet.");
    }
  };

  // Detail View (Mobile friendly logic could be added here, currently just conditional render)
  if (selectedThreadId) {
    const thread = threads.find(t => t.id === selectedThreadId);
    return (
      <div className="h-[calc(100vh-140px)] flex flex-col animate-fade-in">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" onClick={() => setSelectedThreadId(null)} className="p-2">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{thread?.subject}</h2>
            <p className="text-sm text-slate-500">Supportärende #{thread?.id.slice(-4)}</p>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <ChatInterface
            messages={messages}
            currentUserId={currentUserId}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    );
  }

  // List & New View
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Support & Meddelanden</h1>
          <p className="text-slate-500 mt-1">Kontakta din kontaktperson eller tekniska support.</p>
        </div>
        {!showNewThreadForm && (
          <Button variant="primary" onClick={() => setShowNewThreadForm(true)}>
            <Plus size={18} className="mr-2" />
            Nytt ärende
          </Button>
        )}
      </div>

      {showNewThreadForm ? (
        <GlassCard className="p-6 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-lg">Skapa nytt ärende</h3>
            <Button variant="ghost" onClick={() => setShowNewThreadForm(false)}>Avbryt</Button>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ämne</label>
            <input
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-blue-500 font-medium"
              placeholder="Vad gäller ärendet?"
              value={newSubject}
              onChange={e => setNewSubject(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Meddelande</label>
            <textarea
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-blue-500 min-h-[150px] resize-none"
              placeholder="Beskriv ditt ärende så detaljerat som möjligt..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button variant="primary" onClick={handleCreateThread} disabled={!newSubject.trim() || !newMessage.trim()}>
              Skicka meddelande
            </Button>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Laddar ärenden...</div>
          ) : threads.length === 0 ? (
            <div className="text-center py-16 bg-white/50 rounded-3xl border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Inga ärenden än</h3>
              <p className="text-slate-500 max-w-sm mx-auto mt-1 mb-6">Har du frågor eller behöver hjälp? Starta en ny konversation med oss.</p>
              <Button variant="outline" onClick={() => setShowNewThreadForm(true)}>Skapa ditt första ärende</Button>
            </div>
          ) : (
            threads.map(thread => (
              <GlassCard
                key={thread.id}
                className="p-5 flex items-center justify-between cursor-pointer hover:shadow-md transition-all group"
                onClick={() => setSelectedThreadId(thread.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${thread.unreadCount.client > 0 ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h3 className={`font-semibold text-lg ${thread.unreadCount.client > 0 ? 'text-slate-900' : 'text-slate-700'}`}>
                      {thread.subject}
                    </h3>
                    <p className="text-slate-500 text-sm line-clamp-1 mt-0.5">
                      {thread.lastMessage?.senderRole === 'client' ? 'Du: ' : 'Admin: '}
                      {thread.lastMessage?.content}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span>{new Date(thread.updatedAt).toLocaleDateString()}</span>
                      {thread.status === 'closed' && <span className="px-2 py-0.5 bg-slate-100 rounded-full text-slate-600 font-medium">Avslutad</span>}
                    </div>
                  </div>
                </div>
                {thread.unreadCount.client > 0 && (
                  <div className="w-3 h-3 bg-blue-500 rounded-full shrink-0"></div>
                )}
              </GlassCard>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SupportPage;
