import { Router } from "express";
import { organisationService } from "../controllers/organization.controller";
import authenticatedUser from "../middlewares/authorization/user.authorization";
import {
  createOrganizationValidation,
  getOrganizationValidation,
} from "../middlewares/validations/organization.validation";

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
      getOrganizationValidation,
      authenticatedUser,
      organisationService.getOrganisation
    );
    this.router.post(
      "/organisations",
      createOrganizationValidation,
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
