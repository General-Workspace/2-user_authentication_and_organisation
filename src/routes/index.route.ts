import { Router } from "express";
import userRoute from "./user.route";

class IndexRoute {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  private routes(): void {
    this.router.use("/api", userRoute);
  }
}

export default new IndexRoute().router;
