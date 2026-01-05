import React, { useEffect, useState } from 'react';
import GlassCard from '../../ui/GlassCard';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Modal from '../../ui/Modal';
import {
    User, Mail, Phone, Layout, Key, Server,
    ChevronLeft, ExternalLink, Plus, Edit2, Shield,
    Globe, Calendar, DollarSign, Copy, Eye, Trash2,
    Flag, CheckSquare, Target, BarChart2, Lightbulb, Sparkles, Users
} from 'lucide-react';
import type { CustomerContact, CustomerService, CustomerCredential, CustomerTechnical, ActionPlan, ActionArea, ActionActivity } from '../../types/admin';
import type { AgencyCustomer } from '../../types/agency';
import { demoRepo } from '../../api/DemoSeoRepository';
import { adminRepo } from '../../api/AdminRepository';
import { aiService } from '../../api/AiService';
import CustomerIntegrations from './CustomerIntegrations';
import { TeamMember } from '../../../types';
import { TEAM_MEMBERS as INITIAL_TEAM } from '../../../constants';

// --- Helper Components (Defined outside to avoid hoisting issues) ---

const TabButton = ({ label, icon: Icon, count, active, onClick }: { label: string; icon: any; count?: number; active: boolean; onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all relative ${active
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
    >
        <Icon size={16} className={active ? 'text-blue-600' : 'text-slate-400'} />
        {label}
        {count !== undefined && (
            <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                {count}
            </span>
        )}
    </button>
);

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-100 last:border-0 last:pb-0 relative">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div className="text-sm text-slate-900 font-medium text-right truncate max-w-[60%]">{value || '-'}</div>
    </div>
);

const TechStat = ({ label, value, sub, icon: Icon }: { label: string; value?: string; sub?: string; icon: any }) => (
    <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/60 flex flex-col justify-between h-full hover:bg-white hover:shadow-sm transition-all duration-200">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 uppercase tracking-wider font-bold">
            <div className="p-1 bg-white rounded-md shadow-sm border border-slate-100 text-blue-600">
                <Icon size={12} />
            </div>
            {label}
        </div>
        <div>
            <div className="font-bold text-slate-900 mb-0.5 text-sm truncate">{value || '-'}</div>
            {sub && <div className="text-[10px] text-slate-400 font-mono truncate" title={sub}>{sub}</div>}
        </div>
    </div>
);

// --- Main Component ---

interface CustomerDetailsPageProps {
    customerId: string;
    onBack: () => void;
    initialTab?: Tab;
    viewMode?: 'full' | 'actionPlanOnly';
}

type Tab = 'overview' | 'integrations' | 'contacts' | 'services' | 'technical' | 'actionPlan' | 'opportunities' | 'team';
type ModalType = 'contact' | 'service' | 'technical' | 'credential' | 'actionArea' | null;

const CustomerDetailsPage: React.FC<CustomerDetailsPageProps> = ({ customerId, onBack, initialTab = 'overview', viewMode = 'full' }) => {
    const [customer, setCustomer] = useState<AgencyCustomer | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>(initialTab);
    const [opportunities, setOpportunities] = useState<any[]>([
        {
            title: 'Saknar H1-tagg på startsidan',
            type: 'technical',
            severity: 'high',
            desc: 'Huvudrubriken saknas, vilket skadar rankingen.',
            action: 'Lägg till'
        },
        {
            title: 'Nytt sökord: "Billig tandläkare"',
            type: 'content',
            severity: 'medium',
            desc: 'Hög sökvolym (2400/mån) men låg konkurrens.',
            action: 'Skapa Sida'
        },
        {
            title: 'Bildoptimering',
            type: 'speed',
            severity: 'low',
            desc: '3 bilder är onödigt stora (>2MB).',
            action: 'Komprimera'
        }
    ]);
    const [scanning, setScanning] = useState(false);

    // Modal State
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [contactForm, setContactForm] = useState<Partial<CustomerContact>>({});
    const [serviceForm, setServiceForm] = useState<Partial<CustomerService>>({});
    const [credentialForm, setCredentialForm] = useState<Partial<CustomerCredential>>({});
    const [technicalForm, setTechnicalForm] = useState<Partial<CustomerTechnical>>({});

    // Action Plan State
    const [actionPlan, setActionPlan] = useState<ActionPlan | null>(null);
    const [planForm, setPlanForm] = useState<Partial<ActionPlan>>({});
    const [activeAreaForm, setActiveAreaForm] = useState<Partial<ActionArea>>({});

    const loadCustomer = async () => {
        setLoading(true);
        const list = await adminRepo.listCustomers();
        const found = list.find(c => c.id === customerId);
        setCustomer(found || null);
        if (found) {
            setTechnicalForm(found.technical || {});

            // Load Action Plan
            const plan = await demoRepo.getActionPlan(customerId);
            setActionPlan(plan);
            setPlanForm(plan || {});
        }
        setLoading(false);
    };

    useEffect(() => {
        loadCustomer();
    }, [customerId]);



    // --- Handlers: Contacts ---

    const handleOpenContactModal = (contact?: CustomerContact) => {
        if (contact) {
            setEditingId(contact.id);
            setContactForm(contact);
        } else {
            setEditingId(null);
            setContactForm({ name: '', role: '', email: '', phone: '' });
        }
        setActiveModal('contact');
    };

    const handleSaveContact = async () => {
        if (!customer) return;
        const newContacts = [...(customer.contacts || [])];
        if (editingId) {
            const idx = newContacts.findIndex(c => c.id === editingId);
            if (idx >= 0) {
                newContacts[idx] = { ...newContacts[idx], ...contactForm } as CustomerContact;
            }
        } else {
            newContacts.push({ id: `c-${Date.now()}`, ...contactForm } as CustomerContact);
        }
        await updateCustomer({ ...customer, contacts: newContacts });
        setActiveModal(null);
    };

    const handleDeleteContact = async (id: string) => {
        if (!customer || !confirm('Ta bort kontakt?')) return;
        const newContacts = (customer.contacts || []).filter(c => c.id !== id);
        await updateCustomer({ ...customer, contacts: newContacts });
    };

    // --- Handlers: Services ---

    const handleOpenServiceModal = (service?: CustomerService) => {
        if (service) {
            setEditingId(service.id);
            setServiceForm(service);
        } else {
            setEditingId(null);
            setServiceForm({ name: '', status: 'active', startDate: new Date().toISOString().split('T')[0], priceCheck: 0 });
        }
        setActiveModal('service');
    };

    const handleSaveService = async () => {
        if (!customer) return;
        const newServices = [...(customer.services || [])];
        if (editingId) {
            const idx = newServices.findIndex(s => s.id === editingId);
            if (idx >= 0) newServices[idx] = { ...newServices[idx], ...serviceForm } as CustomerService;
        } else {
            newServices.push({ id: `s-${Date.now()}`, ...serviceForm } as CustomerService);
        }
        await updateCustomer({ ...customer, services: newServices });
        setActiveModal(null);
    };

    // --- Handlers: Credentials ---

    const handleOpenCredentialModal = (cred?: CustomerCredential) => {
        if (cred) {
            setEditingId(cred.id);
            setCredentialForm(cred);
        } else {
            setEditingId(null);
            setCredentialForm({ serviceName: '', username: '', password: '', url: '' });
        }
        setActiveModal('credential');
    };

    const handleSaveCredential = async () => {
        if (!customer) return;
        const newCreds = [...(customer.credentials || [])];
        if (editingId) {
            const idx = newCreds.findIndex(c => c.id === editingId);
            if (idx >= 0) newCreds[idx] = { ...newCreds[idx], ...credentialForm } as CustomerCredential;
        } else {
            newCreds.push({ id: `cr-${Date.now()}`, ...credentialForm } as CustomerCredential);
        }
        await updateCustomer({ ...customer, credentials: newCreds });
        setActiveModal(null);
    };

    // --- Handlers: Technical ---

    const handleSaveTechnical = async () => {
        if (!customer) return;
        await updateCustomer({ ...customer, technical: technicalForm });
        setActiveModal(null);
    };

    // --- Handlers: Action Plan ---

    const handleSavePlan = async (updatedPlan: Partial<ActionPlan>) => {
        if (!actionPlan) return;
        const finalPlan = { ...actionPlan, ...updatedPlan };
        await demoRepo.updateActionPlan(finalPlan);
        setActionPlan(finalPlan as ActionPlan);
    };

    const handleOpenActionAreaModal = (area?: ActionArea) => {
        if (area) {
            setEditingId(area.id);
            setActiveAreaForm(area);
        } else {
            setEditingId(null);
            setActiveAreaForm({ title: '', status: 'not-started', progress: 0, activities: [] });
        }
        setActiveModal('actionArea');
    };

    const handleSaveActionArea = async () => {
        if (!actionPlan) return;
        const newAreas = [...(actionPlan.actionAreas || [])];

        const acts = activeAreaForm.activities || [];
        // Calculate progress
        const doneCount = acts.filter(a => a.status === 'done').length;
        const progress = acts.length > 0 ? Math.round((doneCount / acts.length) * 100) : 0;

        const areaToSave = {
            ...activeAreaForm,
            progress,
            // Ensure status is valid
            status: activeAreaForm.status || 'not-started'
        } as ActionArea;

        if (editingId) {
            const idx = newAreas.findIndex(a => a.id === editingId);
            if (idx >= 0) newAreas[idx] = areaToSave;
        } else {
            newAreas.push({ id: `area-${Date.now()}`, ...areaToSave });
        }

        await handleSavePlan({ actionAreas: newAreas });
        setActiveModal(null);
    };

    const handleDeleteActionArea = async (id: string) => {
        if (!actionPlan || !confirm('Ta bort fokusområde?')) return;
        const newAreas = actionPlan.actionAreas.filter(a => a.id !== id);
        await handleSavePlan({ actionAreas: newAreas });
    };

    // Helper to update repo and state
    const updateCustomer = async (updated: AgencyCustomer) => {
        await adminRepo.updateCustomer(updated.id, updated);
        setCustomer(updated);
    };


    if (loading) return <div className="p-12 text-center text-slate-400">Laddar kundprofil...</div>;
    if (!customer) return <div className="p-12 text-center text-slate-400">Kund saknas.</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col gap-6">
                <button onClick={onBack} className="self-start text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors">
                    <ChevronLeft size={16} />
                    Tillbaka till kundlistan
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-900/10">
                            {customer.companyName.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                {viewMode === 'actionPlanOnly' && <Badge variant="neutral">Handlingsplan</Badge>}
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{customer.companyName}</h1>
                            <div className="flex items-center gap-3 mt-1 text-slate-500 text-sm">
                                <a href={`https://${customer.domain}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                                    <Globe size={14} />
                                    {customer.domain}
                                </a>
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                <span className="flex items-center gap-1">
                                    <Mail size={14} />
                                    {customer.email}
                                </span>
                                {viewMode === 'full' && (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                                        <Badge variant={customer.active ? 'success' : 'neutral'}>{customer.active ? 'Aktiv Kund' : 'Inaktiv'}</Badge>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    {viewMode === 'full' && (
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setActiveTab('technical')}>
                                <Edit2 size={16} className="mr-2" />
                                Redigera
                            </Button>
                            <Button variant="primary" onClick={() => setActiveTab('services')}>
                                <Plus size={18} className="mr-2" />
                                Nytt Uppdrag
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs - Only show in Full Mode */}
            {viewMode === 'full' && (
                <div className="border-b border-slate-200/80 flex gap-6 px-1">
                    <TabButton label="Översikt" icon={Layout} active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <TabButton label="Integrationer" icon={Globe} active={activeTab === 'integrations'} onClick={() => setActiveTab('integrations')} />
                    <TabButton label="AI-Insikter" icon={Lightbulb} active={activeTab === 'opportunities'} onClick={() => setActiveTab('opportunities')} />
                    <TabButton label="Kontakter" icon={User} count={customer.contacts?.length} active={activeTab === 'contacts'} onClick={() => setActiveTab('contacts')} />
                    <TabButton label="Tjänster" icon={Shield} count={customer.services?.length} active={activeTab === 'services'} onClick={() => setActiveTab('services')} />
                    <TabButton label="Teknik & Access" icon={Key} active={activeTab === 'technical'} onClick={() => setActiveTab('technical')} />
                    <TabButton label="Handlingsplan" icon={Flag} active={activeTab === 'actionPlan'} onClick={() => setActiveTab('actionPlan')} />
                    <TabButton label="Team" icon={Users} count={customer.assignedTeam?.length} active={activeTab === 'team'} onClick={() => setActiveTab('team')} />
                </div>
            )
            }

            {/* Header for Action Plan Only Mode */}
            {
                viewMode === 'actionPlanOnly' && (
                    <div className="border-b border-slate-200/80 pb-4">
                        <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                            <Flag className="text-blue-600" size={24} />
                            Handlingsplan & Strategi
                        </h2>
                    </div>
                )
            }

            {/* Content Area */}
            <div className="min-h-[400px]">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {/* Main Info Column */}
                        <div className="lg:col-span-2 space-y-5">
                            <GlassCard>
                                <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                                    <h3 className="font-semibold text-base text-slate-900">Teknisk Översikt</h3>
                                    <Button variant="ghost" size="sm" onClick={() => setActiveModal('technical')} className="text-slate-400 hover:text-blue-600">
                                        <Edit2 size={14} />
                                    </Button>
                                </div>
                                <div className="p-5">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <TechStat label="CMS / Plattform" value={customer.technical?.cms} icon={Layout} />
                                        <TechStat label="Hosting" value={customer.technical?.hosting} icon={Server} />
                                        <TechStat label="GA4" value={customer.technical?.ga4Id ? 'Kopplad' : 'Ej kopplad'} sub={customer.technical?.ga4Id} icon={Globe} />
                                        <TechStat label="GTM" value={customer.technical?.gtmId ? 'Kopplad' : 'Ej kopplad'} sub={customer.technical?.gtmId} icon={Globe} />
                                    </div>
                                </div>
                            </GlassCard>

                            <GlassCard className="h-full">
                                <div className="px-5 py-4 border-b border-slate-100">
                                    <h3 className="font-semibold text-base text-slate-900">Aktiva Tjänster</h3>
                                </div>
                                <div className="p-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {customer.services?.map(s => (
                                            <div key={s.id} className="group p-4 rounded-xl border border-slate-200/60 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all duration-200">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="p-2 bg-blue-100/50 text-blue-700 rounded-lg">
                                                        <Shield size={18} />
                                                    </div>
                                                    <Badge variant={s.status === 'active' ? 'success' : 'neutral'}>{s.status}</Badge>
                                                </div>
                                                <h4 className="font-semibold text-slate-900">{s.name}</h4>
                                                <div className="mt-2 text-xs text-slate-500 space-y-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar size={12} />
                                                        <span>Start: {s.startDate}</span>
                                                    </div>
                                                    {s.priceCheck && (
                                                        <div className="flex items-center gap-1.5">
                                                            <DollarSign size={12} />
                                                            <span>{s.priceCheck.toLocaleString()} kr/mån</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => setActiveTab('services')}
                                            className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all gap-2"
                                        >
                                            <Plus size={20} />
                                            <span className="text-sm font-medium">Hantera tjänster</span>
                                        </button>
                                    </div>
                                </div>
                            </GlassCard>
                        </div>

                        {/* Sidebar Info */}
                        <div className="space-y-5">
                            <GlassCard>
                                <div className="px-5 py-4 border-b border-slate-100">
                                    <h3 className="font-semibold text-base text-slate-900">Information</h3>
                                </div>
                                <div className="p-5">
                                    <div className="divide-y divide-slate-100">
                                        <InfoRow label="Status" value={<span className="flex items-center justify-end gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wide bg-emerald-50 px-2 py-1 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Aktiv</span>} />
                                        <InfoRow label="Kund ID" value={<span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded select-all">{customer.id}</span>} />
                                        <InfoRow label="Kontakt Email" value={<a href={`mailto:${customer.contactEmail}`} className="text-blue-600 hover:text-blue-700 hover:underline transition-colors">{customer.contactEmail}</a>} />
                                        <InfoRow label="Telefon" value={<span className="text-slate-400">-</span>} />
                                    </div>
                                </div>
                            </GlassCard>

                            <GlassCard>
                                <div className="px-5 py-4 border-b border-slate-100">
                                    <h3 className="font-semibold text-base text-slate-900">Interna Anteckningar</h3>
                                </div>
                                <div className="p-5">
                                    <textarea
                                        className="w-full text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                                        placeholder="Skriv anteckningar här..."
                                    />
                                    <div className="mt-2 flex justify-end">
                                        <Button variant="outline" className="text-xs py-1 h-auto">Spara</Button>
                                    </div>
                                </div>
                            </GlassCard>
                        </div>
                    </div>
                )}

                {activeTab === 'integrations' && (
                    <CustomerIntegrations customerId={customer.id} />
                )}

                {activeTab === 'contacts' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {customer.contacts?.map(c => (
                            <div key={c.id} className="group bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-lg hover:border-blue-100 transition-all duration-300 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <button onClick={() => handleOpenContactModal(c)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-blue-600"><Edit2 size={14} /></button>
                                    <button onClick={() => handleDeleteContact(c.id)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-600"><Trash2 size={14} /></button>
                                </div>

                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        {c.name.charAt(0)}
                                    </div>
                                    <Badge variant="outline">{c.role}</Badge>
                                </div>

                                <h4 className="text-lg font-bold text-slate-900 mb-1">{c.name}</h4>
                                <div className="text-sm text-slate-500 mb-4">{c.role} på {customer.name}</div>

                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                    <a href={`mailto:${c.email}`} className="flex items-center gap-3 text-sm text-slate-600 hover:text-blue-600 transition-colors p-2 hover:bg-slate-50 rounded-lg -mx-2">
                                        <Mail size={16} className="text-slate-400" />
                                        {c.email}
                                    </a>
                                    {c.phone && (
                                        <a href={`tel:${c.phone}`} className="flex items-center gap-3 text-sm text-slate-600 hover:text-blue-600 transition-colors p-2 hover:bg-slate-50 rounded-lg -mx-2">
                                            <Phone size={16} className="text-slate-400" />
                                            {c.phone}
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={() => handleOpenContactModal()}
                            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/10 transition-all min-h-[280px]"
                        >
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                                <Plus size={24} />
                            </div>
                            <span className="font-semibold">Lägg till kontakt</span>
                        </button>
                    </div>
                )}

                {activeTab === 'services' && (
                    <GlassCard className="p-0 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200/60">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Tjänst</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold">Period</th>
                                    <th className="px-6 py-4 font-semibold text-right">Värde</th>
                                    <th className="px-6 py-4 text-right">Åtgärd</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {customer.services?.map(s => (
                                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{s.name}</div>
                                        </td>
                                        <td className="px-6 py-4"><Badge variant={s.status === 'active' ? 'success' : 'neutral'}>{s.status}</Badge></td>
                                        <td className="px-6 py-4 text-slate-500">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={14} className="text-slate-400" />
                                                {s.startDate || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-slate-700">{s.priceCheck?.toLocaleString() || '-'} kr</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleOpenServiceModal(s)}
                                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="p-4 bg-slate-50 border-t border-slate-200/60 flex justify-center">
                            <Button variant="ghost" className="text-sm" onClick={() => handleOpenServiceModal()}>
                                <Plus size={16} className="mr-2" /> Lägg till tjänst
                            </Button>
                        </div>
                    </GlassCard>
                )}

                {activeTab === 'technical' && (
                    <div className="space-y-6">
                        {/* Technical Overview Form Link */}
                        <GlassCard title="Teknisk Konfiguration">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-slate-500">
                                    {/* Handle display of CMS/Hosting with proper fallbacks */}
                                    Just nu: <strong>{customer.technical?.cms && customer.technical.cms !== 'Unknown' ? customer.technical.cms : 'Ej angivet'}</strong> på <strong>{customer.technical?.hosting && customer.technical.hosting !== 'Unknown' ? customer.technical.hosting : 'Ej angivet'}</strong>.
                                </div>
                                <Button variant="outline" onClick={() => setActiveModal('technical')}>Redigera Teknisk Info</Button>
                            </div>
                        </GlassCard>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {customer.credentials?.map(c => (
                                <div key={c.id} className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-100 rounded-lg text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                <Key size={18} />
                                            </div>
                                            <div className="font-semibold text-slate-900">{c.serviceName}</div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600" title="Kopiera"><Copy size={14} /></button>
                                            <button
                                                onClick={() => handleOpenCredentialModal(c)}
                                                className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600" title="Redigera"
                                            ><Edit2 size={14} /></button>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-lg border border-slate-100 p-3 space-y-2.5">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 text-xs uppercase tracking-wider font-medium">Användare</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-slate-700">{c.username}</span>
                                                <button className="text-slate-300 hover:text-blue-600"><Copy size={12} /></button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-sm border-t border-slate-200/50 pt-2">
                                            <span className="text-slate-500 text-xs uppercase tracking-wider font-medium">Lösenord</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-slate-700 tracking-widest text-xs">••••••••••••</span>
                                                <button className="text-slate-300 hover:text-blue-600"><Eye size={12} /></button>
                                                <button className="text-slate-300 hover:text-blue-600"><Copy size={12} /></button>
                                            </div>
                                        </div>
                                    </div>

                                    {c.url && (
                                        <div className="mt-3 flex justify-end">
                                            <a href={c.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium">
                                                Gå till inloggning <ExternalLink size={10} />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={() => handleOpenCredentialModal()}
                                className="flex items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-blue-400 hover:text-blue-600 transition-colors h-full min-h-[200px]"
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <div className="p-3 bg-slate-50 rounded-full">
                                        <Plus size={20} />
                                    </div>
                                    <span className="font-medium">Lägg till nya uppgifter</span>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* Action Plan View */}
                {activeTab === 'actionPlan' && actionPlan && (
                    <div className="space-y-6">
                        {/* Strategy & Analysis Card */}
                        <GlassCard>
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
                                    <Target size={20} className="text-blue-600" />
                                    Strategi & Nuläge
                                </h3>
                                <Button variant="outline" size="sm" onClick={() => handleSavePlan(planForm)}>
                                    Spara ändringar
                                </Button>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="font-medium text-slate-900">Affärsmål & SEO-Mål</h4>
                                    <textarea
                                        className="w-full h-32 p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
                                        placeholder="Beskriv kundens övergripande mål..."
                                        value={planForm.businessGoals || ''}
                                        onChange={e => setPlanForm({ ...planForm, businessGoals: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-medium text-slate-900">Nulägesanalys</h4>
                                    <textarea
                                        className="w-full h-32 p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
                                        placeholder="Sammanfattning av nuläget..."
                                        value={planForm.statusAnalysis || ''}
                                        onChange={e => setPlanForm({ ...planForm, statusAnalysis: e.target.value })}
                                    />
                                </div>
                            </div>
                        </GlassCard>

                        {/* Action Areas Grid */}
                        <div className="grid grid-cols-1 gap-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-slate-900">Fokusområden & Aktiviteter</h3>
                                <Button variant="primary" onClick={() => handleOpenActionAreaModal()}>
                                    <Plus size={18} className="mr-2" />
                                    Nytt Fokusområde
                                </Button>
                            </div>

                            {actionPlan.actionAreas?.map(area => (
                                <GlassCard key={area.id} className="overflow-hidden">
                                    <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${area.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                                <Flag size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-lg">{area.title}</h4>
                                                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                                    <Badge variant={area.status === 'completed' ? 'success' : area.status === 'in-progress' ? 'warning' : 'neutral'}>
                                                        {area.status === 'completed' ? 'Klart' : area.status === 'in-progress' ? 'Pågående' : 'Ej påbörjat'}
                                                    </Badge>
                                                    <span>{area.activities.length} aktiviteter</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleOpenActionAreaModal(area)}><Edit2 size={16} /></Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteActionArea(area.id)} className="text-red-500 hover:text-red-600"><Trash2 size={16} /></Button>
                                        </div>
                                    </div>

                                    {/* Activities List */}
                                    <div className="p-0">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                                                <tr>
                                                    <th className="px-6 py-3 font-medium w-40">Status</th>
                                                    <th className="px-6 py-3 font-medium">Aktivitet</th>
                                                    <th className="px-6 py-3 font-medium text-right">Est. Tid</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {area.activities.map((act) => (
                                                    <tr key={act.id} className="hover:bg-slate-50/30 transition-colors">
                                                        <td className="px-6 py-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={act.status === 'done'}
                                                                onChange={() => {
                                                                    const updatedActivities = area.activities.map(a =>
                                                                        a.id === act.id ? { ...a, status: a.status === 'done' ? 'pending' : 'done' } : a
                                                                    );
                                                                    // Calculate progress
                                                                    const doneCount = updatedActivities.filter(a => a.status === 'done').length;
                                                                    const progress = Math.round((doneCount / updatedActivities.length) * 100);

                                                                    // Update Area
                                                                    const updatedAreas = actionPlan.actionAreas.map(aa =>
                                                                        aa.id === area.id ? { ...aa, activities: updatedActivities as any, progress } : aa
                                                                    );
                                                                    handleSavePlan({ actionAreas: updatedAreas });
                                                                }}
                                                                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                                                            />
                                                            {act.status === 'done' && <span className="ml-2 text-xs font-medium text-emerald-600">Klar</span>}
                                                        </td>
                                                        <td className={`px-6 py-3 font-medium ${act.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                                            {act.description}
                                                        </td>
                                                        <td className="px-6 py-3 text-right text-slate-400 font-mono text-xs">
                                                            {act.estHours ? `${act.estHours}h` : '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {area.activities.length === 0 && (
                                                    <tr>
                                                        <td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic">Inga aktiviteter tillagda ännu.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    </div>
                )}


                {activeTab === 'opportunities' && (
                    <div className="space-y-6">
                        <GlassCard className="p-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Lightbulb className="text-amber-500" size={24} />
                                        Opportunity Scout
                                    </h3>
                                    <p className="text-slate-500 mt-1 max-w-2xl">
                                        Låt AI:n scanna <span className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">{customer.domain}</span> efter nya möjligheter.
                                        Vi letar efter tekniska fel, innehållsluckor och låghängande frukt.
                                    </p>
                                </div>
                                <Button
                                    variant="primary"
                                    onClick={async () => {
                                        setScanning(true);
                                        setOpportunities([]);
                                        try {
                                            const results = await aiService.scanCustomerSite(customer.domain);
                                            setOpportunities(results);
                                        } catch (e) {
                                            alert("Kunde inte scanna just nu.");
                                        } finally {
                                            setScanning(false);
                                        }
                                    }}
                                    disabled={scanning}
                                    className="bg-linear-to-r from-amber-500 to-orange-500 border-none shadow-lg shadow-orange-500/20"
                                >
                                    <Sparkles size={18} className={`mr-2 ${scanning ? 'animate-spin' : ''}`} />
                                    {scanning ? 'Scannar hemsidan...' : 'Scanna Nu'}
                                </Button>
                            </div>


                            {opportunities.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4 animate-fade-in">
                                    {opportunities.map((opp, i) => (
                                        <div key={i} className="flex gap-4 p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all bg-white">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${opp.severity === 'high' ? 'bg-red-100 text-red-600' :
                                                opp.severity === 'medium' ? 'bg-amber-100 text-amber-600' :
                                                    'bg-blue-100 text-blue-600'
                                                }`}>
                                                {opp.severity === 'high' ? <Flag size={20} /> : <Lightbulb size={20} />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-slate-900">{opp.title}</h4>
                                                    <Badge variant={
                                                        opp.severity === 'high' ? 'error' :
                                                            opp.severity === 'medium' ? 'warning' : 'neutral'
                                                    }>
                                                        {opp.type}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-slate-600 mt-1">{opp.desc}</p>
                                                <div className="mt-3">
                                                    <button className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                                        {opp.action} <ChevronLeft size={12} className="rotate-180" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                !scanning && (
                                    <div className="text-center py-12 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                            <Target className="text-slate-300" size={32} />
                                        </div>
                                        <p className="text-slate-500 font-medium">Inga resultat att visa än.</p>
                                        <p className="text-xs text-slate-400 mt-1">Klicka på "Scanna Nu" för att starta en analys.</p>
                                    </div>
                                )
                            )}
                        </GlassCard>
                    </div >
                )
                }

                {
                    activeTab === 'team' && (
                        <GlassCard className="p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Tilldelat Team</h3>
                            <p className="text-slate-500 mb-6 text-sm">Välj vilka medarbetare som ska synas som kontaktpersoner för denna kund.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {(() => {
                                    // Load global team settings
                                    const savedTeam = localStorage.getItem("seo:settings:team");
                                    const allMembers: TeamMember[] = savedTeam ? JSON.parse(savedTeam) : INITIAL_TEAM;

                                    return allMembers.map((member, i) => {
                                        const isAssigned = customer.assignedTeam?.some(m => m.name === member.name); // Simple match by name for simplicity

                                        return (
                                            <div
                                                key={member.name + i}
                                                onClick={async () => {
                                                    let newTeam = customer.assignedTeam || [];
                                                    if (isAssigned) {
                                                        newTeam = newTeam.filter(m => m.name !== member.name);
                                                    } else {
                                                        newTeam = [...newTeam, member];
                                                    }
                                                    // Persist
                                                    await updateCustomer({ ...customer, assignedTeam: newTeam });
                                                }}
                                                className={`
                                                cursor-pointer relative p-4 rounded-xl border-2 transition-all duration-200 group
                                                ${isAssigned
                                                        ? 'border-blue-500 bg-blue-50/50'
                                                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}
                                            `}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <img src={member.avatar} className="w-12 h-12 rounded-full object-cover bg-white" />
                                                        {isAssigned && (
                                                            <div className="absolute -top-1 -right-1 bg-blue-600 text-white p-1 rounded-full shadow-sm">
                                                                <CheckSquare size={12} fill="currentColor" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className={`font-bold ${isAssigned ? 'text-blue-900' : 'text-slate-900'}`}>{member.name}</h4>
                                                        <p className="text-xs text-slate-500">{member.role}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </GlassCard>
                    )
                }
            </div >

            {/* MODALS */}

            {/* Contact Modal */}
            <Modal
                isOpen={activeModal === 'contact'}
                onClose={() => setActiveModal(null)}
                title={editingId ? 'Redigera Kontakt' : 'Ny Kontakt'}
                footer={
                    <>
                        <Button variant="outline" onClick={() => setActiveModal(null)}>Avbryt</Button>
                        <Button variant="primary" onClick={handleSaveContact}>Spara Kontakt</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Namn</label>
                        <input
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={contactForm.name || ''}
                            onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                            placeholder="Förnamn Efternamn"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Roll / Titel</label>
                        <input
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={contactForm.role || ''}
                            onChange={e => setContactForm({ ...contactForm, role: e.target.value })}
                            placeholder="t.ex. VD, Marknadschef"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                value={contactForm.email || ''}
                                onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                                placeholder="namn@företag.se"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                            <input
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                value={contactForm.phone || ''}
                                onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                                placeholder="070-..."
                            />
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Service Modal */}
            <Modal
                isOpen={activeModal === 'service'}
                onClose={() => setActiveModal(null)}
                title={editingId ? 'Redigera Tjänst' : 'Ny Tjänst'}
                footer={
                    <>
                        <Button variant="outline" onClick={() => setActiveModal(null)}>Avbryt</Button>
                        <Button variant="primary" onClick={handleSaveService}>Spara Tjänst</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tjänst</label>
                        <input
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={serviceForm.name || ''}
                            onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })}
                            placeholder="t.ex. SEO Standard, Google Ads"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                            <select
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                value={serviceForm.status || 'active'}
                                onChange={e => setServiceForm({ ...serviceForm, status: e.target.value as any })}
                            >
                                <option value="active">Aktiv</option>
                                <option value="pending">Pausad</option>
                                <option value="cancelled">Avslutad</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Startdatum</label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                value={serviceForm.startDate || ''}
                                onChange={e => setServiceForm({ ...serviceForm, startDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Månadskostnad (SEK)</label>
                        <input
                            type="number"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={serviceForm.priceCheck || 0}
                            onChange={e => setServiceForm({ ...serviceForm, priceCheck: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                </div>
            </Modal>

            {/* Credential Modal */}
            <Modal
                isOpen={activeModal === 'credential'}
                onClose={() => setActiveModal(null)}
                title={editingId ? 'Redigera Inloggning' : 'Ny Inloggning'}
                footer={
                    <>
                        <Button variant="outline" onClick={() => setActiveModal(null)}>Avbryt</Button>
                        <Button variant="primary" onClick={handleSaveCredential}>Spara Uppgifter</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tjänst / System</label>
                        <input
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={credentialForm.serviceName || ''}
                            onChange={e => setCredentialForm({ ...credentialForm, serviceName: e.target.value })}
                            placeholder="t.ex. WordPress, FTP, Google Ads"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">URL (Valfritt)</label>
                        <input
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={credentialForm.url || ''}
                            onChange={e => setCredentialForm({ ...credentialForm, url: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Användarnamn</label>
                            <input
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                value={credentialForm.username || ''}
                                onChange={e => setCredentialForm({ ...credentialForm, username: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Lösenord</label>
                            <input
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                value={credentialForm.password || ''}
                                onChange={e => setCredentialForm({ ...credentialForm, password: e.target.value })}
                                type="text" // Visas i klartext för admin, kan ändras
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Anteckningar</label>
                        <input
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={credentialForm.notes || ''}
                            onChange={e => setCredentialForm({ ...credentialForm, notes: e.target.value })}
                            placeholder="Övrig info..."
                        />
                    </div>
                </div>
            </Modal>

            {/* Technical Modal */}
            <Modal
                isOpen={activeModal === 'technical'}
                onClose={() => setActiveModal(null)}
                title="Redigera Teknisk Info"
                footer={
                    <>
                        <Button variant="outline" onClick={() => setActiveModal(null)}>Avbryt</Button>
                        <Button variant="primary" onClick={handleSaveTechnical}>Spara Ändringar</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">CMS / Plattform</label>
                            <input
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                value={technicalForm.cms || ''}
                                onChange={e => setTechnicalForm({ ...technicalForm, cms: e.target.value })}
                                placeholder="t.ex. WordPress"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Hosting</label>
                            <input
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                value={technicalForm.hosting || ''}
                                onChange={e => setTechnicalForm({ ...technicalForm, hosting: e.target.value })}
                                placeholder="t.ex. Oderland"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Google Analytics 4 ID (GA4)</label>
                        <input
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={technicalForm.ga4Id || ''}
                            onChange={e => setTechnicalForm({ ...technicalForm, ga4Id: e.target.value })}
                            placeholder="G-XXXXXXXXXX"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Google Tag Manager ID (GTM)</label>
                        <input
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={technicalForm.gtmId || ''}
                            onChange={e => setTechnicalForm({ ...technicalForm, gtmId: e.target.value })}
                            placeholder="GTM-XXXXXX"
                        />
                    </div>
                </div>
            </Modal>

            {/* Action Area Modal */}
            <Modal
                isOpen={activeModal === 'actionArea'}
                onClose={() => setActiveModal(null)}
                title={editingId ? 'Redigera Fokusområde' : 'Nytt Fokusområde'}
                footer={
                    <>
                        <Button variant="outline" onClick={() => setActiveModal(null)}>Avbryt</Button>
                        <Button variant="primary" onClick={handleSaveActionArea}>Spara Område</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Titel</label>
                        <input
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={activeAreaForm.title || ''}
                            onChange={e => setActiveAreaForm({ ...activeAreaForm, title: e.target.value })}
                            placeholder="t.ex. On-Page Optimering"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                            <select
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                value={activeAreaForm.status || 'not-started'}
                                onChange={e => setActiveAreaForm({ ...activeAreaForm, status: e.target.value as any })}
                            >
                                <option value="not-started">Ej påbörjat</option>
                                <option value="in-progress">Pågående</option>
                                <option value="completed">Klart</option>
                            </select>
                        </div>
                    </div>
                </div>
            </Modal>
        </div >
    );
};

export default CustomerDetailsPage;
