import {
  updateJobProcessedPayload,
  updateJobStatus,
} from "../lib/db/queries/jobs.js";
import { processAction } from "../actions/processActions.js";
import { sendToSubscribers } from "./delivery.js";
import { createJobAttempt } from "../lib/db/queries/jobAttempts.js";

type QueueJob = {
  id: string;
  pipelineId: string;
  payload: Record<string, unknown>;
  actionType: string;
  actionConfig: Record<string, unknown>;
  subscribers: Record<string, unknown>[];
  attempts: number;
  maxAttempts: number;
  status: "pending" | "processing" | "failed";
  createdAt: Date;
  lastAttempt?: Date;
  error?: string;
};

export class JobQueue {
  private queue: QueueJob[] = [];
  private processing = false;
  private intervalMs: number;
  private maxConcurrent: number;
  private currentlyProcessing = 0;

  constructor(intervalMs: number, maxConcurrent: number) {
    this.intervalMs = intervalMs;
    this.maxConcurrent = maxConcurrent;
  }

  async addJob(JobData: {
    jobId: string;
    pipelineId: string;
    payload: Record<string, unknown>;
    actionType: string;
    actionConfig: Record<string, unknown>;
    subscribers: Record<string, unknown>[];
  }) {
    const job: QueueJob = {
      id: JobData.jobId,
      pipelineId: JobData.pipelineId,
      payload: JobData.payload,
      actionType: JobData.actionType,
      actionConfig: JobData.actionConfig,
      subscribers: JobData.subscribers,
      attempts: 0,
      maxAttempts: 5,
      status: "pending",
      createdAt: new Date(),
    };

    this.queue.push(job);

    await updateJobStatus(JobData.jobId, "queued");
  }

  start() {
    if (this.processing) return;

    this.processing = true;
    setInterval(() => this.processQueue(), this.intervalMs);
  }

  stop() {
    this.processing = false;
  }

  private async processQueue() {
    if (!this.processing) return;
    if (
      this.currentlyProcessing >= this.maxConcurrent ||
      this.queue.length === 0
    )
      return;

    const availableSlots = this.maxConcurrent - this.currentlyProcessing;
    const jobsToProcess = this.queue
      .filter((job) => job.status === "pending")
      .slice(0, availableSlots);

    if (jobsToProcess.length === 0) return;

    for (const job of jobsToProcess) {
      this.currentlyProcessing++;
      job.status = "processing";
      job.lastAttempt = new Date();

      this.processJob(job).finally(() => {
        this.currentlyProcessing--;
      });
    }
  }

  private async processJob(job: QueueJob) {
    try {
      await updateJobStatus(job.id, "processing");
      console.log("processing ", job.id);
      const processedPayload = await processAction(
        job.actionType,
        job.payload,
        job.actionConfig,
      );

      await updateJobStatus(job.id, "completed");
      await updateJobProcessedPayload(job.id, processedPayload);
      await createJobAttempt({
        jobID: job.id,
        status: "completed",
        errorMessage: null,
      });
      await sendToSubscribers(job.id, processedPayload, job.subscribers);
      this.removeFromQueue(job.id);
      console.log("completed ", job.id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      job.attempts++;
      if (job.attempts < job.maxAttempts) {
        job.status = "pending";
        job.error = message;
        await updateJobStatus(job.id, "pending");
        console.log(job.id, "failed, retrying after", this.intervalMs);
      } else {
        job.status = "failed";
        await updateJobStatus(job.id, "failed");
        this.removeFromQueue(job.id);
        console.log(job.id, "failed permenantly");
      }
      await createJobAttempt({
        jobID: job.id,
        status: job.status,
        errorMessage: job.error || message,
      });
    }
  }

  private removeFromQueue(jobId: string) {
    const index = this.queue.findIndex((j) => j.id === jobId);
    if (index !== -1) {
      this.queue.splice(index, 1);
    }
  }

  getStatus() {
    return {
      queueSize: this.queue.length,
      processing: this.currentlyProcessing,
      pending: this.queue.filter((j) => j.status === "pending").length,
      failed: this.queue.filter((j) => j.status === "failed").length,
      maxConcurrent: this.maxConcurrent,
    };
  }
}
