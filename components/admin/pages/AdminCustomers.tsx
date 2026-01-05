import React, { useEffect, useState } from 'react';
import GlassCard from '../../ui/GlassCard';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import { MoreHorizontal, Plus, Search, Edit2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { adminRepo } from '../../api/AdminRepository';
import type { AgencyCustomer } from '../../types/agency';
import { useToast } from '../../ui/ToastContext';

interface AdminCustomersProps {
    onViewCustomer?: (customerId: string) => void;
    title?: string;
    hideActions?: boolean;
}

const AdminCustomers: React.FC<AdminCustomersProps> = ({ onViewCustomer, title = 'Kunder', subtitle, hideActions = false }) => {
    const { success } = useToast();
    const [customers, setCustomers] = useState<AgencyCustomer[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        companyName: '',
        domain: '',
        email: '',
        timezone: 'Europe/Stockholm',
        active: true
    });

    const loadCustomers = async () => {
        setLoading(true);
        const data = await adminRepo.listCustomers();
        setCustomers(data);
        setLoading(false);
    };

    useEffect(() => {
        loadCustomers();
    }, []);

    const handleOpenModal = () => {
        setFormData({ companyName: '', domain: '', email: '', timezone: 'Europe/Stockholm', active: true });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        // 1. Create the customer in Repo
        await adminRepo.createCustomer({
            agencyId: 'agency1', // Hardcoded for single-tenant agency view
            ...formData,
            reportSettings: { weeklyEnabled: true, monthlyEnabled: true, recipientEmails: [formData.email].filter(Boolean) }
        });

        // 2. Generate Password & "Send Invitation" (Simulated)
        if (formData.email) {
            const tempPassword = Math.random().toString(36).slice(-8);
            await adminRepo.createUser(formData.email, tempPassword, formData.companyName);

            // Simulation of email sending
            alert(`
📨 Inbjudan skickad till: ${formData.email}
🔐 Lösenord: ${tempPassword}

(Detta är en simulation. I produktion skickas ett riktigt mail.)
            `);
        }

        setIsModalOpen(false);
        success(`Kunden ${formData.companyName} har skapats`);
        loadCustomers();
    };

    const filteredCustomers = customers.filter(c =>
        c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.domain.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const customerCount = customers.length;
    const defaultSubtitle = `Hantera ${customerCount} kunder och deras integrationer.`;

    return (
        <div className="space-y-6 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
                    <p className="text-slate-500 mt-1">{subtitle || defaultSubtitle}</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Sök kunden..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                    {!hideActions && (
                        <Button variant="primary" onClick={handleOpenModal}>
                            <Plus size={18} className="mr-2" />
                            Ny Kund
                        </Button>
                    )}
                </div>
            </div>

            {/* Demo Info Message */}
            <div className="flex items-center gap-2.5 px-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl text-blue-700 text-sm animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-medium">Tips: Tryck på en kund i listan för att hantera deras konto och se fler funktioner.</span>
            </div>

            <GlassCard className="overflow-hidden p-0">
                <table className="w-full text-left text-sm border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-200/60">
                            <th className="px-6 py-4 font-semibold text-slate-700">Företag</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">Google Status</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">SEO Verktyg</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">Rapporter</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-right">Åtgärd</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredCustomers.map((c) => (
                            <tr
                                key={c.id}
                                className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                                onClick={() => onViewCustomer?.(c.id)}
                            >
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                        {c.companyName}
                                    </div>
                                    <div className="text-xs text-slate-500">{c.domain}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {c.connectionSummary?.googleConnected ? (
                                            <Badge variant="success" className="gap-1 pl-1.5">
                                                <CheckCircle size={12} /> Connected
                                            </Badge>
                                        ) : (
                                            <Badge variant="warning" className="gap-1 pl-1.5">
                                                <AlertCircle size={12} /> Ej kopplad
                                            </Badge>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-slate-600 font-medium">
                                        {c.connectionSummary?.toolsConnectedCount || 0} anslutna
                                        {c.connectionSummary?.errorsCount > 0 && (
                                            <span className="ml-2 text-red-500 text-xs font-bold">
                                                ({c.connectionSummary.errorsCount} fel)
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-xs text-slate-500">
                                        {c.reportSettings.weeklyEnabled && <span className="mr-2 px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded">Weekly</span>}
                                        {c.reportSettings.monthlyEnabled && <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded">Monthly</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Button variant="ghost" size="sm" className="text-slate-400 group-hover:text-blue-600">
                                        Öppna
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {filteredCustomers.length === 0 && !loading && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-500">
                                    Inga kunder hittades.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </GlassCard>

            {/* Enhanced Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Registrera ny kund</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Lägg till en ny kund i byrå-portalen.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <XCircle size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Företagsnamn</label>
                                <input
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                    placeholder="t.ex. Acme Corp AB"
                                    value={formData.companyName}
                                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">E-post (för inloggning)</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                    placeholder="kund@företag.se"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Domän</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">https://</span>
                                    <input
                                        className="w-full pl-16 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                        placeholder="acme.se"
                                        value={formData.domain}
                                        onChange={e => setFormData({ ...formData, domain: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Avbryt</Button>
                            <Button variant="primary" onClick={handleSave}>
                                <Plus size={16} className="mr-2" />
                                Skapa Kund
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default AdminCustomers;
