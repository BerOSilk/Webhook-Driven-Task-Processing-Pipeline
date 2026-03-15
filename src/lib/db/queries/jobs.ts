import { and, eq } from "drizzle-orm";
import { db } from "../index.js";
import { Job, jobs } from "../schema.js";
import { jobQueryObject } from "../../../types/jobs.js";

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

export async function getJobs(query: jobQueryObject) {
  const result = await db.select().from(jobs).where(
    and(
      query.id ? eq(jobs.id, query.id) : undefined,
      query.status ? eq(jobs.status, query.status) : undefined,
      query.pipelineId ? eq(jobs.pipelineID, query.pipelineId) : undefined
    )
  ).limit(query.limit ? query.limit : 50).offset(query.offset ? query.offset : 0)
    .orderBy(jobs.createdAt);
  return result;
}
