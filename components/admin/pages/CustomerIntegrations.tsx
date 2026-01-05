import React, { useEffect, useState } from 'react';
import GlassCard from '../../ui/GlassCard';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import { adminRepo } from '../../api/AdminRepository';
import { AgencyCustomer, IntegrationConnection, IntegrationProviderId, ProviderDefinition } from '../../types/agency';
import { PROVIDER_CATALOG, OTHER_PROVIDERS } from '../../data/ProviderCatalog';
import { CheckCircle, AlertCircle, Key, Globe, Search, Play, RefreshCw, Save } from 'lucide-react';
import { useToast } from '../../ui/ToastContext';

interface CustomerIntegrationsProps {
    customerId: string;
}

const CustomerIntegrations: React.FC<CustomerIntegrationsProps> = ({ customerId }) => {
    const { info, success } = useToast();
    const [customer, setCustomer] = useState<AgencyCustomer | null>(null);
    const [connections, setConnections] = useState<IntegrationConnection[]>([]);
    const [loading, setLoading] = useState(true);
    const [testingAll, setTestingAll] = useState(false);

    // Editing states
    const [metaInputs, setMetaInputs] = useState<Record<string, any>>({});
    const [secretsInputs, setSecretsInputs] = useState<Record<string, string>>({});

    const loadData = async () => {
        setLoading(true);
        const [c, conns] = await Promise.all([
            adminRepo.getCustomer(customerId),
            adminRepo.listConnections(customerId)
        ]);
        setCustomer(c);
        setConnections(conns);

        // Pre-fill inputs from existing connections
        const initialMeta: Record<string, any> = {};
        conns.forEach(c => {
            initialMeta[c.providerId] = c.meta || {};
        });
        setMetaInputs(initialMeta);

        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [customerId]);

    const handleSaveConnection = async (provider: ProviderDefinition) => {
        const meta = metaInputs[provider.id] || {};
        const secret = secretsInputs[provider.id];

        // For OAuth, we just simulate a redirect flow
        if (provider.authType === 'oauth') {
            info(`Simulerar Google OAuth-flow för ${provider.name}...`);
            // Mock successful callback
            await adminRepo.upsertConnection(customerId, provider.id, meta, "mock_oauth_token");
        } else {
            // API Key flow
            await adminRepo.upsertConnection(customerId, provider.id, meta, secret);
        }
        await loadData();
    };

    const handleTestConnection = async (providerId: IntegrationProviderId) => {
        await adminRepo.testConnection(customerId, providerId);
        await loadData();
    };

    const handleTestAll = async () => {
        setTestingAll(true);
        // Sequential to show progress visually
        for (const conn of connections) {
            await adminRepo.testConnection(customerId, conn.providerId);
        }
        await loadData();
        setTestingAll(false);
    };

    const handleGenerateDrafts = async () => {
        console.log("Compiling drafts for", customerId);
        // In real app: call AutomationApiClient
        success(`Startar aggregering av rapporter för ${customer?.companyName || customerId}...`);
    };

    if (loading) return <div className="p-12 text-center text-slate-400">Laddar integrationer...</div>;
    if (!customer) return <div className="p-12 text-center text-slate-400">Kund saknas</div>;

    const allProviders = [...PROVIDER_CATALOG, ...OTHER_PROVIDERS];

    return (
        <div className="space-y-8 animate-fade-in pb-12">

            {/* 1. Basic Customer Data */}
            <GlassCard className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Kundinställningar</h3>
                        <p className="text-sm text-slate-500">Grundläggande data för rapportgenerering</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => loadData()}>
                        <RefreshCw size={14} className="mr-2" />
                        Ladda om
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Företagsnamn</label>
                        <input
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium"
                            value={customer.companyName}
                            disabled
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Domän</label>
                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                            <Globe size={14} className="text-slate-400 mr-2" />
                            <span className="text-sm font-medium">{customer.domain}</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Tidszon</label>
                        <select className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium" defaultValue={customer.timezone}>
                            <option value="Europe/Stockholm">Europe/Stockholm</option>
                            <option value="Europe/London">Europe/London</option>
                            <option value="US/Eastern">US/Eastern</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Rapportering</label>
                        <div className="flex gap-2 text-sm">
                            <label className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 w-full cursor-not-allowed opacity-75">
                                <input type="checkbox" checked={customer.reportSettings.monthlyEnabled} readOnly className="rounded border-slate-300" />
                                <span>Monthly</span>
                            </label>
                            <label className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 w-full cursor-not-allowed opacity-75">
                                <input type="checkbox" checked={customer.reportSettings.weeklyEnabled} readOnly className="rounded border-slate-300" />
                                <span>Weekly</span>
                            </label>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Actions Bar */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-sm font-medium text-slate-600">
                    <span className="text-slate-400 mr-2">Status:</span>
                    {customer.connectionSummary.googleConnected
                        ? <span className="text-emerald-600 font-bold mr-4">Google Anslutet</span>
                        : <span className="text-amber-500 font-bold mr-4">Google saknas</span>
                    }
                    <span className="text-slate-400">Verktyg:</span> <strong>{customer.connectionSummary.toolsConnectedCount}</strong> st
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleTestAll} disabled={testingAll}>
                        {testingAll ? <RefreshCw className="animate-spin mr-2" size={16} /> : <CheckCircle size={16} className="mr-2" />}
                        Testa alla anslutningar
                    </Button>
                    <Button variant="primary" onClick={handleGenerateDrafts}>
                        <Play size={16} className="mr-2" />
                        Kör rapport-kompilator
                    </Button>
                </div>
            </div>

            {/* 2. Integrations List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allProviders.map(provider => {
                    const connection = connections.find(c => c.providerId === provider.id);
                    const isConnected = connection?.status === 'connected' || connection?.status === 'demo_connected';
                    const hasError = connection?.status === 'error';

                    return (
                        <div key={provider.id} className={`bg-white rounded-xl border transition-all duration-300 ${isConnected ? 'border-emerald-200 shadow-sm' : hasError ? 'border-red-200' : 'border-slate-200 hover:border-blue-300'}`}>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <img src={provider.icon} alt={provider.name} className="w-10 h-10 rounded-lg bg-slate-50 p-1.5" />
                                        <div>
                                            <h4 className="font-bold text-slate-900">{provider.name}</h4>
                                            <p className="text-xs text-slate-500">{provider.subtitle}</p>
                                        </div>
                                    </div>
                                    <div>
                                        {isConnected && (
                                            <Badge variant="success" className="gap-1 pl-1.5">
                                                <CheckCircle size={12} /> Ansluten
                                            </Badge>
                                        )}
                                        {hasError && (
                                            <Badge variant="error" className="gap-1 pl-1.5">
                                                <AlertCircle size={12} /> {connection?.lastError || 'Fel'}
                                            </Badge>
                                        )}
                                        {!isConnected && !hasError && (
                                            <Badge variant="neutral">Ej konfigurerad</Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    {/* Meta Fields */}
                                    {provider.requiredMetaFields.map(field => {
                                        const val = metaInputs[provider.id]?.[field.key] || connection?.meta[field.key] || '';
                                        return (
                                            <div key={field.key}>
                                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                                    {field.label}
                                                </label>
                                                <input
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                                                    placeholder={field.placeholder}
                                                    value={val}
                                                    onChange={e => setMetaInputs({
                                                        ...metaInputs,
                                                        [provider.id]: { ...metaInputs[provider.id], [field.key]: e.target.value }
                                                    })}
                                                />
                                                {field.helperText && <p className="text-[10px] text-slate-400 mt-1">{field.helperText}</p>}
                                            </div>
                                        );
                                    })}

                                    {/* Auth Input */}
                                    {provider.authType === 'apiKey' && (
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                                API Nyckel
                                            </label>
                                            <div className="relative">
                                                <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="password"
                                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none font-mono"
                                                    placeholder={isConnected ? "•••••••••••••••••••••" : "Ange API nyckel"}
                                                    value={secretsInputs[provider.id] || ''}
                                                    onChange={e => setSecretsInputs({ ...secretsInputs, [provider.id]: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-2 pt-2">
                                        {isConnected && (
                                            <Button variant="ghost" size="sm" onClick={() => handleTestConnection(provider.id)}>
                                                Testa
                                            </Button>
                                        )}

                                        {provider.authType === 'oauth' ? (
                                            <Button
                                                variant={isConnected ? "outline" : "primary"}
                                                size="sm"
                                                onClick={() => handleSaveConnection(provider)}
                                                className={!isConnected ? "bg-slate-900 border-slate-900 hover:bg-slate-800" : ""}
                                            >
                                                {isConnected ? 'Återanslut (OAuth)' : 'Connect Account'}
                                            </Button>
                                        ) : (
                                            <Button variant="primary" size="sm" onClick={() => handleSaveConnection(provider)}>
                                                <Save size={14} className="mr-2" />
                                                Spara & Verifiera
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

        </div>
    );
};

export default CustomerIntegrations;
