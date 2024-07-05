import { Router } from "express";
import userRoute from "./user.route";
import songRoute from "./song.route";

class IndexRoute {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  private routes(): void {
    this.router.use("/user", userRoute);
    this.router.use("/song", songRoute);
  }
}

export default new IndexRoute().router;
