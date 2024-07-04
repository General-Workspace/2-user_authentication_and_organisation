import { Request, Response, NextFunction } from "express";

type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown> | void;

class TryCatchHandler {
  constructor(private fn: AsyncFunction) {}

  public async run(req: Request, res: Response, next: NextFunction) {
    try {
      await this.fn(req, res, next);
    } catch (error) {
      next(error);
    }
  }
}

const tryCatch = (fn: AsyncFunction) => {
  const handler = new TryCatchHandler(fn);
  return handler.run.bind(handler);
};

export default tryCatch;
