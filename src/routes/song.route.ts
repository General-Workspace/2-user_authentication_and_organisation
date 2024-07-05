import { Router } from "express";
import { songRecommendation } from "../controllers/song.controller";
import { authenticatedUser } from "../middlewares/authorization/user.authorization";

class SongRoute {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  private routes(): void {
    this.router.get("/dashboard", authenticatedUser, songRecommendation);
  }
}

export default new SongRoute().router;
