/**
 * Background Job & Task Queue Types for QAAGA
 */

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'delayed';

export interface JobOptions {
  attempts?: number;
  delayMs?: number;
  priority?: 'low' | 'normal' | 'high';
  timeoutMs?: number;
}

export interface Job<T = any> {
  id: string;
  name: string;
  data: T;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  createdAt: number;
  processAfter: number;
  processedAt?: number;
  completedAt?: number;
  failedReason?: string;
  result?: any;
}

export type JobHandler<T = any> = (job: Job<T>) => Promise<any>;

export interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  total: number;
}

export interface IJobQueue {
  enqueue<T>(name: string, data: T, options?: JobOptions): Promise<string>;
  registerHandler<T>(name: string, handler: JobHandler<T>): void;
  getJob(id: string): Promise<Job | null>;
  getStats(): Promise<QueueStats>;
}
