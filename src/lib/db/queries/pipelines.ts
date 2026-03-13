import { db } from "../index.js";
import { Pipeline, pipelines } from "../schema.js";

export async function createPipeline(pipeline: Pipeline) {
  const [result] = await db.insert(pipelines).values(pipeline).returning();
  return result;
}

export async function getPipelines() {
  const result = await db.select().from(pipelines);
  return result;
}
