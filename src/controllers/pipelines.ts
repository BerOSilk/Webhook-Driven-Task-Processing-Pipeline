import { Request, Response } from "express";
import { Pipeline } from "../lib/db/schema.js";
import { BadRequestError, NotFoundError } from "../errors.js";
import { randomUUID } from "node:crypto";
import {
  createPipeline,
  deletePipeline,
  getPipelineById,
  getPipelines,
} from "../lib/db/queries/pipelines.js";

type ActionType = "capitalize";

export async function PostPipeline(req: Request, res: Response) {
  const { name, actionType, actionConfig, subscribers } = req.body;

  if (!isValidAction(actionType)) {
    throw new BadRequestError("Invalid Action Type");
  }

  const source = `/webhook/${randomUUID()}`;

  const pipeline: Pipeline = {
    name: name,
    source: source,
    actionType: actionType,
    actionConfig: actionConfig,
    subscribers: subscribers,
  };

  const resPipe = await createPipeline(pipeline);
  res.set({ "Content-Type": "application/json" });
  res.status(201).json(resPipe);
}

export async function GetPipelines(req: Request, res: Response) {
  const pipelines = await getPipelines();

  res.set({ "Content-Type": "application/json" });
  res.status(200).json(pipelines);
}

export async function GetPipeline(req: Request, res: Response) {
  const { id } = req.params;

  const pipeline = await getPipelineById(id as string);
  if (!pipeline) throw new NotFoundError(`Pipeline with ID "${id}" not found`);

  res.set({ "Content-Type": "application/json" });
  res.status(200).json(pipeline);
}

export async function DeletePipelines(req: Request, res: Response) {
  const { id } = req.params;

  await deletePipeline(id as string);
  res.status(204).send();
}

function isValidAction(action: unknown): action is ActionType {
  return typeof action === "string" && ["capitalize"].includes(action);
}
