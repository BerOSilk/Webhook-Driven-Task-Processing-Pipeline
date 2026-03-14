import { NextFunction, Request, Response } from "express";

export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  void next;

  if (err instanceof BadRequestError) {
    res.status(400).json({
      error: err.message,
    });
    return;
  }
  if (err instanceof NotFoundError) {
    res.status(404).json({
      error: err.message,
    });
    return;
  }
  console.log(err);
  res.status(500).json({ error: "Internal Server Error" });
}
