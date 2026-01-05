import React, { useState, useEffect } from 'react';
import { adminRepo } from '../../api/AdminRepository';
import type { AgencyCustomer } from '../../types/agency';
import GlassCard from '../../ui/GlassCard';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import {
    CloudIcon,
    ClockIcon,
    CheckCircleIcon,
    ServerIcon,
    ArrowPathIcon,
    PlayIcon,
    GlobeAltIcon,
    CpuChipIcon,
    BoltIcon
} from '@heroicons/react/24/outline';

interface AdminAutomationsProps {
    onViewCustomer?: (customerId: string) => void;
}

const AdminAutomations: React.FC<AdminAutomationsProps> = ({ onViewCustomer }) => {
    const [isDemoRunning, setIsDemoRunning] = useState(false);
    const [demoStep, setDemoStep] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const [failedCustomers, setFailedCustomers] = useState<AgencyCustomer[]>([]);

    useEffect(() => {
        const loadData = async () => {
            const customers = await adminRepo.listCustomers();
            const failed = customers.filter(c => (c.connectionSummary?.errorsCount || 0) > 0);
            setFailedCustomers(failed);
        };
        loadData();
    }, []);

    // Demo sequence configuration
    const demoSequence = [
        { label: "Initierar molnfunktion...", duration: 800 },
        { label: "Ansluter till Google Cloud Platform...", duration: 1200 },
        { label: "Hämtar 43 aktiva kunder från databas...", duration: 1000 },
        { label: "Autentiserar med Google Search Console API (Service Account)...", duration: 1500 },
        { label: "Autentiserar med Google Analytics 4 Data API...", duration: 1200 },
        { label: "Hämtar sökdata för kund: Tandläkare.se...", duration: 800 },
        { label: "Hämtar trafikdata för kund: Tandläkare.se...", duration: 800 },
        { label: "Genererar rapport (v2026-01)...", duration: 600 },
        { label: "Sparar till Firestore...", duration: 500 },
        { label: "Hämtar sökdata för kund: Kontor.se...", duration: 800 },
        { label: "Hämtar trafikdata för kund: Kontor.se...", duration: 800 },
        { label: "Genererar rapport (v2026-01)...", duration: 600 },
        { label: "Sparar till Firestore...", duration: 500 },
        { label: "Batch-körning slutförd. 2 rapporter genererade.", duration: 200 }
    ];

    const runDemo = () => {
        if (isDemoRunning) return;
        setIsDemoRunning(true);
        setDemoStep(0);
        setLogs([]);

        let currentStep = 0;

        const executeNext = () => {
            if (currentStep >= demoSequence.length) {
                setIsDemoRunning(false);
                return;
            }

            const step = demoSequence[currentStep];
            setDemoStep(currentStep + 1);
            setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${step.label}`]);

            currentStep++;
            setTimeout(executeNext, step.duration);
        };

        executeNext();
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">System Automation</h1>
                    <p className="text-sm text-slate-500">Övervaka och hantera bakgrundsprocesser för rapportgenerering.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.open('https://console.firebase.google.com', '_blank')}>
                        <CloudIcon className="w-4 h-4 mr-2" />
                        GCP Console
                    </Button>
                    <Button variant="primary" size="sm" onClick={runDemo} disabled={isDemoRunning}>
                        {isDemoRunning ? <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" /> : <PlayIcon className="w-4 h-4 mr-2" />}
                        {isDemoRunning ? 'Kör jobb...' : 'Kör manuellt jobb'}
                    </Button>
                </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GlassCard className="p-4 flex items-center gap-4">
                    <div className="p-2.5 bg-emerald-100 rounded-lg text-emerald-600">
                        <ServerIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-slate-500 uppercase">System Status</div>
                        <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                            Online
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-4 flex items-start gap-4">
                    <div className="p-2.5 bg-blue-100 rounded-lg text-blue-600 mt-0.5">
                        <ClockIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Nästa Körning</div>
                        <div className="flex flex-col gap-2">
                            <input
                                type="datetime-local"
                                className="bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                defaultValue="2026-02-01T06:00"
                            />
                            <div className="text-[10px] text-slate-500">
                                <span className="font-semibold">Cron:</span> 0 6 1 * *
                            </div>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-4 flex items-center gap-4">
                    <div className="p-2.5 bg-purple-100 rounded-lg text-purple-600">
                        <BoltIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-slate-500 uppercase">Senaste Körning</div>
                        <div className="text-base font-bold text-slate-900">
                            1 Jan, 06:02
                        </div>
                        <div className="text-[10px] text-emerald-500 font-medium">148 rapporter skapade (100% success)</div>
                    </div>
                </GlassCard>
            </div>

            {/* Architecture Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <GlassCard className="p-5 h-full">
                        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <CpuChipIcon className="w-5 h-5 text-slate-500" />
                            Live Process Visualizer
                        </h3>

                        {/* Visual Flow Diagram */}
                        <div className="relative py-6 px-4 flex flex-col items-center justify-center space-y-6">
                            {/* Cloud Trigger */}
                            <div className={`transition-all duration-500 ${demoStep > 0 ? 'scale-110 opacity-100' : 'opacity-80'}`}>
                                <div className="flex flex-col items-center gap-2">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${demoStep === 1 ? 'border-blue-500 bg-blue-50 animate-pulse' : 'border-slate-200 bg-white'}`}>
                                        <ClockIcon className="w-6 h-6 text-slate-600" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500">SCHEDULER</span>
                                </div>
                            </div>

                            {/* Connection Line */}
                            <div className={`w-0.5 h-8 bg-slate-200 transition-colors duration-300 ${demoStep > 1 ? 'bg-blue-500' : ''}`}></div>

                            {/* Backend Service */}
                            <div className={`transition-all duration-500 ${demoStep > 1 ? 'scale-110 opacity-100' : 'opacity-80'}`}>
                                <div className="flex flex-col items-center gap-2">
                                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center border-2 shadow-sm ${demoStep > 1 && demoStep < 13 ? 'border-purple-500 bg-purple-50 ring-4 ring-purple-100' : 'border-slate-200 bg-white'}`}>
                                        <ServerIcon className={`w-8 h-8 ${demoStep > 1 && demoStep < 13 ? 'text-purple-600 animate-pulse' : 'text-slate-600'}`} />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500">CLOUD FUNCTIONS</span>
                                </div>
                            </div>

                            {/* Branching Lines */}
                            <div className="w-full max-w-[300px] flex justify-between relative mt-2">
                                <div className={`absolute left-1/2 top-0 -translate-x-1/2 w-0.5 h-6 bg-slate-200 ${demoStep > 2 ? 'bg-purple-500' : ''}`}></div>
                                <div className={`absolute left-[20%] top-6 right-[20%] h-0.5 bg-slate-200 ${demoStep > 2 ? 'bg-purple-500' : ''}`}></div>
                                <div className={`absolute left-[20%] top-6 w-0.5 h-6 bg-slate-200 ${demoStep > 3 ? 'bg-orange-500' : ''}`}></div>
                                <div className={`absolute right-[20%] top-6 w-0.5 h-6 bg-slate-200 ${demoStep > 4 ? 'bg-yellow-500' : ''}`}></div>
                            </div>

                            {/* External APIs */}
                            <div className="w-full max-w-[300px] flex justify-between pt-6">
                                <div className={`transition-all duration-500 ${demoStep > 3 ? 'opacity-100' : 'opacity-60 grayscale'}`}>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${demoStep > 3 && demoStep < 9 ? 'border-orange-500 bg-orange-50' : 'border-slate-200 bg-white'}`}>
                                            <GlobeAltIcon className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-500">SEARCH CONSOLE</span>
                                    </div>
                                </div>

                                <div className={`transition-all duration-500 ${demoStep > 4 ? 'opacity-100' : 'opacity-60 grayscale'}`}>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${demoStep > 4 && demoStep < 9 ? 'border-yellow-500 bg-yellow-50' : 'border-slate-200 bg-white'}`}>
                                            <ArrowPathIcon className="w-5 h-5 text-yellow-600" />
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-500">ANALYTICS 4</span>
                                    </div>
                                </div>
                            </div>

                            {/* Final Output */}
                            <div className={`mt-6 transition-all duration-700 ${demoStep > 8 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm">
                                    <CheckCircleIcon className="w-4 h-4" />
                                    Data sparad
                                </div>
                            </div>

                        </div>
                    </GlassCard>
                </div>

                {/* Console Log Simulation */}
                <div>
                    <GlassCard className="p-0 h-full flex flex-col bg-slate-900 border-slate-800 overflow-hidden min-h-[400px]">
                        <div className="p-2.5 border-b border-slate-700/50 flex items-center gap-1.5 bg-slate-900/50">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                            <span className="ml-2 text-[10px] font-mono text-slate-500">terminal — Cloud Functions</span>
                        </div>
                        <div className="flex-1 p-3 font-mono text-[11px] text-slate-300 overflow-y-auto custom-scrollbar">
                            {logs.length === 0 && (
                                <span className="text-slate-600 italic">Väntar på jobb...</span>
                            )}
                            {logs.map((log, i) => (
                                <div key={i} className="mb-1 border-l-2 border-emerald-500/30 pl-2 animate-fade-in wrap-break-word">
                                    <span className="text-emerald-400">$</span> {log}
                                </div>
                            ))}
                            {isDemoRunning && (
                                <div className="mt-2 animate-pulse">_</div>
                            )}
                        </div>
                    </GlassCard>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <GlassCard className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-slate-900">Senaste integrationsfel</h3>
                        {failedCustomers.length === 0 ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                Inga fel upptäckta
                            </span>
                        ) : (
                            <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                                {failedCustomers.length} fel upptäckta
                            </span>
                        )}
                    </div>

                    {failedCustomers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50/50 rounded-xl border border-slate-100 border-dashed">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-2">
                                <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                            </div>
                            <h4 className="text-xs font-semibold text-slate-900">Alla system fungerar</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">Inga integrationsproblem har rapporterats för någon kund.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {failedCustomers.map(customer => (
                                <div key={customer.id} className="flex flex-col p-3 bg-red-50/30 rounded-lg border border-red-100 hover:border-red-200 transition-all group">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-white rounded flex items-center justify-center shadow-sm border border-red-100 text-red-500 font-bold text-xs">
                                                {(customer.companyName || '?').charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-900 leading-tight">{customer.companyName}</div>
                                                <div className="text-[10px] text-slate-500">ID: {customer.id}</div>
                                            </div>
                                        </div>
                                        <Badge variant="error" size="sm" className="animate-pulse">Fel</Badge>
                                    </div>

                                    <div className="bg-white/60 rounded p-2 mb-2 border border-red-100/50">
                                        <div className="flex items-start gap-2">
                                            <div className="mt-0.5 text-red-500 text-xs">⚠️</div>
                                            <div>
                                                <div className="text-[10px] font-bold text-slate-800">Anslutningsfel upptäckt</div>
                                                <div className="text-[9px] text-slate-500 leading-relaxed mt-0.5">
                                                    Misslyckades med att hämta data från Semrush API. Token kan ha gått ut.
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="xs"
                                        className="w-full justify-center bg-white hover:bg-slate-50 border-slate-200 text-slate-600 font-medium py-1 text-xs h-7"
                                        onClick={() => onViewCustomer?.(customer.id)}
                                    >
                                        Åtgärda problemet
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </GlassCard>
            </div>
        </div>
    );
};

export default AdminAutomations;
