import { Request } from "express";
import { StatusCodes } from "http-status-codes";
import tryCatch from "../utils/lib/try-catch.lib";
import response from "../utils/lib/response.lib";
import prisma from "../config/prisma.config";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { OrganisationResponse, UserObject, Organisation } from "../@types";

type RequestObject = Request<
  ParamsDictionary,
  unknown,
  unknown,
  ParsedQs,
  Record<string, unknown>
>;

type OrganisationRequest = Request<unknown, unknown, Organisation, unknown>;

class OrganisationService {
  /**
   * @description Registers all organisations a user belongs to or created
   * @param {RequestObject} req - The request object
   * @param {ResponseData<OrganisationResponse>} res - The response object
   * @returns {Promise<ResponseData<OrganisationResponse>>} - The response object
   */

  public getAllOrganisations = tryCatch(
    async (req: RequestObject, res: OrganisationResponse): Promise<unknown> => {
      const userId = (req as unknown as UserObject).user.userId;
      if (!userId) {
        return response(res).errorResponse(
          "Unauthorized",
          "User not authorized",
          StatusCodes.UNAUTHORIZED
        );
      }

      const organisations = await prisma.organisation.findMany({
        where: { userId },
      });

      const orgUsers = await prisma.organisationUser.findMany({
        where: { userId },
        include: { organisation: true },
      });

      const responseData = orgUsers.map((org) => {
        return {
          orgId: org.organisation.orgId,
          name: org.organisation.name,
          description: org.organisation.description,
        };
      });
      const orgs = organisations.map((org) => {
        return {
          orgId: org.orgId,
          name: org.name,
          description: org.description,
        };
      });

      return response(res).successResponse(
        StatusCodes.OK,
        "Organisations retrieved successfully",
        { organisations: [...responseData, ...orgs] }
      );
    }
  );

  /**
   * @description Get a single organisation record
   * @param {RequestObject} req - The request object
   * @param {ResponseData<OrganisationResponse>} res - The response object
   * @returns {Promise<ResponseData<OrganisationResponse>>} - The response object
   */

  public getOrganisation = tryCatch(
    async (req: RequestObject, res: OrganisationResponse): Promise<unknown> => {
      const userId = (req as unknown as UserObject).user.userId;
      const { orgId } = req.params;

      if (!userId) {
        return response(res).errorResponse(
          "Unauthorized",
          "User not authorized",
          StatusCodes.UNAUTHORIZED
        );
      }

      const organisation = await prisma.organisation.findUnique({
        where: {
          orgId: orgId,
        },
        include: {
          users: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!organisation) {
        return response(res).errorResponse(
          "Not Found",
          "Organisation not found",
          StatusCodes.NOT_FOUND
        );
      }

      const responseData = {
        orgId: organisation.orgId,
        name: organisation.name,
        description: organisation.description,
      };

      const userOwnsOrganisation = await prisma.organisation.findFirst({
        where: {
          orgId,
          userId,
        },
      });

      if (userOwnsOrganisation) {
        return response(res).successResponse(
          StatusCodes.OK,
          "Organisation retrieved successfully",
          responseData
        );
      }

      const userBelongsToOrganisation = await prisma.organisationUser.findFirst(
        {
          where: {
            orgId,
            userId,
          },
        }
      );

      if (!userBelongsToOrganisation) {
        return response(res).errorResponse(
          "Forbidden",
          "You do not belong to this organisation",
          StatusCodes.FORBIDDEN
        );
      }

      return response(res).successResponse(
        StatusCodes.OK,
        "Organisation retrieved successfully",
        responseData
      );
    }
  );

  /**
   * @description Create a new organisation
   * @param {RequestObject} req - The request object
   * @param {ResponseData<OrganisationResponse>} res - The response object
   * @returns {Promise<ResponseData<OrganisationResponse>>} - The response object
   */

  public createOrganisation = tryCatch(
    async (
      req: OrganisationRequest,
      res: OrganisationResponse
    ): Promise<unknown> => {
      const userId = (req as unknown as UserObject).user.userId;
      const { name, description } = req.body;

      if (!userId) {
        return response(res).errorResponse(
          "Bad request",
          "Client error",
          StatusCodes.BAD_REQUEST
        );
      }

      const organisation = await prisma.organisation.create({
        data: {
          name,
          description,
          userId,
        },
      });

      const responseData = {
        orgId: organisation.orgId,
        name: organisation.name,
        description: organisation.description,
      };

      return response(res).successResponse(
        StatusCodes.CREATED,
        "Organisation created successfully",
        responseData
      );
    }
  );

  /**
   * @description Add User to an organisation
   * @param {OrganisationRequest} req - The request object
   * @param {ResponseData<OrganisationResponse>} res - The response object
   * @returns {Promise<ResponseData<OrganisationResponse>>} - The response object
   */

  public addUserToOrganisation = tryCatch(
    async (
      req: OrganisationRequest,
      res: OrganisationResponse
    ): Promise<unknown> => {
      const ownerId = (req as unknown as UserObject).user.userId;
      const { orgId } = req.params as { orgId: string };
      const { userId } = req.body;

      if (!ownerId) {
        return response(res).errorResponse(
          "Unauthorized",
          "Owner Id is required",
          StatusCodes.UNAUTHORIZED
        );
      }

      const owner = await prisma.user.findUnique({
        where: {
          userId: ownerId,
        },
      });

      if (!owner) {
        return response(res).errorResponse(
          "Not Found",
          "Owner not found",
          StatusCodes.NOT_FOUND
        );
      }

      const organisation = await prisma.organisation.findUnique({
        where: {
          orgId,
        },
      });

      if (!organisation) {
        return response(res).errorResponse(
          "Not Found",
          "Organisation not found",
          StatusCodes.NOT_FOUND
        );
      }

      //   add user to organisation
      await prisma.organisationUser.create({
        data: {
          userId,
          orgId,
        },
      });

      return response(res).successResponse(
        StatusCodes.OK,
        "User added to organisation successfully",
        {}
      );
    }
  );
}

export const organisationService = new OrganisationService();
