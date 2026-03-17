import { Request, Response } from "express";
import { getJobs } from "../lib/db/queries/jobs.js";
import { jobQueryObject } from "../types/jobs.js";
import { BadRequestError, NotFoundError } from "../errors.js";
import { validate } from "uuid";
import { getDeliveryAttempts } from "../lib/db/queries/deliveryAttempts.js";
import { getJobAttempts } from "../lib/db/queries/jobAttempts.js";

export async function GetJobs(req: Request, res: Response) {
  const { status, pipelineID, limit = 50, offset = 0 } = req.query;

  const query: jobQueryObject = {
    status: status as string,
    pipelineId: pipelineID as string,
    limit: limit as number,
    offset: offset as number,
  };

  const jobs = await getJobs(query);

  res.status(200).json(jobs);
}

export async function GetJob(req: Request, res: Response) {
  const { id } = req.params;

  const validUUID = validate(id);
  if (!validUUID) {
    throw new BadRequestError("Invalid UUID format");
  }

  const query: jobQueryObject = {
    id: id as string,
  };
  const [job] = await getJobs(query);
  if (!job) throw new NotFoundError(`Job with id ${id} does not exist`);

  res.status(200).json(job);
}

export async function GetJobDeliveries(req: Request, res: Response) {
  const { id } = req.params;
  const validUUID = validate(id);
  if (!validUUID) {
    throw new BadRequestError("Invalid UUID format");
  }

  const deliveries = await getDeliveryAttempts(id as string);
  res.status(200).json(deliveries);
}

export async function GetJobAttempts(req: Request, res: Response) {
  const { id } = req.params;
  const validUUID = validate(id);
  if (!validUUID) {
    throw new BadRequestError("Invalid UUID format");
  }
  const attempts = await getJobAttempts(id as string);
  res.status(200).json(attempts);
}
