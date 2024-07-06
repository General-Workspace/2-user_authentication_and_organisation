import { Router } from "express";
import { organisationService } from "../controllers/organization.controller";
import authenticatedUser from "../middlewares/authorization/user.authorization";

class OrganisationRoute {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  private routes(): void {
    this.router.get(
      "/organisations",
      authenticatedUser,
      organisationService.getAllOrganisations
    );
    this.router.get(
      "/organisations/:orgId",
      authenticatedUser,
      organisationService.getOrganisation
    );
    this.router.post(
      "/organisations",
      authenticatedUser,
      organisationService.createOrganisation
    );
    this.router.post(
      "/organisations/:orgId/users",
      authenticatedUser,
      organisationService.addUserToOrganisation
    );
  }
}

export default new OrganisationRoute().router;
