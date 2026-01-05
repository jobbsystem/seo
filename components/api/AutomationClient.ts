import { AutomationJob, JobStatus, ScheduledTask, AutomationJobType } from '../types/automation';

// Mock State (Simulating Backend Database)
let activeJobs: Map<string, AutomationJob> = new Map();
let scheduledTasks: ScheduledTask[] = [
    {
        id: 'task-monthly',
        type: 'monthly_report',
        cronExpression: '0 6 1 * *',
        nextRun: '2026-02-01T06:00:00',
        lastRun: '2026-01-01T06:02:00',
        enabled: true
    },
    {
        id: 'task-weekly',
        type: 'weekly_report',
        cronExpression: '0 6 * * 1',
        nextRun: '2026-01-06T06:00:00',
        enabled: false // Disabled for demo
    }
];

class AutomationClient {
    // --- Public API ---

    async startJob(type: AutomationJobType): Promise<string> {
        const jobId = `job-${Date.now()}`;
        const newJob: AutomationJob = {
            id: jobId,
            type,
            status: 'pending',
            progress: 0,
            totalItems: 43, // Mock customer count
            processedItems: 0,
            logs: [],
            startedAt: new Date().toISOString()
        };

        activeJobs.set(jobId, newJob);

        // Start simulation in "background"
        this.runSimulation(jobId);

        return jobId;
    }

    async getJob(id: string): Promise<AutomationJob | null> {
        return activeJobs.get(id) || null;
    }

    async listJobs(): Promise<AutomationJob[]> {
        return Array.from(activeJobs.values()).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
    }

    async getScheduledTasks(): Promise<ScheduledTask[]> {
        return [...scheduledTasks];
    }

    async updateScheduledTask(id: string, updates: Partial<ScheduledTask>): Promise<void> {
        scheduledTasks = scheduledTasks.map(t => t.id === id ? { ...t, ...updates } : t);
    }

    // --- Private Simulation Logic ---

    private runSimulation(jobId: string) {
        const job = activeJobs.get(jobId);
        if (!job) return;

        job.status = 'running';
        this.addLog(job, 'Jobb startat. Initierar miljö...', 'info');

        // Check Permissions
        setTimeout(() => {
            if (!activeJobs.has(jobId)) return;
            this.addLog(job, 'Verifierar API-nycklar och behörigheter...', 'info');

            // Connect to Services
            setTimeout(() => {
                this.addLog(job, 'Ansluten till Google Search Console API.', 'success');
                this.addLog(job, 'Ansluten till Google Analytics 4 API.', 'success');
                this.addLog(job, 'Verifierar Semrush API (Project ID-stöd)...', 'info');
                this.addLog(job, 'Verifierar SE Ranking API (Project ID-stöd)...', 'info');
                this.addLog(job, 'Verifierar PageSpeed Insights (Target URL-stöd)...', 'info');

                // Start Processing Items
                this.processNextItem(jobId, 1);
            }, 1500);

        }, 1000);
    }

    private processNextItem(jobId: string, itemIndex: number) {
        const job = activeJobs.get(jobId);
        if (!job || job.status !== 'running') return;

        if (itemIndex > job.totalItems) {
            this.completeJob(jobId);
            return;
        }

        // Simulate processing a customer
        const customerName = `Kund ${itemIndex}`; // In real app, fetch customer name
        job.currentItem = `Bearbetar: ${customerName}`;
        job.processedItems = itemIndex; // Using 1-based index for count
        job.progress = Math.round((itemIndex / job.totalItems) * 100);

        // Add detailed logs occasionally to simulate work
        if (Math.random() > 0.7) {
            this.addLog(job, `Hämtar data för ${customerName}...`, 'info');
        }

        // Random processing time between 100ms and 400ms
        const processingTime = 100 + Math.random() * 300;

        setTimeout(() => {
            this.processNextItem(jobId, itemIndex + 1);
        }, processingTime);
    }

    private completeJob(jobId: string) {
        const job = activeJobs.get(jobId);
        if (!job) return;

        job.status = 'completed';
        job.progress = 100;
        job.currentItem = undefined;
        job.completedAt = new Date().toISOString();
        this.addLog(job, 'Batch-körning slutförd. Alla rapporter genererade.', 'success');

        // Update last run for the corresponding scheduled task
        const taskType = job.type;
        scheduledTasks = scheduledTasks.map(t => {
            if (t.type === taskType) {
                return { ...t, lastRun: job.completedAt };
            }
            return t;
        });
    }

    private addLog(job: AutomationJob, message: string, level: AutomationJob['logs'][0]['level']) {
        job.logs.push({
            timestamp: new Date().toISOString(),
            message,
            level
        });
    }
}

export const automationClient = new AutomationClient();
