import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { Job, jobs } from "../schema.js";

export async function createJob(job: Job) {
  const [result] = await db.insert(jobs).values(job).returning();
  return result;
}

export async function updateJobStatus(id: string, status: string) {
  const [result] = await db
    .update(jobs)
    .set({ status: status })
    .where(eq(jobs.id, id))
    .returning();
  return result;
}

export async function updateJobProcessedPayload(
  id: string,
  processedPayload: Record<string, unknown>,
) {
  const [result] = await db
    .update(jobs)
    .set({ processedPayload: processedPayload })
    .where(eq(jobs.id, id))
    .returning();
  return result;
}
