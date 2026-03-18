import { updateJobStatus } from "../lib/db/queries/jobs.js";
import { createDeliveryAttempt } from "../lib/db/queries/deliveryAttempts.js";
import { DeliveryAttempts } from "../lib/db/schema.js";

export async function sendToSubscribers(
  jobId: string,
  payload: Record<string, unknown>,
  subscribers: Record<string, unknown>[],
) {
  const deliveryPromises = subscribers.map(async (subscriber) => {
    const stringPayload = JSON.stringify(payload);
    let includes: boolean;
    if (typeof subscriber.method === "string") {
      includes = ["GET", "HEAD"].includes(subscriber.method.toUpperCase());
    } else {
      throw new Error("subscriber method not included");
    }

    const body = !includes ? stringPayload : undefined;
    const query = includes
      ? `?${new URLSearchParams(stringPayload).toString()}`
      : "";


    try {
      const res = await fetch(`${subscriber.url}${query}`, {
        method: subscriber.method,
        body: body,
        headers: {
          "Content-Type": "application/json",
          ...(subscriber.headers as object),
          "X-Webhook-Job-ID": jobId,
          "X-Webhook-Delivery-Time": new Date().toISOString(),
        },
      });

      if (!res.ok)
        throw new Error(`Subscriber responded with status ${res.status}`);

      const deliveryAttempt: DeliveryAttempts = {
        jobID: jobId,
        subscriberURL: subscriber.url as string,
        status: "success",
        responseCode: res.status,
      };

      await createDeliveryAttempt(deliveryAttempt);
      console.log("Delivered", jobId);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      const responseStatus = isHttpError(err) ? err.response?.status : 500;
      const deliveryAttempt: DeliveryAttempts = {
        jobID: jobId,
        subscriberURL: subscriber.url as string,
        status: "failed",
        errorMessage: message,
        responseCode: responseStatus || 500,
      };
      console.log("failed to Deliver", jobId);
      console.log(deliveryAttempt);
      await createDeliveryAttempt(deliveryAttempt);
    }
  });

  await Promise.allSettled(deliveryPromises);

  const count = subscribers.length;
  if (count > 0) {
    await updateJobStatus(jobId, "delivered");
  }
}

function isHttpError(err: unknown): err is { response: { status: number } } {
  return (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    "status" in (err.response as Record<string, object>)
  );
}
