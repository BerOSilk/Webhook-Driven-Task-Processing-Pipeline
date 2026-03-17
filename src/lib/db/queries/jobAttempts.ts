import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { jobAttempts, JobAttempts } from "../schema.js";

export async function createJobAttempt(jobAttempt: JobAttempts) {
  const [result] = await db.insert(jobAttempts).values(jobAttempt).returning();
  return result;
}

export async function getJobAttempts(jobID: string) {
  const result = await db
    .select()
    .from(jobAttempts)
    .where(eq(jobAttempts.jobID, jobID));
  return result;
}
