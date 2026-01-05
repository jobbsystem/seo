export type IntegrationProviderId =
    | 'google_search_console'
    | 'google_analytics_4'
    | 'pagespeed_insights'
    | 'chrome_ux_report'
    | 'semrush'
    | 'moz'
    | 'majestic'
    | 'accuranker'
    | 'seranking'
    | 'gtmetrix'
    | 'similarweb'
    | 'bing_webmaster_tools'
    | 'looker_studio';

import { TeamMember } from '../../types';
import { CustomerContact, CustomerService, CustomerCredential, CustomerTechnical } from './admin';

export type AuthType = 'oauth' | 'apiKey';

export interface ProviderDefinition {
    id: IntegrationProviderId;
    name: string;
    subtitle: string;
    authType: AuthType;
    icon: string; // URL or icon name
    requiredMetaFields: {
        key: string;
        label: string;
        placeholder?: string;
        helperText?: string;
    }[];
    testEndpointHint?: string;
}

export interface SetupStatus {
    googleConnected: boolean;
    toolsConnectedCount: number;
    errorsCount: number;
}

export interface ReportSettings {
    weeklyEnabled: boolean;
    monthlyEnabled: boolean;
    recipientEmails: string[];
}

export interface AgencyCustomer {
    id: string; // "cust_<uuid>"
    agencyId: string;
    email: string; // Login / Contact email
    companyName: string;
    domain: string; // "example.com"
    timezone: string; // "Europe/Stockholm"
    reportSettings: ReportSettings;
    createdAt: string; // ISO
    updatedAt: string; // ISO
    lastReportAt?: string; // ISO
    lastSyncAt?: string; // ISO
    lastLoginAt?: string; // ISO (For Churn Risk)
    connectionSummary: SetupStatus;
    active: boolean;
    assignedTeam?: TeamMember[];

    // CRM / Admin Data
    contacts?: CustomerContact[];
    services?: CustomerService[];
    credentials?: CustomerCredential[];
    technical?: CustomerTechnical;
}

export interface IntegrationConnection {
    id: string; // "conn_<uuid>"
    customerId: string;
    providerId: IntegrationProviderId;
    status: 'connected' | 'error' | 'disconnected' | 'demo_connected';
    lastSyncAt?: string;
    lastError?: string;
    meta: Record<string, any>; // Public meta data (e.g. gscProperty), NO SECRETS
    // In real backend: secretRef pointing to Secret Manager
}
