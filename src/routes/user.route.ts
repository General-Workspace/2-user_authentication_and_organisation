import { Router } from "express";
import { userService } from "../controllers/user.controller";
import {
  registerValidation,
  loginValidation,
} from "../middlewares/validations/user.validation";

class UserRoute {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  private routes(): void {
    this.router.post("/register", registerValidation, userService.registerUser);
    this.router.post("/login", loginValidation, userService.loginUser);
  }
}

export default new UserRoute().router;
