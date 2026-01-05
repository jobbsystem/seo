import React from 'react';
import { LayoutDashboard, Users, FileText, Settings, LogOut, LucideIcon, Flag, Workflow, MessageSquare } from 'lucide-react';
import GlassCard from '../../ui/GlassCard';

type NavItemProp = {
    id: string;
    label: string;
    icon: LucideIcon;
};

interface AdminSidebarProps {
    currentSection: string;
    onSectionChange: (section: string) => void;
    onLogout?: () => void;
}

const NAV_ITEMS: NavItemProp[] = [
    { id: 'dashboard', label: 'Översikt', icon: LayoutDashboard },
    { id: 'customers', label: 'Kunder', icon: Users },
    { id: 'action-plans', label: 'Handlingsplan', icon: Flag },
    { id: 'reports', label: 'Rapporter', icon: FileText },
    { id: 'automation', label: 'Automatisering', icon: Workflow },
    { id: 'settings', label: 'Inställningar', icon: Settings },
    { id: 'messages', label: 'Meddelanden', icon: MessageSquare },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentSection, onSectionChange, onLogout }) => {
    /* Dynamic Brand Settings */
    const [agencyName, setAgencyName] = React.useState("AgencyOS");
    const [logoUrl, setLogoUrl] = React.useState<string | null>(null);

    React.useEffect(() => {
        const loadSettings = () => {
            const savedName = localStorage.getItem("seo:settings:agencyName");
            if (savedName) setAgencyName(savedName);

            const savedLogo = localStorage.getItem("seo:settings:logo");
            setLogoUrl(savedLogo);
        };

        loadSettings();
        window.addEventListener('agency-settings-updated', loadSettings);
        return () => window.removeEventListener('agency-settings-updated', loadSettings);
    }, []);

    return (
        <div className="w-64 h-full flex flex-col border-r border-slate-200/60 bg-white/50 backdrop-blur-xl">
            {/* Brand */}
            <div className="h-16 flex items-center px-6 border-b border-slate-200/60">
                <div className="flex items-center gap-3">
                    {logoUrl ? (
                        <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-slate-100">
                            <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-lg leading-none pt-0.5">
                            {agencyName.substring(0, 1).toUpperCase()}
                        </div>
                    )}
                    <span className="font-bold text-slate-900 tracking-tight truncate">{agencyName}</span>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 px-3 space-y-1">
                {NAV_ITEMS.map((item) => {
                    const isActive = currentSection === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onSectionChange(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                        >
                            <item.icon size={18} strokeWidth={2} className={isActive ? 'text-white' : 'text-slate-400'} />
                            {item.label}
                        </button>
                    );
                })}
            </div>

            {/* User / Logout */}
            <div className="p-4 border-t border-slate-200/60">
                <div className="flex items-center justify-between px-2">
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-900">Administrator</span>
                        <span className="text-[10px] text-slate-500">admin@agency.se</span>
                    </div>
                    <button
                        onClick={onLogout}
                        className="p-2 rounded-lg text-slate-400 hover:text-danger hover:bg-danger/10 transition-colors"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminSidebar;
