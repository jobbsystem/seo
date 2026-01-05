import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Check, CheckCheck, Sparkles, Plus } from 'lucide-react';
import { Message } from '../../types/message';
import Button from './Button';

interface ChatInterfaceProps {
    messages: Message[];
    currentUserId: string;
    onSendMessage: (content: string, attachments?: File[]) => void;
    placeholder?: string;
    isLoading?: boolean;
    enableAiTools?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
    messages,
    currentUserId,
    onSendMessage,
    placeholder = "Skriv ett meddelande...",
    isLoading = false,
    enableAiTools = false
}) => {
    const [newMessage, setNewMessage] = useState("");
    const [aiLoading, setAiLoading] = useState(false);
    const [pendingAttachments, setPendingAttachments] = useState<{ file: File, preview: string }[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAiAssist = async (mode: 'professional' | 'friendly' | 'shorter') => {
        if (!newMessage.trim()) return;
        setAiLoading(true);

        // Simulating AI delay
        await new Promise(resolve => setTimeout(resolve, 1200));

        let improved = newMessage;
        if (mode === 'professional') {
            improved = `Hej,\n\n${newMessage.charAt(0).toUpperCase() + newMessage.slice(1)}\n\nMed vänlig hälsning,\nAgency Support`;
        } else if (mode === 'friendly') {
            improved = `Hej! 👋\n\n${newMessage} 😊\n\nHör av dig om du undrar något mer!`;
        } else if (mode === 'shorter') {
            improved = "Sammanfattningsvis: " + newMessage.split('.')[0] + ".";
        }

        setNewMessage(improved);
        setAiLoading(false);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, pendingAttachments]);

    const handleSend = () => {
        if ((!newMessage.trim() && pendingAttachments.length === 0) || isLoading) return;

        const filesToSend = pendingAttachments.map(p => p.file);
        onSendMessage(newMessage, filesToSend);

        setNewMessage("");
        setPendingAttachments([]);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            const newAttachments = files.map(file => ({
                file,
                preview: URL.createObjectURL(file)
            }));
            setPendingAttachments(prev => [...prev, ...newAttachments]);
        }
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeAttachment = (index: number) => {
        setPendingAttachments(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <p className="text-sm">Inga meddelanden än.</p>
                        <p className="text-xs">Starta konversationen!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === currentUserId || (msg.senderRole === 'admin' && currentUserId === 'admin_1'); // adjust logic as needed
                        return (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-in`}
                            >
                                <div className={`flex items-end gap-2 max-w-[80%]`}>
                                    {!isMe && (
                                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 mb-1">
                                            {msg.senderName.charAt(0)}
                                        </div>
                                    )}
                                    <div
                                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 px-1">
                                    <span>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {isMe && (
                                        <span className={msg.readAt ? "text-blue-500" : ""}>
                                            {msg.readAt ? <CheckCheck size={12} /> : <Check size={12} />}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
                {/* Pending Attachments Preview */}
                {pendingAttachments.length > 0 && (
                    <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                        {pendingAttachments.map((att, i) => (
                            <div key={i} className="relative group shrink-0">
                                {att.file.type.startsWith('image/') ? (
                                    <img src={att.preview} alt="preview" className="w-20 h-20 object-cover rounded-lg border border-slate-200" />
                                ) : (
                                    <div className="w-20 h-20 bg-slate-50 rounded-lg border border-slate-200 flex flex-col items-center justify-center p-2 text-center">
                                        <Paperclip size={20} className="text-slate-400 mb-1" />
                                        <span className="text-[10px] text-slate-500 line-clamp-2 leading-tight break-all">{att.file.name}</span>
                                    </div>
                                )}
                                <button
                                    onClick={() => removeAttachment(i)}
                                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600 transition-colors"
                                >
                                    <Plus size={12} className="rotate-45" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {enableAiTools && newMessage.trim().length > 3 && (
                    <div className="flex gap-2 mb-3 animate-fade-in">
                        <button
                            onClick={() => handleAiAssist('professional')}
                            className="text-xs bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full border border-purple-100 hover:bg-purple-100 transition-colors flex items-center gap-1"
                        >
                            <Sparkles size={12} />
                            Formell
                        </button>
                        <button
                            onClick={() => handleAiAssist('friendly')}
                            className="text-xs bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full border border-purple-100 hover:bg-purple-100 transition-colors flex items-center gap-1"
                        >
                            <Sparkles size={12} />
                            Trevligare
                        </button>
                        <button
                            onClick={() => handleAiAssist('shorter')}
                            className="text-xs bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full border border-purple-100 hover:bg-purple-100 transition-colors flex items-center gap-1"
                        >
                            <Sparkles size={12} />
                            Korta ner
                        </button>
                    </div>
                )}
                <div className="flex gap-2 items-end">
                    <div className="relative flex-1">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            disabled={aiLoading}
                            className={`w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none min-h-[50px] max-h-[120px] text-sm transition-all ${aiLoading ? 'opacity-50' : ''}`}
                            rows={1}
                        />
                        <button
                            className="absolute right-3 bottom-3 text-slate-400 hover:text-slate-600 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                            title="Bifoga fil"
                        >
                            <Paperclip size={18} />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            className="hidden"
                            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                            onChange={handleFileSelect}
                        />
                    </div>
                    <Button
                        variant="primary"
                        onClick={handleSend}
                        disabled={(!newMessage.trim() && pendingAttachments.length === 0) || isLoading || aiLoading}
                        className="h-[50px] w-[50px] flex items-center justify-center rounded-xl p-0 shrink-0"
                    >
                        {aiLoading ? <Sparkles size={20} className="animate-spin text-purple-200" /> : <Send size={20} className={isLoading ? "animate-pulse" : ""} />}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
