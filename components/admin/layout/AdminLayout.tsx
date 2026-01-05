import React, { ReactNode } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

interface AdminLayoutProps {
    currentSection: string; // 'dashboard' | 'customers' | 'reports' | 'settings'
    onSectionChange: (section: string) => void;
    onLogout?: () => void;
    title?: string;
    children: ReactNode;
}

const getTitle = (section: string) => {
    switch (section) {
        case 'dashboard': return 'Översikt';
        case 'customers': return 'Kunder';
        case 'reports': return 'Rapporter';
        case 'automation': return 'Automatisering';
        case 'settings': return 'Inställningar';
        case 'messages': return 'Meddelanden';
        default: return 'Admin';
    }
};

const AdminLayout: React.FC<AdminLayoutProps> = ({
    currentSection,
    onSectionChange,
    onLogout,
    title,
    children
}) => {
    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
            <AdminSidebar
                currentSection={currentSection}
                onSectionChange={onSectionChange}
                onLogout={onLogout}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <AdminHeader title={title || getTitle(currentSection)} />

                <main className="flex-1 overflow-y-auto p-8 no-scrollbar">
                    <div className="max-w-6xl mx-auto animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
