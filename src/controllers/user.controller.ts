import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { StatusCodes } from "http-status-codes";
import tryCatch from "../utils/lib/try-catch.lib";
import response from "../utils/lib/response.lib";
import prisma from "../config/prisma.config";
import bcryptHelper from "../utils/helpers/bcrypt.helper";
import jwtService from "../utils/helpers/jwt.helpers";
import { RegisterUserRequest, UserResponse, UserObject } from "../@types";
import { UserHelperFunction } from "../utils/helpers/userHelper.helper";

type RegisterUser = Request<unknown, unknown, RegisterUserRequest, unknown>;

type RequestObject = Request<
  ParamsDictionary,
  unknown,
  unknown,
  ParsedQs,
  Record<string, unknown>
>;
class UserService {
  /**
   * @description Registers a new user
   * @param {RegisterUser} req - The request object
   * @param {UserResponse} res - The response object
   * @returns {Promise<ResponseData<RegisterUserResponse>>} - The response object
   */
  private accessToken: string | undefined;
  private isPasswordValid: boolean | undefined;
  private hashedPassword: string | undefined;

  public registerUser = tryCatch(
    async (req: RegisterUser, res: UserResponse): Promise<unknown> => {
      const { firstName, lastName, password, email, phone } = req.body;

      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (user) {
        return response(res).errorResponse(
          "Bad request",
          "Registration unsuccessful.",
          StatusCodes.BAD_REQUEST
        );
      }

      this.hashedPassword = await bcryptHelper.hashPassword(password as string);

      const userHelper = new UserHelperFunction(firstName, lastName);
      // get the fullname
      userHelper.capitalizeName = `${firstName} ${lastName}`;

      const newUser = await prisma.user.create({
        data: {
          firstName: userHelper.firstname,
          lastName: userHelper.lastname,
          email,
          password: this.hashedPassword,
          phone: phone as string,
        },
      });

      // create organisation
      await prisma.organisation.create({
        data: {
          name: `${newUser.firstName}'s Organisation`,
          description: "",
          userId: newUser.userId,
        },
      });

      this.accessToken = jwtService.generateToken({ email });

      const registerUserResponse = {
        userId: newUser.userId,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone as string,
      };

      return response(res).successResponse(
        StatusCodes.CREATED,
        "Registration Successful",
        { accessToken: this.accessToken, user: registerUserResponse }
      );
    }
  );

  /**
   * @description Logs in a user
   * @param {Request} req - The request object
   * @param {UserResponse} res - The response object
   * @returns {Promise<ResponseData<LoginUserResponse>>} - The response object
   */

  public loginUser = tryCatch(async (req: Request, res: UserResponse) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return response(res).errorResponse(
        "Bad request",
        "Authentication failed.",
        StatusCodes.UNAUTHORIZED
      );
    }

    this.isPasswordValid = await bcryptHelper.comparePassword(
      password,
      user.password
    );
    if (!this.isPasswordValid) {
      return response(res).errorResponse(
        "Bad request",
        "Authentication failed.",
        StatusCodes.UNAUTHORIZED
      );
    }

    this.accessToken = jwtService.generateToken({ email });

    const loginUserResponse = {
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone as string,
    };

    return response(res).successResponse(StatusCodes.OK, "Login successful", {
      accessToken: this.accessToken,
      user: loginUserResponse,
    });
  });

  /**
   * @description Get user record
   * @param {Request} req - The request object
   * @param {UserResponse} res - The response object
   * @returns {Promise<ResponseData<GetUserResponse>>} - The response object
   */

  public getUser = tryCatch(async (req: RequestObject, res: UserResponse) => {
    const { id } = req.params;

    const userObject = (req as unknown as UserObject).user;

    if (userObject.userId !== id) {
      return response(res).errorResponse(
        "Forbidden",
        "Unauthorized access",
        StatusCodes.FORBIDDEN
      );
    }

    // user id does not belong to the organisation

    const user = await prisma.user.findUnique({
      where: {
        userId: id,
      },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
    });

    if (!user) {
      return response(res).errorResponse(
        "Not Found",
        "User does not exist",
        StatusCodes.NOT_FOUND
      );
    }

    return response(res).successResponse(StatusCodes.OK, "User found", user);
  });
}

export const userService = new UserService();
