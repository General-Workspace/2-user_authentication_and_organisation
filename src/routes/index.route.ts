import { Router } from "express";
import userRoute from "./user.route";
import usersRoute from "./users.route";
import organisationRoute from "./organisation.route";

class IndexRoute {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  private routes(): void {
    this.router.use("/auth", userRoute);
    this.router.use("/api", usersRoute);
    this.router.use("/api", organisationRoute);
  }
}

export default new IndexRoute().router;
