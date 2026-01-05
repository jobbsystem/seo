import React, { useState, useEffect } from "react";
import GlassCard from "../../ui/GlassCard";
import Button from "../../ui/Button";
import { CheckCircle, Save, RotateCcw, Plus, Trash2 } from "lucide-react";
import { demoRepo } from "../../api/DemoSeoRepository";
import { TeamMember } from "../../../types";
import { TEAM_MEMBERS as INITIAL_TEAM } from "../../../constants";

const AdminSettings: React.FC = () => {
    const [agencyName, setAgencyName] = useState("Agency OS");
    const [email, setEmail] = useState("admin@admin.se");
    const [notifications, setNotifications] = useState({
        emailOnView: true,
        weeklyDigest: false,
    });
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

    // New member input state
    const [newMember, setNewMember] = useState<TeamMember>({ name: '', role: '', avatar: '' });
    const memberFileInputRef = React.useRef<HTMLInputElement>(null);
    const [saved, setSaved] = useState(false);
    const [resetting, setResetting] = useState(false);

    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Load from local storage if available (mock persistence)
    useEffect(() => {
        const savedName = localStorage.getItem("seo:settings:agencyName");
        if (savedName) setAgencyName(savedName);

        const savedEmail = localStorage.getItem("seo:settings:email");
        if (savedEmail) setEmail(savedEmail);

        const savedLogo = localStorage.getItem("seo:settings:logo");
        if (savedLogo) setLogoUrl(savedLogo);

        const savedNotifs = localStorage.getItem("seo:settings:notifications");
        if (savedNotifs) setNotifications(JSON.parse(savedNotifs));

        const savedTeam = localStorage.getItem("seo:settings:team");
        if (savedTeam) {
            setTeamMembers(JSON.parse(savedTeam));
        } else {
            setTeamMembers(INITIAL_TEAM);
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem("seo:settings:agencyName", agencyName);
        localStorage.setItem("seo:settings:email", email);
        if (logoUrl) localStorage.setItem("seo:settings:logo", logoUrl);
        localStorage.setItem("seo:settings:notifications", JSON.stringify(notifications));
        localStorage.setItem("seo:settings:team", JSON.stringify(teamMembers));

        // Dispatch event for immediate UI update class

        // Dispatch event for immediate UI update in Layout
        window.dispatchEvent(new Event('agency-settings-updated'));

        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleMemberImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewMember(prev => ({ ...prev, avatar: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };



    const handleAddMember = () => {
        if (!newMember.name || !newMember.role) return;
        const updatedTeam = [...teamMembers, {
            ...newMember,
            avatar: newMember.avatar || `https://ui-avatars.com/api/?name=${newMember.name}&background=random`
        }];

        setTeamMembers(updatedTeam);
        setNewMember({ name: '', role: '', avatar: '' });

        // Auto-save team members
        localStorage.setItem("seo:settings:team", JSON.stringify(updatedTeam));
        window.dispatchEvent(new Event('agency-settings-updated'));
    };

    const handleRemoveMember = (index: number) => {
        const updatedTeam = teamMembers.filter((_, i) => i !== index);
        setTeamMembers(updatedTeam);

        // Auto-save removal
        localStorage.setItem("seo:settings:team", JSON.stringify(updatedTeam));
        window.dispatchEvent(new Event('agency-settings-updated'));
    };

    const handleResetData = () => {
        if (!confirm("Är du säker? Detta raderar all data och återställer demot.")) return;
        setResetting(true);

        // Clear known keys
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith("seo:demo:") || key.startsWith("seo:settings:")) {
                localStorage.removeItem(key);
            }
        });

        // Force reload to re-seed
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Inställningar</h2>
                <p className="text-sm text-slate-500">Hantera byråns profil och systeminställningar.</p>
            </div>

            <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">
                    Profil & Utseende
                </h3>

                <div className="mb-8 flex items-center gap-6">
                    <div
                        className="w-24 h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-slate-100 transition relative group"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {logoUrl ? (
                            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                        ) : (
                            <div className="text-center p-2">
                                <span className="text-xs text-slate-400 font-medium">Ladda upp logo</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                            <span className="text-white text-xs font-bold">Ändra</span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-medium text-slate-900">Byrålogotyp</h4>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleLogoSelect}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Byrånamn</label>
                        <input
                            type="text"
                            value={agencyName}
                            onChange={(e) => setAgencyName(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white/50 focus:border-slate-400 outline-none transition"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Admin Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white/50 focus:border-slate-400 outline-none transition"
                        />
                    </div>
                </div>

                <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-4 border-b border-slate-100 pb-2">
                    Kontaktpersoner för kunder
                </h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="sm:col-span-2 flex justify-center pb-1">
                            <div
                                className="w-10 h-10 rounded-full bg-slate-200 cursor-pointer overflow-hidden border border-slate-300 relative group"
                                onClick={() => memberFileInputRef.current?.click()}
                            >
                                {newMember.avatar ? (
                                    <img src={newMember.avatar} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <Plus size={14} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                    <span className="text-[8px] text-white font-bold">BILD</span>
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={memberFileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleMemberImageSelect}
                            />
                        </div>
                        <div className="sm:col-span-4 space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Namn</label>
                            <input
                                value={newMember.name}
                                onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                                placeholder="Namn"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-slate-400 outline-none"
                            />
                        </div>
                        <div className="sm:col-span-4 space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Roll</label>
                            <input
                                value={newMember.role}
                                onChange={e => setNewMember({ ...newMember, role: e.target.value })}
                                placeholder="Roll"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-slate-400 outline-none"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <Button variant="secondary" onClick={handleAddMember} disabled={!newMember.name || !newMember.role} className="w-full justify-center">
                                <Plus size={16} />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {teamMembers.map((member, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover bg-slate-100" />
                                    <div>
                                        <p className="font-semibold text-slate-900 text-sm">{member.name}</p>
                                        <p className="text-xs text-slate-500">{member.role}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemoveMember(i)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        {teamMembers.length === 0 && (
                            <p className="text-sm text-slate-400 text-center py-4 bg-slate-50/50 rounded-xl italic">
                                Inga kontaktpersoner inlagda.
                            </p>
                        )}
                    </div>
                </div>

                <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-4 border-b border-slate-100 pb-2">
                    Notifieringar
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-900">Kund läser rapport</p>
                            <p className="text-xs text-slate-500">Få ett mail när en kund öppnar en publicerad rapport.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={notifications.emailOnView} onChange={e => setNotifications({ ...notifications, emailOnView: e.target.checked })} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-900">Veckosammanfattning</p>
                            <p className="text-xs text-slate-500">En sammanställning av alla kunders KPIer varje måndag.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={notifications.weeklyDigest} onChange={e => setNotifications({ ...notifications, weeklyDigest: e.target.checked })} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                        </label>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <Button variant="primary" onClick={handleSave} className="px-6">
                        {saved ? <CheckCircle className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        {saved ? "Sparat!" : "Spara inställningar"}
                    </Button>
                </div>
            </GlassCard >

            {/* AI Co-pilot Settings */}
            < GlassCard className="p-6" >
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">AI-Inställningar (Co-pilot)</h3>
                        <p className="text-sm text-slate-500 mb-4">
                            🤖 (Valfritt) Koppla in AI för att effektivisera din byrå. Du bestämmer själv om du vill använda detta.
                        </p>
                    </div>
                    <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border border-purple-100 flex items-center gap-1">
                        ✨ Beta
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Google Gemini API Key</label>
                        <div className="relative">
                            <input
                                type="password"
                                placeholder="sk-..."
                                onChange={(e) => {
                                    // Use dynamic import or direct access if import cycle issues, 
                                    // but here we just simulate saving to local storage which AiService reads
                                    localStorage.setItem('agency_os:gemini_api_key', e.target.value);
                                }}
                                defaultValue={typeof window !== 'undefined' ? localStorage.getItem('agency_os:gemini_api_key') || '' : ''}
                                className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10 outline-none transition font-mono text-sm"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            Besök <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-purple-600 hover:underline">Google AI Studio</a> för att hämta din nyckel.
                        </p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <h4 className="text-sm font-semibold text-slate-900 mb-2">Om du väljer att aktivera AI (Valfritt):</h4>
                        <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
                            <li><strong>Analys & Rapportering:</strong> Skriver automatiska VD-ord och sammanfattar månadsrapporter.</li>
                            <li><strong>Opportunity Scout:</strong> Scannar kunders hemsidor efter nya affärsmöjligheter och tekniska brister.</li>
                            <li><strong>Kommunikation:</strong> Hjälper till att formulera proffsiga svar och analyserar tonläge i kundmeddelanden.</li>
                            <li><strong>Kvalitetskontroll:</strong> Varnar vid databortfall i rapporter innan de skickas.</li>
                            <li><strong>Churn-Risk:</strong> Identifierar passiva kunder som riskerar att lämna.</li>
                        </ul>
                    </div>
                </div>
            </GlassCard >

            <GlassCard className="p-6 border-danger/20">
                <h3 className="text-lg font-semibold text-danger mb-2">System (Demo)</h3>
                <p className="text-sm text-slate-600 mb-4">
                    Här kan du återställa all data till ursprungsläget. Detta raderar alla anpassade kunder och rapporter du skapat.
                </p>
                <Button variant="outline" onClick={handleResetData} disabled={resetting} className="text-danger border-danger/30 hover:bg-danger/5">
                    <RotateCcw className={`w-4 h-4 mr-2 ${resetting ? 'animate-spin' : ''}`} />
                    {resetting ? "Återställer..." : "Återställ Demo Data"}
                </Button>
            </GlassCard>
        </div >
    );
};

export default AdminSettings;
