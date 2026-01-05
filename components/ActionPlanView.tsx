import React, { useEffect, useState } from 'react';
import {
    FlagIcon, ChartBarIcon, ClipboardDocumentCheckIcon,
    ArrowTrendingUpIcon, CheckCircleIcon, ClockIcon, CalendarIcon
} from '@heroicons/react/24/outline';
import GlassCard from './ui/GlassCard';
import Badge from './ui/Badge';
import { demoRepo } from './api/DemoSeoRepository';
import type { ActionPlan, ActionArea, ActionActivity } from './types/admin';

/* 
  Customer-facing read-only view of the Action Plan.
  Displays strategic goals, current status, and a checklist of activities.
*/

interface ActionPlanViewProps {
    customerId: string;
}

const ActionPlanView: React.FC<ActionPlanViewProps> = ({ customerId }) => {
    const [plan, setPlan] = useState<ActionPlan | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const data = await demoRepo.getActionPlan(customerId);
            setPlan(data);
            setLoading(false);
        };
        load();
    }, [customerId]);

    if (loading) return <div className="p-12 text-center text-slate-500 animate-pulse">Laddar handlingsplan...</div>;
    if (!plan) return <div className="p-12 text-center text-slate-500">Ingen handlingsplan aktiverad.</div>;

    // Helper to calculate progress for an area
    const getProgress = (activities: ActionActivity[]) => {
        if (!activities.length) return 0;
        const completed = activities.filter(a => a.status === 'done').length;
        return Math.round((completed / activities.length) * 100);
    };

    const businessGoalsList = plan.businessGoals ? plan.businessGoals.split('\n') : [];
    const seoGoalsList = plan.seoGoals ? plan.seoGoals.split('\n') : [];

    return (
        <div className="space-y-6 animate-fade-in pb-8">
            {/* Header / Strategy Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <GlassCard className="lg:col-span-2 p-6 bg-linear-to-br from-white/90 to-blue-50/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <FlagIcon className="w-32 h-32 text-blue-900" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <FlagIcon className="w-6 h-6 text-blue-600" />
                        Strategiska Mål & Fokus
                    </h2>

                    <div className="space-y-4 relative z-10">
                        <div>
                            <h3 className="text-xs font-bold uppercase track-wide text-slate-400 mb-2">Affärsmål</h3>
                            {businessGoalsList.length > 0 ? (
                                <ul className="space-y-2">
                                    {businessGoalsList.map((g, i) => (
                                        <li key={i} className="flex items-start gap-2 text-slate-700 font-medium">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                                            {g}
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-sm text-slate-500 italic">Inga affärsmål definierade.</p>}
                        </div>
                        <div className="pt-4 border-t border-slate-200/50">
                            <h3 className="text-xs font-bold uppercase track-wide text-slate-400 mb-2">SEO Målsättning</h3>
                            {seoGoalsList.length > 0 ? (
                                <ul className="space-y-2">
                                    {seoGoalsList.map((g, i) => (
                                        <li key={i} className="flex items-start gap-2 text-slate-700">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                            {g}
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-sm text-slate-500 italic">Inga SEO-mål definierade.</p>}
                        </div>
                    </div>
                </GlassCard>

                <div className="space-y-6">
                    <GlassCard className="p-5 bg-slate-900 text-white relative overflow-hidden h-full">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <ClipboardDocumentCheckIcon className="w-24 h-24 text-white" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-200 mb-1">Statusanalys</h3>
                        <p className="text-white/90 text-sm leading-relaxed relative z-10 whitespace-pre-wrap">
                            {plan.statusAnalysis || "Ingen analys tillgänglig."}
                        </p>
                        <div className="mt-4 pt-4 border-t border-white/10 text-xs text-slate-400">
                            Senast uppdaterad: {new Date(plan.updatedAt).toLocaleDateString()}
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* Action Areas & Checklist */}
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4 px-1">Handlingsplan & Aktiviteter</h2>

            <div className="grid grid-cols-1 gap-6">
                {plan.actionAreas.map((area) => (
                    <GlassCard key={area.id} className="overflow-hidden">
                        <div className="p-5 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-lg font-bold text-slate-900">{area.title}</h3>
                                    <Badge variant={area.status === 'completed' ? 'success' : area.status === 'in-progress' ? 'warning' : 'neutral'}>
                                        {area.status === 'completed' ? 'Klart' : area.status === 'in-progress' ? 'Pågående' : 'Ej påbörjad'}
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <div className="text-xs text-slate-400 font-medium uppercase mb-1">Genomfört</div>
                                    <div className="text-lg font-bold text-slate-900">{getProgress(area.activities)}%</div>
                                </div>
                                {/* Progress Bar */}
                                <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                                        style={{ width: `${getProgress(area.activities)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {area.activities.map((activity) => (
                                <div key={activity.id} className={`p-4 flex items-start gap-4 transition-colors ${activity.status === 'done' ? 'bg-slate-50/50' : 'hover:bg-blue-50/30'}`}>
                                    <div className={`mt-1 shrink-0`}>
                                        {activity.status === 'done' ? (
                                            <div className="flex items-center gap-2">
                                                <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
                                                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Klar</span>
                                            </div>
                                        ) : (
                                            <div className="w-6 h-6 border-2 border-slate-300 rounded-full" />
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <p className={`text-sm font-medium ${activity.status === 'done' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                                                {activity.description}
                                            </p>
                                            {activity.estHours && (
                                                <Badge variant="neutral" className="self-start sm:self-auto flex items-center gap-1 text-[10px] px-2 py-0.5">
                                                    <ClockIcon className="w-3 h-3" />
                                                    {activity.estHours}h
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {area.activities.length === 0 && (
                                <div className="p-8 text-center text-slate-400 text-sm italic">
                                    Inga aktiviteter inplanerade just nu.
                                </div>
                            )}
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};

export default ActionPlanView;
