import { Router } from "express";
import { userService } from "../controllers/user.controller";

class UserRoute {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  private routes(): void {
    this.router.post("/user/register", userService.registerUser);
  }
}

export default new UserRoute().router;
