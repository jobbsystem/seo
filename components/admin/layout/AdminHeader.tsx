import React from 'react';
import { Bell, Search } from 'lucide-react';
import { adminRepo } from '../../api/AdminRepository';

interface AdminHeaderProps {
    title: string;
    unreadNotifications?: number;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, unreadNotifications = 0 }) => {
    const [showNotifications, setShowNotifications] = React.useState(false);
    const [notifications, setNotifications] = React.useState<any[]>([]);
    const [unreadCount, setUnreadCount] = React.useState(0);
    const notificationRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const fetchNotifications = async () => {
            const data = await adminRepo.getNotifications('admin');
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.read).length);
        };

        fetchNotifications();
        // Poll for notifications
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleNotificationClick = async (notification: any) => {
        if (!notification.read) {
            await adminRepo.markNotificationRead(notification.id);
            setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }

        setShowNotifications(false);

        if (notification.link) {
            window.location.hash = notification.link.replace('/admin/', '');
        }
    };

    return (
        <header className="h-16 px-8 flex items-center justify-between border-b border-slate-200/60 bg-white/50 backdrop-blur-xl sticky top-0 z-10">
            <h1 className="text-lg font-semibold text-slate-900 tracking-tight">{title}</h1>

            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-64 rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-0 transition-all"
                        placeholder="Sök..."
                    />
                </div>

                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all ${showNotifications ? 'bg-slate-100 text-slate-600' : ''}`}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in origin-top-right z-50">
                            <div className="p-3 border-b border-slate-50 flex justify-between items-center">
                                <h3 className="font-semibold text-sm text-slate-900">Notiser</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            await adminRepo.markAllNotificationsRead('admin');
                                            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                                            setUnreadCount(0);
                                        }}
                                        className="text-[10px] font-medium text-blue-600 hover:text-blue-800"
                                    >
                                        Markera alla som lästa
                                    </button>
                                )}
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map(notification => (
                                        <button
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`w-full text-left p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 ${notification.read ? 'opacity-60' : 'bg-blue-50/10'}`}
                                        >
                                            <div className={`shrink-0 w-2 h-2 mt-1.5 rounded-full ${notification.read ? 'bg-transparent' : 'bg-blue-500'}`} />
                                            <div>
                                                <div className="text-xs font-semibold text-slate-800 mb-0.5">{notification.title}</div>
                                                <div className="text-xs text-slate-500 leading-relaxed line-clamp-2">{notification.message}</div>
                                                <div className="text-[10px] text-slate-400 mt-1">
                                                    {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-slate-400 text-sm">
                                        Inga notiser just nu.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
