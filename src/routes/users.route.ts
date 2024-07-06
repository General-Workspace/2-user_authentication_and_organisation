import { Router } from "express";
import { userService } from "../controllers/user.controller";
import authenticatedUser from "../middlewares/authorization/user.authorization";
import { getUserProfileValidation } from "../middlewares/validations/user.validation";

class UsersRoute {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  private routes(): void {
    this.router.get(
      "/users/:id",
      getUserProfileValidation,
      authenticatedUser,
      userService.getUser
    );
  }
}

export default new UsersRoute().router;
