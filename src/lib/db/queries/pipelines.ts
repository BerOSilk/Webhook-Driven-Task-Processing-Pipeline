import { db } from "../index.js";
import { Pipeline, pipelines } from "../schema.js";

export async function createPipeline(pipeline: Pipeline) {
  const [result] = await db.insert(pipelines).values(pipeline).returning();
  return result;
}
