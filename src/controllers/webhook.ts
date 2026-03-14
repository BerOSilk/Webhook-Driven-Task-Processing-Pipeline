import { Request, Response } from "express";
import { getPipelineBySource } from "../lib/db/queries/pipelines.js";
import { NotFoundError } from "../errors.js";
import { createJob } from "../lib/db/queries/jobs.js";
import { Job } from "../lib/db/schema.js";
import { worker } from "../worker/index.js";

export async function handleWebhook(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const source = `/webhook/${id}`;

    const pipeline = await getPipelineBySource(source);

    if (!pipeline) {
      throw new NotFoundError("Invalid webhook URL");
    }

    const job: Job = {
      pipelineID: pipeline.id,
      payload: {
        body: req.body,
        query: req.query,
        method: req.method,
        headers: req.headers,
        timestamp: new Date().toISOString(),
      },
    };

    const resultJob = await createJob(job);

    await worker.addJob({
      jobId: resultJob.id,
      pipelineId: pipeline.id,
      actionType: pipeline.actionType,
      payload: resultJob.payload as Record<string, unknown>,
      actionConfig: pipeline.actionConfig as Record<string, unknown>,
      subscribers: pipeline.subscribers as Record<string, unknown>[],
    });

    res.status(202).json({
      message: "Webhook received and queued for processing",
      jobId: resultJob.id,
      status: "pending",
    });
  } catch (err) {
    if (err instanceof Error) throw new Error(err.message, { cause: err });
  }
}
