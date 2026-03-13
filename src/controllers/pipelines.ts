import { Request, Response } from "express";
import { Pipeline } from "../lib/db/schema.js";
import { BadRequestError } from "../errors.js";
import { randomUUID } from "node:crypto";
import { createPipeline } from "../lib/db/queries/pipelines.js";

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

function isValidAction(action: unknown): action is ActionType {
  return typeof action === "string" && ["capitalize"].includes(action);
}
