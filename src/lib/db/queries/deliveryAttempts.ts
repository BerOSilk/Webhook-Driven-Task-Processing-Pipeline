import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { deliveryAttempts, DeliveryAttempts } from "../schema.js";

export async function createDeliveryAttempt(deliveryAttempt: DeliveryAttempts) {
  const [result] = await db
    .insert(deliveryAttempts)
    .values(deliveryAttempt)
    .returning();
  return result;
}

export async function getDeliveryAttempts(jobId: string) {
  const result = await db
    .select()
    .from(deliveryAttempts)
    .where(eq(deliveryAttempts.jobID, jobId));
  return result;
}
