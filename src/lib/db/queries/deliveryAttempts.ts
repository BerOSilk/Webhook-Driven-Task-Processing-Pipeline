import { db } from "../index.js";
import { deliveryAttempts, DeliveryAttempts } from "../schema.js";

export async function createDeliveryAttempt(deliveryAttempt: DeliveryAttempts) {
  const [result] = await db
    .insert(deliveryAttempts)
    .values(deliveryAttempt)
    .returning();
  return result;
}
