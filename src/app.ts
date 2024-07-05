import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import cors from "cors";
import { StatusCodes } from "http-status-codes";
import routes from "./routes/index.route";

class App {
  public app: express.Application;
  //   public port: string | number;

  constructor(/*controllers: any, port: string | number*/) {
    this.app = express();
    // this.port = port;

    this.initializeMiddlewares();
    // this.initializeControllers(controllers);
    this.mountRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares() {
    this.app.use(cors());
    this.app.use(morgan("dev"));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private mountRoutes() {
    // mount route
    this.app.use("/api", routes);

    // index route
    this.app.get("/", (_req: Request, res: Response) => {
      res.status(StatusCodes.OK).json({
        message: "🚀 Welcome to this song recommendation app.",
      });
    });

    // not found route
    this.app.all("*", (_req: Request, res: Response) => {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "🚫 Route not found.",
      });
    });
  }

  //   private initializeControllers(controllers: any) {
  //     controllers.forEach((controller: any) => {
  //       this.app.use("/", controller.router);
  //     });
  //   }

  private initializeErrorHandling() {
    this.app.use(
      (
        error: Error,
        _req: Request,
        res: Response,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _next: NextFunction
      ): void => {
        const err: {
          name: string;
          message: string;
          stack?: string;
        } = {
          name: error.name,
          message: error.message,
          stack: error.stack,
        };

        console.error(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: error.message,
        });
      }
    );
  }
}

export default new App().app;
