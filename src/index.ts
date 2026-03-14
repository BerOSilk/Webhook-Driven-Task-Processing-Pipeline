import express, { Request, Response } from "express";
import { config } from "./config.js";
import { errorHandler } from "./errors.js";
import {
  DeletePipelines,
  GetPipeline,
  GetPipelines,
  PostPipeline,
} from "./controllers/pipelines.js";
import { initializeWorker, stopWorker } from "./worker/index.js";
import { handleWebhook } from "./controllers/webhook.js";

const app = express();

app.use(express.json());

app.get("/api/ping", (req: Request, res: Response) => {
  res.status(200).send({
    message: "Pong",
  });
});

app.post("/api/pipeline", PostPipeline);
app.get("/api/pipeline", GetPipelines);
app.get("/api/pipeline/:id", GetPipeline);
app.delete("/api/pipeline/:id", DeletePipelines);

app.post("/api/webhook/:id", handleWebhook);

app.use(errorHandler);

initializeWorker(config.INTERVAL_MS as number, config.MAX_ATTEMPTS as number);

app.listen(config.PORT, () => console.log("Server running on:", config.PORT));

process.on("SIGINT", () => {
  console.log("Shutting down server");

  stopWorker();
  console.log("Server Stopped");
  process.exit(1);
});
