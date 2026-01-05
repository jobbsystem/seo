export type AutomationJobType = 'monthly_report' | 'weekly_report' | 'data_sync';

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface AutomationLogEntry {
    timestamp: string;
    message: string;
    level: 'info' | 'warning' | 'error' | 'success';
}

export interface AutomationJob {
    id: string;
    type: AutomationJobType;
    status: JobStatus;
    progress: number; // 0-100
    totalItems: number;
    processedItems: number;
    currentItem?: string; // e.g. "Customer: Origin AB"
    logs: AutomationLogEntry[];
    startedAt: string;
    completedAt?: string;
    error?: string;
}

export interface ScheduledTask {
    id: string;
    type: AutomationJobType;
    cronExpression: string; // "0 0 1 * *"
    nextRun: string; // ISO date
    lastRun?: string; // ISO date
    enabled: boolean;
}
