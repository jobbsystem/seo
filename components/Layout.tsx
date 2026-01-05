import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View } from '../types';
import {
  HomeIcon,
  CameraIcon,
  LifebuoyIcon,
  MegaphoneIcon,
  ComputerDesktopIcon,
  NewspaperIcon,
  PaperClipIcon,
  PencilSquareIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  Bars3Icon,
  SparklesIcon,
  XMarkIcon,
  ChartBarSquareIcon,
  ReceiptPercentIcon,
  FlagIcon
} from '@heroicons/react/24/outline';
import { NEWS_ITEMS } from '../constants';
import GlassCard from './ui/GlassCard';
import SearchInput from './ui/SearchInput';
import Button from './ui/Button';
import { adminRepo } from './api/AdminRepository';
import { useToast } from './ui/ToastContext';

interface LayoutProps {
  currentView: View;
  onChangeView: (view: View) => void;
  onLogout: () => void;
  currentUserName: string;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, onChangeView, onLogout, currentUserName, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  // Notification State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notificationRef = useRef<HTMLDivElement>(null);

  // Agency Branding State
  const [agencyName, setAgencyName] = useState('ORIGIN');
  // logoUrl removed as per user request (only name should sync)

  useEffect(() => {
    // Load agency settings
    const loadSettings = () => {
      const savedName = localStorage.getItem("seo:settings:agencyName");
      if (savedName) setAgencyName(savedName);
    };
    loadSettings();

    // Listen for updates (if admin changes locally)
    window.addEventListener('agency-settings-updated', loadSettings);
    return () => window.removeEventListener('agency-settings-updated', loadSettings);
  }, []);

  // Hardcoded demo customer ID
  const DEMO_CUSTOMER_ID = 'origin';

  useEffect(() => {
    const fetchNotifications = async () => {
      const data = await adminRepo.getNotifications('client', DEMO_CUSTOMER_ID);
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.read).length);
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close notifications on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await adminRepo.markNotificationRead(notification.id);
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    setShowNotifications(false);

    if (notification.link) {
      // Simple client-side navigation mapping
      if (notification.link === '/seo') onChangeView(View.SEO);
      else if (notification.link === '/support') onChangeView(View.SUPPORT);
      else if (notification.link === '/files') onChangeView(View.FILES);
      else if (notification.link === '/news') onChangeView(View.NEWS);
      // Add more mappings as needed
    }
  };

  const normalizeValue = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const searchItems = useMemo(() => {
    const baseItems = [
      { label: 'Start', view: View.DASHBOARD, type: 'Sida', keywords: ['dashboard', 'oversikt'] },
      { label: 'SEO Resultat', view: View.SEO, type: 'Sida', keywords: ['seo', 'analys', 'ranking'] },
      { label: 'Handlingsplan', view: View.ACTION_PLAN, type: 'Sida', keywords: ['handlingsplan', 'strategi', 'roadmap'] },
      { label: 'Dokument', view: View.FILES, type: 'Sida', keywords: ['filer', 'bilagor', 'avtal', 'rapporter'] },
      { label: 'Support', view: View.SUPPORT, type: 'Sida', keywords: ['hjälp', 'arende'] },
      { label: 'Nyheter', view: View.NEWS, type: 'Sida', keywords: ['insikter', 'uppdateringar'] },
      { label: 'Fakturor', view: View.INVOICES, type: 'Sida', keywords: ['fakturering', 'betalning', 'kvitto'] },
      { label: 'Google Ads', view: View.PRODUCT_GOOGLE, type: 'Tjänst', keywords: ['annonsering', 'ads', 'google'] },
      { label: 'META Ads', view: View.PRODUCT_META, type: 'Tjänst', keywords: ['facebook', 'instagram', 'meta'] },
      { label: 'AI-SEO (GEO)', view: View.PRODUCT_AI_SEO, type: 'Tjänst', keywords: ['ai', 'geo', 'llm', 'answer engine'] },
      { label: 'SEO-texter', view: View.PRODUCT_CONTENT, type: 'Tjänst', keywords: ['copy', 'texter', 'content'] },
      { label: 'Hemsida', view: View.PRODUCT_WEBSITE, type: 'Tjänst', keywords: ['webb', 'webbplats', 'site'] }
    ];

    const newsItems = NEWS_ITEMS.map((item) => ({
      label: item.title,
      view: View.NEWS,
      type: 'Nyhet',
      keywords: [item.summary]
    }));

    return [...baseItems, ...newsItems];
  }, []);

  const filteredResults = useMemo(() => {
    const query = normalizeValue(searchQuery.trim());
    if (!query) return [];
    return searchItems
      .filter((item) => {
        const haystack = [item.label, ...(item.keywords || [])].join(' ');
        return normalizeValue(haystack).includes(query);
      })
      .slice(0, 6);
  }, [searchItems, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!searchContainerRef.current?.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultSelect = (view: View) => {
    onChangeView(view);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const viewTitle = (() => {
    switch (currentView) {
      case View.DASHBOARD:
        return 'Start';
      case View.SEO:
        return 'SEO Resultat';
      case View.SUPPORT:
        return 'Support';
      case View.FILES:
        return 'Dokument';
      case View.NEWS:
        return 'Nyheter';
      case View.INVOICES:
        return 'Fakturor';
      case View.ADMIN:
        return 'Admin';
      case View.PRODUCT_GOOGLE:
        return 'Google Ads';
      case View.PRODUCT_META:
        return 'META Ads';
      case View.PRODUCT_AI_SEO:
        return 'AI-SEO (GEO)';
      case View.PRODUCT_CONTENT:
        return 'SEO-texter';
      case View.PRODUCT_WEBSITE:
        return 'Hemsida';
      default:
        return 'Tjänster';
    }
  })();
  const isDashboard = currentView === View.DASHBOARD;

  const NavItem = ({ view, icon: Icon, label, isSubItem = false }: { view: View; icon: any; label: string; isSubItem?: boolean }) => (
    <button
      onClick={() => {
        onChangeView(view);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-3 rounded-xl px-3 py-1.5 text-[15px] font-medium transition-all duration-200 ease-out ${currentView === view
        ? 'text-[#0064E1] font-semibold'
        : 'text-slate-700 hover:bg-slate-900/5 hover:text-slate-900'
        } ${isSubItem ? 'pl-7 text-xs' : ''}`}
    >
      <Icon
        className={`transition-colors ${currentView === view ? 'text-[#0064E1]' : 'text-slate-600'} ${isSubItem ? 'h-4 w-4' : 'h-5 w-5'}`}
      />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-bg text-slate-900 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 left-[-10%] h-[520px] w-[520px] rounded-full blur-3xl opacity-[0.10] bg-gradient-to-br from-sky-500/20 via-indigo-500/20 to-violet-500/20"></div>
      <div className="pointer-events-none absolute top-64 right-[-10%] h-[420px] w-[420px] rounded-full blur-3xl opacity-[0.08] bg-gradient-to-br from-sky-500/15 via-indigo-500/15 to-violet-500/15"></div>
      <div className="relative flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[80vw] max-w-[320px] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-72 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-[110%]'
            } flex flex-col m-0 lg:m-4 p-2.5 bg-white/55 backdrop-blur-2xl rounded-[28px] shadow-[0_20px_60px_rgba(15,23,42,0.08)]`}
        >
          {/* Logo Area */}
          <div className="px-5 pt-5 pb-6 mb-4 flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-[0.18em] text-slate-900 font-display">{agencyName}</span>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-[11px] uppercase tracking-[0.35em] text-slate-500 font-semibold">KUNDPORTAL</span>
                <span className="h-1.5 w-1.5 bg-accent rounded-full"></span>
              </div>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-500">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="h-2"></div>

          {/* Navigation Scroll Area */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
            <NavItem view={View.DASHBOARD} icon={HomeIcon} label="Start" />
            <NavItem view={View.SEO} icon={ChartBarSquareIcon} label="SEO Resultat" />
            <NavItem view={View.ACTION_PLAN} icon={FlagIcon} label="Handlingsplan" />
            <NavItem view={View.FILES} icon={PaperClipIcon} label="Dokument" />
            <NavItem view={View.SUPPORT} icon={LifebuoyIcon} label="Support" />
            <NavItem view={View.NEWS} icon={NewspaperIcon} label="Nyheter" />

            <div className="mt-4 mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">Tilläggstjänster +</div>
            <NavItem view={View.PRODUCT_GOOGLE} icon={MegaphoneIcon} label="Google Ads" />
            <NavItem view={View.PRODUCT_META} icon={CameraIcon} label="META Ads" />
            <NavItem view={View.PRODUCT_AI_SEO} icon={SparklesIcon} label="AI-SEO (GEO)" />
            <NavItem view={View.PRODUCT_CONTENT} icon={PencilSquareIcon} label="SEO-texter" />
            <NavItem view={View.PRODUCT_WEBSITE} icon={ComputerDesktopIcon} label="Hemsida" />
            <div className="mt-4 h-px bg-slate-900/10 mx-3"></div>
            <NavItem view={View.INVOICES} icon={ReceiptPercentIcon} label="Fakturor" />
          </div>

          {/* User Profile / Logout */}
          <GlassCard className="mt-4 p-2.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center overflow-hidden">
              <img src={`https://ui-avatars.com/api/?name=${currentUserName}&background=0064E1&color=fff`} alt="User" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{currentUserName}</p>
              <div className="flex justify-start items-center gap-3">
                <button
                  onClick={() => onChangeView(View.SETTINGS)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Inställningar
                </button>
                <div className="h-3 w-px bg-slate-200"></div>
                <Button variant="ghost" onClick={onLogout} className="-ml-1 px-0 py-0 text-xs text-slate-600 hover:text-red-600">
                  <ArrowRightOnRectangleIcon className="h-3 w-3" /> Logga ut
                </Button>
              </div>
            </div>
          </GlassCard>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          {/* Top Header */}
          <header
            className={`relative mx-3 md:mx-6 mt-3 flex flex-col gap-2 px-3 md:px-5 py-2 shrink-0 rounded-[24px] bg-white/70 backdrop-blur-xl shadow-[0_10px_30px_rgba(15,23,42,0.06)] z-30 ${isDashboard
              ? 'lg:flex-row lg:items-center lg:justify-between lg:min-h-[72px]'
              : 'md:flex-row md:items-center md:justify-between md:min-h-[72px]'
              }`}
          >
            <div className="flex items-center gap-4 min-w-0 w-full lg:w-auto pr-12 pl-12 lg:pl-0 lg:items-center">
              <div className="min-w-0">
                {currentView === View.DASHBOARD && (
                  <span className="text-[11px] uppercase tracking-[0.16em] text-slate-500 font-semibold whitespace-nowrap">Dagens översikt</span>
                )}
                <h2 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight leading-tight truncate">
                  {viewTitle}
                </h2>
                {currentView === View.DASHBOARD && (
                  <p className="text-sm text-slate-600 mt-1">
                    Välkommen, {currentUserName}. ORIGIN hjälper dig att ligga steget före – med insikter, struktur och funktioner som driver verklig tillväxt.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 w-full lg:w-auto justify-end pr-14 lg:pr-0 lg:items-center">
              <div className="relative hidden md:block" ref={searchContainerRef}>
                <SearchInput
                  placeholder="Sök..."
                  containerClassName="w-56 md:w-64 lg:w-64 md:mr-12"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && filteredResults.length > 0) {
                      handleResultSelect(filteredResults[0].view);
                    }
                  }}
                />
                {isSearchOpen && searchQuery.trim() && (
                  <div className="absolute left-0 right-0 mt-2 rounded-2xl bg-white/70 backdrop-blur-xl shadow-[0_10px_30px_rgba(15,23,42,0.06)] overflow-hidden z-20">
                    <div className="px-3.5 py-2.5 text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">Sökresultat</div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredResults.length === 0 ? (
                        <div className="px-3.5 pb-3 text-sm text-slate-600">Inga träffar ännu.</div>
                      ) : (
                        filteredResults.map((result) => (
                          <button
                            key={`${result.type}-${result.label}`}
                            type="button"
                            onMouseDown={(event) => {
                              event.preventDefault();
                              handleResultSelect(result.view);
                            }}
                            className="w-full text-left px-3.5 py-2.5 hover:bg-slate-900/5 transition-colors flex items-center justify-between gap-4"
                          >
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{result.label}</div>
                              <div className="text-xs text-slate-600">{result.type}</div>
                            </div>
                            <span className="text-xs text-slate-600">Öppna</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div className="relative z-50" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative hidden lg:flex h-9 w-9 rounded-full shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition-all duration-200 ease-out active:scale-[0.98] items-center justify-center ${showNotifications ? 'bg-slate-100 text-slate-600' : 'bg-white/70 backdrop-blur-xl text-slate-600 hover:text-slate-900'}`}
                >
                  <BellIcon className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in origin-top-right z-50">
                    <div className="p-3 border-b border-slate-50 flex justify-between items-center">
                      <h3 className="font-semibold text-sm text-slate-900">Notiser</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await adminRepo.markAllNotificationsRead('client', DEMO_CUSTOMER_ID);
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

            {/* Mobile Open Menu */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="absolute left-3 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-white/70 backdrop-blur-xl shadow-[0_8px_20px_rgba(15,23,42,0.06)] text-slate-600 hover:text-slate-900 transition-all duration-200 ease-out active:scale-[0.98] flex items-center justify-center lg:hidden"
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowNotifications(!showNotifications)} // Mobile toggle
              className="absolute right-3 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-white/70 backdrop-blur-xl shadow-[0_8px_20px_rgba(15,23,42,0.06)] text-slate-600 hover:text-slate-900 transition-all duration-200 ease-out active:scale-[0.98] flex items-center justify-center lg:hidden"
            >
              <BellIcon className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto px-3 md:px-6 pb-8 pt-4 no-scrollbar">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
