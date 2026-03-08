import express, { Request, Response } from "express";
import { config } from "./config.js";

const app = express();

app.use(express.json());

app.get("/api/ping", (req: Request, res: Response) => {
    res.status(200).send({
        message: "Pong",
    })
});

app.listen(config.PORT, () => console.log("Server running on:", config.PORT));