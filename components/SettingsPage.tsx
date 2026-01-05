import React, { useState } from 'react';
import { adminRepo } from './api/AdminRepository';
import GlassCard from './ui/GlassCard';
import Button from './ui/Button';
import { useToast } from './ui/ToastContext';
import { LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface SettingsPageProps {
    email: string;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ email }) => {
    const { success, error } = useToast();
    const [loading, setLoading] = useState(false);

    // Password state
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const calculateStrength = (pwd: string) => {
        if (!pwd) return 0;
        let score = 0;
        if (pwd.length > 7) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        return score; // Max 4
    };

    const strength = calculateStrength(newPassword);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newPassword || !confirmPassword) {
            error("Vänligen fyll i alla fält");
            return;
        }

        if (newPassword !== confirmPassword) {
            error("Lösenorden matchar inte");
            return;
        }

        if (newPassword.length < 6) {
            error("Lösenordet måste vara minst 6 tecken");
            return;
        }

        setLoading(true);
        try {
            await adminRepo.updateUserPassword(email, newPassword);
            success("Ditt lösenord har uppdaterats!");
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error(err);
            error("Kunde inte uppdatera lösenordet");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Inställningar</h2>
                <p className="text-slate-500 mt-1">Hantera ditt konto och säkerhet</p>
            </div>

            <GlassCard className="p-6 md:p-8">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <LockClosedIcon className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Säkerhet</h3>
                        <p className="text-sm text-slate-500">Uppdatera ditt lösenord för att hålla ditt konto säkert.</p>
                    </div>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-5 max-w-md">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Användarnamn/Email</label>
                        <input
                            type="text"
                            disabled
                            value={email}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Nytt lösenord</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                            placeholder="Minst 6 tecken"
                        />
                        {/* Password Strength Indicator */}
                        {newPassword && (
                            <div className="flex gap-1 mt-2">
                                {[1, 2, 3, 4].map(i => (
                                    <div
                                        key={i}
                                        className={`h-1 flex-1 rounded-full transition-colors ${strength >= i
                                                ? (strength < 2 ? 'bg-red-400' : strength < 3 ? 'bg-yellow-400' : 'bg-green-500')
                                                : 'bg-slate-100'
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Bekräfta lösenord</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                            placeholder="Upprepa lösenord"
                        />
                    </div>

                    <div className="pt-2">
                        <Button variant="primary" type="submit" disabled={loading} className="w-full sm:w-auto">
                            {loading ? 'Sparar...' : 'Uppdatera lösenord'}
                        </Button>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
};

export default SettingsPage;
