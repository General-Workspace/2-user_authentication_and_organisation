import { Request } from "express";
import { StatusCodes } from "http-status-codes";
import tryCatch from "../utils/lib/try-catch.lib";
import response from "../utils/lib/response.lib";
import prisma from "../config/prisma.config";
import bcryptHelper from "../utils/helpers/bcrypt.helper";
import jwtService from "../utils/helpers/jwt.helpers";
import { RegisterUserRequest, UserResponse } from "../@types";
import { UserHelperFunction } from "../utils/helpers/userHelper.helper";

type RegisterUser = Request<unknown, unknown, RegisterUserRequest, unknown>;
class UserService {
  /**
   * @description Registers a new user
   * @param {RegisterUser} req - The request object
   * @param {UserResponse} res - The response object
   * @returns {Promise<ResponseData<RegisterUserResponse>>} - The response object
   */
  private token: string | undefined;
  private isPasswordValid: boolean | undefined;

  public registerUser = tryCatch(
    async (req: RegisterUser, res: UserResponse): Promise<unknown> => {
      const { username, password, fullname } = req.body;

      const user = await prisma.user.findUnique({
        where: {
          username,
        },
      });

      if (user) {
        return response(res).errorResponse(
          "Conflict",
          "User already exists",
          StatusCodes.CONFLICT
        );
      }

      const hashedPassword = await bcryptHelper.hashPassword(
        password as string
      );

      const userHelper = new UserHelperFunction(fullname as string);
      // set the fullname
      userHelper.fullName = fullname as string;
      // get the fullname
      const getFullName = userHelper.fullName;

      const newUser = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          fullname: getFullName as string,
        },
      });

      this.token = jwtService.generateToken({ username });

      const session = await prisma.session.create({
        data: {
          token: this.token,
          user: {
            connect: {
              id: newUser.id,
            },
          },
        },
      });

      const registerUserResponse: RegisterUserRequest = {
        id: newUser.id,
        username: newUser.username,
        fullname: newUser.fullname as string,
      };

      return response(res).successResponse(
        StatusCodes.CREATED,
        "User registered successfully",
        { ...registerUserResponse, token: session.token }
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
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      return response(res).errorResponse(
        "Not Found",
        "User not found",
        StatusCodes.NOT_FOUND
      );
    }

    this.isPasswordValid = await bcryptHelper.comparePassword(
      password,
      user.password
    );
    if (!this.isPasswordValid) {
      return response(res).errorResponse(
        "Unauthorized",
        "Invalid credentials",
        StatusCodes.UNAUTHORIZED
      );
    }

    // check if user has a valid token
    const session = await prisma.session.findFirst({
      where: {
        userId: user.id,
      },
    });

    if (!session) {
      this.token = jwtService.generateToken({ username });

      const newSession = await prisma.session.create({
        data: {
          token: this.token,
          userId: user.id,
        },
      });

      const loginUserResponse: RegisterUserRequest = {
        id: user.id,
        username: user.username,
        fullname: user.fullname as string,
      };

      return response(res).successResponse(
        StatusCodes.OK,
        "User logged in successfully",
        { ...loginUserResponse, token: newSession.token }
      );
    }

    // return user object without password
    const loginUserResponse: RegisterUserRequest = {
      id: user.id,
      username: user.username,
      fullname: user.fullname as string,
    };

    if (session) {
      return response(res).successResponse(
        StatusCodes.OK,
        "User logged in successfully",
        { ...loginUserResponse, token: session.token }
      );
    }
  });
}

export const userService = new UserService();
