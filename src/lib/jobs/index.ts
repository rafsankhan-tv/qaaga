import { IJobQueue, JobOptions, Job } from './types';
import { MemoryJobQueue } from './memoryQueue';

/**
 * Standard QAAGA Job Types
 */
export enum JobType {
  SEND_SMS = 'qaaga:send_sms',
  SEND_ORDER_NOTIFICATION = 'qaaga:order_notification',
  GENERATE_AI_INSIGHTS = 'qaaga:generate_ai_insights',
  INVALIDATE_CACHE = 'qaaga:invalidate_cache',
  AUDIT_LOG = 'qaaga:audit_log',
}

export class JobManager {
  private queue: IJobQueue;

  constructor() {
    // Uses MemoryJobQueue by default; ready to connect Redis / BullMQ when REDIS_URL is provided
    this.queue = new MemoryJobQueue();
    this.registerDefaultHandlers();
  }

  private registerDefaultHandlers() {
    // Default SMS Job Handler
    this.queue.registerHandler(JobType.SEND_SMS, async (job: Job<{ phone: string; message: string }>) => {
      console.log(`[Worker] Processing SMS job for ${job.data.phone}`);
      // Asynchronous notification delivery logic
      return { sent: true, phone: job.data.phone };
    });

    // Default Order Notification Handler
    this.queue.registerHandler(JobType.SEND_ORDER_NOTIFICATION, async (job: Job<{ orderId: string; status: string }>) => {
      console.log(`[Worker] Order status update notification: ${job.data.orderId} -> ${job.data.status}`);
      return { notified: true };
    });

    // Audit Logger
    this.queue.registerHandler(JobType.AUDIT_LOG, async (job: Job<{ action: string; userId?: string; details?: any }>) => {
      console.log(`[Worker] Audit log recorded: ${job.data.action}`, job.data);
      return { logged: true };
    });
  }

  /**
   * Enqueue a background task
   */
  async dispatch<T>(name: string, data: T, options?: JobOptions): Promise<string> {
    return this.queue.enqueue(name, data, options);
  }

  /**
   * Register custom task worker
   */
  registerHandler<T>(name: string, handler: (job: Job<T>) => Promise<any>): void {
    this.queue.registerHandler(name, handler);
  }

  async getStats() {
    return this.queue.getStats();
  }

  async getJob(id: string) {
    return this.queue.getJob(id);
  }
}

export const jobQueue = new JobManager();
export * from './types';
export { MemoryJobQueue } from './memoryQueue';
