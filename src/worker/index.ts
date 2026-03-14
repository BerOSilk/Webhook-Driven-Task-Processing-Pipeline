import { JobQueue } from "./jobQueue.js";

export let worker: JobQueue;

export function initializeWorker(intervalMS: number, maxAttempts: number) {
  worker = new JobQueue(intervalMS, maxAttempts);
  worker.start();
}

export function stopWorker() {
  if (!worker) return;
  worker.stop();
  console.log("Worker stopped");
}
