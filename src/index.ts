import express, { Request, Response } from "express";
import { config } from "./config.js";
import { errorHandler } from "./errors.js";
import { PostPipeline } from "./controllers/pipelines.js";

const app = express();

app.use(express.json());

app.get("/api/ping", (req: Request, res: Response) => {
  res.status(200).send({
    message: "Pong",
  });
});

app.post("/api/pipeline", PostPipeline);

app.use(errorHandler);

app.listen(config.PORT, () => console.log("Server running on:", config.PORT));
