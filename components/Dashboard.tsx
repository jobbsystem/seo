
import React, { useMemo, useState, useEffect } from 'react';
import { adminRepo } from './api/AdminRepository';
import { View, TeamMember } from '../types';
import { TEAM_MEMBERS as INITIAL_TEAM_MEMBERS, NEWS_ITEMS, SEO_STATS, CHART_DATA } from '../constants';
import {
    ArrowRightIcon,
    ChatBubbleLeftRightIcon,
    MegaphoneIcon,
    ComputerDesktopIcon,
    ArrowTrendingUpIcon,
    ClockIcon,
    ChartBarIcon,
    ArrowTrendingDownIcon,
    UsersIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import GlassCard from './ui/GlassCard';
import Button from './ui/Button';
import Badge from './ui/Badge';

interface DashboardProps {
    onChangeView: (view: View) => void;
    currentUserName: string;
    currentUserEmail?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ onChangeView, currentUserName, currentUserEmail }) => {
    // Dynamic Team State
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);

    useEffect(() => {
        const loadSettings = async () => {
            // Priority 1: Customer-specific assigned team
            if (currentUserEmail) {
                const customers = await adminRepo.listCustomers();
                const currentCustomer = customers.find(c => c.email.toLowerCase() === currentUserEmail.toLowerCase());

                if (currentCustomer && currentCustomer.assignedTeam && currentCustomer.assignedTeam.length > 0) {
                    setTeamMembers(currentCustomer.assignedTeam);
                    return;
                }
            }

            // Priority 2: Global Agency Team Settings
            const savedTeam = localStorage.getItem("seo:settings:team");
            if (savedTeam) {
                setTeamMembers(JSON.parse(savedTeam));
                return;
            }

            // Fallback: Default Initial Team
            setTeamMembers(INITIAL_TEAM_MEMBERS);
        };
        loadSettings();
        window.addEventListener('agency-settings-updated', loadSettings);
        return () => window.removeEventListener('agency-settings-updated', loadSettings);
    }, [currentUserEmail]);

    const timeOfDay = new Date().getHours() < 12 ? 'God morgon' : 'God eftermiddag';
    // Add state for notifications to show in calendar
    const [calendarEvents, setCalendarEvents] = React.useState<any[]>([]);

    React.useEffect(() => {
        const fetchEvents = async () => {
            // Reusing the same repo/logic as Layout to get client notifications
            // In a real app we might pass this as prop or context to avoid double fetch
            const { adminRepo } = await import('./api/AdminRepository');
            const data = await adminRepo.getNotifications('client', 'origin'); // Hardcoded demo ID
            setCalendarEvents(data);
        };
        fetchEvents();
    }, []);

    // State for selected date to show details
    const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);

    const monthLabel = useMemo(() => {
        const today = new Date();
        const monthYear = today.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' });
        return monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
    }, []);

    // Filter events for selected date
    const selectedDateEvents = useMemo(() => {
        if (!selectedDate) return [];
        return calendarEvents.filter(e => {
            const eDate = new Date(e.timestamp);
            return eDate.getDate() === selectedDate.getDate() &&
                eDate.getMonth() === selectedDate.getMonth() &&
                eDate.getFullYear() === selectedDate.getFullYear();
        }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [selectedDate, calendarEvents]);

    return (
        <div className="space-y-4 sm:space-y-5 animate-fade-in pb-8">

            <div className="flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-5">
                <div className="flex-1 space-y-4 sm:space-y-5">
                    <GlassCard className="p-4 sm:p-5 md:p-6 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-5 relative z-10">
                            <div>
                                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900 mb-1">Trafiköversikt</h3>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span className="font-medium">{monthLabel}</span>
                                    <span className="w-1 h-1 bg-slate-400/60 rounded-full"></span>
                                    <span className="text-accent font-semibold">Live</span>
                                </div>
                            </div>
                            <Button
                                variant="secondary"
                                onClick={() => onChangeView(View.SEO)}
                                className="px-3 py-1.5 text-[11px] sm:text-xs font-semibold"
                            >
                                Resultat
                            </Button>
                        </div>

                        <div className="flex items-end gap-4 sm:gap-5 mb-5 relative z-10">
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-[28px] sm:text-[32px] font-semibold text-slate-900 tracking-tight">39.2k</span>
                                    <span className="text-slate-500 font-medium">/ 50k</span>
                                </div>
                                <p className="text-slate-600 text-sm font-medium mt-1">Totala visningar denna månad</p>
                            </div>
                            <div className="mb-2">
                                <Badge className="px-3 py-1 text-sm font-semibold">
                                    <ArrowTrendingUpIcon className="h-4 w-4" />
                                    <span>+12.5%</span>
                                </Badge>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="h-32 sm:h-36 w-full relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={CHART_DATA}>
                                    <defs>
                                        <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0064E1" stopOpacity={0.18} />
                                            <stop offset="95%" stopColor="#0064E1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '16px', border: 'none', color: '#0f172a', backdropFilter: 'blur(18px)' }}
                                        itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                                        cursor={{ stroke: 'rgba(0,100,225,0.18)', strokeWidth: 2 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="visningar"
                                        stroke="#0064E1"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorVis)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                        <GlassCard className="p-4 sm:p-5 relative overflow-hidden cursor-pointer" onClick={() => onChangeView(View.PRODUCT_GOOGLE)}>
                            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/40 blur-2xl"></div>
                            <div className="relative z-10">
                                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-900/5 text-accent rounded-full flex items-center justify-center mb-3">
                                    <MegaphoneIcon className="h-5 w-5" />
                                </div>
                                <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-1">Google Ads</h3>
                                <p className="text-slate-600 text-xs sm:text-sm mb-4 leading-relaxed">
                                    Kampanjen "Höstrea 2025" presterar över förväntan.
                                </p>
                                <div className="flex justify-between items-center">
                                    <Badge className="px-3 py-1 text-[10px] font-semibold uppercase">Aktiv</Badge>
                                    <div className="w-6 h-6 sm:w-7 sm:h-7 bg-white/70 rounded-full flex items-center justify-center text-slate-600">
                                        <ArrowRightIcon className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-4 sm:p-5 relative overflow-hidden cursor-pointer" onClick={() => onChangeView(View.PRODUCT_WEBSITE)}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-900/5 text-slate-600 rounded-full flex items-center justify-center">
                                    <ComputerDesktopIcon className="h-5 w-5" />
                                </div>
                            </div>
                            <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-1">Hemsida</h3>
                            <p className="text-slate-600 text-xs sm:text-sm mb-4 leading-relaxed">
                                Din webbplats hälsa är god. Inga kritiska fel upptäckta.
                            </p>
                            <div className="flex justify-between items-center">
                                <Badge className="px-3 py-1 text-[10px] font-semibold uppercase">Aktiv</Badge>
                                <ArrowRightIcon className="h-4 w-4 text-slate-400" />
                            </div>
                        </GlassCard>

                        <GlassCard className="p-4 sm:p-5 group cursor-pointer" onClick={() => onChangeView(View.NEWS)}>
                            <div className="flex items-center gap-2 mb-2 text-slate-500 text-[11px] font-semibold uppercase tracking-[0.16em]">
                                <ClockIcon className="h-3 w-3" /> Senaste nytt
                            </div>
                            <h4 className="font-semibold text-slate-900 text-sm sm:text-base leading-tight mb-2 group-hover:text-accent transition-colors">
                                {NEWS_ITEMS[0].title}
                            </h4>
                            <p className="text-slate-600 text-xs sm:text-sm line-clamp-2">
                                {NEWS_ITEMS[0].summary}
                            </p>
                        </GlassCard>
                    </div>
                </div>

                <div className="w-full lg:w-[320px] xl:w-[340px] space-y-4 sm:space-y-5">

                    {/* Calendar/Date Widget - Month View */}
                    <GlassCard className="p-3.5 sm:p-4 text-center relative overflow-hidden min-h-[300px]">
                        {!selectedDate ? (
                            <>
                                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 capitalize">{monthLabel}</h3>

                                {/* Days Header */}
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {['M', 'T', 'O', 'T', 'F', 'L', 'S'].map((d, i) => (
                                        <div key={i} className="text-[10px] font-semibold text-slate-400 uppercase">
                                            {d}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar Grid */}
                                <div className="grid grid-cols-7 gap-1">
                                    {(() => {
                                        const today = new Date();
                                        const year = today.getFullYear();
                                        const month = today.getMonth(); // 0-indexed

                                        const firstDay = new Date(year, month, 1);
                                        const startDay = (firstDay.getDay() + 6) % 7;
                                        const daysInMonth = new Date(year, month + 1, 0).getDate();

                                        const days = [];

                                        for (let i = 0; i < startDay; i++) {
                                            days.push(<div key={`empty - ${i} `} className="h-8 w-8" />);
                                        }

                                        for (let d = 1; d <= daysInMonth; d++) {
                                            const isToday = d === today.getDate();

                                            const hasEvents = calendarEvents.some(e => {
                                                const eDate = new Date(e.timestamp);
                                                return eDate.getDate() === d &&
                                                    eDate.getMonth() === month &&
                                                    eDate.getFullYear() === year;
                                            });

                                            days.push(
                                                <button
                                                    key={d}
                                                    onClick={() => setSelectedDate(new Date(year, month, d))}
                                                    className="flex flex-col items-center justify-center relative w-full aspect-square"
                                                >
                                                    <span className={`h - 8 w - 8 flex items - center justify - center rounded - full text - xs font - medium transition - all relative
                                                        ${isToday
                                                            ? 'bg-white text-slate-900 ring-2 ring-blue-500 font-bold shadow-sm'
                                                            : 'text-slate-600 hover:bg-slate-100'
                                                        } `}
                                                    >
                                                        {d}
                                                        {hasEvents && !isToday && (
                                                            <span className="absolute bottom-1 w-1 h-1 bg-blue-500 rounded-full"></span>
                                                        )}
                                                    </span>
                                                    {hasEvents && isToday && (
                                                        <span className="absolute bottom-1 w-1 h-1 bg-blue-500 rounded-full z-10 translate-y-2"></span>
                                                    )}
                                                </button>
                                            );
                                        }
                                        return days;
                                    })()}
                                </div>
                            </>
                        ) : (
                            <div className="animate-fade-in h-full flex flex-col">
                                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                                    <button
                                        onClick={() => setSelectedDate(null)}
                                        className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1"
                                    >
                                        ← Tillbaka
                                    </button>
                                    <span className="text-sm font-semibold text-slate-900">
                                        {selectedDate.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' })}
                                    </span>
                                </div>
                                <div className="flex-1 overflow-y-auto -mx-2 px-2 space-y-2 text-left">
                                    {selectedDateEvents.length > 0 ? (
                                        selectedDateEvents.map((event: any) => (
                                            <div key={event.id} className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                                                <div className="flex items-start gap-2">
                                                    <div className={`w - 1.5 h - 1.5 mt - 1.5 rounded - full shrink - 0 ${event.read ? 'bg-slate-300' : 'bg-blue-500'} `} />
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-900 mb-0.5">{event.title}</p>
                                                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{event.message}</p>
                                                        <span className="text-[10px] text-slate-400 mt-1 block">
                                                            {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="h-32 flex flex-col items-center justify-center text-slate-400">
                                            <p className="text-xs">Inga händelser detta datum</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </GlassCard>

                    <GlassCard className="p-3.5 sm:p-4">
                        <p className="text-sm text-slate-700 font-medium">
                            📈 Trafiken ökar stabilt. Vill du se vilka sidor som driver tillväxt just nu?
                        </p>
                        <Button variant="secondary" className="mt-2.5 px-3 py-1.5 text-[11px] sm:text-xs font-semibold" onClick={() => onChangeView(View.SEO)}>
                            Visa insikter
                        </Button>
                    </GlassCard>

                    {/* Team / Contact Widget */}
                    <GlassCard className="p-3.5 sm:p-4">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Kontaktpersoner</h3>

                        </div>

                        <div className="space-y-3">
                            {teamMembers.map((member, i) => (
                                <div key={i} className="flex items-center gap-3 group rounded-xl px-2 py-1 hover:bg-slate-900/5 transition-colors">
                                    <div className="relative">
                                        <img src={member.avatar} className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover" alt={member.name} />
                                        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-success rounded-full animate-pulse-soft shadow-[0_6px_14px_rgba(15,23,42,0.2)]"></div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-900">{member.name}</h4>
                                        <p className="text-xs text-slate-600">{member.role}</p>
                                    </div>
                                    <button className="ml-auto w-6 h-6 sm:w-7 sm:h-7 bg-white/70 rounded-full flex items-center justify-center text-slate-600 transition-all duration-200 ease-out opacity-70 group-hover:opacity-100 hover:text-slate-900">
                                        <ChatBubbleLeftRightIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 pt-3">
                            <GlassCard className="p-2 sm:p-2.5 flex items-center gap-3 cursor-pointer bg-white/70" onClick={() => onChangeView(View.SUPPORT)}>
                                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-900/5 rounded-xl flex items-center justify-center text-accent">
                                    <ChatBubbleLeftRightIcon className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 text-sm">Behöver du hjälp?</p>
                                    <p className="text-xs text-slate-600">Starta ett ärende</p>
                                </div>
                            </GlassCard>
                        </div>
                    </GlassCard>

                </div>
            </div>

        </div>
    );
};

export default Dashboard;
