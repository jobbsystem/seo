import React from "react";
import { BellIcon, Bars3Icon, XMarkIcon, ClipboardDocumentListIcon, UserGroupIcon, InboxIcon, Squares2X2Icon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import GlassCard from "../ui/GlassCard";
import SearchInput from "../ui/SearchInput";
import Button from "../ui/Button";
import Badge from "../ui/Badge";

type AdminSection = "dashboard" | "drafts" | "customers" | "notifications" | "messages";

interface AdminLayoutProps {
  section: AdminSection;
  onSectionChange: (s: AdminSection) => void;
  onGenerateDrafts?: () => void;
  unreadCount?: number;
  onLogout?: () => void;
  children: React.ReactNode;
}

const navItems: { key: AdminSection; label: string; icon: any }[] = [
  { key: "dashboard", label: "Dashboard", icon: Squares2X2Icon },
  { key: "messages", label: "Meddelanden", icon: ChatBubbleLeftRightIcon },
  { key: "drafts", label: "Drafts", icon: ClipboardDocumentListIcon },
  { key: "customers", label: "Customers", icon: UserGroupIcon },
  { key: "notifications", label: "Notifications", icon: InboxIcon },
];

const NavItem = ({
  item,
  isActive,
  onClick
}: {
  item: (typeof navItems)[number];
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ease-out ${isActive ? "text-[#0064E1] font-semibold" : "text-slate-700 hover:bg-slate-900/5 hover:text-slate-900"
      }`}
  >
    <item.icon className={`h-5 w-5 ${isActive ? "text-[#0064E1]" : "text-slate-600"}`} />
    <span>{item.label}</span>
  </button>
);

const AdminLayout: React.FC<AdminLayoutProps> = ({
  section,
  onSectionChange,
  onGenerateDrafts,
  unreadCount = 0,
  onLogout,
  children,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  /* New: Load dynamic settings */
  const [agencyName, setAgencyName] = React.useState("ORIGIN");
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadSettings = () => {
      const savedName = localStorage.getItem("seo:settings:agencyName");
      if (savedName) setAgencyName(savedName);

      const savedLogo = localStorage.getItem("seo:settings:logo");
      setLogoUrl(savedLogo); // Set to string or null
    };

    loadSettings();
    window.addEventListener('agency-settings-updated', loadSettings);
    return () => window.removeEventListener('agency-settings-updated', loadSettings);
  }, []);

  return (
    <div className="min-h-screen bg-bg text-slate-900 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 left-[-10%] h-[520px] w-[520px] rounded-full blur-3xl opacity-[0.10] bg-linear-to-br from-sky-500/20 via-indigo-500/20 to-violet-500/20"></div>
      <div className="pointer-events-none absolute top-64 right-[-10%] h-[420px] w-[420px] rounded-full blur-3xl opacity-[0.08] bg-linear-to-br from-sky-500/15 via-indigo-500/15 to-violet-500/15"></div>

      <div className="relative flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[80vw] max-w-[320px] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-72 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-[110%]"
            } flex flex-col m-0 lg:m-4 p-2.5 bg-white/55 backdrop-blur-2xl rounded-[28px] shadow-[0_20px_60px_rgba(15,23,42,0.08)]`}
        >
          {/* Logo Area */}
          <div className="px-5 pt-5 pb-6 mb-4 flex items-start justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                {logoUrl && (
                  <img src={logoUrl} alt="Logo" className="h-8 w-8 object-contain rounded-lg bg-slate-900 p-1" />
                )}
                <span className="text-xl font-bold tracking-[0.18em] text-slate-900 font-display uppercase">{agencyName}</span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-[11px] uppercase tracking-[0.35em] text-slate-500 font-semibold">ADMIN PORTAL</span>
                <span className="h-1.5 w-1.5 bg-accent rounded-full"></span>
              </div>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-500">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
            {navItems.map((item) => (
              <NavItem
                key={item.key}
                item={item}
                isActive={section === item.key}
                onClick={() => {
                  onSectionChange(item.key);
                  setIsMobileMenuOpen(false);
                }}
              />
            ))}
          </div>
          {onLogout && (
            <div className="mt-4">
              <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white/70 backdrop-blur-xl shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
                <div className="w-10 h-10 rounded-full bg-[#0064E1] text-white flex items-center justify-center font-bold">
                  AD
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-900">Admin</span>
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-1 text-xs text-slate-700 hover:text-slate-900 transition"
                  >
                    <span className="inline-block">↩</span> Logga ut
                  </button>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          <header className="relative mx-3 md:mx-6 mt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-3 md:px-5 py-3 shrink-0 rounded-[24px] bg-white/70 backdrop-blur-xl shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <SearchInput placeholder="Sök..." containerClassName="w-full md:w-64" />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <div className="relative h-9 w-9 rounded-full bg-white/70 backdrop-blur-xl shadow-[0_8px_20px_rgba(15,23,42,0.06)] text-slate-600 hover:text-slate-900 transition-all duration-200 ease-out active:scale-[0.98] flex items-center justify-center">
                <BellIcon className="h-5 w-5" />
                {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full"></span>}
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="absolute left-3 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-white/70 backdrop-blur-xl shadow-[0_8px_20px_rgba(15,23,42,0.06)] text-slate-600 hover:text-slate-900 transition-all duration-200 ease-out active:scale-[0.98] flex items-center justify-center lg:hidden"
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
          </header>

          <main className="flex-1 overflow-y-auto px-3 md:px-6 pb-8 pt-4 no-scrollbar">
            <div className="max-w-7xl mx-auto space-y-4">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
