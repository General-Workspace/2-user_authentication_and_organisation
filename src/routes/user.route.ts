import { Router } from "express";
import { userService } from "../controllers/user.controller";

class UserRoute {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  private routes(): void {
    this.router.post("/register", userService.registerUser);
    this.router.post("/login", userService.loginUser);
  }
}

export default new UserRoute().router;
