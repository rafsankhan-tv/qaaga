import { IJobQueue, Job, JobHandler, JobOptions, QueueStats } from './types';

/**
 * Clean In-Memory Asynchronous Job Queue
 * Runs tasks asynchronously with retry mechanisms, exponential backoff, and job tracking.
 * Ready for drop-in replacement with Redis/BullMQ/Cloud Tasks when scaled.
 */
export class MemoryJobQueue implements IJobQueue {
  private jobs = new Map<string, Job>();
  private handlers = new Map<string, JobHandler>();
  private isProcessing = false;
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    // Start background poller for delayed/scheduled jobs
    if (typeof window === 'undefined') {
      this.timer = setInterval(() => this.processNextBatch(), 1000);
      if (this.timer.unref) {
        this.timer.unref();
      }
    }
  }

  registerHandler<T>(name: string, handler: JobHandler<T>): void {
    this.handlers.set(name, handler as JobHandler);
  }

  async enqueue<T>(name: string, data: T, options?: JobOptions): Promise<string> {
    const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const delayMs = options?.delayMs || 0;

    const job: Job<T> = {
      id,
      name,
      data,
      status: delayMs > 0 ? 'delayed' : 'pending',
      attempts: 0,
      maxAttempts: options?.attempts || 3,
      createdAt: Date.now(),
      processAfter: Date.now() + delayMs,
    };

    this.jobs.set(id, job);

    // Immediate dispatch if no delay
    if (delayMs === 0) {
      setTimeout(() => this.processJob(id), 0);
    }

    return id;
  }

  async getJob(id: string): Promise<Job | null> {
    return this.jobs.get(id) || null;
  }

  async getStats(): Promise<QueueStats> {
    let pending = 0;
    let processing = 0;
    let completed = 0;
    let failed = 0;

    for (const job of this.jobs.values()) {
      if (job.status === 'pending' || job.status === 'delayed') pending++;
      else if (job.status === 'processing') processing++;
      else if (job.status === 'completed') completed++;
      else if (job.status === 'failed') failed++;
    }

    return {
      pending,
      processing,
      completed,
      failed,
      total: this.jobs.size,
    };
  }

  private async processNextBatch(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const now = Date.now();
      for (const [id, job] of this.jobs.entries()) {
        if ((job.status === 'pending' || job.status === 'delayed') && job.processAfter <= now) {
          await this.processJob(id);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async processJob(id: string): Promise<void> {
    const job = this.jobs.get(id);
    if (!job || job.status === 'processing' || job.status === 'completed') return;

    const handler = this.handlers.get(job.name);
    if (!handler) {
      job.status = 'failed';
      job.failedReason = `No registered handler for job type "${job.name}"`;
      return;
    }

    job.status = 'processing';
    job.attempts++;
    job.processedAt = Date.now();

    try {
      const result = await handler(job);
      job.status = 'completed';
      job.completedAt = Date.now();
      job.result = result;
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      if (job.attempts < job.maxAttempts) {
        job.status = 'delayed';
        // Exponential backoff
        const backoffMs = Math.pow(2, job.attempts) * 1000;
        job.processAfter = Date.now() + backoffMs;
        console.warn(`[JobQueue] Job ${job.id} (${job.name}) failed (attempt ${job.attempts}/${job.maxAttempts}). Retrying in ${backoffMs}ms. Error: ${errorMsg}`);
      } else {
        job.status = 'failed';
        job.failedReason = errorMsg;
        console.error(`[JobQueue] Job ${job.id} (${job.name}) permanently failed after ${job.attempts} attempts:`, err);
      }
    }
  }
}
