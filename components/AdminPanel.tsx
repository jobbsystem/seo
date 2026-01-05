import React, { useEffect, useState } from 'react';
import AdminLayout from './admin/layout/AdminLayout';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminReports from './admin/pages/AdminReports';
import AdminCustomers from './admin/pages/AdminCustomers';
import AdminSettings from './admin/pages/AdminSettings';
import AdminAutomations from './admin/pages/AdminAutomations';
import AdminMessages from './admin/pages/AdminMessages';
import AdminDraftReviewPage from './admin/AdminDraftReviewPage';
import CustomerDetailsPage from './admin/pages/CustomerDetailsPage';
import { adminCustomersMock } from './mock/admin.customers';
import { demoRepo } from './api/DemoSeoRepository';
import type { SeoPeriodReport } from './types/seoReport';
import type { ReportStatus } from './types/admin';

type Section = 'dashboard' | 'drafts' | 'customers' | 'reports' | 'settings' | 'action-plans' | 'automation' | 'messages';
type AdminRoute = { page: Section }
  | { page: 'review'; customerId: string; month: string }
  | { page: 'customer-details'; customerId: string; initialTab?: 'overview' | 'contacts' | 'services' | 'technical' | 'actionPlan' };

interface AdminPanelProps {
  onLogout?: () => void;
  route: AdminRoute;
  onRouteChange: (r: AdminRoute) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, route, onRouteChange }) => {
  const [stats, setStats] = useState({
    totalCustomers: adminCustomersMock.length,
    draftsPending: 0,
    publishedReports: 0
  });

  // TODO: Use real period selection
  const currentMonth = "2026-01";

  const loadStats = async () => {
    const allReports = await demoRepo.listAllReports('monthly', currentMonth);
    const drafts = allReports.filter(r => r.status === 'draft');
    const published = allReports.filter(r => r.status === 'published');

    setStats(prev => ({
      ...prev,
      draftsPending: drafts.length,
      publishedReports: published.length
    }));
  };

  // Handle Hash Navigation (for Notifications)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) return;

      const parts = hash.split('/');
      const section = parts[0];
      const id = parts[1];

      if (section === 'customers' && id) {
        onRouteChange({ page: 'customer-details', customerId: id, initialTab: 'overview' });
      } else if (section === 'messages') {
        // If we had a thread ID, we could pass it, but for now just going to messages is a good start
        onRouteChange({ page: 'messages' });
      } else if (section === 'reports') {
        onRouteChange({ page: 'reports' });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Check initial hash
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    loadStats();
  }, []);

  const handleGenerateDrafts = async () => {
    await demoRepo.generateDrafts('monthly', currentMonth);
    // Refresh stats
    await loadStats();
  };

  // Route mapping
  const currentSection = route.page === 'review' ? 'reports' : route.page;

  if (route.page === 'review') {
    return (
      <AdminLayout
        currentSection="reports"
        onSectionChange={(s) => onRouteChange({ page: s as Section })}
        onLogout={onLogout}
        title={`Granska: ${route.customerId}`}
      >
        <AdminDraftReviewPage
          customerId={route.customerId}
          month={route.month}
          onBack={() => onRouteChange({ page: 'reports' })}
          onPublished={() => {
            onRouteChange({ page: 'reports' });
          }}
          onLogout={onLogout}
        />
      </AdminLayout>
    );
  }

  if (route.page === 'customer-details') {
    return (
      <AdminLayout
        currentSection={route.initialTab === 'actionPlan' ? 'action-plans' : 'customers'}
        onSectionChange={(s) => onRouteChange({ page: s as Section })}
        onLogout={onLogout}
        title="Kundprofil"
      >
        <CustomerDetailsPage
          customerId={route.customerId}
          initialTab={route.initialTab}
          viewMode={route.initialTab === 'actionPlan' ? 'actionPlanOnly' : 'full'}
          onBack={() => onRouteChange({ page: route.initialTab === 'actionPlan' ? 'action-plans' : 'customers' })}
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      currentSection={currentSection}
      onSectionChange={(s) => onRouteChange({ page: s as Section })}
      onLogout={onLogout}
    >
      {currentSection === 'dashboard' && (
        <AdminDashboard
          stats={stats}
          onNavigate={(page) => onRouteChange({ page: page as Section })}
        />
      )}

      {(currentSection === 'reports' || currentSection === 'drafts') && (
        <AdminReports
          onReview={(cid, m) => onRouteChange({ page: 'review', customerId: cid, month: m })}
          onGenerateDrafts={handleGenerateDrafts}
        />
      )}

      {currentSection === 'customers' && (
        <AdminCustomers
          onViewCustomer={(id) => onRouteChange({ page: 'customer-details', customerId: id })}
        />
      )}

      {currentSection === 'action-plans' && (
        <AdminCustomers
          title="Handlingsplaner"
          subtitle="Hantera och följ upp kundrers handlingsplaner."
          hideActions={true}
          onViewCustomer={(id) => onRouteChange({ page: 'customer-details', customerId: id, initialTab: 'actionPlan' })}
        />
      )}

      {currentSection === 'settings' && (
        <AdminSettings />
      )}

      {currentSection === 'messages' && (
        <AdminMessages />
      )}

      {currentSection === 'automation' && (
        <AdminAutomations
          onViewCustomer={(id) => onRouteChange({ page: 'customer-details', customerId: id, initialTab: 'integrations' as any })}
        />
      )}
    </AdminLayout>
  );
};

export default AdminPanel;
