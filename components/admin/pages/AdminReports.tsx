import React, { useState, useEffect } from 'react';
import GlassCard from '../../ui/GlassCard';
import Button from '../../ui/Button';
import { FileText, CheckCircle, Clock, Upload, Send, Sparkles } from 'lucide-react';
import { demoRepo } from '../../api/DemoSeoRepository';
import type { SeoPeriodReport } from '../../types/seoReport';
import { parseSeoReportExcel } from '../../utils/SeoReportParser';

interface AdminReportsProps {
    onReview: (customerId: string, month: string) => void;
    onGenerateDrafts?: () => void;
}

const AdminReports: React.FC<AdminReportsProps> = ({ onReview, onGenerateDrafts }) => {
    const [activeTab, setActiveTab] = useState<'drafts' | 'published'>('drafts');
    const [drafts, setDrafts] = useState<SeoPeriodReport[]>([]);
    const [published, setPublished] = useState<SeoPeriodReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadTarget, setUploadTarget] = useState<{ customerId: string, periodKey: string } | null>(null);
    const [uploadStatus, setUploadStatus] = useState<Record<string, 'idle' | 'uploading' | 'success' | 'error'>>({});
    const [uploadIsAi, setUploadIsAi] = useState(false);
    const [showFormatInfo, setShowFormatInfo] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // TODO: Use correct periodType selector in UI
    const currentMonth = "2026-01";

    const fetchData = async () => {
        try {
            setLoading(true);
            // Drafts: Filter for current month
            const draftsList = await demoRepo.listAllReports("monthly", currentMonth);
            setDrafts(draftsList.filter(r => r.status === 'draft'));

            // Published: Fetch ALL recent published reports
            const publishedList = await demoRepo.listRecentPublishedReports(50);
            setPublished(publishedList);
        } catch (e) {
            console.error("Failed to fetch reports:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUploadClick = (customerId: string, periodKey: string, isAi: boolean) => {
        setUploadTarget({ customerId, periodKey });
        setUploadIsAi(isAi);
        if (uploadStatus[customerId] === 'error') {
            setUploadStatus(prev => ({ ...prev, [customerId]: 'idle' }));
        }
        fileInputRef.current?.click();
    };

    const handleQuickPublish = async (customerId: string, periodKey: string) => {
        try {
            if (!confirm(`Ska rapporten för ${customerId} (${periodKey}) publiceras direkt?`)) return;

            // Optimistic update or reload
            await demoRepo.publishReport(customerId, 'monthly', periodKey);
            await fetchData();
        } catch (e) {
            console.error(e);
            alert("Kunde inte publicera");
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !uploadTarget) return;

        const targetId = uploadTarget.customerId;
        setUploadStatus(prev => ({ ...prev, [targetId]: 'uploading' }));

        try {
            // Check for PDF
            const isPdf = file.name.toLowerCase().endsWith('.pdf');

            if (isPdf) {
                if (uploadIsAi) {
                    // Mock AI processing for PDF
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    setUploadStatus(prev => ({ ...prev, [targetId]: 'success' }));
                    setTimeout(() => setUploadStatus(prev => ({ ...prev, [targetId]: 'idle' })), 5000);
                    alert("📂 PDF uppladdad! \n\nAI-analysen är köad och data kommer extraheras inom kort.\n(Detta är en simulation)");
                    return;
                } else {
                    alert("⚠️ PDF-filer kan endast behandlas av AI.\n\nVänligen klicka på den lila 'AI Import'-knappen för att ladda upp PDF:er.");
                    setUploadStatus(prev => ({ ...prev, [targetId]: 'idle' }));
                    setUploadTarget(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    return;
                }
            }

            // Standard Parser
            const partialData = await parseSeoReportExcel(file);

            // Fetch existing report to merge
            const existing = await demoRepo.getReport(targetId, 'monthly', uploadTarget.periodKey);
            if (existing) {
                const updated = {
                    ...existing,
                    ...partialData,
                    uploadedAt: new Date().toISOString()
                };

                if (partialData.kpis) {
                    updated.kpis = { ...existing.kpis, ...partialData.kpis };
                }

                await demoRepo.upsertReport(updated);
                await fetchData();
                setUploadStatus(prev => ({ ...prev, [targetId]: 'success' }));

                setTimeout(() => {
                    setUploadStatus(prev => ({ ...prev, [targetId]: 'idle' }));
                }, 5000);
            }
        } catch (err) {
            console.error(err);
            setUploadStatus(prev => ({ ...prev, [targetId]: 'error' }));
            alert("Fel vid uppladdning av fil: " + (err as Error).message);
        } finally {
            setUploadTarget(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-6">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".xlsx,.xls,.csv,.html,.htm,.pdf"
                onChange={handleFileChange}
            />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Rapporter</h2>
                    <p className="text-sm text-slate-500 mb-2">Granska och publicera rapporter för {currentMonth}. Ladda upp data via Excel, CSV eller HTML. Med AI kan du även ladda upp PDF.</p>

                    <button
                        onClick={() => setShowFormatInfo(!showFormatInfo)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                    >
                        <span className="bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">ℹ️ Vilka format stöds?</span>
                    </button>

                    {showFormatInfo && (
                        <div className="mt-3 bg-slate-50 rounded-xl p-4 border border-slate-200/60 animate-fade-in text-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-1.5 bg-white rounded-md border border-slate-200 shadow-sm">
                                            <Upload size={14} className="text-slate-500" />
                                        </div>
                                        <span className="font-bold text-slate-800">Manuell Uppladdning</span>
                                    </div>
                                    <ul className="space-y-1 ml-9 text-slate-600 text-xs">
                                        <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-400"></span>Excel (.xlsx, .xls)</li>
                                        <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-400"></span>CSV (.csv)</li>
                                        <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-400"></span>HTML (.html)</li>
                                    </ul>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-1.5 bg-purple-50 rounded-md border border-purple-100 shadow-sm">
                                            <Sparkles size={14} className="text-purple-600" />
                                        </div>
                                        <span className="font-bold text-purple-900">AI Import</span>
                                    </div>
                                    <ul className="space-y-1 ml-9 text-slate-600 text-xs">
                                        <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-purple-400"></span>Allt i manuell</li>
                                        <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-purple-400"></span><strong>PDF (.pdf)</strong></li>
                                        <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-purple-400"></span>Bildanalys av dokument</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <Button
                    variant="primary"
                    disabled={loading}
                    onClick={async () => {
                        if (!onGenerateDrafts) return;

                        try {
                            setLoading(true);
                            // Cast to any because we updated the return type in the repo but prop type might be loose or inferred
                            const stats = await (demoRepo.generateDrafts('monthly', currentMonth) as any);
                            await fetchData(); // fetchData handles its own setLoading(true/false) but we want to ensure false at end

                            let msg = "Generering slutförd.";
                            if (stats && typeof stats.created === 'number') {
                                if (stats.created > 0) {
                                    msg += `\n• Skapade ${stats.created} nya utkast.`;
                                } else {
                                    msg += "\n• Inga nya utkast skapades.";
                                }

                                if (stats.existing > 0) {
                                    msg += `\n• ${stats.existing} rapporter fanns redan (se fliken 'Utkast' eller 'Publicerade').`;
                                }
                            } else {
                                msg += " Kontrollera 'Publicerade' om du saknar rapporter.";
                            }
                            alert(msg);
                        } catch (err) {
                            console.error(err);
                            alert("Ett fel inträffade vid generering: " + (err instanceof Error ? err.message : String(err)));
                        } finally {
                            setLoading(false);
                        }
                    }}
                    className="px-4 py-2 flex items-center gap-2"
                >
                    {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                    ) : (
                        <FileText size={16} />
                    )}
                    {loading ? 'Genererar...' : 'Generera rapporter'}
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-200">
                <TabButton label="Utkast (Drafts)" active={activeTab === 'drafts'} onClick={() => setActiveTab('drafts')} count={drafts.length} />
                <TabButton label="Publicerade" active={activeTab === 'published'} onClick={() => setActiveTab('published')} count={published.length} />
            </div>

            {/* Content */}
            {/* Content Container with contrasting background for Glassmorphism */}
            <div className="min-h-[500px] p-8 -mx-8 bg-slate-50/50 rounded-3xl border border-slate-100/50 mt-6 relative overflow-hidden">
                {/* Decorative blobs for glass effect */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none mix-blend-multiply"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl pointer-events-none mix-blend-multiply"></div>

                {loading ? (
                    <div className="flex items-center justify-center py-12 text-slate-500 text-sm relative z-10">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-300 border-t-blue-600 mr-2" />
                        Laddar rapporter...
                    </div>
                ) : activeTab === 'drafts' ? (
                    // Drafts Grid View
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                        {drafts.map((d) => (
                            <div key={`${d.customerId}-${d.periodKey}`} className="bg-white/60 backdrop-blur-2xl p-6 rounded-[24px] border border-white/60 shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.1)] transition-all duration-300 group relative hover:-translate-y-1">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/80 border border-white flex items-center justify-center text-slate-800 text-sm font-bold shadow-sm backdrop-blur-sm">
                                            {d.customerId.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg tracking-tight">{d.customerId}</h3>
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide opacity-80">{d.month || d.periodKey}</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FFF8E6] text-[#B45309] border border-[#FEF3C7] shadow-sm">
                                        UTKAST
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    <Button variant="secondary" className="w-full justify-center py-2.5 rounded-full border-slate-200 bg-white hover:bg-slate-50 font-medium transition-colors shadow-sm" onClick={() => onReview(d.customerId, d.month || d.periodKey)}>
                                        Granska
                                    </Button>
                                    <Button
                                        variant="primary"
                                        className="w-full justify-center py-2.5 rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white shadow-lg shadow-slate-900/10 flex items-center gap-2 border-none transition-all"
                                        onClick={() => handleQuickPublish(d.customerId, d.month || d.periodKey)}
                                    >
                                        <Send size={14} />
                                        Publicera
                                    </Button>

                                    {uploadStatus[d.customerId] === 'uploading' || uploadStatus[d.customerId] === 'success' ? (
                                        <div className={`w-full px-3 py-2.5 text-sm font-medium rounded-full transition-all flex items-center justify-center gap-2 border ${uploadStatus[d.customerId] === 'success'
                                            ? 'bg-green-50 text-green-700 border-green-200'
                                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                            }`}>
                                            {uploadStatus[d.customerId] === 'uploading' ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent" />
                                                    <span>{uploadIsAi ? 'AI Analyserar...' : 'Laddar upp...'}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle size={16} />
                                                    <span>Klar</span>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex gap-3 pt-1">
                                            <button
                                                onClick={() => handleUploadClick(d.customerId, d.periodKey, true)}
                                                className="flex-1 px-3 py-2.5 text-sm font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-lg shadow-purple-500/20 active:scale-[0.98]"
                                            >
                                                <Sparkles size={16} />
                                                AI Import
                                            </button>
                                            <button
                                                onClick={() => handleUploadClick(d.customerId, d.periodKey, false)}
                                                className="px-4 py-2.5 text-sm font-medium rounded-2xl transition-all flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm"
                                            >
                                                <Upload size={16} />
                                                Manuell
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {drafts.length === 0 && (
                            <div className="col-span-full py-16 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-slate-900 font-medium mb-1">Inga utkast</h3>
                                <p className="text-slate-500 text-sm">Alla rapporter är publicerade eller så har inga genererats än.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    // Published Table View (Delivery Log)
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold w-1/4">Kund</th>
                                    <th className="px-6 py-4 font-semibold">Rapportperiod</th>
                                    <th className="px-6 py-4 font-semibold">Levererad (Datum)</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold text-right">Åtgärd</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {published.map((d) => (
                                    <tr key={`${d.customerId}-${d.periodKey}`} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold border border-indigo-100">
                                                    {d.customerId.substring(0, 1).toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-slate-900">{d.customerId}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                                {d.month || d.periodKey}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                                            {d.publishedAt ? d.publishedAt.substring(0, 10) : '-'} <span className="text-slate-300 mx-1">|</span> {d.publishedAt ? d.publishedAt.substring(11, 16) : ''}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md w-fit border border-emerald-100">
                                                <CheckCircle size={14} className="fill-emerald-600 text-white" />
                                                <span className="text-xs font-bold">Skickad</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                variant="outline"
                                                className="text-xs h-8 py-0 border-slate-200 hover:bg-white hover:border-blue-300 hover:text-blue-600"
                                                onClick={() => onReview(d.customerId, d.month || d.periodKey)}
                                            >
                                                Visa rapport
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {published.length === 0 && (
                            <div className="py-16 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-slate-900 font-medium mb-1">Inga publicerade rapporter</h3>
                                <p className="text-slate-500 text-sm">När du publicerar utkast hamnar de här i leveransloggen.</p>
                            </div>
                        )}
                    </div>
                )
                }
            </div >
        </div >
    );
};

// ... TabButton ...

const TabButton = ({ label, active, onClick, count }: any) => (
    <button
        onClick={onClick}
        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${active
            ? 'border-slate-900 text-slate-900'
            : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
    >
        {label}
        {count !== undefined && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-slate-100 text-slate-900' : 'bg-slate-100 text-slate-500'}`}>
                {count}
            </span>
        )}
    </button>
);

export default AdminReports;
