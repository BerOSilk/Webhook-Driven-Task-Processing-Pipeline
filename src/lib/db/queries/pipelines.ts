import { eq } from "drizzle-orm";
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

export async function getPipelineById(id: string) {
  const [result] = await db
    .select()
    .from(pipelines)
    .where(eq(pipelines.id, id));
  return result;
}

export async function deletePipeline(id: string) {
  await db.delete(pipelines).where(eq(pipelines.id, id));
}
