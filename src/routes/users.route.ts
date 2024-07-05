import { Router } from "express";
import { userService } from "../controllers/user.controller";
import authenticatedUser from "../middlewares/authorization/user.authorization";

class UsersRoute {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  private routes(): void {
    this.router.get("/users/:id", authenticatedUser, userService.getUser);
  }
}

export default new UsersRoute().router;
