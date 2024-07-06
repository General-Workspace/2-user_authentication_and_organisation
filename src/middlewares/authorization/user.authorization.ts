import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ErrorResponseData } from "../../@types";
import response from "../../utils/lib/response.lib";
import prisma from "../../config/prisma.config";
import { User } from "@prisma/client";
import jwtService from "../../utils/helpers/jwt.helpers";

interface AuthenticatedUserError {
  type: string;
  message: string;
  statusCode: number;
}

interface AuthenticatedUserRequest extends Request {
  user?: User;
}

type AuthenticatedUserResponse = Response<ErrorResponseData>;

class AuthService {
  constructor(
    private req: AuthenticatedUserRequest,
    private res: AuthenticatedUserResponse,
    private next: NextFunction
  ) {}

  public async authenticatedUser(): Promise<AuthenticatedUserResponse | void> {
    try {
      const authHeader = this.req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        const err: AuthenticatedUserError = {
          type: "Bad request",
          message: "Authentication failed.",
          statusCode: StatusCodes.UNAUTHORIZED,
        };
        return response(this.res).errorResponse(
          err.type,
          err.message,
          err.statusCode
        );
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        const err: AuthenticatedUserError = {
          type: "Bad request",
          message: "Authentication failed.",
          statusCode: StatusCodes.UNAUTHORIZED,
        };
        return response(this.res).errorResponse(
          err.type,
          err.message,
          err.statusCode
        );
      }

      const payload = jwtService.verifyToken(token);
      if (!payload) {
        const err: AuthenticatedUserError = {
          type: "Bad request",
          message: "Authentication failed.",
          statusCode: StatusCodes.UNAUTHORIZED,
        };
        return response(this.res).errorResponse(
          err.type,
          err.message,
          err.statusCode
        );
      }

      const user = await prisma.user.findUnique({
        where: {
          email: payload["email"] as string,
        },
      });

      if (!user) {
        const err: AuthenticatedUserError = {
          type: "Bad request",
          message: "Authentication failed.",
          statusCode: StatusCodes.UNAUTHORIZED,
        };
        return response(this.res).errorResponse(
          err.type,
          err.message,
          err.statusCode
        );
      }

      this.req.user = user;
      return this.next();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return this.res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: "Bad request",
        message: "Authentication failed.",
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }
  }
}

const authenticatedUser = (
  req: AuthenticatedUserRequest,
  res: AuthenticatedUserResponse,
  next: NextFunction
) => {
  return new AuthService(req, res, next).authenticatedUser();
};

export default authenticatedUser;
